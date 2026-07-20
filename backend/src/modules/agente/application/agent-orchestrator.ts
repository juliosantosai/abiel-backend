import type { AgentRepository } from "../infrastructure/agent-repository";
import type { AgentRuntime } from "../../../shared/ai/agent-runtime";
import type { DomainEvent } from "../../../shared/events/domain-event";
import type { ConversationRepository } from "../../conversacion/infrastructure/conversation-repository";
import type { MessageRepository } from "../../conversacion/infrastructure/message-repository";
import type { EventBus } from "../../../shared/events/event-bus";
import { createAgentExecutionContext } from "../../../shared/ai/agent-execution-context";
import { AgentExecution } from "../domain/agent-execution";
import { createAgentExecutionStartedEvent } from "../domain/events/agent-execution-started.event";
import { createAgentExecutionCompletedEvent } from "../domain/events/agent-execution-completed.event";
import { createAgentExecutionFailedEvent } from "../domain/events/agent-execution-failed.event";
import { ConversationStatus } from "../../conversacion/domain/conversation-status";
import { logger } from "../../../shared/logger/logger";
import type { CapabilityRegistry } from "./capability-registry";

/**
 * AgentOrchestrator coordina la ejecución de agentes y capacidades ante mensajes entrantes.
 *
 * Es responsable de mantener aislamiento por tenant, verificar el estado de la conversación
 * y ejecutar la primera capability que coincida.
 */
export class AgentOrchestrator {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly runtime: AgentRuntime,
    private readonly eventBus: EventBus,
    private readonly capabilityRegistry: CapabilityRegistry
  ) {}

  /**
   * Orquesta la ejecución de agente en respuesta a un evento `MessageReceived`.
   *
   * @param event DomainEvent con metadata `tenantId` y `correlationId`.
   */
  async orchestrateMessage(event: DomainEvent) {
    const tenantId = event.metadata?.tenantId;
    const correlationId = event.metadata?.correlationId;

    if (!tenantId) {
      logger.warn({ correlationId }, "TenantId missing in event metadata; skipping orchestration");
      throw new Error("TenantId missing in event metadata");
    }

    const conversationId = event.aggregateId;
    logger.info({ tenantId, conversationId, correlationId }, "agent orchestrator: processing message");

    // ensure conversation exists in tenant
    const convo = await this.conversationRepository.findById(conversationId, tenantId);
    if (!convo) {
      logger.warn({ tenantId, conversationId, correlationId }, "agent orchestrator: conversation not found; skipping");
      return null;
    }

    logger.info({ tenantId, conversationId, estado: convo.estado, correlationId }, "agent orchestrator: conversation status check");

    // CRITICAL: If in human intervention or blocked, persist message but abort execution
    if (convo.estado === ConversationStatus.HUMAN_INTERVENTION || convo.estado === ConversationStatus.BLOCKED) {
      logger.warn(
        { tenantId, conversationId, estado: convo.estado, correlationId },
        "agent orchestrator: conversation in human intervention/blocked state; aborting orchestration"
      );
      return null;
    }

    // gather message content if available
    const messageId = event.payload && (event.payload as any).messageId ? String((event.payload as any).messageId) : null;
    const messages = await this.messageRepository.findByConversationId(conversationId, tenantId);
    const message = messages.find((m: any) => m.id === messageId) || messages[messages.length - 1] || null;

    if (!message) {
      logger.warn({ tenantId, conversationId, messageId, correlationId }, "agent orchestrator: no message found in conversation; skipping");
      return null;
    }

    // find an active agent for this tenant
    const agents = await this.agentRepository.findByEmpresa(tenantId);
    const active = agents.find((a) => a.estado === ("ACTIVE" as any) && a.empresaId === tenantId);

    if (!active) {
      logger.warn({ tenantId, conversationId, correlationId }, "agent orchestrator: no active agent found for tenant; skipping");
      return null;
    }

    logger.info({ tenantId, conversationId, agentId: active.id, correlationId }, "agent orchestrator: found active agent");

    // create execution domain object
    const execId = `exec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    let execution = AgentExecution.createPending({
      id: execId,
      agentId: active.id,
      conversationId: conversationId,
      empresaId: tenantId,
      metadata: { correlationId },
    });

    // publish started
    await this.eventBus.publish(
      createAgentExecutionStartedEvent(execution, {
        tenantId,
        userId: event.metadata?.userId,
        correlationId,
      })
    );

    execution = execution.start();
    logger.info({ execId, tenantId, conversationId, correlationId }, "agent orchestrator: execution started");

    const ctx = createAgentExecutionContext({
      tenantId,
      agentId: active.id,
      conversation: { id: conversationId },
      message: { id: message.id, content: message.contenido ?? "" },
      capabilities: active.capabilities ?? [],
      metadata: { ...{ executionId: execId }, ...(event.metadata ?? {}) },
      correlationId: correlationId ?? null,
    });

    try {
      logger.info({ execId, correlationId }, "agent orchestrator: invoking capabilities");

      // Find executable capabilities for this agent
      const capabilityIds = active.capabilities ?? [];
      const executableCapabilities = this.capabilityRegistry.getMany(capabilityIds);

      if (executableCapabilities.length === 0) {
        logger.warn({ tenantId, conversationId, correlationId }, "agent orchestrator: no executable capabilities found; falling back to runtime");
        const result = await this.runtime.execute(ctx);
        execution = execution.complete();
        await this.eventBus.publish(
          createAgentExecutionCompletedEvent(execution, result, {
            tenantId,
            userId: event.metadata?.userId,
            correlationId,
          })
        );
        logger.info({ execId, correlationId }, "agent orchestrator: execution completed successfully");
        return result;
      }

      // Try each capability in order until one can handle the message
      let result = null;
      let capabilityMatched = false;

      for (const capability of executableCapabilities) {
        const canHandle = await capability.canHandle(ctx);
        if (canHandle) {
          logger.info({ execId, capabilityId: capability.id, correlationId }, "agent orchestrator: capability matched");
          capabilityMatched = true;
          result = await capability.execute(ctx);
          break;
        }
      }

      if (!capabilityMatched) {
        logger.warn({ tenantId, conversationId, correlationId }, "agent orchestrator: no capability matched the message");
        execution = execution.complete();
        await this.eventBus.publish(
          createAgentExecutionCompletedEvent(
            execution,
            {
              success: false,
              error: { code: "NO_CAPABILITY_MATCH", message: "No capability could handle this message" },
            },
            {
              tenantId,
              userId: event.metadata?.userId,
              correlationId,
            }
          )
        );
        return { success: false, error: { code: "NO_CAPABILITY_MATCH", message: "No capability could handle this message" } };
      }

      execution = execution.complete();
      await this.eventBus.publish(
        createAgentExecutionCompletedEvent(execution, result, {
          tenantId,
          userId: event.metadata?.userId,
          correlationId,
        })
      );
      logger.info({ execId, correlationId }, "agent orchestrator: execution completed successfully");
      return result;
    } catch (err) {
      execution = execution.fail();
      await this.eventBus.publish(
        createAgentExecutionFailedEvent(execution, err, {
          tenantId,
          userId: event.metadata?.userId,
          correlationId,
        })
      );
      logger.error({ execId, err, correlationId }, "agent orchestrator: execution failed");
      throw err;
    }
  }
}

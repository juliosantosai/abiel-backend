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

export class AgentOrchestrator {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly runtime: AgentRuntime,
    private readonly eventBus: EventBus
  ) {}

  async orchestrateMessage(event: DomainEvent) {
    const tenantId = event.metadata?.tenantId;
    if (!tenantId) throw new Error("TenantId missing in event metadata");

    const conversationId = event.aggregateId;

    // ensure conversation exists in tenant
    const convo = await this.conversationRepository.findById(conversationId, tenantId);
    if (!convo) return null;

    // gather message content if available
    const messageId = event.payload && (event.payload as any).messageId ? String((event.payload as any).messageId) : null;
    const messages = await this.messageRepository.findByConversationId(conversationId, tenantId);
    const message = messages.find((m: any) => m.id === messageId) || null;

    // find an active agent for this tenant
    const agents = await this.agentRepository.findByEmpresa(tenantId);
    const active = agents.find((a) => a.estado === ("ACTIVE" as any) && a.empresaId === tenantId);
    if (!active) return null;

    // create execution domain object
    const execId = `exec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    let execution = AgentExecution.createPending({ id: execId, agentId: active.id, conversationId: conversationId, empresaId: tenantId, metadata: { correlationId: event.metadata?.correlationId } });

    // publish started
    await this.eventBus.publish(createAgentExecutionStartedEvent(execution, { tenantId, userId: event.metadata?.userId, correlationId: event.metadata?.correlationId }));

    execution = execution.start();

    const ctx = createAgentExecutionContext({
      tenantId,
      agentId: active.id,
      conversation: { id: conversationId },
      message: { id: message ? message.id : messageId, content: message ? message.contenido ?? "" : "" },
      capabilities: active.capabilities ?? [],
      metadata: { ...(event.metadata ?? {}) },
      correlationId: event.metadata?.correlationId ?? null,
    });

    try {
      const result = await this.runtime.execute(ctx);
      execution = execution.complete();
      await this.eventBus.publish(createAgentExecutionCompletedEvent(execution, result, { tenantId, userId: event.metadata?.userId, correlationId: event.metadata?.correlationId }));
      return result;
    } catch (err) {
      execution = execution.fail();
      await this.eventBus.publish(createAgentExecutionFailedEvent(execution, err, { tenantId, userId: event.metadata?.userId, correlationId: event.metadata?.correlationId }));
      throw err;
    }
  }
}

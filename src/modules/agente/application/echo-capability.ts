import type { ExecutableCapability } from "../domain/executable-capability";
import type { AgentExecutionContext } from "../../../shared/ai/agent-execution-context";
import type { AgentResult } from "../../../shared/ai/agent-result";
import { createAgentResult } from "../../../shared/ai/agent-result";
import { createAgentResponse } from "../../../shared/ai/agent-response";
import { AgentRuntimeError } from "../../../shared/ai/agent-runtime-error";
import { logger } from "../../../shared/logger/logger";
import type { EventBus } from "../../../shared/events/event-bus";
import { createSendMessageRequestedEvent } from "../../gateway/domain/events/send-message-requested.event";

/**
 * Echo Capability
 * 
 * A simple capability that echoes back the received message or sends a fixed greeting.
 * Useful for testing the capability pattern and basic automation.
 */
/**
 * Echo Capability
 *
 * Implementa un capability pattern básico que responde con un eco del mensaje recibido.
 * Está diseñado para ilustrar el mecanismo de selección de capacidades y la publicación
 * de eventos outbound sin acoplar la lógica a la entrega real.
 */
export class EchoCapability implements ExecutableCapability {
  id = "echo-capability";
  name = "Echo Capability";

  constructor(private readonly eventBus: EventBus) {}

  /**
   * Determina si esta capability puede procesar el mensaje.
   *
   * En este ejemplo siempre retorna true para demostrar el patrón de capacidades.
   */
  async canHandle(context: AgentExecutionContext): Promise<boolean> {
    // Echo capability always handles messages
    return true;
  }

  /**
   * Ejecuta la capability y publica un evento `SendMessageRequested`.
   */
  async execute(context: AgentExecutionContext): Promise<AgentResult> {
    const { tenantId, agentId, message, correlationId, metadata } = context;
    const messageContent = message.content ?? "No message content";

    logger.info(
      { tenantId, agentId, conversationId: context.conversation?.id, messageId: message.id, correlationId },
      "echo-capability: executing"
    );

    const executionId = metadata?.executionId;
    const userId = metadata?.userId;
    const originalMessageId = message.id;

    try {
      // Generate echo response
      const echoResponse = `Echo: "${messageContent}"`;

      logger.info(
        { output: echoResponse, tenantId, correlationId },
        "echo-capability: generated response"
      );

      // Publish SendMessageRequested event to trigger outbound handling
      const sendEvent = createSendMessageRequestedEvent(
        {
          tenantId,
          conversationId: context.conversation?.id ?? "unknown",
          messageContent: echoResponse,
          originalMessageId: originalMessageId ?? "unknown",
          agentId,
          executionId: typeof executionId === "string" ? executionId : "unknown",
        },
        {
          tenantId,
          correlationId: correlationId ?? undefined,
          userId: typeof userId === "string" ? userId : undefined,
        }
      );

      await this.eventBus.publish(sendEvent);

      logger.info(
        { tenantId, conversationId: context.conversation?.id, correlationId },
        "echo-capability: published SendMessageRequested event"
      );

      return createAgentResult({
        success: true,
        response: createAgentResponse({
          output: echoResponse,
          metadata: {
            capability: "echo",
            processedAt: new Date().toISOString(),
          },
        }),
      });
    } catch (error) {
      logger.error(
        { tenantId, agentId, correlationId, error },
        "echo-capability: execution failed"
      );

      return createAgentResult({
        success: false,
        error: new AgentRuntimeError(
          "Unknown",
          error instanceof Error ? error.message : "Unknown error"
        ),
      });
    }
  }
}

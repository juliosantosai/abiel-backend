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
export class EchoCapability implements ExecutableCapability {
  id = "echo-capability";
  name = "Echo Capability";

  constructor(private readonly eventBus: EventBus) {}

  async canHandle(context: AgentExecutionContext): Promise<boolean> {
    // Echo capability always handles messages
    return true;
  }

  async execute(context: AgentExecutionContext): Promise<AgentResult> {
    const { tenantId, agentId, message, correlationId, metadata } = context;
    const messageContent = message.content ?? "No message content";

    logger.info(
      { tenantId, agentId, conversationId: context.conversation?.id, messageId: message.id, correlationId },
      "echo-capability: executing"
    );

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
          originalMessageId: message.id,
          agentId,
          executionId: metadata?.executionId ?? "unknown",
        },
        {
          tenantId,
          correlationId: correlationId ?? undefined,
          userId: metadata?.userId,
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

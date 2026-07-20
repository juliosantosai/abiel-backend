import type { AgentRuntime } from "./agent-runtime";
import type { AgentExecutionContext } from "./agent-execution-context";
import { createAgentResult } from "./agent-result";
import { createAgentResponse } from "./agent-response";
import type { AgentResult } from "./agent-result";
import { logger } from "../logger/logger";

export class NoopAgentRuntime implements AgentRuntime {
  supports(_caps: string[]): boolean {
    return true;
  }

  async execute(context: AgentExecutionContext): Promise<AgentResult> {
    const { tenantId, agentId, conversation, message, correlationId } = context;
    const conversationId = conversation?.id;
    const { id: messageId, content } = message;

    logger.info(
      { tenantId, agentId, conversationId, messageId, correlationId },
      "noop-agent-runtime: executing stub agent"
    );

    // Simulate processing the message
    const output = `Echo response: "${content}" (processed by stub runtime)`;

    logger.info(
      { tenantId, agentId, conversationId, messageId, correlationId, output },
      "noop-agent-runtime: generating stub response"
    );

    const response = createAgentResponse({
      output,
      metadata: {
        noop: true,
        correlationId,
        processedMessageId: messageId,
        messageContent: content,
      },
    });

    return createAgentResult({ success: true, response });
  }

  async health(): Promise<{ status: "ok" | "unavailable"; details?: Record<string, unknown> }> {
    return { status: "ok" };
  }

  async shutdown(): Promise<void> {
    return;
  }
}

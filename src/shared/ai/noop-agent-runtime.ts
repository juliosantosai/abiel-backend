import type { AgentRuntime } from "./agent-runtime";
import type { AgentExecutionContext } from "./agent-execution-context";
import { createAgentResult } from "./agent-result";
import { createAgentResponse } from "./agent-response";
import type { AgentResult } from "./agent-result";

export class NoopAgentRuntime implements AgentRuntime {
  supports(_caps: string[]): boolean {
    return true;
  }

  async execute(context: AgentExecutionContext): Promise<AgentResult> {
    const output = `Respuesta generada por runtime simulado: ${context.message.content}`;
    const response = createAgentResponse({ output, metadata: { noop: true, correlationId: context.correlationId } });
    return createAgentResult({ success: true, response });
  }

  async health(): Promise<{ status: "ok" | "unavailable"; details?: Record<string, unknown> }> {
    return { status: "ok" };
  }

  async shutdown(): Promise<void> {
    return;
  }
}

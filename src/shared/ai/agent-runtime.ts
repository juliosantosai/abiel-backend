import type { AgentResult } from "./agent-result";
import type { AgentExecutionContext } from "./agent-execution-context";

export interface AgentRuntime {
  execute(context: AgentExecutionContext): Promise<AgentResult>;
  supports(capabilities: string[]): boolean;
  health(): Promise<{ status: "ok" | "unavailable"; details?: Record<string, unknown> }>;
  shutdown(): Promise<void>;
}

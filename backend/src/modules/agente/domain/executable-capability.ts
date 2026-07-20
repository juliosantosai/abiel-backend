import type { AgentExecutionContext } from "../../../shared/ai/agent-execution-context";
import type { AgentResult } from "../../../shared/ai/agent-result";

/**
 * ExecutableCapability Pattern
 * 
 * Represents a capability that an agent can perform in response to a message.
 * Each capability can evaluate if it should handle a message and execute the action.
 */
export interface ExecutableCapability {
  /**
   * Unique identifier for this capability
   */
  id: string;

  /**
   * Human-readable name
   */
  name: string;

  /**
   * Determines if this capability should handle the given context/message
   * @param context - Agent execution context with message and metadata
   * @returns true if this capability should handle the message
   */
  canHandle(context: AgentExecutionContext): Promise<boolean>;

  /**
   * Executes the capability action
   * @param context - Agent execution context with message and metadata
   * @returns AgentResult with success status and response
   */
  execute(context: AgentExecutionContext): Promise<AgentResult>;
}

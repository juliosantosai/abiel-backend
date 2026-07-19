import type { AgentResponse } from "./agent-response";
import type { AgentRuntimeError } from "./agent-runtime-error";

export type AgentResultProps = {
  success: boolean;
  response?: AgentResponse;
  error?: AgentRuntimeError;
};

export function createAgentResult(props: AgentResultProps): Readonly<AgentResultProps> {
  const obj: AgentResultProps = {
    success: !!props.success,
    response: props.response,
    error: props.error,
  };
  return Object.freeze(obj);
}

export type AgentResult = Readonly<AgentResultProps>;
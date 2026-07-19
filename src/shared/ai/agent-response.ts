export type AgentResponseProps = {
  output: string;
  usage?: { tokens?: number; [key: string]: unknown };
  metadata?: Record<string, unknown>;
};

export function createAgentResponse(props: AgentResponseProps): Readonly<AgentResponseProps> {
  if (props.output === undefined || props.output === null) throw new Error("output is required");
  const obj: AgentResponseProps = {
    output: props.output,
    usage: props.usage ?? {},
    metadata: props.metadata ?? {},
  };
  return Object.freeze(obj);
}

export type AgentResponse = Readonly<AgentResponseProps>;
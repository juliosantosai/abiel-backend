export type AgentRequestProps = {
  tenantId: string;
  agentId: string;
  conversationId?: string | null;
  messageId?: string | null;
  userId?: string | null;
  input: string;
  metadata?: Record<string, unknown>;
};

export function createAgentRequest(props: AgentRequestProps): Readonly<AgentRequestProps> {
  if (!props.tenantId) throw new Error("tenantId is required");
  if (!props.agentId) throw new Error("agentId is required");
  if (!props.input && props.input !== "") throw new Error("input is required (may be empty string)");

  const obj: AgentRequestProps = {
    tenantId: props.tenantId,
    agentId: props.agentId,
    conversationId: props.conversationId ?? null,
    messageId: props.messageId ?? null,
    userId: props.userId ?? null,
    input: props.input,
    metadata: props.metadata ?? {},
  };

  return Object.freeze(obj);
}

export type AgentRequest = Readonly<AgentRequestProps>;
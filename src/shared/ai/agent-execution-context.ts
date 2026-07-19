export type ConversationContext = {
  id: string;
  metadata?: Record<string, unknown>;
};

export type MessageContext = {
  id?: string | null;
  content: string;
  role?: string;
  metadata?: Record<string, unknown>;
};

export type AgentExecutionContext = {
  tenantId: string;
  agentId: string;
  conversation?: ConversationContext | null;
  message: MessageContext;
  capabilities?: string[];
  metadata?: Record<string, unknown>;
  correlationId?: string | null;
};

export function createAgentExecutionContext(ctx: AgentExecutionContext): Readonly<AgentExecutionContext> {
  if (!ctx.tenantId) throw new Error("tenantId is required");
  if (!ctx.agentId) throw new Error("agentId is required");
  if (!ctx.message) throw new Error("message is required");
  return Object.freeze({ ...ctx });
}

export type AgentExecutionContextType = Readonly<AgentExecutionContext>;

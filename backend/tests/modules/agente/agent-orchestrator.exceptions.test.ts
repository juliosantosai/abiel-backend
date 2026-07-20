import { describe, it, expect } from 'vitest';
import { AgentOrchestrator } from '../../../src/modules/agente/application/agent-orchestrator';
import { ConversationStatus } from '../../../src/modules/conversacion/domain/conversation-status';

function makeFakeDeps({ runtimeThrows = false } = {}) {
  const published: any[] = [];
  const eventBus = { publish: async (e: any) => { published.push(e); } };
  const conversationRepository = { findById: async (id: string, tenantId: string) => ({ id, estado: ConversationStatus.BOT_ACTIVE }) };
  const messageRepository = { findByConversationId: async (conversationId: string, tenantId: string) => [{ id: 'm1', contenido: 'hello' }] };
  const agentRepository = { findByEmpresa: async (tenantId: string) => [{ id: 'agent-1', estado: 'ACTIVE', empresaId: tenantId, capabilities: [] }] };
  const runtime = { execute: async (ctx: any) => { if (runtimeThrows) throw new Error('runtime failed'); return { success: true }; } };
  const capabilityRegistry = { getMany: (ids: any[]) => [] };
  return { eventBus, conversationRepository, messageRepository, agentRepository, runtime, capabilityRegistry, published };
}

describe('AgentOrchestrator exceptions', () => {
  it('throws and publishes failed event when runtime throws', async () => {
    const deps = makeFakeDeps({ runtimeThrows: true });
    const orchestrator = new AgentOrchestrator(deps.agentRepository, deps.conversationRepository, deps.messageRepository, deps.runtime, deps.eventBus, deps.capabilityRegistry);
    const evt: any = { aggregateId: 'tenant-1:conv-1', metadata: { tenantId: 'tenant-1', correlationId: 'c1' }, payload: { messageId: 'm1' } };
    await expect(orchestrator.orchestrateMessage(evt)).rejects.toThrow('runtime failed');
    // ensure events were published (start + failed)
    expect(deps.published.length).toBeGreaterThanOrEqual(2);
    const names = deps.published.map((e:any)=>e.eventName || e.name || '');
    expect(names.some(n => /ExecutionFailed|AgentExecutionFailed|agent.execution.failed/i.test(n))).toBe(true);
  });
});

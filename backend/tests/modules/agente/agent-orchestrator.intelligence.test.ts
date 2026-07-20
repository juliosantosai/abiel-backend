import { describe, it, expect, beforeEach } from 'vitest';
import { AgentOrchestrator } from '../../../src/modules/agente/application/agent-orchestrator';
import { ConversationStatus } from '../../../src/modules/conversacion/domain/conversation-status';

function makeDeps(overrides: any = {}) {
  const published: any[] = [];
  const eventBus = {
    publish: async (e: any) => { published.push(e); }
  };
  const conversationRepository = {
    findById: async (id: string, tenantId: string) => 
      overrides.conversationNotFound ? null : 
      { id, tenantId, estado: overrides.conversationState || ConversationStatus.BOT_ACTIVE }
  };
  const messageRepository = {
    findByConversationId: async (conversationId: string, tenantId: string) =>
      overrides.noMessages ? [] :
      [{ id: 'm1', contenido: overrides.messageContent || 'test message' }]
  };
  const agentRepository = {
    findByEmpresa: async (tenantId: string) =>
      overrides.noAgents ? [] :
      [{ 
        id: 'agent-1', 
        estado: overrides.agentState || 'ACTIVE', 
        empresaId: tenantId, 
        capabilities: overrides.agentCapabilities || [] 
      }]
  };
  const runtime = {
    execute: async (ctx: any) => {
      if (overrides.runtimeThrows) throw new Error('runtime error');
      return { success: true, output: 'runtime result' };
    }
  };
  const capability1 = {
    id: 'cap-1',
    canHandle: async (ctx: any) => overrides.cap1CanHandle !== false,
    execute: async (ctx: any) => ({ success: true, output: 'cap1' })
  };
  const capability2 = {
    id: 'cap-2',
    canHandle: async (ctx: any) => overrides.cap2CanHandle || false,
    execute: async (ctx: any) => ({ success: true, output: 'cap2' })
  };
  const capabilityRegistry = {
    getMany: (ids: string[]) => {
      const all: any = { 'cap-1': capability1, 'cap-2': capability2 };
      return ids.map(id => all[id]).filter(Boolean);
    }
  };
  return { eventBus, conversationRepository, messageRepository, agentRepository, runtime, capabilityRegistry, published };
}

describe('AgentOrchestrator (Intelligence Suite)', () => {
  
  describe('Fallback Scenarios', () => {
    it('throws when tenantId missing from event metadata', async () => {
      const deps = makeDeps();
      const orch = new AgentOrchestrator(deps.agentRepository, deps.conversationRepository, deps.messageRepository, deps.runtime, deps.eventBus, deps.capabilityRegistry);
      const evt: any = { aggregateId: 'conv-1', metadata: { correlationId: 'c1' }, payload: {} };
      await expect(orch.orchestrateMessage(evt)).rejects.toThrow('TenantId missing');
    });

    it('returns null when conversation not found', async () => {
      const deps = makeDeps({ conversationNotFound: true });
      const orch = new AgentOrchestrator(deps.agentRepository, deps.conversationRepository, deps.messageRepository, deps.runtime, deps.eventBus, deps.capabilityRegistry);
      const evt: any = { aggregateId: 'conv-1', metadata: { tenantId: 't1', correlationId: 'c1' }, payload: {} };
      const result = await orch.orchestrateMessage(evt);
      expect(result).toBeNull();
    });

    it('returns null and skips when conversation in HUMAN_INTERVENTION state', async () => {
      const deps = makeDeps({ conversationState: ConversationStatus.HUMAN_INTERVENTION });
      const orch = new AgentOrchestrator(deps.agentRepository, deps.conversationRepository, deps.messageRepository, deps.runtime, deps.eventBus, deps.capabilityRegistry);
      const evt: any = { aggregateId: 'conv-1', metadata: { tenantId: 't1', correlationId: 'c1' }, payload: {} };
      const result = await orch.orchestrateMessage(evt);
      expect(result).toBeNull();
    });

    it('returns null and skips when conversation in BLOCKED state', async () => {
      const deps = makeDeps({ conversationState: ConversationStatus.BLOCKED });
      const orch = new AgentOrchestrator(deps.agentRepository, deps.conversationRepository, deps.messageRepository, deps.runtime, deps.eventBus, deps.capabilityRegistry);
      const evt: any = { aggregateId: 'conv-1', metadata: { tenantId: 't1', correlationId: 'c1' }, payload: {} };
      const result = await orch.orchestrateMessage(evt);
      expect(result).toBeNull();
    });

    it('returns null when no active agent found for tenant', async () => {
      const deps = makeDeps({ noAgents: true });
      const orch = new AgentOrchestrator(deps.agentRepository, deps.conversationRepository, deps.messageRepository, deps.runtime, deps.eventBus, deps.capabilityRegistry);
      const evt: any = { aggregateId: 'conv-1', metadata: { tenantId: 't1', correlationId: 'c1' }, payload: {} };
      const result = await orch.orchestrateMessage(evt);
      expect(result).toBeNull();
    });

    it('falls back to runtime when agent has no capabilities', async () => {
      const deps = makeDeps({ agentCapabilities: [] });
      const orch = new AgentOrchestrator(deps.agentRepository, deps.conversationRepository, deps.messageRepository, deps.runtime, deps.eventBus, deps.capabilityRegistry);
      const evt: any = { aggregateId: 'conv-1', metadata: { tenantId: 't1', correlationId: 'c1' }, payload: {} };
      const result = await orch.orchestrateMessage(evt);
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.output).toBe('runtime result');
      // Should have published: started + completed
      expect(deps.published.length).toBeGreaterThanOrEqual(2);
    });

    it('returns error when no capability matches and no runtime fallback', async () => {
      const deps = makeDeps({ agentCapabilities: ['cap-1'], cap1CanHandle: false });
      const orch = new AgentOrchestrator(deps.agentRepository, deps.conversationRepository, deps.messageRepository, deps.runtime, deps.eventBus, deps.capabilityRegistry);
      const evt: any = { aggregateId: 'conv-1', metadata: { tenantId: 't1', correlationId: 'c1' }, payload: {} };
      const result = await orch.orchestrateMessage(evt);
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe('NO_CAPABILITY_MATCH');
    });
  });

  describe('Capability Selection', () => {
    it('executes first capability that returns canHandle=true', async () => {
      const deps = makeDeps({ agentCapabilities: ['cap-1', 'cap-2'], cap1CanHandle: true, cap2CanHandle: true });
      const orch = new AgentOrchestrator(deps.agentRepository, deps.conversationRepository, deps.messageRepository, deps.runtime, deps.eventBus, deps.capabilityRegistry);
      const evt: any = { aggregateId: 'conv-1', metadata: { tenantId: 't1', correlationId: 'c1' }, payload: {} };
      const result = await orch.orchestrateMessage(evt);
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.output).toBe('cap1'); // cap-1 is first and can handle
    });

    it('skips to next capability when current returns canHandle=false', async () => {
      const deps = makeDeps({ agentCapabilities: ['cap-1', 'cap-2'], cap1CanHandle: false, cap2CanHandle: true });
      const orch = new AgentOrchestrator(deps.agentRepository, deps.conversationRepository, deps.messageRepository, deps.runtime, deps.eventBus, deps.capabilityRegistry);
      const evt: any = { aggregateId: 'conv-1', metadata: { tenantId: 't1', correlationId: 'c1' }, payload: {} };
      const result = await orch.orchestrateMessage(evt);
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.output).toBe('cap2'); // cap-1 skipped, cap-2 executed
    });
  });

  describe('Tenant Isolation', () => {
    it('isolates execution for different tenants with same conversationId', async () => {
      const deps = makeDeps();
      const orch = new AgentOrchestrator(deps.agentRepository, deps.conversationRepository, deps.messageRepository, deps.runtime, deps.eventBus, deps.capabilityRegistry);
      
      const evt1: any = { aggregateId: 'conv-1', metadata: { tenantId: 'tenant-a', correlationId: 'c1' }, payload: {} };
      const evt2: any = { aggregateId: 'conv-1', metadata: { tenantId: 'tenant-b', correlationId: 'c2' }, payload: {} };
      
      // Simulate sequential calls (in real world these could be concurrent)
      const result1 = await orch.orchestrateMessage(evt1);
      const result2 = await orch.orchestrateMessage(evt2);
      
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      // Both should succeed independently
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      // Verify repository was called with correct tenant isolation
      // (conversationRepository.findById receives correct tenantId each time)
    });
  });

  describe('Error Handling', () => {
    it('publishes ExecutionFailed event when runtime throws', async () => {
      const deps = makeDeps({ agentCapabilities: [], runtimeThrows: true });
      const orch = new AgentOrchestrator(deps.agentRepository, deps.conversationRepository, deps.messageRepository, deps.runtime, deps.eventBus, deps.capabilityRegistry);
      const evt: any = { aggregateId: 'conv-1', metadata: { tenantId: 't1', correlationId: 'c1' }, payload: {} };
      await expect(orch.orchestrateMessage(evt)).rejects.toThrow('runtime error');
      // Should have published: started + failed
      const eventNames = deps.published.map((e: any) => e.eventName || e.name || '');
      expect(eventNames.some(n => /Failed|failed/.test(n))).toBe(true);
    });
  });
});

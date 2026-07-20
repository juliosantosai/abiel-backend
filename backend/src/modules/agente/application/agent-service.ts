import { generateUuid } from "../../../shared/utils/uuid";
import type { AgentRepository } from "../infrastructure/agent-repository";
import type { TenantContext } from "../../../shared/context/tenant-context";
import type { EventBus } from "../../../shared/events/event-bus";
import { Agent } from "../domain/agent";
import type { AgentProps } from "../domain/agent";
import { AgentStatus } from "../domain/agent-status";
import { AgentDefinition } from "../domain/agent-definition";
import { AgentSettings } from "../domain/agent-settings";
import { createAgentCreatedEvent } from "../domain/events/agent-created.event";
import { createAgentUpdatedEvent } from "../domain/events/agent-updated.event";
import { createAgentActivatedEvent } from "../domain/events/agent-activated.event";
import { createAgentPausedEvent } from "../domain/events/agent-paused.event";
import { createAgentDisabledEvent } from "../domain/events/agent-disabled.event";

export type CreateAgentInput = {
  nombre: string;
  descripcion?: string | null;
  configuracionId?: string | null;
  definition?: AgentDefinition;
  settings?: AgentSettings;
  capabilities?: string[];
};

export class AgentService {
  constructor(private readonly repository: AgentRepository, private readonly eventBus: EventBus) {}

  async crearAgent(context: TenantContext, input: CreateAgentInput): Promise<AgentProps> {
    const id = generateUuid();
    const now = new Date();
    const agent = new Agent({
      id,
      empresaId: context.empresaId,
      nombre: input.nombre,
      descripcion: input.descripcion ?? null,
      estado: AgentStatus.ACTIVE,
      configuracionId: input.configuracionId ?? null,
      definition: input.definition,
      settings: input.settings,
      capabilities: (input.capabilities ?? []) as any,
      createdAt: now,
      updatedAt: now,
    });

    const created = await this.repository.create(agent.toJSON());

    await this.eventBus.publish(createAgentCreatedEvent({ agentId: created.id, empresaId: context.empresaId }, { tenantId: context.empresaId, correlationId: created.id }));

    return created;
  }

  async updateConfiguration(context: TenantContext, agentId: string, data: { definition?: AgentDefinition; settings?: AgentSettings; descripcion?: string | null; capabilities?: string[] }): Promise<AgentProps> {
    const existing = await this.repository.findById(agentId, context.empresaId);
    if (!existing) throw new Error("Agente no encontrado o no pertenece al tenant");

    const agent = new Agent(existing);

    if (data.definition) agent.updateDefinition(data.definition);
    if (data.settings) agent.updateSettings(data.settings);
    if (data.descripcion !== undefined) agent.updateDescripcion(data.descripcion);
    if (data.capabilities) agent.setCapabilities((data.capabilities ?? []) as any);

    const updated = await this.repository.update(agent.toJSON());
    await this.eventBus.publish(createAgentUpdatedEvent({ agentId: updated.id, empresaId: context.empresaId }, { tenantId: context.empresaId, correlationId: updated.id }));
    return updated;
  }

  async activate(context: TenantContext, agentId: string): Promise<AgentProps> {
    const existing = await this.repository.findById(agentId, context.empresaId);
    if (!existing) throw new Error("Agente no encontrado o no pertenece al tenant");

    const agent = new Agent(existing);
    agent.activate();
    const updated = await this.repository.update(agent.toJSON());
    await this.eventBus.publish(createAgentActivatedEvent({ agentId: updated.id, empresaId: context.empresaId }, { tenantId: context.empresaId, correlationId: updated.id }));
    return updated;
  }

  async pause(context: TenantContext, agentId: string): Promise<AgentProps> {
    const existing = await this.repository.findById(agentId, context.empresaId);
    if (!existing) throw new Error("Agente no encontrado o no pertenece al tenant");

    const agent = new Agent(existing);
    agent.pause();
    const updated = await this.repository.update(agent.toJSON());
    await this.eventBus.publish(createAgentPausedEvent({ agentId: updated.id, empresaId: context.empresaId }, { tenantId: context.empresaId, correlationId: updated.id }));
    return updated;
  }

  async disable(context: TenantContext, agentId: string): Promise<AgentProps> {
    const existing = await this.repository.findById(agentId, context.empresaId);
    if (!existing) throw new Error("Agente no encontrado o no pertenece al tenant");

    const agent = new Agent(existing);
    agent.disable();
    const updated = await this.repository.update(agent.toJSON());
    await this.eventBus.publish(createAgentDisabledEvent({ agentId: updated.id, empresaId: context.empresaId }, { tenantId: context.empresaId, correlationId: updated.id }));
    return updated;
  }

  async findById(context: TenantContext, id: string): Promise<AgentProps | null> {
    return this.repository.findById(id, context.empresaId);
  }

  async findByEmpresa(context: TenantContext) : Promise<AgentProps[]> {
    return this.repository.findByEmpresa(context.empresaId);
  }
}

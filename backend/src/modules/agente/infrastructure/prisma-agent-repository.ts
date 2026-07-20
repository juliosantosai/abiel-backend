import { prisma } from "../../../shared/database/prisma";
import type { AgentProps } from "../domain/agent";
import type { AgentRepository } from "./agent-repository";
import type { Agent as PrismaAgent, Prisma } from "@prisma/client";
import { AgentDefinition } from "../domain/agent-definition";
import { AgentSettings } from "../domain/agent-settings";

function toPersistence(agent: AgentProps) {
  const def = agent.definition ? JSON.parse(JSON.stringify(agent.definition)) : {};
  const sett = agent.settings ? JSON.parse(JSON.stringify(agent.settings)) : {};
  return {
    id: agent.id,
    empresaId: agent.empresaId,
    name: agent.nombre,
    description: agent.descripcion ?? null,
    status: agent.estado,
    runtimeId: agent.configuracionId ?? null,
    definition: def as Prisma.InputJsonValue,
    settings: sett as Prisma.InputJsonValue,
    metadata: {
      capabilities: agent.capabilities ?? [],
    },
    version: (agent as unknown as { version?: number }).version ?? 1,
    createdAt: agent.createdAt,
    updatedAt: agent.updatedAt,
  };
}

function toDomain(record: PrismaAgent): AgentProps {
  const def = record.definition ?? undefined;
  const sett = record.settings ?? undefined;
  return {
    id: record.id,
    empresaId: record.empresaId,
    nombre: record.name,
    descripcion: record.description ?? null,
    estado: record.status as any,
    configuracionId: record.runtimeId ?? null,
    definition: def ? new AgentDefinition(def as any) : undefined,
    settings: sett ? new AgentSettings(sett as any) : undefined,
    capabilities: (record.metadata && (record.metadata as any).capabilities) ?? [],
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export class PrismaAgentRepository implements AgentRepository {
  async create(agent: AgentProps): Promise<AgentProps> {
    const data = toPersistence(agent);
    const created = await prisma.agent.create({ data });
    return toDomain(created as PrismaAgent);
  }

  async update(agent: AgentProps): Promise<AgentProps> {
    const data = toPersistence(agent);
    // Use updateMany to ensure empresaId is enforced
    const result = await prisma.agent.updateMany({
      where: { id: agent.id, empresaId: agent.empresaId },
      data,
    });

    if (result.count === 0) throw new Error("Agente no encontrado o no pertenece al tenant");

    const record = await prisma.agent.findFirst({ where: { id: agent.id, empresaId: agent.empresaId } });
    if (!record) throw new Error("Agente no encontrado después de update");
    return toDomain(record as PrismaAgent);
  }

  async findById(id: string, empresaId: string): Promise<AgentProps | null> {
    const record = await prisma.agent.findFirst({ where: { id, empresaId } });
    return record ? toDomain(record as PrismaAgent) : null;
  }

  async findByEmpresa(empresaId: string): Promise<AgentProps[]> {
    const records = await prisma.agent.findMany({ where: { empresaId }, orderBy: { createdAt: "asc" } });
    return records.map((r) => toDomain(r as PrismaAgent));
  }

  async delete(id: string, empresaId: string): Promise<void> {
    const result = await prisma.agent.deleteMany({ where: { id, empresaId } });
    if (result.count === 0) throw new Error("Agente no encontrado o no pertenece al tenant");
  }
}

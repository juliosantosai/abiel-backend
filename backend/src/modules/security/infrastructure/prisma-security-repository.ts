import type { SystemEventLog, SeverityType } from "@prisma/client";
import { prisma } from "../../../shared/database/prisma";
import { Severity, IncidentType } from "../domain/severity";
import type { SecurityIncidentProps } from "../domain/security-incident";
import type { SecurityRepository } from "./security-repository";

function mapSeverity(severity: SeverityType): Severity {
  return severity as Severity;
}

function mapIncident(record: SystemEventLog): SecurityIncidentProps {
  return {
    id: record.id,
    severity: mapSeverity(record.severity),
    type: record.type as IncidentType,
    ipAddress: record.ipAddress,
    endpoint: record.endpoint,
    metadata: record.metadata as Record<string, any>,
    createdAt: record.createdAt,
  };
}

export class PrismaSecurityRepository implements SecurityRepository {
  async create(incident: SecurityIncidentProps): Promise<SecurityIncidentProps> {
    const created = await prisma.systemEventLog.create({
      data: {
        id: incident.id,
        severity: incident.severity as SeverityType,
        type: incident.type as string,
        ipAddress: incident.ipAddress,
        endpoint: incident.endpoint,
        metadata: incident.metadata,
        createdAt: incident.createdAt,
      },
    });

    return mapIncident(created);
  }

  async findByIP(ipAddress: string, limit: number = 100): Promise<SecurityIncidentProps[]> {
    const records = await prisma.systemEventLog.findMany({
      where: { ipAddress },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return records.map(mapIncident);
  }

  async findByType(type: string, limit: number = 100): Promise<SecurityIncidentProps[]> {
    const records = await prisma.systemEventLog.findMany({
      where: { type },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return records.map(mapIncident);
  }

  async countRecent(ipAddress: string, windowMs: number): Promise<number> {
    const since = new Date(Date.now() - windowMs);

    return await prisma.systemEventLog.count({
      where: {
        ipAddress,
        createdAt: { gte: since },
      },
    });
  }
}

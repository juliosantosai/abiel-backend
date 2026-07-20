import type { SecurityIncidentProps } from "../domain/security-incident";
import type { SecurityRepository } from "./security-repository";

export class InMemorySecurityRepository implements SecurityRepository {
  private readonly incidents: SecurityIncidentProps[] = [];

  async create(incident: SecurityIncidentProps): Promise<SecurityIncidentProps> {
    this.incidents.push(incident);
    return incident;
  }

  async findByIP(ipAddress: string, limit: number = 100): Promise<SecurityIncidentProps[]> {
    return this.incidents.filter((incident) => incident.ipAddress === ipAddress).slice(0, limit);
  }

  async findByType(type: string, limit: number = 100): Promise<SecurityIncidentProps[]> {
    return this.incidents.filter((incident) => incident.type === type).slice(0, limit);
  }

  async countRecent(ipAddress: string, windowMs: number): Promise<number> {
    const since = new Date(Date.now() - windowMs);
    return this.incidents.filter((incident) => incident.ipAddress === ipAddress && incident.createdAt >= since).length;
  }
}

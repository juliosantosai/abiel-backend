import type { SecurityIncidentProps } from "../domain/security-incident";

export interface SecurityRepository {
  create(incident: SecurityIncidentProps): Promise<SecurityIncidentProps>;
  findByIP(ipAddress: string, limit: number): Promise<SecurityIncidentProps[]>;
  findByType(type: string, limit: number): Promise<SecurityIncidentProps[]>;
  countRecent(ipAddress: string, windowMs: number): Promise<number>;
}

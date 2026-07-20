import type { Severity, IncidentType } from "../domain/severity";

export interface SecurityNotification {
  recipientNumber: string;
  severity: Severity;
  title: string;
  body: string;
  metadata: {
    incidentId: string;
    timestamp: string;
    ip: string;
  };
}

export interface NotificationService {
  sendSecurityAlert(notification: SecurityNotification): Promise<void>;
}

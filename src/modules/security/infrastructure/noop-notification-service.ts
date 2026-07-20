import type { NotificationService, SecurityNotification } from "../application/notification-service";

/**
 * No-op notification service for testing and development.
 * In production, this would be replaced with a real WhatsApp adapter.
 */
export class NoopNotificationService implements NotificationService {
  async sendSecurityAlert(notification: SecurityNotification): Promise<void> {
    // Silently ignore in no-op mode
    // In production, this would send via WhatsApp/Twilio
    void notification;
  }
}

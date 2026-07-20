import type { WebhookDeliveryRecord, WebhookDeliveryRepository } from "../domain/webhook-delivery-repository";

export class InMemoryWebhookDeliveryRepository implements WebhookDeliveryRepository {
  private readonly records = new Map<string, WebhookDeliveryRecord>();

  async findByDeliveryKey(deliveryKey: string): Promise<WebhookDeliveryRecord | null> {
    return this.records.get(deliveryKey) ?? null;
  }

  async upsert(record: WebhookDeliveryRecord): Promise<void> {
    this.records.set(record.deliveryKey, record);
  }

  async markProcessed(deliveryKey: string): Promise<void> {
    const existing = this.records.get(deliveryKey);
    if (!existing) return;
    this.records.set(deliveryKey, { ...existing, status: "PROCESSED", attempts: existing.attempts + 1, updatedAt: new Date() });
  }

  async markFailed(deliveryKey: string, error: string): Promise<void> {
    const existing = this.records.get(deliveryKey);
    if (!existing) return;
    this.records.set(deliveryKey, { ...existing, status: "FAILED", lastError: error, attempts: existing.attempts + 1, updatedAt: new Date() });
  }
}

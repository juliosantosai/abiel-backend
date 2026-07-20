export interface WebhookDeliveryRecord {
  deliveryKey: string;
  tenantId: string;
  status: "PENDING" | "PROCESSED" | "FAILED";
  attempts: number;
  lastError?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookDeliveryRepository {
  findByDeliveryKey(deliveryKey: string): Promise<WebhookDeliveryRecord | null>;
  upsert(record: WebhookDeliveryRecord): Promise<void>;
  markProcessed(deliveryKey: string): Promise<void>;
  markFailed(deliveryKey: string, error: string): Promise<void>;
}

import { prisma } from "../../../shared/database/prisma";
import type { WebhookDeliveryRecord, WebhookDeliveryRepository } from "../domain/webhook-delivery-repository";

function mapRecord(record: any): WebhookDeliveryRecord {
  return {
    deliveryKey: record.deliveryKey,
    tenantId: record.tenantId,
    status: record.status as WebhookDeliveryRecord["status"],
    attempts: record.attempts,
    lastError: record.lastError ?? null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export class PrismaWebhookDeliveryRepository implements WebhookDeliveryRepository {
  async findByDeliveryKey(deliveryKey: string): Promise<WebhookDeliveryRecord | null> {
    const record = await prisma.webhookDelivery.findUnique({ where: { deliveryKey } });
    return record ? mapRecord(record) : null;
  }

  async upsert(record: WebhookDeliveryRecord): Promise<void> {
    await prisma.webhookDelivery.upsert({
      where: { deliveryKey: record.deliveryKey },
      update: {
        tenantId: record.tenantId,
        status: record.status,
        attempts: record.attempts,
        lastError: record.lastError ?? null,
        updatedAt: new Date(),
      },
      create: {
        deliveryKey: record.deliveryKey,
        tenantId: record.tenantId,
        status: record.status,
        attempts: record.attempts,
        lastError: record.lastError ?? null,
      },
    });
  }

  async markProcessed(deliveryKey: string): Promise<void> {
    await prisma.webhookDelivery.updateMany({
      where: { deliveryKey },
      data: {
        status: "PROCESSED",
        attempts: { increment: 1 },
        updatedAt: new Date(),
      },
    });
  }

  async markFailed(deliveryKey: string, error: string): Promise<void> {
    await prisma.webhookDelivery.updateMany({
      where: { deliveryKey },
      data: {
        status: "FAILED",
        attempts: { increment: 1 },
        lastError: error,
        updatedAt: new Date(),
      },
    });
  }
}

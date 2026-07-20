import type { DomainEvent } from "../../../shared/events/domain-event";
import type { EventHandler } from "../../../shared/events/event-handler";
import { logger } from "../../../shared/logger/logger";

/**
 * Outbound Message Handler
 * 
 * Listens to SendMessageRequested events and handles outbound message delivery.
 * Currently logs the message for validation; can be extended to integrate with
 * WhatsApp API, email, SMS, or other communication channels.
 */
export class OutboundMessageHandler implements EventHandler {
  async handle(event: DomainEvent): Promise<void> {
    const payload = event.payload as any;
    const metadata = event.metadata ?? {};
    const correlationId = metadata.correlationId;
    const tenantId = metadata.tenantId;

    const { conversationId, messageContent, originalMessageId, agentId, executionId } = payload;

    logger.info(
      {
        tenantId,
        conversationId,
        messageContent,
        originalMessageId,
        agentId,
        executionId,
        correlationId,
      },
      "outbound-handler: sending message to WhatsApp"
    );

    // TODO: Replace with actual WhatsApp API call
    // Example integration:
    // const whatsappService = await this.whatsappProvider.sendMessage({
    //   to: conversationId.split(':')[1],
    //   body: messageContent,
    //   metadata: { conversationId, executionId, correlationId }
    // });

    logger.info(
      { conversationId, messageContent, tenantId, correlationId },
      "outbound-handler: message dispatched to WhatsApp (stub)"
    );
  }
}

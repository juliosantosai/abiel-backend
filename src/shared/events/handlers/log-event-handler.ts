import type { EventHandler } from "../event-handler";
import type { DomainEvent } from "../domain-event";

export class LogEventHandler implements EventHandler<DomainEvent> {
  async handle(event: DomainEvent): Promise<void> {
    // Placeholder for audit/logging use cases. No business logic here.
    // In production, this could emit to monitoring, audit trails, or analytics.
    console.log(`Event received: ${event.eventName}`, {
      aggregateId: event.aggregateId,
      payload: event.payload,
    });
  }
}

import type { EventHandler } from "../event-handler";
import type { DomainEvent } from "../domain-event";
import { logger } from "../../logger/logger";

export class LogEventHandler implements EventHandler<DomainEvent> {
  async handle(event: DomainEvent): Promise<void> {
    logger.info({
      event: event.eventName,
      aggregateId: event.aggregateId,
      payload: event.payload,
    }, "event received");
  }
}

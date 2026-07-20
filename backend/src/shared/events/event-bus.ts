import type { DomainEvent } from "./domain-event";
import type { EventHandler } from "./event-handler";

export interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventName: string, handler: EventHandler): void;
}

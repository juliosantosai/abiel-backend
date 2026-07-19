import type { DomainEvent } from "./domain-event";
import type { EventBus } from "./event-bus";
import type { EventHandler } from "./event-handler";

export class InMemoryEventBus implements EventBus {
  private readonly handlers: Map<string, EventHandler[]> = new Map();

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventName) ?? [];

    for (const handler of handlers) {
      try {
        await handler.handle(event);
      } catch (error) {
        // Isolated handler execution: a failed handler does not stop the others.
        // The error is surfaced to the caller through the console and the bus remains available.
        console.warn(`Handler failed for ${event.eventName}`, error);
      }
    }
  }

  subscribe(eventName: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventName) ?? [];
    handlers.push(handler);
    this.handlers.set(eventName, handlers);
  }
}

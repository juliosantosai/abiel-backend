import { describe, it, expect, vi } from "vitest";
import { InMemoryEventBus } from "../../../src/shared/events/in-memory-event-bus";
import { createDomainEvent } from "../../../src/shared/events/domain-event";

interface TestPayload {
  value: string;
}

class TestHandler {
  public handled: unknown[] = [];

  async handle(event: { payload: TestPayload }) {
    this.handled.push(event.payload.value);
  }
}

describe("InMemoryEventBus", () => {
  it("executes a handler when an event is published", async () => {
    const bus = new InMemoryEventBus();
    const handler = new TestHandler();

    bus.subscribe("TestEvent", handler as any);
    await bus.publish(
      createDomainEvent({
        eventId: "1",
        occurredAt: new Date(),
        eventName: "TestEvent",
        aggregateId: "aggregate-1",
        payload: { value: "ok" },
      })
    );

    expect(handler.handled).toEqual(["ok"]);
  });

  it("executes multiple handlers for the same event", async () => {
    const bus = new InMemoryEventBus();
    const handler1 = new TestHandler();
    const handler2 = new TestHandler();

    bus.subscribe("TestEvent", handler1 as any);
    bus.subscribe("TestEvent", handler2 as any);

    await bus.publish(
      createDomainEvent({
        eventId: "2",
        occurredAt: new Date(),
        eventName: "TestEvent",
        aggregateId: "aggregate-2",
        payload: { value: "multi" },
      })
    );

    expect(handler1.handled).toEqual(["multi"]);
    expect(handler2.handled).toEqual(["multi"]);
  });

  it("continues publishing when a handler fails", async () => {
    const bus = new InMemoryEventBus();
    const errorHandler = {
      handle: vi.fn().mockRejectedValue(new Error("handler failed")),
    };
    const successHandler = new TestHandler();

    bus.subscribe("TestEvent", errorHandler as any);
    bus.subscribe("TestEvent", successHandler as any);

    await expect(
      bus.publish(
        createDomainEvent({
          eventId: "3",
          occurredAt: new Date(),
          eventName: "TestEvent",
          aggregateId: "aggregate-3",
          metadata: { correlationId: "corr-3" },
          payload: { value: "fail" },
        })
      )
    ).resolves.toBeUndefined();

    expect(successHandler.handled).toEqual(["fail"]);
  });

  it("returns an immutable event instance", async () => {
    const event = createDomainEvent({
      eventId: "4",
      occurredAt: new Date(),
      eventName: "TestEvent",
      aggregateId: "aggregate-4",
      metadata: { tenantId: "tenant-1", correlationId: "corr-4" },
      payload: { value: "immutable" },
    });

    expect(() => {
      (event as any).eventName = "changed";
    }).toThrow();
    expect(() => {
      (event.payload as any).value = "changed";
    }).toThrow();
  });
});

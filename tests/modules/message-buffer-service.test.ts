import { describe, expect, it, vi } from "vitest";
import { MessageBufferService } from "../../src/modules/conversacion/application/message-buffer-service";
import { TenantContext } from "../../src/shared/context/tenant-context";

const context = TenantContext.create({
  usuarioId: "user-1",
  empresaId: "empresa-1",
  membershipId: "membership-1",
  rolIds: ["rol-1"],
  permisos: ["CONVERSATION_CREATE"],
  isGlobalTenant: false,
});

describe("MessageBufferService", () => {
  it("publishes a single MessagesBuffered event after debounce", async () => {
    vi.useFakeTimers();
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) } as any;
    const bufferService = new MessageBufferService(eventBus, 50);

    await bufferService.bufferMessage(context, {
      id: "msg-1",
      conversationId: "conversation-1",
      empresaId: "empresa-1",
      usuarioId: "user-1",
      contenido: "Hello 1",
      rol: "USER",
      createdAt: new Date(),
    } as any);

    await bufferService.bufferMessage(context, {
      id: "msg-2",
      conversationId: "conversation-1",
      empresaId: "empresa-1",
      usuarioId: "user-1",
      contenido: "Hello 2",
      rol: "USER",
      createdAt: new Date(),
    } as any);

    vi.advanceTimersByTime(50);
    await vi.runAllTimersAsync();

    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    expect(eventBus.publish).toHaveBeenCalledWith(expect.objectContaining({
      eventName: "MessagesBuffered",
      payload: expect.objectContaining({
        conversationId: "conversation-1",
        empresaId: "empresa-1",
        messages: expect.arrayContaining([
          expect.objectContaining({ id: "msg-1" }),
          expect.objectContaining({ id: "msg-2" }),
        ]),
      }),
    }));

    vi.useRealTimers();
  });

  it("preserves pending messages until the debounce window expires", async () => {
    vi.useFakeTimers();
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) } as any;
    const bufferService = new MessageBufferService(eventBus, 100);

    await bufferService.bufferMessage(context, {
      id: "msg-3",
      conversationId: "conversation-2",
      empresaId: "empresa-1",
      usuarioId: "user-1",
      contenido: "Hello 3",
      rol: "USER",
      createdAt: new Date(),
    } as any);

    vi.advanceTimersByTime(50);
    expect(eventBus.publish).not.toHaveBeenCalled();

    await bufferService.bufferMessage(context, {
      id: "msg-4",
      conversationId: "conversation-2",
      empresaId: "empresa-1",
      usuarioId: "user-1",
      contenido: "Hello 4",
      rol: "USER",
      createdAt: new Date(),
    } as any);

    vi.advanceTimersByTime(100);
    await vi.runAllTimersAsync();

    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    expect(eventBus.publish.mock.calls[0][0].payload.messages).toHaveLength(2);
    vi.useRealTimers();
  });
});

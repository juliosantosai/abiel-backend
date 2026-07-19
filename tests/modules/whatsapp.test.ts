import { describe, it, expect, vi } from "vitest";
import { WhatsAppService } from "../../src/modules/whatsapp/application/whatsapp-service";
import { WhatsAppController } from "../../src/modules/whatsapp/presentation/whatsapp-controller";

describe("whatsapp module", () => {
  it("receives a message through the service", async () => {
    const message = { id: "wa-1", from: "user", to: "bot", body: "hola", sentAt: new Date() };
    const service = new WhatsAppService();

    await expect(service.receive(message)).resolves.toEqual(message);
  });

  it("receives a message through the controller", async () => {
    const message = { id: "wa-1", from: "user", to: "bot", body: "hola", sentAt: new Date() };
    const service = { receive: vi.fn().mockResolvedValue(message) };
    const controller = new WhatsAppController(service as any);
    const reply = { status: vi.fn().mockReturnThis(), send: vi.fn().mockReturnValue({ ok: true }) };

    await controller.receive({ body: message } as any, reply as any);

    expect(service.receive).toHaveBeenCalledWith(message);
    expect(reply.status).toHaveBeenCalledWith(200);
  });
});

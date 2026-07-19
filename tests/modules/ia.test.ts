import { describe, it, expect, vi } from "vitest";
import { IAService } from "../../src/modules/ia/application/ia-service";
import { IAController } from "../../src/modules/ia/presentation/ia-controller";

describe("ia module", () => {
  it("answers a prompt through the service", async () => {
    const service = new IAService();

    await expect(service.ask({ prompt: "Hola" })).resolves.toEqual({ answer: "Respuesta simulada para: Hola" });
  });

  it("answers through the controller", async () => {
    const service = { ask: vi.fn().mockResolvedValue({ answer: "Respuesta" }) };
    const controller = new IAController(service as any);
    const reply = { status: vi.fn().mockReturnThis(), send: vi.fn().mockReturnValue({ ok: true }) };

    await controller.ask({ body: { prompt: "Hola" } } as any, reply as any);

    expect(service.ask).toHaveBeenCalledWith({ prompt: "Hola" });
    expect(reply.status).toHaveBeenCalledWith(200);
  });
});

import { describe, it, expect, vi } from "vitest";
import { MensajeService } from "../../src/modules/mensaje/application/mensaje-service";
import { MensajeController } from "../../src/modules/mensaje/presentation/mensaje-controller";

describe("mensaje module", () => {
  it("creates a message through the service", async () => {
    const mensaje = { id: "msg-1", contenido: "Hola", remitente: "user", creadoAt: new Date() };
    const service = new MensajeService();

    await expect(service.create(mensaje)).resolves.toEqual(mensaje);
  });

  it("creates a message through the controller", async () => {
    const mensaje = { id: "msg-1", contenido: "Hola", remitente: "user", creadoAt: new Date() };
    const service = { create: vi.fn().mockResolvedValue(mensaje) };
    const controller = new MensajeController(service as any);
    const reply = { status: vi.fn().mockReturnThis(), send: vi.fn().mockReturnValue({ ok: true }) };

    await controller.create({ body: mensaje } as any, reply as any);

    expect(service.create).toHaveBeenCalledWith(mensaje);
    expect(reply.status).toHaveBeenCalledWith(201);
  });
});

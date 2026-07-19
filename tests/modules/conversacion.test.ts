import { describe, it, expect, vi } from "vitest";
import { ConversacionService } from "../../src/modules/conversacion/application/conversacion-service";
import { ConversacionController } from "../../src/modules/conversacion/presentation/conversacion-controller";

describe("conversacion module", () => {
  it("creates a conversation through the service", async () => {
    const conversacion = { id: "conv-1", nombre: "Soporte", estado: "abierta", createdAt: new Date() };
    const service = new ConversacionService();

    await expect(service.create(conversacion)).resolves.toEqual(conversacion);
  });

  it("creates a conversation through the controller", async () => {
    const conversacion = { id: "conv-1", nombre: "Soporte", estado: "abierta", createdAt: new Date() };
    const service = { create: vi.fn().mockResolvedValue(conversacion) };
    const controller = new ConversacionController(service as any);
    const reply = { status: vi.fn().mockReturnThis(), send: vi.fn().mockReturnValue({ ok: true }) };

    await controller.create({ body: conversacion } as any, reply as any);

    expect(service.create).toHaveBeenCalledWith(conversacion);
    expect(reply.status).toHaveBeenCalledWith(201);
  });
});

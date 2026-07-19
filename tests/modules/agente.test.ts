import { describe, it, expect, vi } from "vitest";
import { AgenteService } from "../../src/modules/agente/application/agente-service";
import { AgenteController } from "../../src/modules/agente/presentation/agente-controller";

describe("agente module", () => {
  it("creates an agent through the service", async () => {
    const agente = { id: "ag-1", nombre: "Asistente", tipo: "bot", activo: true };
    const service = new AgenteService();

    await expect(service.create(agente)).resolves.toEqual(agente);
  });

  it("creates an agent through the controller", async () => {
    const agente = { id: "ag-1", nombre: "Asistente", tipo: "bot", activo: true };
    const service = { create: vi.fn().mockResolvedValue(agente) };
    const controller = new AgenteController(service as any);
    const reply = { status: vi.fn().mockReturnThis(), send: vi.fn().mockReturnValue({ ok: true }) };

    await controller.create({ body: agente } as any, reply as any);

    expect(service.create).toHaveBeenCalledWith(agente);
    expect(reply.status).toHaveBeenCalledWith(201);
  });
});

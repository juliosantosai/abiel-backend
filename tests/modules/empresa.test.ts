import { describe, it, expect, vi } from "vitest";
import { EmpresaService } from "../../src/modules/empresa/application/empresa-service";
import { EmpresaController } from "../../src/modules/empresa/presentation/empresa-controller";

describe("empresa module", () => {
  it("creates an empresa through the service", async () => {
    const empresa = {
      id: "empresa-1",
      nombre: "Abiel",
      email: "contacto@abiel.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const repository = {
      create: vi.fn().mockResolvedValue(empresa),
    };

    const service = new EmpresaService(repository as any);
    await expect(service.create(empresa)).resolves.toEqual(empresa);
  });

  it("returns all empresas through the controller", async () => {
    const empresas = [{ id: "empresa-1", nombre: "Abiel", email: "contacto@abiel.com" }];
    const service = { findAll: vi.fn().mockResolvedValue(empresas) };
    const controller = new EmpresaController(service as any);
    const reply = { send: vi.fn().mockReturnValue({ ok: true }) };

    await controller.getAll({} as any, reply as any);

    expect(service.findAll).toHaveBeenCalled();
    expect(reply.send).toHaveBeenCalledWith(empresas);
  });
});

import { describe, it, expect, vi } from "vitest";
import Fastify from "fastify";
import { Empresa } from "../../src/modules/empresa/domain/empresa";
import { EmpresaService } from "../../src/modules/empresa/application/empresa-service";
import { registerEmpresaRoutes } from "../../src/modules/empresa/presentation/empresa-controller";

describe("empresa module", () => {
  it("creates an empresa and validates required name", async () => {
    const repository = {
      create: vi.fn().mockImplementation(async (empresa) => empresa),
    };

    const service = new EmpresaService(repository as any);

    const result = await service.crearEmpresa({ nombre: "Abiel", plan: "starter" });

    expect(result.nombre).toBe("Abiel");
    expect(result.plan).toBe("starter");
    expect(result.activo).toBe(true);
    expect(repository.create).toHaveBeenCalled();
  });

  it("throws when nombre is missing", async () => {
    const repository = {
      create: vi.fn(),
    };

    const service = new EmpresaService(repository as any);

    await expect(service.crearEmpresa({ nombre: "", plan: "starter" })).rejects.toThrow(
      "El nombre de la empresa es obligatorio"
    );
  });

  it("changes plan and toggles active state on Empresa entity", () => {
    const empresa = new Empresa({
      id: "empresa-1",
      nombre: "Abiel",
      plan: "starter",
      activo: true,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    });

    empresa.cambiarPlan("enterprise");
    expect(empresa.plan).toBe("enterprise");

    empresa.desactivar();
    expect(empresa.activo).toBe(false);

    empresa.activar();
    expect(empresa.activo).toBe(true);
  });

  it("exposes HTTP endpoints for empresas", async () => {
    const service = {
      listarEmpresas: vi.fn().mockResolvedValue([]),
      obtenerEmpresaPorId: vi.fn().mockResolvedValue({
        id: "empresa-1",
        nombre: "Abiel",
        plan: "starter",
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      crearEmpresa: vi.fn().mockImplementation(async (input) => ({
        id: "empresa-2",
        nombre: input.nombre,
        plan: input.plan,
        activo: input.activo ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      actualizarEmpresa: vi.fn().mockImplementation(async (id, input) => ({
        id,
        nombre: input.nombre ?? "Abiel",
        plan: input.plan ?? "starter",
        activo: input.activo ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      eliminarEmpresa: vi.fn().mockResolvedValue(undefined),
    };

    const app = Fastify();
    registerEmpresaRoutes(app, service as any);

    const createResponse = await app.inject({
      method: "POST",
      url: "/empresas",
      payload: { nombre: "Abiel", plan: "starter" },
    });
    expect(createResponse.statusCode).toBe(201);

    const listResponse = await app.inject({ method: "GET", url: "/empresas" });
    expect(listResponse.statusCode).toBe(200);

    const getResponse = await app.inject({ method: "GET", url: "/empresas/empresa-1" });
    expect(getResponse.statusCode).toBe(200);

    const updateResponse = await app.inject({
      method: "PUT",
      url: "/empresas/empresa-1",
      payload: { plan: "enterprise" },
    });
    expect(updateResponse.statusCode).toBe(200);

    const deleteResponse = await app.inject({ method: "DELETE", url: "/empresas/empresa-1" });
    expect(deleteResponse.statusCode).toBe(204);

    await app.close();
  });
});

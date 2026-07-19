import { describe, expect, it, vi } from "vitest";
import { SuscripcionService } from "../../src/modules/suscripcion/application/suscripcion-service";

describe("SuscripcionService", () => {
  const suscripcionRepository = {
    findById: vi.fn(),
    findAll: vi.fn(),
    findByEmpresaId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };

  const empresaRepository = {
    findById: vi.fn(),
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const planRepository = {
    findById: vi.fn(),
    findBySlug: vi.fn(),
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const service = new SuscripcionService(suscripcionRepository as any, empresaRepository as any, planRepository as any);

  it("creates a subscription correctly", async () => {
    empresaRepository.findById.mockResolvedValue({ id: "empresa-1" });
    planRepository.findById.mockResolvedValue({ id: "plan-1", activo: true });
    suscripcionRepository.create.mockImplementation(async (suscripcion) => suscripcion);

    const result = await service.crearSuscripcion({ empresaId: "empresa-1", planId: "plan-1", fechaInicio: new Date("2026-01-01") });

    expect(result.empresaId).toBe("empresa-1");
    expect(result.planId).toBe("plan-1");
    expect(result.estado).toBe("PENDIENTE");
    expect(result.activo).toBe(false);
  });

  it("lists subscriptions and searches by company", async () => {
    const subscriptions = [{ id: "sub-1", empresaId: "empresa-1", planId: "plan-1", estado: "PENDIENTE", activo: false }];
    suscripcionRepository.findAll.mockResolvedValue(subscriptions);
    suscripcionRepository.findByEmpresaId.mockResolvedValue(subscriptions);

    await expect(service.listarSuscripciones()).resolves.toEqual(subscriptions);
    await expect(service.listarPorEmpresa("empresa-1")).resolves.toEqual(subscriptions);
  });

  it("activates, cancels and changes plan", async () => {
    const existing = {
      id: "sub-1",
      empresaId: "empresa-1",
      planId: "plan-1",
      fechaInicio: new Date("2026-01-01"),
      fechaFin: null,
      estado: "PENDIENTE",
      activo: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    suscripcionRepository.findById.mockResolvedValue(existing);
    suscripcionRepository.update.mockImplementation(async (_id, suscripcion) => suscripcion);

    const activated = await service.activarSuscripcion("sub-1");
    expect(activated.estado).toBe("ACTIVA");
    expect(activated.activo).toBe(true);

    const cancelled = await service.cancelarSuscripcion("sub-1");
    expect(cancelled.estado).toBe("CANCELADA");
    expect(cancelled.activo).toBe(false);

    const changed = await service.cambiarPlan("sub-1", "plan-2");
    expect(changed.planId).toBe("plan-2");
  });

  it("throws for invalid business rules", async () => {
    empresaRepository.findById.mockResolvedValue(null);
    await expect(service.crearSuscripcion({ empresaId: "unknown", planId: "plan-1", fechaInicio: new Date() })).rejects.toThrow("Empresa no encontrada");

    empresaRepository.findById.mockResolvedValue({ id: "empresa-1" });
    planRepository.findById.mockResolvedValue(null);
    await expect(service.crearSuscripcion({ empresaId: "empresa-1", planId: "unknown", fechaInicio: new Date() })).rejects.toThrow("Plan no encontrado");

    planRepository.findById.mockResolvedValue({ id: "plan-1", activo: false });
    await expect(service.crearSuscripcion({ empresaId: "empresa-1", planId: "plan-1", fechaInicio: new Date() })).rejects.toThrow("El plan no está activo");

    suscripcionRepository.findById.mockResolvedValue(null);
    await expect(service.activarSuscripcion("missing")).rejects.toThrow("Suscripción no encontrada");
  });
});

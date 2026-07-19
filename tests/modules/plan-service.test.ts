import { describe, expect, it, vi } from "vitest";
import { PlanService } from "../../src/modules/plan/application/plan-service";
import { Plan } from "../../src/modules/plan/domain/plan";

describe("PlanService", () => {
  const repository = {
    findBySlug: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const service = new PlanService(repository as any);

  it("creates a plan and validates required fields", async () => {
    repository.findBySlug.mockResolvedValue(null);
    repository.create.mockImplementation(async (plan) => plan);

    const result = await service.crearPlan({
      nombre: "Starter",
      slug: "starter",
      descripcion: "Plan inicial",
      precio: 19.9,
      intervalo: "MENSUAL",
    });

    expect(result.nombre).toBe("Starter");
    expect(result.slug).toBe("starter");
    expect(result.precio).toBe(19.9);
    expect(result.intervalo).toBe("MENSUAL");
    expect(repository.findBySlug).toHaveBeenCalledWith("starter");
    expect(repository.create).toHaveBeenCalled();
  });

  it("throws when slug already exists", async () => {
    repository.findBySlug.mockResolvedValue({ id: "plan-1" } as any);

    await expect(
      service.crearPlan({
        nombre: "Starter",
        slug: "starter",
        descripcion: "Plan inicial",
        precio: 19.9,
        intervalo: "MENSUAL",
      })
    ).rejects.toThrow("Slug del plan ya existe");
  });

  it("throws when required data is invalid", async () => {
    repository.findBySlug.mockResolvedValue(null);

    await expect(
      service.crearPlan({
        nombre: "",
        slug: "starter",
        descripcion: "Plan inicial",
        precio: 19.9,
        intervalo: "MENSUAL",
      })
    ).rejects.toThrow("El nombre del plan es obligatorio");

    await expect(
      service.crearPlan({
        nombre: "Starter",
        slug: "invalid slug",
        descripcion: "Plan inicial",
        precio: 19.9,
        intervalo: "MENSUAL",
      })
    ).rejects.toThrow("El slug del plan no es válido");

    await expect(
      service.crearPlan({
        nombre: "Starter",
        slug: "starter",
        descripcion: "Plan inicial",
        precio: -1,
        intervalo: "MENSUAL",
      })
    ).rejects.toThrow("El precio del plan no puede ser negativo");

    await expect(
      service.crearPlan({
        nombre: "Starter",
        slug: "starter",
        descripcion: "Plan inicial",
        precio: 19.9,
        intervalo: "INVALID" as any,
      })
    ).rejects.toThrow("El intervalo del plan debe ser MENSUAL o ANUAL");
  });

  it("lists plans", async () => {
    const plans = [
      { id: "plan-1", nombre: "Starter", slug: "starter", descripcion: "Plan inicial", precio: 19.9, intervalo: "MENSUAL", activo: true, createdAt: new Date(), updatedAt: new Date() },
    ];

    repository.findAll.mockResolvedValue(plans);

    const result = await service.listarPlanes();
    expect(result).toEqual(plans);
  });

  it("obtains a plan by id", async () => {
    const plan = { id: "plan-1", nombre: "Starter", slug: "starter", descripcion: "Plan inicial", precio: 19.9, intervalo: "MENSUAL", activo: true, createdAt: new Date(), updatedAt: new Date() };
    repository.findById.mockResolvedValue(plan);

    const result = await service.obtenerPlanPorId("plan-1");
    expect(result).toEqual(plan);
  });

  it("updates a plan and validates slug uniqueness", async () => {
    const existing = { id: "plan-1", nombre: "Starter", slug: "starter", descripcion: "Plan inicial", precio: 19.9, intervalo: "MENSUAL", activo: true, createdAt: new Date(), updatedAt: new Date() };
    repository.findById.mockResolvedValue(existing);
    repository.findBySlug.mockResolvedValue(null);
    repository.update.mockResolvedValue({ ...existing, nombre: "Enterprise" });

    const result = await service.actualizarPlan("plan-1", { nombre: "Enterprise" });
    expect(result.nombre).toBe("Enterprise");
  });

  it("throws when updating a nonexistent plan", async () => {
    repository.findById.mockResolvedValue(null);
    await expect(service.actualizarPlan("plan-unknown", { nombre: "Enterprise" })).rejects.toThrow("Plan no encontrado");
  });

  it("activates and deactivates a plan", async () => {
    const existing = { id: "plan-1", nombre: "Starter", slug: "starter", descripcion: "Plan inicial", precio: 19.9, intervalo: "MENSUAL", activo: false, createdAt: new Date(), updatedAt: new Date() };
    repository.findById.mockResolvedValue(existing);
    repository.update.mockImplementation(async (_id, plan) => plan as any);

    const activated = await service.activarPlan("plan-1");
    expect(activated.activo).toBe(true);

    const deactivated = await service.desactivarPlan("plan-1");
    expect(deactivated.activo).toBe(false);
  });
});

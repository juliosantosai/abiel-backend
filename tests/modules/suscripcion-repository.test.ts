import { afterEach, describe, expect, it } from "vitest";
import { PrismaSuscripcionRepository } from "../../src/modules/suscripcion/infrastructure/prisma-suscripcion-repository";
import { prisma } from "../../src/shared/database/prisma";
import { ensurePrismaSchema } from "../setup";

describe("Suscripcion Prisma repository", () => {
  const repository = new PrismaSuscripcionRepository();

  beforeAll(() => {
    ensurePrismaSchema();
  });

  afterEach(async () => {
    await prisma.suscripcion.deleteMany({
      where: {
        id: {
          startsWith: "suscripcion-test-",
        },
      },
    });
    await prisma.usuario.deleteMany({ where: { empresaId: { startsWith: "empresa-suscripcion-test-" } } });
    await prisma.empresa.deleteMany({ where: { id: { startsWith: "empresa-suscripcion-test-" } } });
    await prisma.plan.deleteMany({ where: { slug: { startsWith: "plan-suscripcion-test-" } } });
  });

  it("creates, reads, lists and updates a suscripcion", async () => {
    const empresa = await prisma.empresa.create({
      data: {
        id: "empresa-suscripcion-test-1",
        nombre: "Empresa Suscripcion",
        plan: "starter",
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const plan = await prisma.plan.create({
      data: {
        id: "plan-suscripcion-test-1",
        nombre: "Plan Suscripcion",
        slug: "plan-suscripcion-test-1",
        descripcion: "Plan de prueba",
        precio: 29.9,
        intervalo: "MENSUAL",
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const created = await repository.create({
      id: "suscripcion-test-1",
      empresaId: empresa.id,
      planId: plan.id,
      fechaInicio: new Date("2026-01-01T00:00:00.000Z"),
      fechaFin: null,
      estado: "PENDIENTE",
      activo: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(created.id).toBe("suscripcion-test-1");
    expect(created.empresaId).toBe(empresa.id);
    expect(created.planId).toBe(plan.id);

    const found = await repository.findById("suscripcion-test-1");
    expect(found).not.toBeNull();
    expect(found?.estado).toBe("PENDIENTE");

    const byEmpresa = await repository.findByEmpresaId(empresa.id);
    expect(byEmpresa.some((item) => item.id === created.id)).toBe(true);

    const updated = await repository.update("suscripcion-test-1", { estado: "ACTIVA", activo: true });
    expect(updated).not.toBeNull();
    expect(updated?.estado).toBe("ACTIVA");
    expect(updated?.activo).toBe(true);
  });
});

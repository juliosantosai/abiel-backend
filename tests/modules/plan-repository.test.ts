import { afterEach, describe, expect, it } from "vitest";
import { PrismaPlanRepository } from "../../src/modules/plan/infrastructure/prisma-plan-repository";
import { prisma } from "../../src/shared/database/prisma";

const repository = new PrismaPlanRepository();

describe("Plan Prisma repository", () => {
  const testId = `plan-test-${Date.now()}`;
  const testSlug = `plan-test-slug-${Date.now()}`;

  afterEach(async () => {
    await prisma.plan.deleteMany({ where: { slug: testSlug } });
  });

  it("creates, reads, lists, finds by slug and updates a plan", async () => {
    const created = await repository.create({
      id: testId,
      nombre: "Plan Test",
      slug: testSlug,
      descripcion: "Plan de prueba",
      precio: 49.9,
      intervalo: "MENSUAL",
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(created).toMatchObject({
      id: testId,
      nombre: "Plan Test",
      slug: testSlug,
      precio: 49.9,
      intervalo: "MENSUAL",
      activo: true,
    });

    const found = await repository.findById(testId);
    expect(found).not.toBeNull();
    expect(found?.slug).toBe(testSlug);

    const foundBySlug = await repository.findBySlug(testSlug);
    expect(foundBySlug).not.toBeNull();
    expect(foundBySlug?.id).toBe(testId);

    const all = await repository.findAll();
    expect(all.some((plan) => plan.id === testId)).toBe(true);

    const updated = await repository.update(testId, { nombre: "Plan Test Updated", precio: 59.9 });
    expect(updated).not.toBeNull();
    expect(updated?.nombre).toBe("Plan Test Updated");
    expect(updated?.precio).toBe(59.9);
  });
});

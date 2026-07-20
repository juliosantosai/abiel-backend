import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { PrismaEmpresaRepository } from "../../src/modules/empresa/infrastructure/prisma-empresa-repository";
import { prisma } from "../../src/shared/database/prisma";
import { ensurePrismaSchema } from "../setup";

const repository = new PrismaEmpresaRepository();

describe("Empresa Prisma repository", () => {
  const testId = `empresa-test-${Date.now()}`;

  beforeAll(() => {
    ensurePrismaSchema();
  });

  afterEach(async () => {
    await prisma.empresa.deleteMany({ where: { id: testId } });
  });

  it("creates, reads, updates and deletes a empresa", async () => {
    const created = await repository.create({
      id: testId,
      nombre: "Empresa Test",
      plan: "starter",
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(created).toMatchObject({
      id: testId,
      nombre: "Empresa Test",
      plan: "starter",
      activo: true,
    });

    const found = await repository.findById(testId);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(testId);

    const updated = await repository.update(testId, {
      plan: "enterprise",
      activo: false,
    });

    expect(updated).not.toBeNull();
    expect(updated?.plan).toBe("enterprise");
    expect(updated?.activo).toBe(false);

    await repository.delete(testId);
    const deleted = await repository.findById(testId);
    expect(deleted).toBeNull();
  });
});

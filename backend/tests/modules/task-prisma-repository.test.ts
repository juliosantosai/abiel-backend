import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { PrismaTaskRepository } from "../../src/modules/task/infrastructure/prisma-task-repository";
import { prisma } from "../../src/shared/database/prisma";
import { ensurePrismaSchema } from "../setup";

const repository = new PrismaTaskRepository();

describe("Prisma Task repository - tenant isolation", () => {
  const empresaA = `empresa-A-${Date.now()}`;
  const empresaB = `empresa-B-${Date.now()}`;
  const taskA = `task-A-${Date.now()}`;
  const taskB = `task-B-${Date.now()}`;

  beforeAll(() => {
    ensurePrismaSchema();
  });

  beforeAll(async () => {
    ensurePrismaSchema();
    // create tenant rows required by FK
    await prisma.empresa.createMany({
      data: [
        { id: empresaA, nombre: "Empresa A", plan: "dev", activo: true, createdAt: new Date(), updatedAt: new Date() },
        { id: empresaB, nombre: "Empresa B", plan: "dev", activo: true, createdAt: new Date(), updatedAt: new Date() },
      ],
      skipDuplicates: true,
    });
  });

  afterEach(async () => {
    await prisma.task.deleteMany({ where: { id: { in: [taskA, taskB] } } });
  });

  afterAll(async () => {
    await prisma.empresa.deleteMany({ where: { id: { in: [empresaA, empresaB] } } });
  });

  it("persists tasks and queries are tenant-scoped", async () => {
    await repository.create({
      id: taskA,
      empresaId: empresaA,
      title: "Task A",
      type: "HUMAN",
      priority: "MEDIUM",
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    await repository.create({
      id: taskB,
      empresaId: empresaB,
      title: "Task B",
      type: "AUTOMATED",
      priority: "LOW",
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const tasksA = await repository.findAllByEmpresa(empresaA);
    expect(tasksA.length).toBeGreaterThanOrEqual(1);
    expect(tasksA.every((t) => t.empresaId === empresaA)).toBe(true);

    const tasksB = await repository.findAllByEmpresa(empresaB);
    expect(tasksB.length).toBeGreaterThanOrEqual(1);
    expect(tasksB.every((t) => t.empresaId === empresaB)).toBe(true);
  });
});

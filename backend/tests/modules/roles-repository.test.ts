import { describe, expect, it, vi } from "vitest";
import { PrismaRoleRepository } from "../../src/modules/roles/infrastructure/prisma-role-repository";

describe("roles repository", () => {
  it("exposes repository methods", () => {
    const repository = new PrismaRoleRepository();

    expect(typeof repository.findAll).toBe("function");
    expect(typeof repository.createRol).toBe("function");
    expect(typeof repository.createPermiso).toBe("function");
  });
});

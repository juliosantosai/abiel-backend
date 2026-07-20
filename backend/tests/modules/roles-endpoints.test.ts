import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import Fastify from "fastify";
import { RoleService } from "../../src/modules/roles/application/role-service";
import { PrismaRoleRepository } from "../../src/modules/roles/infrastructure/prisma-role-repository";
import { registerRoleRoutes } from "../../src/modules/roles/presentation/role-controller";
import { prisma } from "../../src/shared/database/prisma";
import { ensurePrismaSchema } from "../setup";

describe("roles HTTP endpoints", () => {
  const app = Fastify();
  const repository = new PrismaRoleRepository();
  const service = new RoleService(repository);

  beforeAll(() => {
    ensurePrismaSchema();
  });

  registerRoleRoutes(app, service);

  const createdRoleIds: string[] = [];
  const createdPermisoIds: string[] = [];

  afterEach(async () => {
    if (createdRoleIds.length) {
      await prisma.rol.deleteMany({ where: { id: { in: createdRoleIds } } });
      createdRoleIds.length = 0;
    }

    if (createdPermisoIds.length) {
      await prisma.permiso.deleteMany({ where: { id: { in: createdPermisoIds } } });
      createdPermisoIds.length = 0;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it("creates roles and permissions through HTTP", async () => {
    const createRoleResponse = await app.inject({
      method: "POST",
      url: "/roles",
      payload: {
        tipo: "GLOBAL",
        nombre: "SUPER_ADMIN",
      },
    });

    expect(createRoleResponse.statusCode).toBe(201);
    const createdRole = createRoleResponse.json();
    createdRoleIds.push(createdRole.id);

    const createPermisoResponse = await app.inject({
      method: "POST",
      url: "/roles/permisos",
      payload: {
        nombre: "Ver dashboard",
        slug: "dashboard.ver",
      },
    });

    expect(createPermisoResponse.statusCode).toBe(201);
    const createdPermiso = createPermisoResponse.json();
    createdPermisoIds.push(createdPermiso.id);

    const listRolesResponse = await app.inject({ method: "GET", url: "/roles" });
    expect(listRolesResponse.statusCode).toBe(200);

    const listPermisosResponse = await app.inject({ method: "GET", url: "/roles/permisos" });
    expect(listPermisosResponse.statusCode).toBe(200);
  });
});

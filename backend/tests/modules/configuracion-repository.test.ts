import { afterEach, describe, expect, it } from "vitest";
import { PrismaConfiguracionRepository } from "../../src/modules/configuracion/infrastructure/prisma-configuracion-repository";
import { prisma } from "../../src/shared/database/prisma";
import { ensurePrismaSchema } from "../setup";

describe("Configuracion Prisma repository", () => {
  const repository = new PrismaConfiguracionRepository();

  beforeAll(() => {
    ensurePrismaSchema();
  });

  afterEach(async () => {
    await prisma.configuracion.deleteMany({ where: { id: { startsWith: "config-test-" } } });
    await prisma.empresa.deleteMany({ where: { id: { startsWith: "empresa-config-test-" } } });
  });

  it("creates, reads, lists and updates a configuration", async () => {
    const empresa = await prisma.empresa.create({
      data: {
        id: "empresa-config-test-1",
        nombre: "Empresa Config",
        plan: "starter",
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const created = await repository.create({
      id: "config-test-1",
      empresaId: empresa.id,
      idioma: "ES",
      zonaHoraria: "UTC",
      notificacionesEmail: true,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(created.id).toBe("config-test-1");
    expect(created.empresaId).toBe(empresa.id);

    const byId = await repository.findById("config-test-1");
    expect(byId).not.toBeNull();

    const byEmpresa = await repository.findByEmpresaId(empresa.id);
    expect(byEmpresa.some((item) => item.id === created.id)).toBe(true);

    const updated = await repository.update("config-test-1", { idioma: "EN" });
    expect(updated).not.toBeNull();
    expect(updated?.idioma).toBe("EN");
  });
});

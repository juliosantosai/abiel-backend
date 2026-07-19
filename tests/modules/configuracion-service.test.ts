import { describe, expect, it, vi } from "vitest";
import { ConfiguracionService } from "../../src/modules/configuracion/application/configuracion-service";

describe("ConfiguracionService", () => {
  const configuracionRepository = {
    findById: vi.fn(),
    findByEmpresaId: vi.fn(),
    findAll: vi.fn(),
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

  const service = new ConfiguracionService(configuracionRepository as any, empresaRepository as any);

  it("creates a configuration", async () => {
    empresaRepository.findById.mockResolvedValue({ id: "empresa-1" });
    configuracionRepository.findByEmpresaId.mockResolvedValue([]);
    configuracionRepository.create.mockImplementation(async (config) => config);

    const result = await service.crearConfiguracion({ empresaId: "empresa-1", idioma: "ES", zonaHoraria: "UTC" });

    expect(result.empresaId).toBe("empresa-1");
    expect(result.idioma).toBe("ES");
    expect(result.activo).toBe(true);
  });

  it("validates duplicate config and missing company", async () => {
    empresaRepository.findById.mockResolvedValue(null);
    await expect(service.crearConfiguracion({ empresaId: "missing", idioma: "ES", zonaHoraria: "UTC" })).rejects.toThrow("Empresa no encontrada");

    empresaRepository.findById.mockResolvedValue({ id: "empresa-1" });
    configuracionRepository.findByEmpresaId.mockResolvedValue([{ id: "config-1" }]);
    await expect(service.crearConfiguracion({ empresaId: "empresa-1", idioma: "ES", zonaHoraria: "UTC" })).rejects.toThrow("Ya existe una configuración para esta empresa");
  });

  it("updates and toggles state", async () => {
    const existing = {
      id: "config-1",
      empresaId: "empresa-1",
      idioma: "ES",
      zonaHoraria: "UTC",
      notificacionesEmail: true,
      activo: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    configuracionRepository.findById.mockResolvedValue(existing);
    configuracionRepository.update.mockImplementation(async (_id, config) => config);

    const updated = await service.actualizar("config-1", { idioma: "EN", zonaHoraria: "America/Bogota" });
    expect(updated.idioma).toBe("EN");
    expect(updated.zonaHoraria).toBe("America/Bogota");

    const activated = await service.activar("config-1");
    expect(activated.activo).toBe(true);
  });
});

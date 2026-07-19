import { describe, expect, it } from "vitest";
import { Configuracion } from "../../src/modules/configuracion/domain/configuracion";

describe("Configuracion entity", () => {
  it("creates a valid configuration", () => {
    const configuracion = new Configuracion({
      id: "config-1",
      empresaId: "empresa-1",
      idioma: "ES",
      zonaHoraria: "UTC",
      notificacionesEmail: true,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(configuracion.empresaId).toBe("empresa-1");
    expect(configuracion.idioma).toBe("ES");
    expect(configuracion.activo).toBe(true);
  });

  it("validates required fields", () => {
    expect(() => new Configuracion({
      id: "config-1",
      empresaId: "",
      idioma: "ES",
      zonaHoraria: "UTC",
      notificacionesEmail: true,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })).toThrow("El empresaId de la configuración es obligatorio");

    expect(() => new Configuracion({
      id: "config-1",
      empresaId: "empresa-1",
      idioma: "FR" as any,
      zonaHoraria: "UTC",
      notificacionesEmail: true,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })).toThrow("El idioma de la configuración no es válido");

    expect(() => new Configuracion({
      id: "config-1",
      empresaId: "empresa-1",
      idioma: "ES",
      zonaHoraria: "",
      notificacionesEmail: true,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })).toThrow("La zonaHoraria de la configuración es obligatoria");
  });

  it("updates, activates and deactivates", () => {
    const configuracion = new Configuracion({
      id: "config-1",
      empresaId: "empresa-1",
      idioma: "ES",
      zonaHoraria: "UTC",
      notificacionesEmail: true,
      activo: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    configuracion.actualizarConfiguracion({ idioma: "EN", zonaHoraria: "America/Bogota" });
    expect(configuracion.idioma).toBe("EN");
    expect(configuracion.zonaHoraria).toBe("America/Bogota");

    configuracion.activar();
    expect(configuracion.activo).toBe(true);

    configuracion.desactivar();
    expect(configuracion.activo).toBe(false);
  });
});

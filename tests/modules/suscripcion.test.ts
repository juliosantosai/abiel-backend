import { describe, expect, it } from "vitest";
import { Suscripcion } from "../../src/modules/suscripcion/domain/suscripcion";

describe("Suscripcion entity", () => {
  it("creates a valid subscription", () => {
    const suscripcion = new Suscripcion({
      id: "sub-1",
      empresaId: "empresa-1",
      planId: "plan-1",
      fechaInicio: new Date("2026-01-01T00:00:00.000Z"),
      fechaFin: null,
      estado: "PENDIENTE",
      activo: false,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    expect(suscripcion.empresaId).toBe("empresa-1");
    expect(suscripcion.planId).toBe("plan-1");
    expect(suscripcion.estado).toBe("PENDIENTE");
    expect(suscripcion.activo).toBe(false);
  });

  it("validates required fields and state", () => {
    expect(() => new Suscripcion({
      id: "sub-1",
      empresaId: "",
      planId: "plan-1",
      fechaInicio: new Date(),
      fechaFin: null,
      estado: "PENDIENTE",
      activo: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })).toThrow("La empresaId de la suscripción es obligatoria");

    expect(() => new Suscripcion({
      id: "sub-1",
      empresaId: "empresa-1",
      planId: "",
      fechaInicio: new Date(),
      fechaFin: null,
      estado: "PENDIENTE",
      activo: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })).toThrow("La planId de la suscripción es obligatoria");

    expect(() => new Suscripcion({
      id: "sub-1",
      empresaId: "empresa-1",
      planId: "plan-1",
      fechaInicio: null as any,
      fechaFin: null,
      estado: "PENDIENTE",
      activo: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })).toThrow("La fechaInicio de la suscripción es obligatoria");

    expect(() => new Suscripcion({
      id: "sub-1",
      empresaId: "empresa-1",
      planId: "plan-1",
      fechaInicio: new Date(),
      fechaFin: null,
      estado: "INVALID" as any,
      activo: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })).toThrow("El estado de la suscripción no es válido");
  });

  it("activates, cancels, expires and changes the plan", () => {
    const suscripcion = new Suscripcion({
      id: "sub-1",
      empresaId: "empresa-1",
      planId: "plan-1",
      fechaInicio: new Date(),
      fechaFin: null,
      estado: "PENDIENTE",
      activo: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    suscripcion.activar();
    expect(suscripcion.estado).toBe("ACTIVA");
    expect(suscripcion.activo).toBe(true);

    suscripcion.cancelar();
    expect(suscripcion.estado).toBe("CANCELADA");
    expect(suscripcion.activo).toBe(false);

    expect(() => suscripcion.activar()).toThrow("No se puede activar una suscripción cancelada");

    const activeSubscription = new Suscripcion({
      id: "sub-2",
      empresaId: "empresa-1",
      planId: "plan-1",
      fechaInicio: new Date(),
      fechaFin: null,
      estado: "PENDIENTE",
      activo: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    activeSubscription.activar();
    activeSubscription.expirar();
    expect(activeSubscription.estado).toBe("EXPIRADA");
    expect(activeSubscription.activo).toBe(false);
    expect(() => activeSubscription.cancelar()).toThrow("No se puede cancelar una suscripción expirada");

    const changed = new Suscripcion({
      id: "sub-3",
      empresaId: "empresa-1",
      planId: "plan-1",
      fechaInicio: new Date(),
      fechaFin: null,
      estado: "PENDIENTE",
      activo: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    changed.cambiarPlan("plan-2");
    expect(changed.planId).toBe("plan-2");
  });
});

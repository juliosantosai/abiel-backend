export type SuscripcionEstado = "PENDIENTE" | "ACTIVA" | "CANCELADA" | "EXPIRADA";

export interface SuscripcionProps {
  id: string;
  empresaId: string;
  planId: string;
  fechaInicio: Date;
  fechaFin: Date | null;
  estado: SuscripcionEstado;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Suscripcion {
  readonly id: string;
  private _empresaId: string;
  private _planId: string;
  private _fechaInicio: Date;
  private _fechaFin: Date | null;
  private _estado: SuscripcionEstado;
  private _activo: boolean;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: SuscripcionProps) {
    if (!props.empresaId || props.empresaId.trim() === "") {
      throw new Error("La empresaId de la suscripción es obligatoria");
    }

    if (!props.planId || props.planId.trim() === "") {
      throw new Error("La planId de la suscripción es obligatoria");
    }

    if (!props.fechaInicio) {
      throw new Error("La fechaInicio de la suscripción es obligatoria");
    }

    if (!Suscripcion.isValidEstado(props.estado)) {
      throw new Error("El estado de la suscripción no es válido");
    }

    this.id = props.id;
    this._empresaId = props.empresaId.trim();
    this._planId = props.planId.trim();
    this._fechaInicio = props.fechaInicio;
    this._fechaFin = props.fechaFin ?? null;
    this._estado = props.estado;
    this._activo = props.activo;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get empresaId() {
    return this._empresaId;
  }

  get planId() {
    return this._planId;
  }

  get fechaInicio() {
    return this._fechaInicio;
  }

  get fechaFin() {
    return this._fechaFin;
  }

  get estado() {
    return this._estado;
  }

  get activo() {
    return this._activo;
  }

  get updatedAt() {
    return this._updatedAt;
  }

  activar() {
    if (this._estado === "CANCELADA") {
      throw new Error("No se puede activar una suscripción cancelada");
    }

    if (this._estado === "EXPIRADA") {
      throw new Error("No se puede activar una suscripción expirada");
    }

    this._estado = "ACTIVA";
    this._activo = true;
    this._touch();
  }

  cancelar() {
    if (this._estado === "EXPIRADA") {
      throw new Error("No se puede cancelar una suscripción expirada");
    }

    this._estado = "CANCELADA";
    this._activo = false;
    this._touch();
  }

  expirar() {
    this._estado = "EXPIRADA";
    this._activo = false;
    this._touch();
  }

  cambiarPlan(planId: string) {
    if (!planId || planId.trim() === "") {
      throw new Error("La planId de la suscripción es obligatoria");
    }

    this._planId = planId.trim();
    this._touch();
  }

  toJSON(): SuscripcionProps {
    return {
      id: this.id,
      empresaId: this._empresaId,
      planId: this._planId,
      fechaInicio: this._fechaInicio,
      fechaFin: this._fechaFin,
      estado: this._estado,
      activo: this._activo,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }

  private _touch() {
    this._updatedAt = new Date();
  }

  private static isValidEstado(value: string): value is SuscripcionEstado {
    return value === "PENDIENTE" || value === "ACTIVA" || value === "CANCELADA" || value === "EXPIRADA";
  }
}

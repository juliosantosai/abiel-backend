export type IdiomaConfiguracion = "ES" | "EN";

export interface ConfiguracionProps {
  id: string;
  empresaId: string;
  idioma: IdiomaConfiguracion;
  zonaHoraria: string;
  notificacionesEmail: boolean;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Configuracion {
  readonly id: string;
  private _empresaId: string;
  private _idioma: IdiomaConfiguracion;
  private _zonaHoraria: string;
  private _notificacionesEmail: boolean;
  private _activo: boolean;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: ConfiguracionProps) {
    if (!props.empresaId || props.empresaId.trim() === "") {
      throw new Error("El empresaId de la configuración es obligatorio");
    }

    if (!props.idioma || !Configuracion.isValidIdioma(props.idioma)) {
      throw new Error("El idioma de la configuración no es válido");
    }

    if (!props.zonaHoraria || props.zonaHoraria.trim() === "") {
      throw new Error("La zonaHoraria de la configuración es obligatoria");
    }

    this.id = props.id;
    this._empresaId = props.empresaId.trim();
    this._idioma = props.idioma;
    this._zonaHoraria = props.zonaHoraria.trim();
    this._notificacionesEmail = props.notificacionesEmail;
    this._activo = props.activo;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get empresaId() {
    return this._empresaId;
  }

  get idioma() {
    return this._idioma;
  }

  get zonaHoraria() {
    return this._zonaHoraria;
  }

  get notificacionesEmail() {
    return this._notificacionesEmail;
  }

  get activo() {
    return this._activo;
  }

  get updatedAt() {
    return this._updatedAt;
  }

  actualizarConfiguracion(input: Partial<Pick<ConfiguracionProps, "idioma" | "zonaHoraria" | "notificacionesEmail">>) {
    if (input.idioma !== undefined) {
      if (!Configuracion.isValidIdioma(input.idioma)) {
        throw new Error("El idioma de la configuración no es válido");
      }
      this._idioma = input.idioma;
    }

    if (input.zonaHoraria !== undefined) {
      if (!input.zonaHoraria || input.zonaHoraria.trim() === "") {
        throw new Error("La zonaHoraria de la configuración es obligatoria");
      }
      this._zonaHoraria = input.zonaHoraria.trim();
    }

    if (input.notificacionesEmail !== undefined) {
      this._notificacionesEmail = input.notificacionesEmail;
    }

    this._touch();
  }

  activar() {
    if (!this._activo) {
      this._activo = true;
      this._touch();
    }
  }

  desactivar() {
    if (this._activo) {
      this._activo = false;
      this._touch();
    }
  }

  toJSON(): ConfiguracionProps {
    return {
      id: this.id,
      empresaId: this._empresaId,
      idioma: this._idioma,
      zonaHoraria: this._zonaHoraria,
      notificacionesEmail: this._notificacionesEmail,
      activo: this._activo,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }

  private _touch() {
    this._updatedAt = new Date();
  }

  private static isValidIdioma(value: string): value is IdiomaConfiguracion {
    return value === "ES" || value === "EN";
  }
}

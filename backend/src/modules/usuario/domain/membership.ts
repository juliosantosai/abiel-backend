export interface MembershipProps {
  id: string;
  usuarioId: string;
  empresaId: string;
  rolId: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Membership {
  readonly id: string;
  private _usuarioId: string;
  private _empresaId: string;
  private _rolId: string;
  private _activo: boolean;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: MembershipProps) {
    if (!props.usuarioId || props.usuarioId.trim() === "") {
      throw new Error("El usuarioId de la membership es obligatorio");
    }

    if (!props.empresaId || props.empresaId.trim() === "") {
      throw new Error("El empresaId de la membership es obligatorio");
    }

    if (!props.rolId || props.rolId.trim() === "") {
      throw new Error("El rolId de la membership es obligatorio");
    }

    this.id = props.id;
    this._usuarioId = props.usuarioId.trim();
    this._empresaId = props.empresaId.trim();
    this._rolId = props.rolId.trim();
    this._activo = props.activo;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get usuarioId() {
    return this._usuarioId;
  }

  get empresaId() {
    return this._empresaId;
  }

  get rolId() {
    return this._rolId;
  }

  get activo() {
    return this._activo;
  }

  get updatedAt() {
    return this._updatedAt;
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

  toJSON(): MembershipProps {
    return {
      id: this.id,
      usuarioId: this._usuarioId,
      empresaId: this._empresaId,
      rolId: this._rolId,
      activo: this._activo,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }

  private _touch() {
    this._updatedAt = new Date();
  }
}

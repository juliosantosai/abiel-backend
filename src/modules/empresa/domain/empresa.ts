export interface EmpresaProps {
  id: string;
  nombre: string;
  plan: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Empresa {
  readonly id: string;
  private _nombre: string;
  private _plan: string;
  private _activo: boolean;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: EmpresaProps) {
    if (!props.nombre || props.nombre.trim() === "") {
      throw new Error("El nombre de la empresa es obligatorio");
    }

    this.id = props.id;
    this._nombre = props.nombre.trim();
    this._plan = props.plan;
    this._activo = props.activo;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get nombre() {
    return this._nombre;
  }

  get plan() {
    return this._plan;
  }

  get activo() {
    return this._activo;
  }

  get updatedAt() {
    return this._updatedAt;
  }

  cambiarNombre(nombre: string) {
    if (!nombre || nombre.trim() === "") {
      throw new Error("El nombre de la empresa es obligatorio");
    }

    this._nombre = nombre.trim();
    this._touch();
  }

  cambiarPlan(plan: string) {
    if (!plan || plan.trim() === "") {
      throw new Error("El plan de la empresa es obligatorio");
    }

    this._plan = plan.trim();
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

  toJSON(): EmpresaProps {
    return {
      id: this.id,
      nombre: this._nombre,
      plan: this._plan,
      activo: this._activo,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }

  private _touch() {
    this._updatedAt = new Date();
  }
}

export interface PermisoProps {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Permiso {
  readonly id: string;
  private _nombre: string;
  private _slug: string;
  private _descripcion: string | null;
  private _activo: boolean;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: PermisoProps) {
    if (!props.nombre || props.nombre.trim() === "") {
      throw new Error("El nombre del permiso es obligatorio");
    }

    if (!props.slug || props.slug.trim() === "") {
      throw new Error("El slug del permiso es obligatorio");
    }

    this.id = props.id;
    this._nombre = props.nombre.trim();
    this._slug = props.slug.trim();
    this._descripcion = props.descripcion?.trim() ?? null;
    this._activo = props.activo;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get nombre() {
    return this._nombre;
  }

  get slug() {
    return this._slug;
  }

  get descripcion() {
    return this._descripcion;
  }

  get activo() {
    return this._activo;
  }

  get updatedAt() {
    return this._updatedAt;
  }

  actualizarNombre(nombre: string) {
    if (!nombre || nombre.trim() === "") {
      throw new Error("El nombre del permiso es obligatorio");
    }

    this._nombre = nombre.trim();
    this._touch();
  }

  actualizarSlug(slug: string) {
    if (!slug || slug.trim() === "") {
      throw new Error("El slug del permiso es obligatorio");
    }

    this._slug = slug.trim();
    this._touch();
  }

  actualizarDescripcion(descripcion: string | null) {
    this._descripcion = descripcion?.trim() ?? null;
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

  toJSON(): PermisoProps {
    return {
      id: this.id,
      nombre: this._nombre,
      slug: this._slug,
      descripcion: this._descripcion,
      activo: this._activo,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }

  private _touch() {
    this._updatedAt = new Date();
  }
}

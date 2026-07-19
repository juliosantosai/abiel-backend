export type PlanIntervalo = "MENSUAL" | "ANUAL";

export interface PlanProps {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  precio: number;
  intervalo: PlanIntervalo;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Plan {
  readonly id: string;
  private _nombre: string;
  private _slug: string;
  private _descripcion: string;
  private _precio: number;
  private _intervalo: PlanIntervalo;
  private _activo: boolean;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: PlanProps) {
    if (!props.nombre || props.nombre.trim() === "") {
      throw new Error("El nombre del plan es obligatorio");
    }

    if (!props.slug || props.slug.trim() === "") {
      throw new Error("El slug del plan es obligatorio");
    }

    if (!Plan.isValidSlug(props.slug)) {
      throw new Error("El slug del plan no es válido");
    }

    if (props.precio === undefined || props.precio === null || Number.isNaN(props.precio)) {
      throw new Error("El precio del plan es obligatorio");
    }

    if (props.precio < 0) {
      throw new Error("El precio del plan no puede ser negativo");
    }

    if (!Plan.isValidIntervalo(props.intervalo)) {
      throw new Error("El intervalo del plan debe ser MENSUAL o ANUAL");
    }

    this.id = props.id;
    this._nombre = props.nombre.trim();
    this._slug = props.slug.trim();
    this._descripcion = props.descripcion ?? "";
    this._precio = props.precio;
    this._intervalo = props.intervalo;
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

  get precio() {
    return this._precio;
  }

  get intervalo() {
    return this._intervalo;
  }

  get activo() {
    return this._activo;
  }

  get updatedAt() {
    return this._updatedAt;
  }

  cambiarNombre(nombre: string) {
    if (!nombre || nombre.trim() === "") {
      throw new Error("El nombre del plan es obligatorio");
    }

    this._nombre = nombre.trim();
    this._touch();
  }

  cambiarSlug(slug: string) {
    if (!slug || slug.trim() === "") {
      throw new Error("El slug del plan es obligatorio");
    }

    if (!Plan.isValidSlug(slug)) {
      throw new Error("El slug del plan no es válido");
    }

    this._slug = slug.trim();
    this._touch();
  }

  cambiarDescripcion(descripcion: string) {
    this._descripcion = descripcion?.trim() ?? "";
    this._touch();
  }

  cambiarPrecio(precio: number) {
    if (precio === undefined || precio === null || Number.isNaN(precio)) {
      throw new Error("El precio del plan es obligatorio");
    }

    if (precio < 0) {
      throw new Error("El precio del plan no puede ser negativo");
    }

    this._precio = precio;
    this._touch();
  }

  cambiarIntervalo(intervalo: PlanIntervalo) {
    if (!Plan.isValidIntervalo(intervalo)) {
      throw new Error("El intervalo del plan debe ser MENSUAL o ANUAL");
    }

    this._intervalo = intervalo;
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

  toJSON(): PlanProps {
    return {
      id: this.id,
      nombre: this._nombre,
      slug: this._slug,
      descripcion: this._descripcion,
      precio: this._precio,
      intervalo: this._intervalo,
      activo: this._activo,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }

  private _touch() {
    this._updatedAt = new Date();
  }

  private static isValidSlug(slug: string) {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim());
  }

  private static isValidIntervalo(value: string): value is PlanIntervalo {
    return value === "MENSUAL" || value === "ANUAL";
  }
}

export interface UsuarioProps {
  id: string;
  nombre: string;
  email: string;
  passwordHash: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Usuario {
  readonly id: string;
  private _nombre: string;
  private _email: string;
  private _passwordHash: string;
  private _activo: boolean;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: UsuarioProps) {
    if (!props.nombre || props.nombre.trim() === "") {
      throw new Error("El nombre del usuario es obligatorio");
    }

    if (!props.email || props.email.trim() === "") {
      throw new Error("El email del usuario es obligatorio");
    }

    if (!Usuario.isValidEmail(props.email)) {
      throw new Error("El email del usuario no es válido");
    }

    if (!props.passwordHash || props.passwordHash.trim() === "") {
      throw new Error("El passwordHash del usuario es obligatorio");
    }

    this.id = props.id;
    this._nombre = props.nombre.trim();
    this._email = props.email.trim().toLowerCase();
    this._passwordHash = props.passwordHash.trim();
    this._activo = props.activo;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get nombre() {
    return this._nombre;
  }

  get email() {
    return this._email;
  }

  get passwordHash() {
    return this._passwordHash;
  }

  get activo() {
    return this._activo;
  }

  get updatedAt() {
    return this._updatedAt;
  }

  cambiarNombre(nombre: string) {
    if (!nombre || nombre.trim() === "") {
      throw new Error("El nombre del usuario es obligatorio");
    }

    this._nombre = nombre.trim();
    this._touch();
  }

  cambiarEmail(email: string) {
    if (!email || email.trim() === "") {
      throw new Error("El email del usuario es obligatorio");
    }

    if (!Usuario.isValidEmail(email)) {
      throw new Error("El email del usuario no es válido");
    }

    this._email = email.trim().toLowerCase();
    this._touch();
  }

  cambiarPasswordHash(passwordHash: string) {
    if (!passwordHash || passwordHash.trim() === "") {
      throw new Error("El passwordHash del usuario es obligatorio");
    }

    this._passwordHash = passwordHash.trim();
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

  toJSON(): UsuarioProps {
    return {
      id: this.id,
      nombre: this._nombre,
      email: this._email,
      passwordHash: this._passwordHash,
      activo: this._activo,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }

  private _touch() {
    this._updatedAt = new Date();
  }

  private static isValidEmail(email: string) {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
  }
}

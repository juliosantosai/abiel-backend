"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usuario = void 0;
class Usuario {
    id;
    _nombre;
    _email;
    _activo;
    createdAt;
    _updatedAt;
    constructor(props) {
        if (!props.nombre || props.nombre.trim() === "") {
            throw new Error("El nombre del usuario es obligatorio");
        }
        if (!props.email || props.email.trim() === "") {
            throw new Error("El email del usuario es obligatorio");
        }
        if (!Usuario.isValidEmail(props.email)) {
            throw new Error("El email del usuario no es válido");
        }
        this.id = props.id;
        this._nombre = props.nombre.trim();
        this._email = props.email.trim().toLowerCase();
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
    get activo() {
        return this._activo;
    }
    get updatedAt() {
        return this._updatedAt;
    }
    cambiarNombre(nombre) {
        if (!nombre || nombre.trim() === "") {
            throw new Error("El nombre del usuario es obligatorio");
        }
        this._nombre = nombre.trim();
        this._touch();
    }
    cambiarEmail(email) {
        if (!email || email.trim() === "") {
            throw new Error("El email del usuario es obligatorio");
        }
        if (!Usuario.isValidEmail(email)) {
            throw new Error("El email del usuario no es válido");
        }
        this._email = email.trim().toLowerCase();
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
    toJSON() {
        return {
            id: this.id,
            nombre: this._nombre,
            email: this._email,
            activo: this._activo,
            createdAt: this.createdAt,
            updatedAt: this._updatedAt,
        };
    }
    _touch() {
        this._updatedAt = new Date();
    }
    static isValidEmail(email) {
        return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
    }
}
exports.Usuario = Usuario;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rol = void 0;
class Rol {
    id;
    _empresaId;
    _tipo;
    _nombre;
    _descripcion;
    _activo;
    createdAt;
    _updatedAt;
    constructor(props) {
        if (!props.nombre || props.nombre.trim() === "") {
            throw new Error("El nombre del rol es obligatorio");
        }
        if (props.tipo === "TENANT" && (!props.empresaId || props.empresaId.trim() === "")) {
            throw new Error("El empresaId es obligatorio para roles TENANT");
        }
        if (props.tipo === "GLOBAL" && props.empresaId) {
            throw new Error("Los roles GLOBAL no deben tener empresaId");
        }
        this.id = props.id;
        this._empresaId = props.empresaId?.trim() ?? null;
        this._tipo = props.tipo;
        this._nombre = props.nombre.trim();
        this._descripcion = props.descripcion?.trim() ?? null;
        this._activo = props.activo;
        this.createdAt = props.createdAt;
        this._updatedAt = props.updatedAt;
    }
    get empresaId() {
        return this._empresaId;
    }
    get tipo() {
        return this._tipo;
    }
    get nombre() {
        return this._nombre;
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
    actualizarNombre(nombre) {
        if (!nombre || nombre.trim() === "") {
            throw new Error("El nombre del rol es obligatorio");
        }
        this._nombre = nombre.trim();
        this._touch();
    }
    actualizarDescripcion(descripcion) {
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
    toJSON() {
        return {
            id: this.id,
            empresaId: this._empresaId,
            tipo: this._tipo,
            nombre: this._nombre,
            descripcion: this._descripcion,
            activo: this._activo,
            createdAt: this.createdAt,
            updatedAt: this._updatedAt,
        };
    }
    _touch() {
        this._updatedAt = new Date();
    }
}
exports.Rol = Rol;

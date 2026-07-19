"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Membership = void 0;
class Membership {
    id;
    _usuarioId;
    _empresaId;
    _rolId;
    _activo;
    createdAt;
    _updatedAt;
    constructor(props) {
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
    toJSON() {
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
    _touch() {
        this._updatedAt = new Date();
    }
}
exports.Membership = Membership;

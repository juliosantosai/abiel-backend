"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configuracion = void 0;
class Configuracion {
    id;
    _empresaId;
    _idioma;
    _zonaHoraria;
    _notificacionesEmail;
    _activo;
    createdAt;
    _updatedAt;
    constructor(props) {
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
    actualizarConfiguracion(input) {
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
    toJSON() {
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
    _touch() {
        this._updatedAt = new Date();
    }
    static isValidIdioma(value) {
        return value === "ES" || value === "EN";
    }
}
exports.Configuracion = Configuracion;

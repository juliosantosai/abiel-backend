"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfiguracionService = void 0;
const uuid_1 = require("../../../shared/utils/uuid");
const configuracion_1 = require("../domain/configuracion");
class ConfiguracionService {
    configuracionRepository;
    empresaRepository;
    constructor(configuracionRepository, empresaRepository) {
        this.configuracionRepository = configuracionRepository;
        this.empresaRepository = empresaRepository;
    }
    async crearConfiguracion(input) {
        const empresa = await this.empresaRepository.findById(input.empresaId);
        if (!empresa) {
            throw new Error("Empresa no encontrada");
        }
        const existing = await this.configuracionRepository.findByEmpresaId(input.empresaId);
        if (existing.length > 0) {
            throw new Error("Ya existe una configuración para esta empresa");
        }
        const configuracion = new configuracion_1.Configuracion({
            id: (0, uuid_1.generateUuid)(),
            empresaId: input.empresaId,
            idioma: input.idioma ?? "ES",
            zonaHoraria: input.zonaHoraria ?? "UTC",
            notificacionesEmail: input.notificacionesEmail ?? true,
            activo: input.activo ?? true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return this.configuracionRepository.create(configuracion.toJSON());
    }
    async obtenerPorId(id) {
        return this.configuracionRepository.findById(id);
    }
    async obtenerPorEmpresa(empresaId) {
        const configuraciones = await this.configuracionRepository.findByEmpresaId(empresaId);
        return configuraciones[0] ?? null;
    }
    async listar() {
        return this.configuracionRepository.findAll();
    }
    async actualizar(id, input) {
        const existing = await this.configuracionRepository.findById(id);
        if (!existing) {
            throw new Error("Configuración no encontrada");
        }
        const configuracion = new configuracion_1.Configuracion(existing);
        configuracion.actualizarConfiguracion({
            idioma: input.idioma,
            zonaHoraria: input.zonaHoraria,
            notificacionesEmail: input.notificacionesEmail,
        });
        if (input.activo !== undefined) {
            if (input.activo) {
                configuracion.activar();
            }
            else {
                configuracion.desactivar();
            }
        }
        const updated = await this.configuracionRepository.update(id, configuracion.toJSON());
        if (!updated) {
            throw new Error("No se pudo actualizar la configuración");
        }
        return updated;
    }
    async activar(id) {
        const existing = await this.configuracionRepository.findById(id);
        if (!existing) {
            throw new Error("Configuración no encontrada");
        }
        const configuracion = new configuracion_1.Configuracion(existing);
        configuracion.activar();
        const updated = await this.configuracionRepository.update(id, configuracion.toJSON());
        if (!updated) {
            throw new Error("No se pudo activar la configuración");
        }
        return updated;
    }
    async desactivar(id) {
        const existing = await this.configuracionRepository.findById(id);
        if (!existing) {
            throw new Error("Configuración no encontrada");
        }
        const configuracion = new configuracion_1.Configuracion(existing);
        configuracion.desactivar();
        const updated = await this.configuracionRepository.update(id, configuracion.toJSON());
        if (!updated) {
            throw new Error("No se pudo desactivar la configuración");
        }
        return updated;
    }
}
exports.ConfiguracionService = ConfiguracionService;

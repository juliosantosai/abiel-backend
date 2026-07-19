"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuscripcionService = void 0;
const uuid_1 = require("../../../shared/utils/uuid");
const suscripcion_1 = require("../domain/suscripcion");
class SuscripcionService {
    suscripcionRepository;
    empresaRepository;
    planRepository;
    constructor(suscripcionRepository, empresaRepository, planRepository) {
        this.suscripcionRepository = suscripcionRepository;
        this.empresaRepository = empresaRepository;
        this.planRepository = planRepository;
    }
    async crearSuscripcion(input) {
        const empresa = await this.empresaRepository.findById(input.empresaId);
        if (!empresa) {
            throw new Error("Empresa no encontrada");
        }
        const plan = await this.planRepository.findById(input.planId);
        if (!plan) {
            throw new Error("Plan no encontrado");
        }
        if (!plan.activo) {
            throw new Error("El plan no está activo");
        }
        const suscripcion = new suscripcion_1.Suscripcion({
            id: (0, uuid_1.generateUuid)(),
            empresaId: input.empresaId,
            planId: input.planId,
            fechaInicio: input.fechaInicio,
            fechaFin: null,
            estado: "PENDIENTE",
            activo: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return this.suscripcionRepository.create(suscripcion.toJSON());
    }
    async obtenerSuscripcionPorId(id) {
        return this.suscripcionRepository.findById(id);
    }
    async listarSuscripciones() {
        return this.suscripcionRepository.findAll();
    }
    async listarPorEmpresa(empresaId) {
        return this.suscripcionRepository.findByEmpresaId(empresaId);
    }
    async activarSuscripcion(id) {
        const existing = await this.suscripcionRepository.findById(id);
        if (!existing) {
            throw new Error("Suscripción no encontrada");
        }
        const suscripcion = new suscripcion_1.Suscripcion(existing);
        suscripcion.activar();
        const updated = await this.suscripcionRepository.update(id, suscripcion.toJSON());
        if (!updated) {
            throw new Error("No se pudo actualizar la suscripción");
        }
        return updated;
    }
    async cancelarSuscripcion(id) {
        const existing = await this.suscripcionRepository.findById(id);
        if (!existing) {
            throw new Error("Suscripción no encontrada");
        }
        const suscripcion = new suscripcion_1.Suscripcion(existing);
        suscripcion.cancelar();
        const updated = await this.suscripcionRepository.update(id, suscripcion.toJSON());
        if (!updated) {
            throw new Error("No se pudo actualizar la suscripción");
        }
        return updated;
    }
    async expirarSuscripcion(id) {
        const existing = await this.suscripcionRepository.findById(id);
        if (!existing) {
            throw new Error("Suscripción no encontrada");
        }
        const suscripcion = new suscripcion_1.Suscripcion(existing);
        suscripcion.expirar();
        const updated = await this.suscripcionRepository.update(id, suscripcion.toJSON());
        if (!updated) {
            throw new Error("No se pudo actualizar la suscripción");
        }
        return updated;
    }
    async cambiarPlan(id, planId) {
        const existing = await this.suscripcionRepository.findById(id);
        if (!existing) {
            throw new Error("Suscripción no encontrada");
        }
        const plan = await this.planRepository.findById(planId);
        if (!plan) {
            throw new Error("Plan no encontrado");
        }
        if (!plan.activo) {
            throw new Error("El plan no está activo");
        }
        const suscripcion = new suscripcion_1.Suscripcion(existing);
        suscripcion.cambiarPlan(planId);
        const updated = await this.suscripcionRepository.update(id, suscripcion.toJSON());
        if (!updated) {
            throw new Error("No se pudo actualizar la suscripción");
        }
        return updated;
    }
}
exports.SuscripcionService = SuscripcionService;

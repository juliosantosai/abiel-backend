"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanService = void 0;
const uuid_1 = require("../../../shared/utils/uuid");
const plan_1 = require("../domain/plan");
class PlanService {
    planRepository;
    constructor(planRepository) {
        this.planRepository = planRepository;
    }
    async crearPlan(input) {
        const existingSlug = await this.planRepository.findBySlug(input.slug);
        if (existingSlug) {
            throw new Error("Slug del plan ya existe");
        }
        const plan = new plan_1.Plan({
            id: (0, uuid_1.generateUuid)(),
            nombre: input.nombre,
            slug: input.slug,
            descripcion: input.descripcion ?? "",
            precio: input.precio,
            intervalo: input.intervalo,
            activo: input.activo ?? true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return this.planRepository.create(plan.toJSON());
    }
    async obtenerPlanPorId(id) {
        return this.planRepository.findById(id);
    }
    async listarPlanes() {
        return this.planRepository.findAll();
    }
    async actualizarPlan(id, input) {
        const existing = await this.planRepository.findById(id);
        if (!existing) {
            throw new Error("Plan no encontrado");
        }
        if (input.slug !== undefined && input.slug !== existing.slug) {
            const duplicate = await this.planRepository.findBySlug(input.slug);
            if (duplicate && duplicate.id !== id) {
                throw new Error("Slug del plan ya existe");
            }
        }
        const plan = new plan_1.Plan(existing);
        if (input.nombre !== undefined) {
            plan.cambiarNombre(input.nombre);
        }
        if (input.slug !== undefined) {
            plan.cambiarSlug(input.slug);
        }
        if (input.descripcion !== undefined) {
            plan.cambiarDescripcion(input.descripcion);
        }
        if (input.precio !== undefined) {
            plan.cambiarPrecio(input.precio);
        }
        if (input.intervalo !== undefined) {
            plan.cambiarIntervalo(input.intervalo);
        }
        if (input.activo !== undefined) {
            if (input.activo) {
                plan.activar();
            }
            else {
                plan.desactivar();
            }
        }
        const updated = await this.planRepository.update(id, plan.toJSON());
        if (!updated) {
            throw new Error("No se pudo actualizar el plan");
        }
        return updated;
    }
    async activarPlan(id) {
        const existing = await this.planRepository.findById(id);
        if (!existing) {
            throw new Error("Plan no encontrado");
        }
        const plan = new plan_1.Plan(existing);
        plan.activar();
        const updated = await this.planRepository.update(id, plan.toJSON());
        if (!updated) {
            throw new Error("No se pudo activar el plan");
        }
        return updated;
    }
    async desactivarPlan(id) {
        const existing = await this.planRepository.findById(id);
        if (!existing) {
            throw new Error("Plan no encontrado");
        }
        const plan = new plan_1.Plan(existing);
        plan.desactivar();
        const updated = await this.planRepository.update(id, plan.toJSON());
        if (!updated) {
            throw new Error("No se pudo desactivar el plan");
        }
        return updated;
    }
    async eliminarPlan(id) {
        await this.planRepository.delete(id);
    }
}
exports.PlanService = PlanService;

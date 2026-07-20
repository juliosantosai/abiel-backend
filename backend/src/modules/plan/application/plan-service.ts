import { generateUuid } from "../../../shared/utils/uuid";
import { Plan, type PlanIntervalo, type PlanProps } from "../domain/plan";
import type { PlanRepository } from "../infrastructure/plan-repository";

export type CreatePlanInput = {
  nombre: string;
  slug: string;
  descripcion?: string;
  precio: number;
  intervalo: PlanIntervalo;
  activo?: boolean;
};

export type UpdatePlanInput = {
  nombre?: string;
  slug?: string;
  descripcion?: string;
  precio?: number;
  intervalo?: PlanIntervalo;
  activo?: boolean;
};

export class PlanService {
  constructor(private readonly planRepository: PlanRepository) {}

  async crearPlan(input: CreatePlanInput): Promise<PlanProps> {
    const existingSlug = await this.planRepository.findBySlug(input.slug);

    if (existingSlug) {
      throw new Error("Slug del plan ya existe");
    }

    const plan = new Plan({
      id: generateUuid(),
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

  async obtenerPlanPorId(id: string): Promise<PlanProps | null> {
    return this.planRepository.findById(id);
  }

  async listarPlanes(): Promise<PlanProps[]> {
    return this.planRepository.findAll();
  }

  async actualizarPlan(id: string, input: UpdatePlanInput): Promise<PlanProps> {
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

    const plan = new Plan(existing);

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
      } else {
        plan.desactivar();
      }
    }

    const updated = await this.planRepository.update(id, plan.toJSON());

    if (!updated) {
      throw new Error("No se pudo actualizar el plan");
    }

    return updated;
  }

  async activarPlan(id: string): Promise<PlanProps> {
    const existing = await this.planRepository.findById(id);

    if (!existing) {
      throw new Error("Plan no encontrado");
    }

    const plan = new Plan(existing);
    plan.activar();

    const updated = await this.planRepository.update(id, plan.toJSON());

    if (!updated) {
      throw new Error("No se pudo activar el plan");
    }

    return updated;
  }

  async desactivarPlan(id: string): Promise<PlanProps> {
    const existing = await this.planRepository.findById(id);

    if (!existing) {
      throw new Error("Plan no encontrado");
    }

    const plan = new Plan(existing);
    plan.desactivar();

    const updated = await this.planRepository.update(id, plan.toJSON());

    if (!updated) {
      throw new Error("No se pudo desactivar el plan");
    }

    return updated;
  }

  async eliminarPlan(id: string): Promise<void> {
    await this.planRepository.delete(id);
  }
}

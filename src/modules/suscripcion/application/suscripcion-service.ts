import { generateUuid } from "../../../shared/utils/uuid";
import { Suscripcion, type SuscripcionProps } from "../domain/suscripcion";
import type { SuscripcionRepository } from "../infrastructure/suscripcion-repository";
import type { EmpresaRepository } from "../../empresa/infrastructure/empresa-repository";
import type { PlanRepository } from "../../plan/infrastructure/plan-repository";

export type CreateSuscripcionInput = {
  empresaId: string;
  planId: string;
  fechaInicio: Date;
};

export class SuscripcionService {
  constructor(
    private readonly suscripcionRepository: SuscripcionRepository,
    private readonly empresaRepository: EmpresaRepository,
    private readonly planRepository: PlanRepository
  ) {}

  async crearSuscripcion(input: CreateSuscripcionInput): Promise<SuscripcionProps> {
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

    const suscripcion = new Suscripcion({
      id: generateUuid(),
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

  async obtenerSuscripcionPorId(id: string): Promise<SuscripcionProps | null> {
    return this.suscripcionRepository.findById(id);
  }

  async listarSuscripciones(): Promise<SuscripcionProps[]> {
    return this.suscripcionRepository.findAll();
  }

  async listarPorEmpresa(empresaId: string): Promise<SuscripcionProps[]> {
    return this.suscripcionRepository.findByEmpresaId(empresaId);
  }

  async activarSuscripcion(id: string): Promise<SuscripcionProps> {
    const existing = await this.suscripcionRepository.findById(id);

    if (!existing) {
      throw new Error("Suscripción no encontrada");
    }

    const suscripcion = new Suscripcion(existing);
    suscripcion.activar();

    const updated = await this.suscripcionRepository.update(id, suscripcion.toJSON());

    if (!updated) {
      throw new Error("No se pudo actualizar la suscripción");
    }

    return updated;
  }

  async cancelarSuscripcion(id: string): Promise<SuscripcionProps> {
    const existing = await this.suscripcionRepository.findById(id);

    if (!existing) {
      throw new Error("Suscripción no encontrada");
    }

    const suscripcion = new Suscripcion(existing);
    suscripcion.cancelar();

    const updated = await this.suscripcionRepository.update(id, suscripcion.toJSON());

    if (!updated) {
      throw new Error("No se pudo actualizar la suscripción");
    }

    return updated;
  }

  async expirarSuscripcion(id: string): Promise<SuscripcionProps> {
    const existing = await this.suscripcionRepository.findById(id);

    if (!existing) {
      throw new Error("Suscripción no encontrada");
    }

    const suscripcion = new Suscripcion(existing);
    suscripcion.expirar();

    const updated = await this.suscripcionRepository.update(id, suscripcion.toJSON());

    if (!updated) {
      throw new Error("No se pudo actualizar la suscripción");
    }

    return updated;
  }

  async cambiarPlan(id: string, planId: string): Promise<SuscripcionProps> {
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

    const suscripcion = new Suscripcion(existing);
    suscripcion.cambiarPlan(planId);

    const updated = await this.suscripcionRepository.update(id, suscripcion.toJSON());

    if (!updated) {
      throw new Error("No se pudo actualizar la suscripción");
    }

    return updated;
  }
}

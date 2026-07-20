import { generateUuid } from "../../../shared/utils/uuid";
import { Empresa, type EmpresaProps } from "../domain/empresa";
import type { EmpresaRepository } from "../infrastructure/empresa-repository";

export type CreateEmpresaInput = {
  nombre: string;
  plan: string;
  activo?: boolean;
};

export type UpdateEmpresaInput = {
  nombre?: string;
  plan?: string;
  activo?: boolean;
};

export class EmpresaService {
  constructor(private readonly empresaRepository: EmpresaRepository) {}

  async crearEmpresa(input: CreateEmpresaInput): Promise<EmpresaProps> {
    const empresa = new Empresa({
      id: generateUuid(),
      nombre: input.nombre,
      plan: input.plan,
      activo: input.activo ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.empresaRepository.create(empresa.toJSON());
  }

  async obtenerEmpresaPorId(id: string): Promise<EmpresaProps | null> {
    return this.empresaRepository.findById(id);
  }

  async listarEmpresas(): Promise<EmpresaProps[]> {
    return this.empresaRepository.findAll();
  }

  async actualizarEmpresa(id: string, input: UpdateEmpresaInput): Promise<EmpresaProps> {
    const existing = await this.empresaRepository.findById(id);

    if (!existing) {
      throw new Error("Empresa no encontrada");
    }

    const empresa = new Empresa(existing);

    if (input.nombre !== undefined) {
      empresa.cambiarNombre(input.nombre);
    }

    if (input.plan !== undefined) {
      empresa.cambiarPlan(input.plan);
    }

    if (input.activo !== undefined) {
      if (input.activo) {
        empresa.activar();
      } else {
        empresa.desactivar();
      }
    }

    const updated = await this.empresaRepository.update(id, empresa.toJSON());

    if (!updated) {
      throw new Error("No se pudo actualizar la empresa");
    }

    return updated;
  }

  async eliminarEmpresa(id: string): Promise<void> {
    await this.empresaRepository.delete(id);
  }
}

import type { Empresa } from "../domain/empresa";
import type { EmpresaRepository } from "../infrastructure/empresa-repository";

export class EmpresaService {
  constructor(private readonly empresaRepository: EmpresaRepository) {}

  async findById(id: string): Promise<Empresa | null> {
    return this.empresaRepository.findById(id);
  }

  async findAll(): Promise<Empresa[]> {
    return this.empresaRepository.findAll();
  }

  async create(empresa: Empresa): Promise<Empresa> {
    return this.empresaRepository.create(empresa);
  }

  async update(id: string, empresa: Partial<Empresa>): Promise<Empresa | null> {
    return this.empresaRepository.update(id, empresa);
  }

  async delete(id: string): Promise<void> {
    return this.empresaRepository.delete(id);
  }
}

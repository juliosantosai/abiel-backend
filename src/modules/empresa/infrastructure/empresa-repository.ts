import type { Empresa } from "../domain/empresa";

export interface EmpresaRepository {
  findById(id: string): Promise<Empresa | null>;
  findAll(): Promise<Empresa[]>;
  create(empresa: Empresa): Promise<Empresa>;
  update(id: string, empresa: Partial<Empresa>): Promise<Empresa | null>;
  delete(id: string): Promise<void>;
}

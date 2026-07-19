import type { EmpresaProps } from "../domain/empresa";

export interface EmpresaRepository {
  findById(id: string): Promise<EmpresaProps | null>;
  findAll(): Promise<EmpresaProps[]>;
  create(empresa: EmpresaProps): Promise<EmpresaProps>;
  update(id: string, empresa: Partial<EmpresaProps>): Promise<EmpresaProps | null>;
  delete(id: string): Promise<void>;
}

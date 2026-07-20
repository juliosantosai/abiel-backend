import type { EmpresaProps } from "../../modules/empresa/domain/empresa";

export interface EmpresaFinder {
  findById(id: string): Promise<EmpresaProps | null>;
}

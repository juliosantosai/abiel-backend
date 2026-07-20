import type { ConfiguracionProps } from "../domain/configuracion";

export interface ConfiguracionRepository {
  findById(id: string): Promise<ConfiguracionProps | null>;
  findByEmpresaId(empresaId: string): Promise<ConfiguracionProps[]>;
  findAll(): Promise<ConfiguracionProps[]>;
  create(configuracion: ConfiguracionProps): Promise<ConfiguracionProps>;
  update(id: string, configuracion: Partial<ConfiguracionProps>): Promise<ConfiguracionProps | null>;
}

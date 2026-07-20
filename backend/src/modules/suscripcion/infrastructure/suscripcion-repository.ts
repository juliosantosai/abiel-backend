import type { SuscripcionProps } from "../domain/suscripcion";

export interface SuscripcionRepository {
  findById(id: string): Promise<SuscripcionProps | null>;
  findAll(): Promise<SuscripcionProps[]>;
  findByEmpresaId(empresaId: string): Promise<SuscripcionProps[]>;
  create(suscripcion: SuscripcionProps): Promise<SuscripcionProps>;
  update(id: string, suscripcion: Partial<SuscripcionProps>): Promise<SuscripcionProps | null>;
}

import type { UsuarioProps } from "../domain/usuario";

export interface UsuarioRepository {
  findById(id: string): Promise<UsuarioProps | null>;
  findAll(): Promise<UsuarioProps[]>;
  findByEmpresaId(empresaId: string): Promise<UsuarioProps[]>;
  findByIdAndEmpresaId(id: string, empresaId: string): Promise<UsuarioProps | null>;
  create(usuario: UsuarioProps): Promise<UsuarioProps>;
  update(id: string, usuario: Partial<UsuarioProps>): Promise<UsuarioProps | null>;
}

import type { UsuarioProps } from "../domain/usuario";

export interface UsuarioRepository {
  findById(id: string): Promise<UsuarioProps | null>;
  findAll(): Promise<UsuarioProps[]>;
  create(usuario: UsuarioProps): Promise<UsuarioProps>;
  update(id: string, usuario: Partial<UsuarioProps>): Promise<UsuarioProps | null>;
  delete(id: string): Promise<void>;
}

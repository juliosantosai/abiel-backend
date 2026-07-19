import type { Usuario } from "../domain/usuario";

export interface UsuarioRepository {
  findById(id: string): Promise<Usuario | null>;
  findByEmail(email: string): Promise<Usuario | null>;
  create(usuario: Usuario): Promise<Usuario>;
  update(id: string, usuario: Partial<Usuario>): Promise<Usuario | null>;
  delete(id: string): Promise<void>;
}

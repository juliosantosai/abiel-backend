import type { Usuario } from "../domain/usuario";
import type { UsuarioRepository } from "../infrastructure/usuario-repository";

export class UsuarioService {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async findById(id: string): Promise<Usuario | null> {
    return this.usuarioRepository.findById(id);
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepository.findByEmail(email);
  }

  async create(usuario: Usuario): Promise<Usuario> {
    return this.usuarioRepository.create(usuario);
  }

  async update(id: string, usuario: Partial<Usuario>): Promise<Usuario | null> {
    return this.usuarioRepository.update(id, usuario);
  }

  async delete(id: string): Promise<void> {
    return this.usuarioRepository.delete(id);
  }
}

import { generateUuid } from "../../../shared/utils/uuid";
import { Usuario, type UsuarioProps } from "../domain/usuario";
import type { UsuarioRepository } from "../infrastructure/usuario-repository";

export type CreateUsuarioInput = {
  empresaId: string;
  nombre: string;
  email: string;
  activo?: boolean;
};

export type UpdateUsuarioInput = {
  nombre?: string;
  email?: string;
};

export class UsuarioService {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async crearUsuario(input: CreateUsuarioInput): Promise<UsuarioProps> {
    const usuario = new Usuario({
      id: generateUuid(),
      empresaId: input.empresaId,
      nombre: input.nombre,
      email: input.email,
      activo: input.activo ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.usuarioRepository.create(usuario.toJSON());
  }

  async obtenerUsuarioPorId(id: string): Promise<UsuarioProps | null> {
    return this.usuarioRepository.findById(id);
  }

  async obtenerUsuarios(): Promise<UsuarioProps[]> {
    return this.usuarioRepository.findAll();
  }

  async actualizarUsuario(id: string, input: UpdateUsuarioInput): Promise<UsuarioProps> {
    const existing = await this.usuarioRepository.findById(id);

    if (!existing) {
      throw new Error("Usuario no encontrado");
    }

    const usuario = new Usuario(existing);

    if (input.nombre !== undefined) {
      usuario.cambiarNombre(input.nombre);
    }

    if (input.email !== undefined) {
      usuario.cambiarEmail(input.email);
    }

    const updated = await this.usuarioRepository.update(id, usuario.toJSON());

    if (!updated) {
      throw new Error("No se pudo actualizar el usuario");
    }

    return updated;
  }

  async activarUsuario(id: string): Promise<UsuarioProps> {
    const existing = await this.usuarioRepository.findById(id);

    if (!existing) {
      throw new Error("Usuario no encontrado");
    }

    const usuario = new Usuario(existing);
    usuario.activar();

    const updated = await this.usuarioRepository.update(id, usuario.toJSON());

    if (!updated) {
      throw new Error("No se pudo activar el usuario");
    }

    return updated;
  }

  async desactivarUsuario(id: string): Promise<UsuarioProps> {
    const existing = await this.usuarioRepository.findById(id);

    if (!existing) {
      throw new Error("Usuario no encontrado");
    }

    const usuario = new Usuario(existing);
    usuario.desactivar();

    const updated = await this.usuarioRepository.update(id, usuario.toJSON());

    if (!updated) {
      throw new Error("No se pudo desactivar el usuario");
    }

    return updated;
  }
}

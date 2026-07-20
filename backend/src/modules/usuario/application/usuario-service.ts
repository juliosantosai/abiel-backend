import { generateUuid } from "../../../shared/utils/uuid";
import { Usuario, type UsuarioProps } from "../domain/usuario";
import type { UsuarioRepository } from "../infrastructure/usuario-repository";
import type { EventBus } from "../../../shared/events/event-bus";
import { createUsuarioCreatedEvent } from "../domain/events/usuario-created.event";

export type CreateUsuarioInput = {
  nombre: string;
  email: string;
  passwordHash: string;
  activo?: boolean;
};

export type UpdateUsuarioInput = {
  nombre?: string;
  email?: string;
  passwordHash?: string;
};

export class UsuarioService {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly eventBus: EventBus
  ) {}

  async crearUsuario(input: CreateUsuarioInput): Promise<UsuarioProps> {
    const existing = await this.usuarioRepository.findByEmail(input.email);

    if (existing) {
      throw new Error("El email del usuario ya está registrado");
    }

    const usuario = new Usuario({
      id: generateUuid(),
      nombre: input.nombre,
      email: input.email,
      passwordHash: input.passwordHash,
      activo: input.activo ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const created = await this.usuarioRepository.create(usuario.toJSON());

    await this.eventBus.publish(
      createUsuarioCreatedEvent(
        {
          usuarioId: created.id,
          email: created.email,
        },
        {
          correlationId: `usuario-${created.id}`,
          userId: created.id,
        }
      )
    );

    return created;
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

    if (input.passwordHash !== undefined) {
      usuario.cambiarPasswordHash(input.passwordHash);
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

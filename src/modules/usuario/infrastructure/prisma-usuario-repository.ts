import { prisma } from "../../../shared/database/prisma";
import type { UsuarioProps } from "../domain/usuario";
import type { UsuarioRepository } from "./usuario-repository";

export class PrismaUsuarioRepository implements UsuarioRepository {
  async findById(id: string): Promise<UsuarioProps | null> {
    return prisma.usuario.findUnique({ where: { id } });
  }

  async findAll(): Promise<UsuarioProps[]> {
    return prisma.usuario.findMany();
  }

  async findByEmail(email: string): Promise<UsuarioProps | null> {
    return prisma.usuario.findUnique({ where: { email } });
  }

  async create(usuario: UsuarioProps): Promise<UsuarioProps> {
    return prisma.usuario.create({ data: usuario });
  }

  async update(id: string, usuario: Partial<UsuarioProps>): Promise<UsuarioProps | null> {
    return prisma.usuario.update({
      where: { id },
      data: usuario,
    });
  }
}

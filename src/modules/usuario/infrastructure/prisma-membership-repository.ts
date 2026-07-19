import { prisma } from "../../../shared/database/prisma";
import type { MembershipProps } from "../domain/membership";
import type { MembershipRepository } from "./membership-repository";

export class PrismaMembershipRepository implements MembershipRepository {
  async findById(id: string): Promise<MembershipProps | null> {
    return prisma.membership.findUnique({ where: { id } });
  }

  async findByUsuarioId(usuarioId: string): Promise<MembershipProps[]> {
    return prisma.membership.findMany({ where: { usuarioId } });
  }

  async findByEmpresaId(empresaId: string): Promise<MembershipProps[]> {
    return prisma.membership.findMany({ where: { empresaId } });
  }

  async findByUsuarioAndEmpresa(usuarioId: string, empresaId: string): Promise<MembershipProps | null> {
    return prisma.membership.findFirst({ where: { usuarioId, empresaId } });
  }

  async create(membership: MembershipProps): Promise<MembershipProps> {
    return prisma.membership.create({ data: membership });
  }

  async update(id: string, membership: Partial<MembershipProps>): Promise<MembershipProps | null> {
    return prisma.membership.update({ where: { id }, data: membership });
  }
}

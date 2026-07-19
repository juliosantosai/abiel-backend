import { prisma } from "../../../shared/database/prisma";
import type { EmpresaProps } from "../domain/empresa";
import type { EmpresaRepository } from "./empresa-repository";

export class PrismaEmpresaRepository implements EmpresaRepository {
  async findById(id: string): Promise<EmpresaProps | null> {
    return prisma.empresa.findUnique({ where: { id } });
  }

  async findAll(): Promise<EmpresaProps[]> {
    return prisma.empresa.findMany();
  }

  async create(empresa: EmpresaProps): Promise<EmpresaProps> {
    return prisma.empresa.create({ data: empresa });
  }

  async update(id: string, empresa: Partial<EmpresaProps>): Promise<EmpresaProps | null> {
    return prisma.empresa.update({
      where: { id },
      data: empresa,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.empresa.delete({ where: { id } });
  }
}

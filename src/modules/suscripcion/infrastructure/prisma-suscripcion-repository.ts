import { prisma } from "../../../shared/database/prisma";
import type { SuscripcionProps } from "../domain/suscripcion";
import type { SuscripcionRepository } from "./suscripcion-repository";

function normalizeSuscripcion(suscripcion: any): SuscripcionProps {
  return {
    ...suscripcion,
    estado: suscripcion.estado as SuscripcionProps["estado"],
  };
}

export class PrismaSuscripcionRepository implements SuscripcionRepository {
  async findById(id: string): Promise<SuscripcionProps | null> {
    const suscripcion = await prisma.suscripcion.findUnique({ where: { id } });
    return suscripcion ? normalizeSuscripcion(suscripcion) : null;
  }

  async findAll(): Promise<SuscripcionProps[]> {
    const suscripciones = await prisma.suscripcion.findMany();
    return suscripciones.map(normalizeSuscripcion);
  }

  async findByEmpresaId(empresaId: string): Promise<SuscripcionProps[]> {
    const suscripciones = await prisma.suscripcion.findMany({ where: { empresaId } });
    return suscripciones.map(normalizeSuscripcion);
  }

  async create(suscripcion: SuscripcionProps): Promise<SuscripcionProps> {
    const created = await prisma.suscripcion.create({ data: suscripcion });
    return normalizeSuscripcion(created);
  }

  async update(id: string, suscripcion: Partial<SuscripcionProps>): Promise<SuscripcionProps | null> {
    const updated = await prisma.suscripcion.update({
      where: { id },
      data: suscripcion,
    });
    return normalizeSuscripcion(updated);
  }
}

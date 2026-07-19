import { prisma } from "../../../shared/database/prisma";
import type { ConfiguracionProps, IdiomaConfiguracion } from "../domain/configuracion";
import type { ConfiguracionRepository } from "./configuracion-repository";

function mapConfiguracion(configuracion: any): ConfiguracionProps {
  return {
    id: configuracion.id,
    empresaId: configuracion.empresaId,
    idioma: configuracion.idioma as IdiomaConfiguracion,
    zonaHoraria: configuracion.zonaHoraria,
    notificacionesEmail: configuracion.notificacionesEmail,
    activo: configuracion.activo,
    createdAt: configuracion.createdAt,
    updatedAt: configuracion.updatedAt,
  };
}

export class PrismaConfiguracionRepository implements ConfiguracionRepository {
  async findById(id: string): Promise<ConfiguracionProps | null> {
    const configuracion = await prisma.configuracion.findUnique({ where: { id } });
    return configuracion ? mapConfiguracion(configuracion) : null;
  }

  async findByEmpresaId(empresaId: string): Promise<ConfiguracionProps[]> {
    const configuraciones = await prisma.configuracion.findMany({ where: { empresaId } });
    return configuraciones.map(mapConfiguracion);
  }

  async findAll(): Promise<ConfiguracionProps[]> {
    const configuraciones = await prisma.configuracion.findMany();
    return configuraciones.map(mapConfiguracion);
  }

  async create(configuracion: ConfiguracionProps): Promise<ConfiguracionProps> {
    const created = await prisma.configuracion.create({ data: configuracion });
    return mapConfiguracion(created);
  }

  async update(id: string, configuracion: Partial<ConfiguracionProps>): Promise<ConfiguracionProps | null> {
    const updated = await prisma.configuracion.update({
      where: { id },
      data: configuracion,
    });
    return updated ? mapConfiguracion(updated) : null;
  }
}

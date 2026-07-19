import { generateUuid } from "../../../shared/utils/uuid";
import { Configuracion, type ConfiguracionProps } from "../domain/configuracion";
import type { ConfiguracionRepository } from "../infrastructure/configuracion-repository";
import type { EmpresaRepository } from "../../empresa/infrastructure/empresa-repository";

export type CreateConfiguracionInput = {
  empresaId: string;
  idioma?: string;
  zonaHoraria?: string;
  notificacionesEmail?: boolean;
  activo?: boolean;
};

export type UpdateConfiguracionInput = {
  idioma?: string;
  zonaHoraria?: string;
  notificacionesEmail?: boolean;
  activo?: boolean;
};

export class ConfiguracionService {
  constructor(
    private readonly configuracionRepository: ConfiguracionRepository,
    private readonly empresaRepository: EmpresaRepository
  ) {}

  async crearConfiguracion(input: CreateConfiguracionInput): Promise<ConfiguracionProps> {
    const empresa = await this.empresaRepository.findById(input.empresaId);

    if (!empresa) {
      throw new Error("Empresa no encontrada");
    }

    const existing = await this.configuracionRepository.findByEmpresaId(input.empresaId);

    if (existing.length > 0) {
      throw new Error("Ya existe una configuración para esta empresa");
    }

    const configuracion = new Configuracion({
      id: generateUuid(),
      empresaId: input.empresaId,
      idioma: (input.idioma as any) ?? "ES",
      zonaHoraria: input.zonaHoraria ?? "UTC",
      notificacionesEmail: input.notificacionesEmail ?? true,
      activo: input.activo ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.configuracionRepository.create(configuracion.toJSON());
  }

  async obtenerPorId(id: string): Promise<ConfiguracionProps | null> {
    return this.configuracionRepository.findById(id);
  }

  async obtenerPorEmpresa(empresaId: string): Promise<ConfiguracionProps | null> {
    const configuraciones = await this.configuracionRepository.findByEmpresaId(empresaId);
    return configuraciones[0] ?? null;
  }

  async listar(): Promise<ConfiguracionProps[]> {
    return this.configuracionRepository.findAll();
  }

  async actualizar(id: string, input: UpdateConfiguracionInput): Promise<ConfiguracionProps> {
    const existing = await this.configuracionRepository.findById(id);

    if (!existing) {
      throw new Error("Configuración no encontrada");
    }

    const configuracion = new Configuracion(existing);

    configuracion.actualizarConfiguracion({
      idioma: input.idioma as "ES" | "EN" | undefined,
      zonaHoraria: input.zonaHoraria,
      notificacionesEmail: input.notificacionesEmail,
    });

    if (input.activo !== undefined) {
      if (input.activo) {
        configuracion.activar();
      } else {
        configuracion.desactivar();
      }
    }

    const updated = await this.configuracionRepository.update(id, configuracion.toJSON());

    if (!updated) {
      throw new Error("No se pudo actualizar la configuración");
    }

    return updated;
  }

  async activar(id: string): Promise<ConfiguracionProps> {
    const existing = await this.configuracionRepository.findById(id);

    if (!existing) {
      throw new Error("Configuración no encontrada");
    }

    const configuracion = new Configuracion(existing);
    configuracion.activar();

    const updated = await this.configuracionRepository.update(id, configuracion.toJSON());

    if (!updated) {
      throw new Error("No se pudo activar la configuración");
    }

    return updated;
  }

  async desactivar(id: string): Promise<ConfiguracionProps> {
    const existing = await this.configuracionRepository.findById(id);

    if (!existing) {
      throw new Error("Configuración no encontrada");
    }

    const configuracion = new Configuracion(existing);
    configuracion.desactivar();

    const updated = await this.configuracionRepository.update(id, configuracion.toJSON());

    if (!updated) {
      throw new Error("No se pudo desactivar la configuración");
    }

    return updated;
  }
}

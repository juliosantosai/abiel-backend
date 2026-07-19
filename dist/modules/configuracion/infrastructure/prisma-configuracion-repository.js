"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaConfiguracionRepository = void 0;
const prisma_1 = require("../../../shared/database/prisma");
function mapConfiguracion(configuracion) {
    return {
        id: configuracion.id,
        empresaId: configuracion.empresaId,
        idioma: configuracion.idioma,
        zonaHoraria: configuracion.zonaHoraria,
        notificacionesEmail: configuracion.notificacionesEmail,
        activo: configuracion.activo,
        createdAt: configuracion.createdAt,
        updatedAt: configuracion.updatedAt,
    };
}
class PrismaConfiguracionRepository {
    async findById(id) {
        const configuracion = await prisma_1.prisma.configuracion.findUnique({ where: { id } });
        return configuracion ? mapConfiguracion(configuracion) : null;
    }
    async findByEmpresaId(empresaId) {
        const configuraciones = await prisma_1.prisma.configuracion.findMany({ where: { empresaId } });
        return configuraciones.map(mapConfiguracion);
    }
    async findAll() {
        const configuraciones = await prisma_1.prisma.configuracion.findMany();
        return configuraciones.map(mapConfiguracion);
    }
    async create(configuracion) {
        const created = await prisma_1.prisma.configuracion.create({ data: configuracion });
        return mapConfiguracion(created);
    }
    async update(id, configuracion) {
        const updated = await prisma_1.prisma.configuracion.update({
            where: { id },
            data: configuracion,
        });
        return updated ? mapConfiguracion(updated) : null;
    }
}
exports.PrismaConfiguracionRepository = PrismaConfiguracionRepository;

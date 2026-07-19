"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaRoleRepository = void 0;
const prisma_1 = require("../../../shared/database/prisma");
class PrismaRoleRepository {
    async findById(id) {
        return prisma_1.prisma.rol.findUnique({ where: { id } });
    }
    async findAll() {
        return prisma_1.prisma.rol.findMany();
    }
    async findByEmpresaId(empresaId) {
        return prisma_1.prisma.rol.findMany({ where: { empresaId } });
    }
    async findByNameAndType(nombre, tipo, empresaId) {
        return prisma_1.prisma.rol.findFirst({
            where: {
                nombre,
                tipo,
                ...(empresaId === null ? { empresaId: null } : empresaId ? { empresaId } : {}),
            },
        });
    }
    async findByNameAndTypeExcludingId(id, nombre, tipo, empresaId) {
        return prisma_1.prisma.rol.findFirst({
            where: {
                id: { not: id },
                nombre,
                tipo,
                ...(empresaId === null ? { empresaId: null } : empresaId ? { empresaId } : {}),
            },
        });
    }
    async createRol(rol) {
        return prisma_1.prisma.rol.create({ data: rol });
    }
    async updateRol(id, rol) {
        return prisma_1.prisma.rol.update({ where: { id }, data: rol });
    }
    async findPermisoById(id) {
        return prisma_1.prisma.permiso.findUnique({ where: { id } });
    }
    async findAllPermisos() {
        return prisma_1.prisma.permiso.findMany();
    }
    async createPermiso(permiso) {
        return prisma_1.prisma.permiso.create({ data: permiso });
    }
    async updatePermiso(id, permiso) {
        return prisma_1.prisma.permiso.update({ where: { id }, data: permiso });
    }
    // Membership persistence is handled by the Usuario module (PrismaMembershipRepository)
    async findRolPermisoByRolAndPermiso(rolId, permisoId) {
        const existing = await prisma_1.prisma.rolPermiso.findFirst({ where: { rolId, permisoId } });
        return existing ? { id: existing.id } : null;
    }
    async assignPermissionToRole(rolId, permisoId) {
        await prisma_1.prisma.rolPermiso.create({ data: { id: `${rolId}-${permisoId}`, rolId, permisoId, activo: true, createdAt: new Date(), updatedAt: new Date() } });
    }
    async removePermissionFromRole(rolId, permisoId) {
        await prisma_1.prisma.rolPermiso.deleteMany({ where: { rolId, permisoId } });
    }
}
exports.PrismaRoleRepository = PrismaRoleRepository;

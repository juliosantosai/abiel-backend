"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaMembershipRepository = void 0;
const prisma_1 = require("../../../shared/database/prisma");
class PrismaMembershipRepository {
    async findById(id) {
        return prisma_1.prisma.membership.findUnique({ where: { id } });
    }
    async findByUsuarioId(usuarioId) {
        return prisma_1.prisma.membership.findMany({ where: { usuarioId } });
    }
    async findByEmpresaId(empresaId) {
        return prisma_1.prisma.membership.findMany({ where: { empresaId } });
    }
    async findByUsuarioAndEmpresa(usuarioId, empresaId) {
        return prisma_1.prisma.membership.findFirst({ where: { usuarioId, empresaId } });
    }
    async create(membership) {
        return prisma_1.prisma.membership.create({ data: membership });
    }
    async update(id, membership) {
        return prisma_1.prisma.membership.update({ where: { id }, data: membership });
    }
}
exports.PrismaMembershipRepository = PrismaMembershipRepository;

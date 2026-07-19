"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUsuarioRepository = void 0;
const prisma_1 = require("../../../shared/database/prisma");
class PrismaUsuarioRepository {
    async findById(id) {
        return prisma_1.prisma.usuario.findUnique({ where: { id } });
    }
    async findAll() {
        return prisma_1.prisma.usuario.findMany();
    }
    async findByEmpresaId(empresaId) {
        return prisma_1.prisma.usuario.findMany({ where: { empresaId } });
    }
    async findByIdAndEmpresaId(id, empresaId) {
        return prisma_1.prisma.usuario.findFirst({ where: { id, empresaId } });
    }
    async create(usuario) {
        return prisma_1.prisma.usuario.create({ data: usuario });
    }
    async update(id, usuario) {
        return prisma_1.prisma.usuario.update({
            where: { id },
            data: usuario,
        });
    }
}
exports.PrismaUsuarioRepository = PrismaUsuarioRepository;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaEmpresaRepository = void 0;
const prisma_1 = require("../../../shared/database/prisma");
class PrismaEmpresaRepository {
    async findById(id) {
        return prisma_1.prisma.empresa.findUnique({ where: { id } });
    }
    async findAll() {
        return prisma_1.prisma.empresa.findMany();
    }
    async create(empresa) {
        return prisma_1.prisma.empresa.create({ data: empresa });
    }
    async update(id, empresa) {
        return prisma_1.prisma.empresa.update({
            where: { id },
            data: empresa,
        });
    }
    async delete(id) {
        await prisma_1.prisma.empresa.delete({ where: { id } });
    }
}
exports.PrismaEmpresaRepository = PrismaEmpresaRepository;

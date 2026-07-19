"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaSuscripcionRepository = void 0;
const prisma_1 = require("../../../shared/database/prisma");
function normalizeSuscripcion(suscripcion) {
    return {
        ...suscripcion,
        estado: suscripcion.estado,
    };
}
class PrismaSuscripcionRepository {
    async findById(id) {
        const suscripcion = await prisma_1.prisma.suscripcion.findUnique({ where: { id } });
        return suscripcion ? normalizeSuscripcion(suscripcion) : null;
    }
    async findAll() {
        const suscripciones = await prisma_1.prisma.suscripcion.findMany();
        return suscripciones.map(normalizeSuscripcion);
    }
    async findByEmpresaId(empresaId) {
        const suscripciones = await prisma_1.prisma.suscripcion.findMany({ where: { empresaId } });
        return suscripciones.map(normalizeSuscripcion);
    }
    async create(suscripcion) {
        const created = await prisma_1.prisma.suscripcion.create({ data: suscripcion });
        return normalizeSuscripcion(created);
    }
    async update(id, suscripcion) {
        const updated = await prisma_1.prisma.suscripcion.update({
            where: { id },
            data: suscripcion,
        });
        return normalizeSuscripcion(updated);
    }
}
exports.PrismaSuscripcionRepository = PrismaSuscripcionRepository;

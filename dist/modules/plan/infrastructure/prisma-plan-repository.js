"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaPlanRepository = void 0;
const prisma_1 = require("../../../shared/database/prisma");
function normalizePlan(plan) {
    return {
        ...plan,
        precio: typeof plan.precio === "object" && typeof plan.precio.toNumber === "function" ? plan.precio.toNumber() : Number(plan.precio),
    };
}
class PrismaPlanRepository {
    async findById(id) {
        const plan = await prisma_1.prisma.plan.findUnique({ where: { id } });
        return plan ? normalizePlan(plan) : null;
    }
    async findBySlug(slug) {
        const plan = await prisma_1.prisma.plan.findUnique({ where: { slug } });
        return plan ? normalizePlan(plan) : null;
    }
    async findAll() {
        const plans = await prisma_1.prisma.plan.findMany();
        return plans.map(normalizePlan);
    }
    async create(plan) {
        const created = await prisma_1.prisma.plan.create({ data: plan });
        return normalizePlan(created);
    }
    async update(id, plan) {
        const updated = await prisma_1.prisma.plan.update({
            where: { id },
            data: plan,
        });
        return normalizePlan(updated);
    }
    async delete(id) {
        await prisma_1.prisma.plan.delete({ where: { id } });
    }
}
exports.PrismaPlanRepository = PrismaPlanRepository;

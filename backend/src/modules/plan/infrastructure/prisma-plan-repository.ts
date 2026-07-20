import { prisma } from "../../../shared/database/prisma";
import type { PlanProps } from "../domain/plan";
import type { PlanRepository } from "./plan-repository";

function normalizePlan(plan: any): PlanProps {
  return {
    ...plan,
    precio: typeof plan.precio === "object" && typeof plan.precio.toNumber === "function" ? plan.precio.toNumber() : Number(plan.precio),
  };
}

export class PrismaPlanRepository implements PlanRepository {
  async findById(id: string): Promise<PlanProps | null> {
    const plan = await prisma.plan.findUnique({ where: { id } });
    return plan ? normalizePlan(plan) : null;
  }

  async findBySlug(slug: string): Promise<PlanProps | null> {
    const plan = await prisma.plan.findUnique({ where: { slug } });
    return plan ? normalizePlan(plan) : null;
  }

  async findAll(): Promise<PlanProps[]> {
    const plans = await prisma.plan.findMany();
    return plans.map(normalizePlan);
  }

  async create(plan: PlanProps): Promise<PlanProps> {
    const created = await prisma.plan.create({ data: plan });
    return normalizePlan(created);
  }

  async update(id: string, plan: Partial<PlanProps>): Promise<PlanProps | null> {
    const updated = await prisma.plan.update({
      where: { id },
      data: plan,
    });
    return normalizePlan(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.plan.delete({ where: { id } });
  }
}

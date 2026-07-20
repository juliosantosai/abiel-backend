import type { PlanProps } from "../domain/plan";

export interface PlanRepository {
  findById(id: string): Promise<PlanProps | null>;
  findBySlug(slug: string): Promise<PlanProps | null>;
  findAll(): Promise<PlanProps[]>;
  create(plan: PlanProps): Promise<PlanProps>;
  update(id: string, plan: Partial<PlanProps>): Promise<PlanProps | null>;
  delete(id: string): Promise<void>;
}

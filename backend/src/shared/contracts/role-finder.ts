import type { RolProps } from "../../modules/roles/domain/rol";

export interface RoleFinder {
  findById(id: string): Promise<RolProps | null>;
}

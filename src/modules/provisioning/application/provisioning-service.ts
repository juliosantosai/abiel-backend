import type { TenantContext } from "../../../shared/context/tenant-context";

export type ProvisioningResult = {
  agents: string[];
  workflows: string[];
  tasks: string[];
  empresaId: string;
};

export interface ProvisioningService {
  provisionFromBlueprint(context: TenantContext, blueprint: any): Promise<ProvisioningResult>;
}

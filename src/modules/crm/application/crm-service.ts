import type { CRMLead } from "../domain/crm";

export class CRMService {
  async create(lead: CRMLead): Promise<CRMLead> {
    return lead;
  }
}

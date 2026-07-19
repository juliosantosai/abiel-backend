import type { FastifyReply, FastifyRequest } from "fastify";
import type { CRMService } from "../application/crm-service";

export class CRMController {
  constructor(private readonly crmService: CRMService) {}

  async create(request: FastifyRequest<{ Body: Record<string, unknown> }>, reply: FastifyReply) {
    const lead = await this.crmService.create(request.body as any);
    return reply.status(201).send(lead);
  }
}

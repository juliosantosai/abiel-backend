import type { FastifyReply, FastifyRequest } from "fastify";
import type { AgenteService } from "../application/agente-service";

export class AgenteController {
  constructor(private readonly agenteService: AgenteService) {}

  async create(request: FastifyRequest<{ Body: Record<string, unknown> }>, reply: FastifyReply) {
    const agente = await this.agenteService.create(request.body as any);
    return reply.status(201).send(agente);
  }
}

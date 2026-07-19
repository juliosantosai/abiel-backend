import type { FastifyReply, FastifyRequest } from "fastify";
import type { ConversacionService } from "../application/conversacion-service";

export class ConversacionController {
  constructor(private readonly conversacionService: ConversacionService) {}

  async create(request: FastifyRequest<{ Body: Record<string, unknown> }>, reply: FastifyReply) {
    const conversacion = await this.conversacionService.create(request.body as any);
    return reply.status(201).send(conversacion);
  }
}

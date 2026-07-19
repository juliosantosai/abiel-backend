import type { FastifyReply, FastifyRequest } from "fastify";
import type { MensajeService } from "../application/mensaje-service";

export class MensajeController {
  constructor(private readonly mensajeService: MensajeService) {}

  async create(request: FastifyRequest<{ Body: Record<string, unknown> }>, reply: FastifyReply) {
    const mensaje = await this.mensajeService.create(request.body as any);
    return reply.status(201).send(mensaje);
  }
}

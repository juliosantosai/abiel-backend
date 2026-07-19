import type { FastifyReply, FastifyRequest } from "fastify";
import type { IAService } from "../application/ia-service";

export class IAController {
  constructor(private readonly iaService: IAService) {}

  async ask(request: FastifyRequest<{ Body: Record<string, unknown> }>, reply: FastifyReply) {
    const response = await this.iaService.ask(request.body as any);
    return reply.status(200).send(response);
  }
}

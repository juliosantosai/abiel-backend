import type { FastifyReply, FastifyRequest } from "fastify";
import type { WhatsAppService } from "../application/whatsapp-service";

export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  async receive(request: FastifyRequest<{ Body: Record<string, unknown> }>, reply: FastifyReply) {
    const message = await this.whatsappService.receive(request.body as any);
    return reply.status(200).send(message);
  }
}

import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { GatewayUnauthorizedError } from "../domain/errors";
import type { IMessageGateway } from "../domain/message-gateway.interface";

interface WebhookControllerDeps {
  empresaRepository: {
    findByWebhookToken?: (token: string) => Promise<{ id: string; activo?: boolean } | null>;
  };
  gateway: IMessageGateway;
}

export function registerWebhookController(app: FastifyInstance, deps: WebhookControllerDeps) {
  app.post("/webhooks/whatsapp/:webhookToken", async (request: FastifyRequest, reply: FastifyReply) => {
    const webhookToken = (request.params as any)?.webhookToken as string | undefined;
    if (!webhookToken) {
      reply.code(401);
      return { error: "Missing webhook token" };
    }

    const empresa = await deps.empresaRepository.findByWebhookToken?.(webhookToken);
    if (!empresa || empresa.activo === false) {
      reply.code(401);
      return { error: "Unauthorized webhook token" };
    }

    const correlationId = request.headers["x-correlation-id"]?.toString() ?? `webhook-${Date.now()}`;

    const result = await deps.gateway.processWebhook(empresa.id, request.body, {
      tenantId: empresa.id,
      correlationId,
      receivedAt: new Date(),
      source: "whatsapp",
      provider: "evolution",
      auth: {
        token: webhookToken,
      },
    });

    if (!result.accepted) {
      reply.code(400);
      return { error: "Invalid webhook payload", reason: result.reason };
    }

    reply.code(202);
    return { status: "accepted", correlationId: result.correlationId };
  });
}

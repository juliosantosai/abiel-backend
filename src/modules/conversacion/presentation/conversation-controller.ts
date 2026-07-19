import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { ConversationService } from "../application/conversation-service";
import type { TenantContext } from "../../../shared/context/tenant-context";
import { MessageRole } from "../domain/message-role";

export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  async createConversation(request: FastifyRequest<{ Body: { titulo?: string | null; usuarioId: string } }>, reply: FastifyReply) {
    const context = (request as any).tenantContext as TenantContext;
    const conversation = await this.conversationService.crearConversation(context, request.body);
    return reply.status(201).send(conversation);
  }

  async addMessage(request: FastifyRequest<{ Body: { conversationId: string; contenido: string; rol: MessageRole } }>, reply: FastifyReply) {
    const context = (request as any).tenantContext as TenantContext;
    const message = await this.conversationService.agregarMensaje(context, request.body);
    return reply.status(201).send(message);
  }

  async listMessages(request: FastifyRequest<{ Params: { conversationId: string } }>, reply: FastifyReply) {
    const context = (request as any).tenantContext as TenantContext;
    const messages = await this.conversationService.listarMensajes(context, request.params.conversationId);
    return reply.send(messages);
  }
}

export function registerConversationRoutes(app: FastifyInstance, conversationService: ConversationService) {
  const controller = new ConversationController(conversationService);

  app.post("/conversations", controller.createConversation.bind(controller));
  app.post("/conversations/messages", controller.addMessage.bind(controller));
  app.get("/conversations/:conversationId/messages", controller.listMessages.bind(controller));
}

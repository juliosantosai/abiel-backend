import type { Message as PrismaMessage } from "@prisma/client";
import { prisma } from "../../../shared/database/prisma";
import type { MessageProps } from "../domain/message";
import type { MessageRepository } from "./message-repository";
import { MessageRole } from "../domain/message-role";

function mapMessage(record: PrismaMessage): MessageProps {
  return {
    id: record.id,
    conversationId: record.conversationId,
    empresaId: record.empresaId,
    usuarioId: record.usuarioId,
    contenido: record.content,
    rol: record.role as MessageRole,
    createdAt: record.createdAt,
  };
}

export class PrismaMessageRepository implements MessageRepository {
  async create(message: MessageProps): Promise<MessageProps> {
    const created = await prisma.message.create({
      data: {
        id: message.id,
        conversationId: message.conversationId,
        empresaId: message.empresaId,
        usuarioId: message.usuarioId,
        content: message.contenido,
        role: message.rol,
        createdAt: message.createdAt,
      },
    });

    return mapMessage(created);
  }

  async findByConversationId(conversationId: string, empresaId: string): Promise<MessageProps[]> {
    const records = await prisma.message.findMany({
      where: {
        conversationId,
        empresaId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return records.map(mapMessage);
  }
}

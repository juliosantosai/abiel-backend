import type { Conversation as PrismaConversation } from "@prisma/client";
import { prisma } from "../../../shared/database/prisma";
import { ConversationStatus } from "../domain/conversation-status";
import type { ConversationProps } from "../domain/conversation";
import type { ConversationRepository } from "./conversation-repository";

function mapConversation(record: PrismaConversation): ConversationProps {
  return {
    id: record.id,
    empresaId: record.empresaId,
    usuarioId: record.clienteId,
    titulo: record.titulo,
    estado: record.status as ConversationStatus,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export class PrismaConversationRepository implements ConversationRepository {
  async create(conversation: ConversationProps): Promise<ConversationProps> {
    const created = await prisma.conversation.create({
      data: {
        id: conversation.id,
        empresaId: conversation.empresaId,
        clienteId: conversation.usuarioId,
        status: conversation.estado,
        titulo: conversation.titulo ?? null,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    });

    return mapConversation(created);
  }

  async findById(id: string, empresaId: string): Promise<ConversationProps | null> {
    const record = await prisma.conversation.findFirst({
      where: {
        id,
        empresaId,
      },
    });

    return record ? mapConversation(record) : null;
  }

  async findByEmpresaId(empresaId: string): Promise<ConversationProps[]> {
    const records = await prisma.conversation.findMany({ where: { empresaId } });
    return records.map(mapConversation);
  }
}

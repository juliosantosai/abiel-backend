import type { MessageProps } from "../domain/message";

export interface MessageRepository {
  create(message: MessageProps): Promise<MessageProps>;
  findByConversationId(conversationId: string, empresaId: string): Promise<MessageProps[]>;
}

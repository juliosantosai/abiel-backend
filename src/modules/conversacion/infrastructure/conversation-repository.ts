import type { ConversationProps } from "../domain/conversation";

export interface ConversationRepository {
  create(conversation: ConversationProps): Promise<ConversationProps>;
  findById(id: string, empresaId: string): Promise<ConversationProps | null>;
  findByEmpresaId(empresaId: string): Promise<ConversationProps[]>;
}

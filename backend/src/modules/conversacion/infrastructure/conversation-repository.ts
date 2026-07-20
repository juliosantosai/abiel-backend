import type { ConversationProps } from "../domain/conversation";

export interface ConversationRepository {
  create(conversation: ConversationProps): Promise<ConversationProps>;
  findById(id: string, empresaId: string): Promise<ConversationProps | null>;
  findByEmpresaId(empresaId: string): Promise<ConversationProps[]>;
  update(id: string, empresaId: string, patch: Partial<ConversationProps>): Promise<ConversationProps | null>;
}

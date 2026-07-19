import type { AgentProps } from "../domain/agent";

export interface AgentRepository {
  create(agent: AgentProps): Promise<AgentProps>;
  update(agent: AgentProps): Promise<AgentProps>;
  findById(id: string, empresaId: string): Promise<AgentProps | null>;
  findByEmpresa(empresaId: string): Promise<AgentProps[]>;
  delete(id: string, empresaId: string): Promise<void>;
}

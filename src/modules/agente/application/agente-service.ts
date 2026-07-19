import type { Agente } from "../domain/agente";

export class AgenteService {
  async create(agente: Agente): Promise<Agente> {
    return agente;
  }
}

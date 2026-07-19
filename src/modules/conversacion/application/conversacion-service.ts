import type { Conversacion } from "../domain/conversacion";

export class ConversacionService {
  async create(conversacion: Conversacion): Promise<Conversacion> {
    return conversacion;
  }
}

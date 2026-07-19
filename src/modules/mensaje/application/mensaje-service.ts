import type { Mensaje } from "../domain/mensaje";

export class MensajeService {
  async create(mensaje: Mensaje): Promise<Mensaje> {
    return mensaje;
  }
}

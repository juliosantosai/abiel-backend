import type { IARequest, IAResponse } from "../domain/ia";

export class IAService {
  async ask(request: IARequest): Promise<IAResponse> {
    return { answer: `Respuesta simulada para: ${request.prompt}` };
  }
}

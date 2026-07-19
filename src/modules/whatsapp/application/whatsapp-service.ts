import type { WhatsAppMessage } from "../domain/whatsapp";

export class WhatsAppService {
  async receive(message: WhatsAppMessage): Promise<WhatsAppMessage> {
    return message;
  }
}

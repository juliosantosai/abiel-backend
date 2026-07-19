"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppController = void 0;
class WhatsAppController {
    whatsappService;
    constructor(whatsappService) {
        this.whatsappService = whatsappService;
    }
    async receive(request, reply) {
        const message = await this.whatsappService.receive(request.body);
        return reply.status(200).send(message);
    }
}
exports.WhatsAppController = WhatsAppController;

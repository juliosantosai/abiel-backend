"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversacionController = void 0;
class ConversacionController {
    conversacionService;
    constructor(conversacionService) {
        this.conversacionService = conversacionService;
    }
    async create(request, reply) {
        const conversacion = await this.conversacionService.create(request.body);
        return reply.status(201).send(conversacion);
    }
}
exports.ConversacionController = ConversacionController;

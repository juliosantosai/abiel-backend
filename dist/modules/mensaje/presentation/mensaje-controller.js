"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MensajeController = void 0;
class MensajeController {
    mensajeService;
    constructor(mensajeService) {
        this.mensajeService = mensajeService;
    }
    async create(request, reply) {
        const mensaje = await this.mensajeService.create(request.body);
        return reply.status(201).send(mensaje);
    }
}
exports.MensajeController = MensajeController;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgenteController = void 0;
class AgenteController {
    agenteService;
    constructor(agenteService) {
        this.agenteService = agenteService;
    }
    async create(request, reply) {
        const agente = await this.agenteService.create(request.body);
        return reply.status(201).send(agente);
    }
}
exports.AgenteController = AgenteController;

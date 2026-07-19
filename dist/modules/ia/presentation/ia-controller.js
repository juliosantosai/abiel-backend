"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IAController = void 0;
class IAController {
    iaService;
    constructor(iaService) {
        this.iaService = iaService;
    }
    async ask(request, reply) {
        const response = await this.iaService.ask(request.body);
        return reply.status(200).send(response);
    }
}
exports.IAController = IAController;

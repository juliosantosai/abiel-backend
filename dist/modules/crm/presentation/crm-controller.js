"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRMController = void 0;
class CRMController {
    crmService;
    constructor(crmService) {
        this.crmService = crmService;
    }
    async create(request, reply) {
        const lead = await this.crmService.create(request.body);
        return reply.status(201).send(lead);
    }
}
exports.CRMController = CRMController;

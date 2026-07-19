"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmpresaController = void 0;
class EmpresaController {
    empresaService;
    constructor(empresaService) {
        this.empresaService = empresaService;
    }
    async getAll(_request, reply) {
        const empresas = await this.empresaService.findAll();
        return reply.send(empresas);
    }
    async getById(request, reply) {
        const empresa = await this.empresaService.findById(request.params.id);
        return reply.send(empresa);
    }
    async create(request, reply) {
        const empresa = await this.empresaService.create(request.body);
        return reply.status(201).send(empresa);
    }
    async update(request, reply) {
        const empresa = await this.empresaService.update(request.params.id, request.body);
        return reply.send(empresa);
    }
    async delete(request, reply) {
        await this.empresaService.delete(request.params.id);
        return reply.status(204).send();
    }
}
exports.EmpresaController = EmpresaController;

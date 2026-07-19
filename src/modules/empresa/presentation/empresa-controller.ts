import type { FastifyReply, FastifyRequest } from "fastify";
import type { EmpresaService } from "../application/empresa-service";

export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  async getAll(_request: FastifyRequest, reply: FastifyReply) {
    const empresas = await this.empresaService.findAll();
    return reply.send(empresas);
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const empresa = await this.empresaService.findById(request.params.id);
    return reply.send(empresa);
  }

  async create(request: FastifyRequest<{ Body: Record<string, unknown> }>, reply: FastifyReply) {
    const empresa = await this.empresaService.create(request.body as any);
    return reply.status(201).send(empresa);
  }

  async update(request: FastifyRequest<{ Params: { id: string }; Body: Record<string, unknown> }>, reply: FastifyReply) {
    const empresa = await this.empresaService.update(request.params.id, request.body as any);
    return reply.send(empresa);
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await this.empresaService.delete(request.params.id);
    return reply.status(204).send();
  }
}

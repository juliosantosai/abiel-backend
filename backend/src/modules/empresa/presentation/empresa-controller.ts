import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { EmpresaService } from "../application/empresa-service";

export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  async getAll(_request: FastifyRequest, reply: FastifyReply) {
    const empresas = await this.empresaService.listarEmpresas();
    return reply.send(empresas);
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const empresa = await this.empresaService.obtenerEmpresaPorId(request.params.id);

    if (!empresa) {
      return reply.status(404).send({ error: true, message: "Empresa no encontrada" });
    }

    return reply.send(empresa);
  }

  async create(request: FastifyRequest<{ Body: { nombre?: string; plan?: string; activo?: boolean } }>, reply: FastifyReply) {
    const { nombre, plan, activo } = request.body;
    const empresa = await this.empresaService.crearEmpresa({ nombre: nombre ?? "", plan: plan ?? "", activo });
    return reply.status(201).send(empresa);
  }

  async update(request: FastifyRequest<{ Params: { id: string }; Body: { nombre?: string; plan?: string; activo?: boolean } }>, reply: FastifyReply) {
    const empresa = await this.empresaService.actualizarEmpresa(request.params.id, request.body);
    return reply.send(empresa);
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await this.empresaService.eliminarEmpresa(request.params.id);
    return reply.status(204).send();
  }
}

export function registerEmpresaRoutes(app: FastifyInstance, empresaService: EmpresaService) {
  const controller = new EmpresaController(empresaService);

  app.post("/empresas", controller.create.bind(controller));
  app.get("/empresas", controller.getAll.bind(controller));
  app.get("/empresas/:id", controller.getById.bind(controller));
  app.put("/empresas/:id", controller.update.bind(controller));
  app.delete("/empresas/:id", controller.delete.bind(controller));
}

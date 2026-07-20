import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { SuscripcionService } from "../application/suscripcion-service";

export class SuscripcionController {
  constructor(private readonly suscripcionService: SuscripcionService) {}

  async getAll(_request: FastifyRequest, reply: FastifyReply) {
    const suscripciones = await this.suscripcionService.listarSuscripciones();
    return reply.send(suscripciones);
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const suscripcion = await this.suscripcionService.obtenerSuscripcionPorId(request.params.id);

    if (!suscripcion) {
      return reply.status(404).send({ error: true, message: "Suscripción no encontrada" });
    }

    return reply.send(suscripcion);
  }

  async getByEmpresa(request: FastifyRequest<{ Params: { empresaId: string } }>, reply: FastifyReply) {
    const suscripciones = await this.suscripcionService.listarPorEmpresa(request.params.empresaId);
    return reply.send(suscripciones);
  }

  async create(
    request: FastifyRequest<{
      Body: { empresaId?: string; planId?: string; fechaInicio?: string };
    }>,
    reply: FastifyReply
  ) {
    const { empresaId, planId, fechaInicio } = request.body;
    const suscripcion = await this.suscripcionService.crearSuscripcion({
      empresaId: empresaId ?? "",
      planId: planId ?? "",
      fechaInicio: fechaInicio ? new Date(fechaInicio) : new Date(),
    });

    return reply.status(201).send(suscripcion);
  }

  async activar(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const suscripcion = await this.suscripcionService.activarSuscripcion(request.params.id);
    return reply.send(suscripcion);
  }

  async cancelar(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const suscripcion = await this.suscripcionService.cancelarSuscripcion(request.params.id);
    return reply.send(suscripcion);
  }

  async expirar(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const suscripcion = await this.suscripcionService.expirarSuscripcion(request.params.id);
    return reply.send(suscripcion);
  }

  async cambiarPlan(
    request: FastifyRequest<{ Params: { id: string }; Body: { planId?: string } }>,
    reply: FastifyReply
  ) {
    const suscripcion = await this.suscripcionService.cambiarPlan(request.params.id, request.body.planId ?? "");
    return reply.send(suscripcion);
  }
}

export function registerSuscripcionRoutes(app: FastifyInstance, suscripcionService: SuscripcionService) {
  const controller = new SuscripcionController(suscripcionService);

  app.post("/suscripciones", controller.create.bind(controller));
  app.get("/suscripciones", controller.getAll.bind(controller));
  app.get("/suscripciones/:id", controller.getById.bind(controller));
  app.get("/empresas/:empresaId/suscripciones", controller.getByEmpresa.bind(controller));
  app.patch("/suscripciones/:id/activar", controller.activar.bind(controller));
  app.patch("/suscripciones/:id/cancelar", controller.cancelar.bind(controller));
  app.patch("/suscripciones/:id/expirar", controller.expirar.bind(controller));
  app.patch("/suscripciones/:id/cambiar-plan", controller.cambiarPlan.bind(controller));
}

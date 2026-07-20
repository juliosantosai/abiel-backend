import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { PlanService } from "../application/plan-service";
import type { PlanIntervalo } from "../domain/plan";

export class PlanController {
  constructor(private readonly planService: PlanService) {}

  async getAll(_request: FastifyRequest, reply: FastifyReply) {
    const planes = await this.planService.listarPlanes();
    return reply.send(planes);
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const plan = await this.planService.obtenerPlanPorId(request.params.id);

    if (!plan) {
      return reply.status(404).send({ error: true, message: "Plan no encontrado" });
    }

    return reply.send(plan);
  }

  async create(
    request: FastifyRequest<{
      Body: {
        nombre?: string;
        slug?: string;
        descripcion?: string;
        precio?: number;
        intervalo?: PlanIntervalo;
        activo?: boolean;
      };
    }>,
    reply: FastifyReply
  ) {
    const { nombre, slug, descripcion, precio, intervalo, activo } = request.body;
    const plan = await this.planService.crearPlan({
      nombre: nombre ?? "",
      slug: slug ?? "",
      descripcion,
      precio: precio ?? 0,
      intervalo: intervalo ?? "MENSUAL",
      activo,
    });

    return reply.status(201).send(plan);
  }

  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: {
        nombre?: string;
        slug?: string;
        descripcion?: string;
        precio?: number;
        intervalo?: PlanIntervalo;
        activo?: boolean;
      };
    }>,
    reply: FastifyReply
  ) {
    const plan = await this.planService.actualizarPlan(request.params.id, request.body);
    return reply.send(plan);
  }

  async activar(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const plan = await this.planService.activarPlan(request.params.id);
    return reply.send(plan);
  }

  async desactivar(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const plan = await this.planService.desactivarPlan(request.params.id);
    return reply.send(plan);
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await this.planService.eliminarPlan(request.params.id);
    return reply.status(204).send();
  }
}

export function registerPlanRoutes(app: FastifyInstance, planService: PlanService) {
  const controller = new PlanController(planService);

  app.post("/planes", controller.create.bind(controller));
  app.get("/planes", controller.getAll.bind(controller));
  app.get("/planes/:id", controller.getById.bind(controller));
  app.put("/planes/:id", controller.update.bind(controller));
  app.patch("/planes/:id/activar", controller.activar.bind(controller));
  app.patch("/planes/:id/desactivar", controller.desactivar.bind(controller));
  app.delete("/planes/:id", controller.delete.bind(controller));
}

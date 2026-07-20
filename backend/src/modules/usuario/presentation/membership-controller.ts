import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { MembershipService } from "../application/membership-service";

export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  async create(
    request: FastifyRequest<{ Body: { usuarioId?: string; empresaId?: string; rolId?: string; activo?: boolean } }>,
    reply: FastifyReply
  ) {
    const membership = await this.membershipService.crearMembership({
      usuarioId: request.body.usuarioId ?? "",
      empresaId: request.body.empresaId ?? "",
      rolId: request.body.rolId ?? "",
      activo: request.body.activo,
    });

    return reply.status(201).send(membership);
  }

  async getByUsuario(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const memberships = await this.membershipService.obtenerMembershipsPorUsuario(request.params.id);
    return reply.send(memberships);
  }

  async activar(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const membership = await this.membershipService.activarMembership(request.params.id);
    return reply.send(membership);
  }

  async desactivar(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const membership = await this.membershipService.desactivarMembership(request.params.id);
    return reply.send(membership);
  }
}

export function registerMembershipRoutes(app: FastifyInstance, membershipService: MembershipService) {
  const controller = new MembershipController(membershipService);

  app.post("/membresias", controller.create.bind(controller));
  app.get("/usuarios/:id/membresias", controller.getByUsuario.bind(controller));
  app.patch("/membresias/:id/activar", controller.activar.bind(controller));
  app.patch("/membresias/:id/desactivar", controller.desactivar.bind(controller));
}

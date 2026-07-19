import type { FastifyReply, FastifyRequest } from "fastify";
import type { UsuarioService } from "../application/usuario-service";

export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const usuario = await this.usuarioService.findById(request.params.id);
    return reply.send(usuario);
  }

  async create(request: FastifyRequest<{ Body: Record<string, unknown> }>, reply: FastifyReply) {
    const usuario = await this.usuarioService.create(request.body as any);
    return reply.status(201).send(usuario);
  }
}

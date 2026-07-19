import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { UsuarioService } from "../application/usuario-service";

export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  async getAll(_request: FastifyRequest, reply: FastifyReply) {
    const usuarios = await this.usuarioService.listarUsuarios();
    return reply.send(usuarios);
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const usuario = await this.usuarioService.obtenerUsuarioPorId(request.params.id);

    if (!usuario) {
      return reply.status(404).send({ error: true, message: "Usuario no encontrado" });
    }

    return reply.send(usuario);
  }

  async create(request: FastifyRequest<{ Body: { nombre?: string; email?: string; activo?: boolean } }>, reply: FastifyReply) {
    const { nombre, email, activo } = request.body;
    const usuario = await this.usuarioService.crearUsuario({ nombre: nombre ?? "", email: email ?? "", activo });
    return reply.status(201).send(usuario);
  }

  async update(request: FastifyRequest<{ Params: { id: string }; Body: { nombre?: string; email?: string; activo?: boolean } }>, reply: FastifyReply) {
    const usuario = await this.usuarioService.actualizarUsuario(request.params.id, request.body);
    return reply.send(usuario);
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    await this.usuarioService.eliminarUsuario(request.params.id);
    return reply.status(204).send();
  }
}

export function registerUsuarioRoutes(app: FastifyInstance, usuarioService: UsuarioService) {
  const controller = new UsuarioController(usuarioService);

  app.post("/usuarios", controller.create.bind(controller));
  app.get("/usuarios", controller.getAll.bind(controller));
  app.get("/usuarios/:id", controller.getById.bind(controller));
  app.put("/usuarios/:id", controller.update.bind(controller));
  app.delete("/usuarios/:id", controller.delete.bind(controller));
}

import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { RoleService } from "../application/role-service";

export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  async getRoles(_request: FastifyRequest, reply: FastifyReply) {
    const roles = await this.roleService.listarRoles();
    return reply.send(roles);
  }

  async getRoleById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const rol = await this.roleService.obtenerRolPorId(request.params.id);

    if (!rol) {
      return reply.status(404).send({ error: true, message: "Rol no encontrado" });
    }

    return reply.send(rol);
  }

  async createRole(request: FastifyRequest<{ Body: { empresaId?: string | null; tipo: "GLOBAL" | "TENANT"; nombre?: string; descripcion?: string | null; activo?: boolean } }>, reply: FastifyReply) {
    const rol = await this.roleService.crearRol({
      empresaId: request.body.empresaId ?? null,
      tipo: request.body.tipo,
      nombre: request.body.nombre ?? "",
      descripcion: request.body.descripcion ?? null,
      activo: request.body.activo,
    });

    return reply.status(201).send(rol);
  }

  async updateRole(request: FastifyRequest<{ Params: { id: string }; Body: { nombre?: string; descripcion?: string | null; activo?: boolean } }>, reply: FastifyReply) {
    const rol = await this.roleService.actualizarRol(request.params.id, request.body);
    return reply.send(rol);
  }

  async activateRole(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const rol = await this.roleService.activarRol(request.params.id);
    return reply.send(rol);
  }

  async deactivateRole(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const rol = await this.roleService.desactivarRol(request.params.id);
    return reply.send(rol);
  }

  async getPermisos(_request: FastifyRequest, reply: FastifyReply) {
    const permisos = await this.roleService.listarPermisos();
    return reply.send(permisos);
  }

  async createPermiso(request: FastifyRequest<{ Body: { nombre?: string; slug?: string; descripcion?: string | null; activo?: boolean } }>, reply: FastifyReply) {
    const permiso = await this.roleService.crearPermiso({
      nombre: request.body.nombre ?? "",
      slug: request.body.slug ?? "",
      descripcion: request.body.descripcion ?? null,
      activo: request.body.activo,
    });

    return reply.status(201).send(permiso);
  }

  async updatePermiso(request: FastifyRequest<{ Params: { id: string }; Body: { nombre?: string; slug?: string; descripcion?: string | null; activo?: boolean } }>, reply: FastifyReply) {
    const permiso = await this.roleService.actualizarPermiso(request.params.id, request.body);
    return reply.send(permiso);
  }

  async activatePermiso(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const permiso = await this.roleService.activarPermiso(request.params.id);
    return reply.send(permiso);
  }

  async deactivatePermiso(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const permiso = await this.roleService.desactivarPermiso(request.params.id);
    return reply.send(permiso);
  }

  async assignRoleToUser(request: FastifyRequest<{ Params: { rolId: string; usuarioId: string } }>, reply: FastifyReply) {
    await this.roleService.asignarRolAUsuario(request.params.usuarioId, request.params.rolId);
    return reply.status(201).send({ ok: true });
  }

  async removeRoleFromUser(request: FastifyRequest<{ Params: { rolId: string; usuarioId: string } }>, reply: FastifyReply) {
    await this.roleService.removerRolDeUsuario(request.params.usuarioId, request.params.rolId);
    return reply.send({ ok: true });
  }

  async assignPermissionToRole(request: FastifyRequest<{ Params: { rolId: string; permisoId: string } }>, reply: FastifyReply) {
    await this.roleService.asignarPermisoARol(request.params.rolId, request.params.permisoId);
    return reply.status(201).send({ ok: true });
  }

  async removePermissionFromRole(request: FastifyRequest<{ Params: { rolId: string; permisoId: string } }>, reply: FastifyReply) {
    await this.roleService.removerPermisoDeRol(request.params.rolId, request.params.permisoId);
    return reply.send({ ok: true });
  }
}

export function registerRoleRoutes(app: FastifyInstance, roleService: RoleService) {
  const controller = new RoleController(roleService);

  app.post("/roles", controller.createRole.bind(controller));
  app.get("/roles", controller.getRoles.bind(controller));
  app.get("/roles/:id", controller.getRoleById.bind(controller));
  app.put("/roles/:id", controller.updateRole.bind(controller));
  app.patch("/roles/:id/activar", controller.activateRole.bind(controller));
  app.patch("/roles/:id/desactivar", controller.deactivateRole.bind(controller));

  app.post("/roles/permisos", controller.createPermiso.bind(controller));
  app.get("/roles/permisos", controller.getPermisos.bind(controller));
  app.put("/roles/permisos/:id", controller.updatePermiso.bind(controller));
  app.patch("/roles/permisos/:id/activar", controller.activatePermiso.bind(controller));
  app.patch("/roles/permisos/:id/desactivar", controller.deactivatePermiso.bind(controller));

  app.post("/roles/:rolId/usuarios/:usuarioId", controller.assignRoleToUser.bind(controller));
  app.delete("/roles/:rolId/usuarios/:usuarioId", controller.removeRoleFromUser.bind(controller));
  app.post("/roles/:rolId/permisos/:permisoId", controller.assignPermissionToRole.bind(controller));
  app.delete("/roles/:rolId/permisos/:permisoId", controller.removePermissionFromRole.bind(controller));
}

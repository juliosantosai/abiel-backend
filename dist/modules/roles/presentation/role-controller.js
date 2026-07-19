"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleController = void 0;
exports.registerRoleRoutes = registerRoleRoutes;
class RoleController {
    roleService;
    constructor(roleService) {
        this.roleService = roleService;
    }
    async getRoles(_request, reply) {
        const roles = await this.roleService.listarRoles();
        return reply.send(roles);
    }
    async getRoleById(request, reply) {
        const rol = await this.roleService.obtenerRolPorId(request.params.id);
        if (!rol) {
            return reply.status(404).send({ error: true, message: "Rol no encontrado" });
        }
        return reply.send(rol);
    }
    async createRole(request, reply) {
        const rol = await this.roleService.crearRol({
            empresaId: request.body.empresaId ?? null,
            tipo: request.body.tipo,
            nombre: request.body.nombre ?? "",
            descripcion: request.body.descripcion ?? null,
            activo: request.body.activo,
        });
        return reply.status(201).send(rol);
    }
    async updateRole(request, reply) {
        const rol = await this.roleService.actualizarRol(request.params.id, request.body);
        return reply.send(rol);
    }
    async activateRole(request, reply) {
        const rol = await this.roleService.activarRol(request.params.id);
        return reply.send(rol);
    }
    async deactivateRole(request, reply) {
        const rol = await this.roleService.desactivarRol(request.params.id);
        return reply.send(rol);
    }
    async getPermisos(_request, reply) {
        const permisos = await this.roleService.listarPermisos();
        return reply.send(permisos);
    }
    async createPermiso(request, reply) {
        const permiso = await this.roleService.crearPermiso({
            nombre: request.body.nombre ?? "",
            slug: request.body.slug ?? "",
            descripcion: request.body.descripcion ?? null,
            activo: request.body.activo,
        });
        return reply.status(201).send(permiso);
    }
    async updatePermiso(request, reply) {
        const permiso = await this.roleService.actualizarPermiso(request.params.id, request.body);
        return reply.send(permiso);
    }
    async activatePermiso(request, reply) {
        const permiso = await this.roleService.activarPermiso(request.params.id);
        return reply.send(permiso);
    }
    async deactivatePermiso(request, reply) {
        const permiso = await this.roleService.desactivarPermiso(request.params.id);
        return reply.send(permiso);
    }
    async assignRoleToUser(request, reply) {
        await this.roleService.asignarRolAUsuario(request.params.usuarioId, request.params.rolId);
        return reply.status(201).send({ ok: true });
    }
    async removeRoleFromUser(request, reply) {
        await this.roleService.removerRolDeUsuario(request.params.usuarioId, request.params.rolId);
        return reply.send({ ok: true });
    }
    async assignPermissionToRole(request, reply) {
        await this.roleService.asignarPermisoARol(request.params.rolId, request.params.permisoId);
        return reply.status(201).send({ ok: true });
    }
    async removePermissionFromRole(request, reply) {
        await this.roleService.removerPermisoDeRol(request.params.rolId, request.params.permisoId);
        return reply.send({ ok: true });
    }
}
exports.RoleController = RoleController;
function registerRoleRoutes(app, roleService) {
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

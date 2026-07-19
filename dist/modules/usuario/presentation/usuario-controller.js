"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioController = void 0;
exports.registerUsuarioRoutes = registerUsuarioRoutes;
class UsuarioController {
    usuarioService;
    constructor(usuarioService) {
        this.usuarioService = usuarioService;
    }
    async getAll(_request, reply) {
        const usuarios = await this.usuarioService.listarUsuarios();
        return reply.send(usuarios);
    }
    async getById(request, reply) {
        const usuario = await this.usuarioService.obtenerUsuarioPorId(request.params.id);
        if (!usuario) {
            return reply.status(404).send({ error: true, message: "Usuario no encontrado" });
        }
        return reply.send(usuario);
    }
    async create(request, reply) {
        const { nombre, email, activo } = request.body;
        const usuario = await this.usuarioService.crearUsuario({ nombre: nombre ?? "", email: email ?? "", activo });
        return reply.status(201).send(usuario);
    }
    async update(request, reply) {
        const usuario = await this.usuarioService.actualizarUsuario(request.params.id, request.body);
        return reply.send(usuario);
    }
    async delete(request, reply) {
        await this.usuarioService.eliminarUsuario(request.params.id);
        return reply.status(204).send();
    }
}
exports.UsuarioController = UsuarioController;
function registerUsuarioRoutes(app, usuarioService) {
    const controller = new UsuarioController(usuarioService);
    app.post("/usuarios", controller.create.bind(controller));
    app.get("/usuarios", controller.getAll.bind(controller));
    app.get("/usuarios/:id", controller.getById.bind(controller));
    app.put("/usuarios/:id", controller.update.bind(controller));
    app.delete("/usuarios/:id", controller.delete.bind(controller));
}

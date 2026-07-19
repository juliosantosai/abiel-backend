"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioController = void 0;
class UsuarioController {
    usuarioService;
    constructor(usuarioService) {
        this.usuarioService = usuarioService;
    }
    async getById(request, reply) {
        const usuario = await this.usuarioService.findById(request.params.id);
        return reply.send(usuario);
    }
    async create(request, reply) {
        const usuario = await this.usuarioService.create(request.body);
        return reply.status(201).send(usuario);
    }
}
exports.UsuarioController = UsuarioController;

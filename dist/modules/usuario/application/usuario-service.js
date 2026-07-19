"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioService = void 0;
const uuid_1 = require("../../../shared/utils/uuid");
const usuario_1 = require("../domain/usuario");
class UsuarioService {
    usuarioRepository;
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }
    async crearUsuario(input) {
        const usuario = new usuario_1.Usuario({
            id: (0, uuid_1.generateUuid)(),
            nombre: input.nombre,
            email: input.email,
            activo: input.activo ?? true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return this.usuarioRepository.create(usuario.toJSON());
    }
    async obtenerUsuarioPorId(id) {
        return this.usuarioRepository.findById(id);
    }
    async listarUsuarios() {
        return this.usuarioRepository.findAll();
    }
    async actualizarUsuario(id, input) {
        const existing = await this.usuarioRepository.findById(id);
        if (!existing) {
            throw new Error("Usuario no encontrado");
        }
        const usuario = new usuario_1.Usuario(existing);
        if (input.nombre !== undefined) {
            usuario.cambiarNombre(input.nombre);
        }
        if (input.email !== undefined) {
            usuario.cambiarEmail(input.email);
        }
        if (input.activo !== undefined) {
            if (input.activo) {
                usuario.activar();
            }
            else {
                usuario.desactivar();
            }
        }
        const updated = await this.usuarioRepository.update(id, usuario.toJSON());
        if (!updated) {
            throw new Error("No se pudo actualizar el usuario");
        }
        return updated;
    }
    async eliminarUsuario(id) {
        await this.usuarioRepository.delete(id);
    }
}
exports.UsuarioService = UsuarioService;

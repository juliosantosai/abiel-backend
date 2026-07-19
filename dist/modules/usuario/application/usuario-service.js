"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioService = void 0;
class UsuarioService {
    usuarioRepository;
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }
    async findById(id) {
        return this.usuarioRepository.findById(id);
    }
    async findByEmail(email) {
        return this.usuarioRepository.findByEmail(email);
    }
    async create(usuario) {
        return this.usuarioRepository.create(usuario);
    }
    async update(id, usuario) {
        return this.usuarioRepository.update(id, usuario);
    }
    async delete(id) {
        return this.usuarioRepository.delete(id);
    }
}
exports.UsuarioService = UsuarioService;

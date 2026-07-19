"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmpresaService = void 0;
class EmpresaService {
    empresaRepository;
    constructor(empresaRepository) {
        this.empresaRepository = empresaRepository;
    }
    async findById(id) {
        return this.empresaRepository.findById(id);
    }
    async findAll() {
        return this.empresaRepository.findAll();
    }
    async create(empresa) {
        return this.empresaRepository.create(empresa);
    }
    async update(id, empresa) {
        return this.empresaRepository.update(id, empresa);
    }
    async delete(id) {
        return this.empresaRepository.delete(id);
    }
}
exports.EmpresaService = EmpresaService;

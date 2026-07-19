"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmpresaService = void 0;
const uuid_1 = require("../../../shared/utils/uuid");
const empresa_1 = require("../domain/empresa");
class EmpresaService {
    empresaRepository;
    constructor(empresaRepository) {
        this.empresaRepository = empresaRepository;
    }
    async crearEmpresa(input) {
        const empresa = new empresa_1.Empresa({
            id: (0, uuid_1.generateUuid)(),
            nombre: input.nombre,
            plan: input.plan,
            activo: input.activo ?? true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return this.empresaRepository.create(empresa.toJSON());
    }
    async obtenerEmpresaPorId(id) {
        return this.empresaRepository.findById(id);
    }
    async listarEmpresas() {
        return this.empresaRepository.findAll();
    }
    async actualizarEmpresa(id, input) {
        const existing = await this.empresaRepository.findById(id);
        if (!existing) {
            throw new Error("Empresa no encontrada");
        }
        const empresa = new empresa_1.Empresa(existing);
        if (input.nombre !== undefined) {
            empresa.cambiarNombre(input.nombre);
        }
        if (input.plan !== undefined) {
            empresa.cambiarPlan(input.plan);
        }
        if (input.activo !== undefined) {
            if (input.activo) {
                empresa.activar();
            }
            else {
                empresa.desactivar();
            }
        }
        const updated = await this.empresaRepository.update(id, empresa.toJSON());
        if (!updated) {
            throw new Error("No se pudo actualizar la empresa");
        }
        return updated;
    }
    async eliminarEmpresa(id) {
        await this.empresaRepository.delete(id);
    }
}
exports.EmpresaService = EmpresaService;

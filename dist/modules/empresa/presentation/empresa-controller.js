"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmpresaController = void 0;
exports.registerEmpresaRoutes = registerEmpresaRoutes;
class EmpresaController {
    empresaService;
    constructor(empresaService) {
        this.empresaService = empresaService;
    }
    async getAll(_request, reply) {
        const empresas = await this.empresaService.listarEmpresas();
        return reply.send(empresas);
    }
    async getById(request, reply) {
        const empresa = await this.empresaService.obtenerEmpresaPorId(request.params.id);
        if (!empresa) {
            return reply.status(404).send({ error: true, message: "Empresa no encontrada" });
        }
        return reply.send(empresa);
    }
    async create(request, reply) {
        const { nombre, plan, activo } = request.body;
        const empresa = await this.empresaService.crearEmpresa({ nombre: nombre ?? "", plan: plan ?? "", activo });
        return reply.status(201).send(empresa);
    }
    async update(request, reply) {
        const empresa = await this.empresaService.actualizarEmpresa(request.params.id, request.body);
        return reply.send(empresa);
    }
    async delete(request, reply) {
        await this.empresaService.eliminarEmpresa(request.params.id);
        return reply.status(204).send();
    }
}
exports.EmpresaController = EmpresaController;
function registerEmpresaRoutes(app, empresaService) {
    const controller = new EmpresaController(empresaService);
    app.post("/empresas", controller.create.bind(controller));
    app.get("/empresas", controller.getAll.bind(controller));
    app.get("/empresas/:id", controller.getById.bind(controller));
    app.put("/empresas/:id", controller.update.bind(controller));
    app.delete("/empresas/:id", controller.delete.bind(controller));
}

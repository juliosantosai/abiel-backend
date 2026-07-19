"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuscripcionController = void 0;
exports.registerSuscripcionRoutes = registerSuscripcionRoutes;
class SuscripcionController {
    suscripcionService;
    constructor(suscripcionService) {
        this.suscripcionService = suscripcionService;
    }
    async getAll(_request, reply) {
        const suscripciones = await this.suscripcionService.listarSuscripciones();
        return reply.send(suscripciones);
    }
    async getById(request, reply) {
        const suscripcion = await this.suscripcionService.obtenerSuscripcionPorId(request.params.id);
        if (!suscripcion) {
            return reply.status(404).send({ error: true, message: "Suscripción no encontrada" });
        }
        return reply.send(suscripcion);
    }
    async getByEmpresa(request, reply) {
        const suscripciones = await this.suscripcionService.listarPorEmpresa(request.params.empresaId);
        return reply.send(suscripciones);
    }
    async create(request, reply) {
        const { empresaId, planId, fechaInicio } = request.body;
        const suscripcion = await this.suscripcionService.crearSuscripcion({
            empresaId: empresaId ?? "",
            planId: planId ?? "",
            fechaInicio: fechaInicio ? new Date(fechaInicio) : new Date(),
        });
        return reply.status(201).send(suscripcion);
    }
    async activar(request, reply) {
        const suscripcion = await this.suscripcionService.activarSuscripcion(request.params.id);
        return reply.send(suscripcion);
    }
    async cancelar(request, reply) {
        const suscripcion = await this.suscripcionService.cancelarSuscripcion(request.params.id);
        return reply.send(suscripcion);
    }
    async expirar(request, reply) {
        const suscripcion = await this.suscripcionService.expirarSuscripcion(request.params.id);
        return reply.send(suscripcion);
    }
    async cambiarPlan(request, reply) {
        const suscripcion = await this.suscripcionService.cambiarPlan(request.params.id, request.body.planId ?? "");
        return reply.send(suscripcion);
    }
}
exports.SuscripcionController = SuscripcionController;
function registerSuscripcionRoutes(app, suscripcionService) {
    const controller = new SuscripcionController(suscripcionService);
    app.post("/suscripciones", controller.create.bind(controller));
    app.get("/suscripciones", controller.getAll.bind(controller));
    app.get("/suscripciones/:id", controller.getById.bind(controller));
    app.get("/empresas/:empresaId/suscripciones", controller.getByEmpresa.bind(controller));
    app.patch("/suscripciones/:id/activar", controller.activar.bind(controller));
    app.patch("/suscripciones/:id/cancelar", controller.cancelar.bind(controller));
    app.patch("/suscripciones/:id/expirar", controller.expirar.bind(controller));
    app.patch("/suscripciones/:id/cambiar-plan", controller.cambiarPlan.bind(controller));
}

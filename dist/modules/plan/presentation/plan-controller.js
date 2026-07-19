"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanController = void 0;
exports.registerPlanRoutes = registerPlanRoutes;
class PlanController {
    planService;
    constructor(planService) {
        this.planService = planService;
    }
    async getAll(_request, reply) {
        const planes = await this.planService.listarPlanes();
        return reply.send(planes);
    }
    async getById(request, reply) {
        const plan = await this.planService.obtenerPlanPorId(request.params.id);
        if (!plan) {
            return reply.status(404).send({ error: true, message: "Plan no encontrado" });
        }
        return reply.send(plan);
    }
    async create(request, reply) {
        const { nombre, slug, descripcion, precio, intervalo, activo } = request.body;
        const plan = await this.planService.crearPlan({
            nombre: nombre ?? "",
            slug: slug ?? "",
            descripcion,
            precio: precio,
            intervalo: intervalo,
            activo,
        });
        return reply.status(201).send(plan);
    }
    async update(request, reply) {
        const plan = await this.planService.actualizarPlan(request.params.id, request.body);
        return reply.send(plan);
    }
    async activar(request, reply) {
        const plan = await this.planService.activarPlan(request.params.id);
        return reply.send(plan);
    }
    async desactivar(request, reply) {
        const plan = await this.planService.desactivarPlan(request.params.id);
        return reply.send(plan);
    }
    async delete(request, reply) {
        await this.planService.eliminarPlan(request.params.id);
        return reply.status(204).send();
    }
}
exports.PlanController = PlanController;
function registerPlanRoutes(app, planService) {
    const controller = new PlanController(planService);
    app.post("/planes", controller.create.bind(controller));
    app.get("/planes", controller.getAll.bind(controller));
    app.get("/planes/:id", controller.getById.bind(controller));
    app.put("/planes/:id", controller.update.bind(controller));
    app.patch("/planes/:id/activar", controller.activar.bind(controller));
    app.patch("/planes/:id/desactivar", controller.desactivar.bind(controller));
    app.delete("/planes/:id", controller.delete.bind(controller));
}

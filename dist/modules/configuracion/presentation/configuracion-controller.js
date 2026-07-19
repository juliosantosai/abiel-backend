"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfiguracionController = void 0;
exports.registerConfiguracionRoutes = registerConfiguracionRoutes;
class ConfiguracionController {
    configuracionService;
    constructor(configuracionService) {
        this.configuracionService = configuracionService;
    }
    async getAll(_request, reply) {
        const configuraciones = await this.configuracionService.listar();
        return reply.send(configuraciones);
    }
    async getById(request, reply) {
        const configuracion = await this.configuracionService.obtenerPorId(request.params.id);
        if (!configuracion) {
            return reply.status(404).send({ error: true, message: "Configuración no encontrada" });
        }
        return reply.send(configuracion);
    }
    async getByEmpresa(request, reply) {
        const configuracion = await this.configuracionService.obtenerPorEmpresa(request.params.empresaId);
        if (!configuracion) {
            return reply.status(404).send({ error: true, message: "Configuración no encontrada" });
        }
        return reply.send(configuracion);
    }
    async create(request, reply) {
        const configuracion = await this.configuracionService.crearConfiguracion({
            empresaId: request.body.empresaId ?? "",
            idioma: request.body.idioma,
            zonaHoraria: request.body.zonaHoraria,
            notificacionesEmail: request.body.notificacionesEmail,
            activo: request.body.activo,
        });
        return reply.status(201).send(configuracion);
    }
    async update(request, reply) {
        const configuracion = await this.configuracionService.actualizar(request.params.id, request.body);
        return reply.send(configuracion);
    }
    async activar(request, reply) {
        const configuracion = await this.configuracionService.activar(request.params.id);
        return reply.send(configuracion);
    }
    async desactivar(request, reply) {
        const configuracion = await this.configuracionService.desactivar(request.params.id);
        return reply.send(configuracion);
    }
}
exports.ConfiguracionController = ConfiguracionController;
function registerConfiguracionRoutes(app, configuracionService) {
    const controller = new ConfiguracionController(configuracionService);
    app.post("/configuraciones", controller.create.bind(controller));
    app.get("/configuraciones", controller.getAll.bind(controller));
    app.get("/configuraciones/:id", controller.getById.bind(controller));
    app.get("/empresas/:empresaId/configuracion", controller.getByEmpresa.bind(controller));
    app.put("/configuraciones/:id", controller.update.bind(controller));
    app.patch("/configuraciones/:id/activar", controller.activar.bind(controller));
    app.patch("/configuraciones/:id/desactivar", controller.desactivar.bind(controller));
}

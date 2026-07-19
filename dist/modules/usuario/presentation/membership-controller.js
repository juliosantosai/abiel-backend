"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembershipController = void 0;
exports.registerMembershipRoutes = registerMembershipRoutes;
class MembershipController {
    membershipService;
    constructor(membershipService) {
        this.membershipService = membershipService;
    }
    async create(request, reply) {
        const membership = await this.membershipService.crearMembership({
            usuarioId: request.body.usuarioId ?? "",
            empresaId: request.body.empresaId ?? "",
            rolId: request.body.rolId ?? "",
            activo: request.body.activo,
        });
        return reply.status(201).send(membership);
    }
    async getByUsuario(request, reply) {
        const memberships = await this.membershipService.obtenerMembershipsPorUsuario(request.params.id);
        return reply.send(memberships);
    }
    async activar(request, reply) {
        const membership = await this.membershipService.activarMembership(request.params.id);
        return reply.send(membership);
    }
    async desactivar(request, reply) {
        const membership = await this.membershipService.desactivarMembership(request.params.id);
        return reply.send(membership);
    }
}
exports.MembershipController = MembershipController;
function registerMembershipRoutes(app, membershipService) {
    const controller = new MembershipController(membershipService);
    app.post("/membresias", controller.create.bind(controller));
    app.get("/usuarios/:id/membresias", controller.getByUsuario.bind(controller));
    app.patch("/membresias/:id/activar", controller.activar.bind(controller));
    app.patch("/membresias/:id/desactivar", controller.desactivar.bind(controller));
}

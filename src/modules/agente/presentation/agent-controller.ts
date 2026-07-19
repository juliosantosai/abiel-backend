import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { AgentService } from "../application/agent-service";
import type { TenantContext } from "../../../shared/context/tenant-context";
import { AgentDefinition } from "../domain/agent-definition";
import { AgentSettings } from "../domain/agent-settings";

export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  async createAgent(request: FastifyRequest<{ Body: { nombre: string; descripcion?: string | null } }>, reply: FastifyReply) {
    const context = (request as any).tenantContext as TenantContext;
    const body = request.body;
    const created = await this.agentService.crearAgent(context, { nombre: body.nombre, descripcion: body.descripcion });
    return reply.status(201).send(created);
  }

  async updateConfig(request: FastifyRequest<{ Params: { id: string }; Body: { definition?: AgentDefinition; settings?: AgentSettings; descripcion?: string | null; capabilities?: string[] } }>, reply: FastifyReply) {
    const context = (request as any).tenantContext as TenantContext;
    const { id } = request.params;
    const updated = await this.agentService.updateConfiguration(context, id, request.body);
    return reply.send(updated);
  }

  async activate(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const context = (request as any).tenantContext as TenantContext;
    const { id } = request.params;
    const updated = await this.agentService.activate(context, id);
    return reply.send(updated);
  }

  async pause(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const context = (request as any).tenantContext as TenantContext;
    const { id } = request.params;
    const updated = await this.agentService.pause(context, id);
    return reply.send(updated);
  }

  async disable(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const context = (request as any).tenantContext as TenantContext;
    const { id } = request.params;
    const updated = await this.agentService.disable(context, id);
    return reply.send(updated);
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const context = (request as any).tenantContext as TenantContext;
    const { id } = request.params;
    const agent = await this.agentService.findById(context, id);
    if (!agent) return reply.status(404).send({ message: "Not found" });
    return reply.send(agent);
  }

  async listByEmpresa(request: FastifyRequest, reply: FastifyReply) {
    const context = (request as any).tenantContext as TenantContext;
    const agents = await this.agentService.findByEmpresa(context);
    return reply.send(agents);
  }
}

export function registerAgentRoutes(app: FastifyInstance, agentService: AgentService) {
  const controller = new AgentController(agentService);
  app.post("/agents", controller.createAgent.bind(controller));
  app.put("/agents/:id/config", controller.updateConfig.bind(controller));
  app.post("/agents/:id/activate", controller.activate.bind(controller));
  app.post("/agents/:id/pause", controller.pause.bind(controller));
  app.post("/agents/:id/disable", controller.disable.bind(controller));
  app.get("/agents/:id", controller.getById.bind(controller));
  app.get("/agents", controller.listByEmpresa.bind(controller));
}

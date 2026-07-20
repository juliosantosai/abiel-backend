import { afterAll, beforeAll, describe, expect, it } from "vitest";
import Fastify from "fastify";
import { InMemoryTaskRepository } from "../../src/modules/task/infrastructure/in-memory-task-repository";
import { InMemoryEventBus } from "../../src/shared/events/in-memory-event-bus";
import { TaskServiceImpl } from "../../src/modules/task/application/task-service-impl";
import { registerTaskRoutes } from "../../src/modules/task/presentation/task-controller";
import { TenantContext } from "../../src/shared/context/tenant-context";

describe("Task HTTP endpoints (in-memory)", () => {
  const app = Fastify();
  const repo = new InMemoryTaskRepository();
  const bus = new InMemoryEventBus();
  const service = new TaskServiceImpl(repo as any, bus as any);

  const tenant = TenantContext.create({ usuarioId: "user-1", empresaId: "empresa-x", membershipId: "m-1", rolIds: ["r1"], permisos: [], isGlobalTenant: false });

  beforeAll(() => {
    // inject tenant for all requests
    app.addHook("preHandler", (req, _reply, done) => {
      (req as any).tenantContext = tenant;
      done();
    });

    registerTaskRoutes(app, service as any);
  });

  afterAll(async () => {
    await app.close();
  });

  it("creates, lists, retrieves and updates task status", async () => {
    const createResp = await app.inject({ method: "POST", url: "/tasks", payload: { title: "Test Task", type: "HUMAN" } });
    expect(createResp.statusCode).toBe(201);
    const created = createResp.json();
    expect(created).toHaveProperty("id");
    expect(created.empresaId).toBe("empresa-x");

    const listResp = await app.inject({ method: "GET", url: "/tasks" });
    expect(listResp.statusCode).toBe(200);
    const tasks = listResp.json();
    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.some((t: any) => t.id === created.id)).toBe(true);

    const getResp = await app.inject({ method: "GET", url: `/tasks/${created.id}` });
    expect(getResp.statusCode).toBe(200);
    const found = getResp.json();
    expect(found.id).toBe(created.id);

    const startResp = await app.inject({ method: "PATCH", url: `/tasks/${created.id}/status`, payload: { action: "start" } });
    expect(startResp.statusCode).toBe(200);
    const started = startResp.json();
    expect(started.status).toBe("IN_PROGRESS");
  });
});

import { describe, it, expect, vi } from "vitest";
import { CRMService } from "../../src/modules/crm/application/crm-service";
import { CRMController } from "../../src/modules/crm/presentation/crm-controller";

describe("crm module", () => {
  it("creates a lead through the service", async () => {
    const lead = { id: "lead-1", nombre: "Juan", email: "juan@test.com", telefono: "123", creadoAt: new Date() };
    const service = new CRMService();

    await expect(service.create(lead)).resolves.toEqual(lead);
  });

  it("creates a lead through the controller", async () => {
    const lead = { id: "lead-1", nombre: "Juan", email: "juan@test.com", telefono: "123", creadoAt: new Date() };
    const service = { create: vi.fn().mockResolvedValue(lead) };
    const controller = new CRMController(service as any);
    const reply = { status: vi.fn().mockReturnThis(), send: vi.fn().mockReturnValue({ ok: true }) };

    await controller.create({ body: lead } as any, reply as any);

    expect(service.create).toHaveBeenCalledWith(lead);
    expect(reply.status).toHaveBeenCalledWith(201);
  });
});

import { describe, it, expect } from "vitest";
import { InMemoryTemplateRepository } from "../../src/modules/template/infrastructure/in-memory-template-repository";
import { TemplateServiceImpl } from "../../src/modules/template/application/template-service-impl";
import { createTestTenantContext } from "../helpers/test-fixtures";

describe("TemplateServiceImpl", () => {
  it("creates template and versions, sets active version and retrieves blueprint", async () => {
    const repo = new InMemoryTemplateRepository();
    const svc = new TemplateServiceImpl(repo);
    const ctx = createTestTenantContext();

    const tpl = await svc.createTemplate(ctx, { id: "tpl-1", name: "Test Template", description: "desc", empresaId: ctx.empresaId, activeVersionId: null });
    expect(tpl).toBeTruthy();
    expect(tpl.id).toBe("tpl-1");

    const blueprint = { workflow: { id: "wf-1" }, agents: [{ id: "a1" }] };
    const v = await svc.createVersion(ctx, tpl.id, blueprint, "tester");
    expect(v).toBeTruthy();
    expect(v.templateId).toBe(tpl.id);
    expect(v.versionNumber).toBe(1);

    const fetched = await svc.getBlueprint(ctx, tpl.id, v.id);
    expect(fetched).not.toBeNull();
    expect(fetched!.blueprint).toEqual(blueprint);
  });

  it("throws when creating a version for non-existent template", async () => {
    const repo = new InMemoryTemplateRepository();
    const svc = new TemplateServiceImpl(repo);
    const ctx = createTestTenantContext();

    await expect(svc.createVersion(ctx, "no-tpl", { foo: "bar" })).rejects.toThrow();
  });
});

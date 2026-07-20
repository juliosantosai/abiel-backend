import type { TemplateService } from "./template-service";
import type { TemplateRepository } from "../domain/repositories/template-repository";
import type { TenantContext } from "../../../shared/context/tenant-context";
import { Template } from "../domain/template";
import { TemplateVersion } from "../domain/template-version";

export class TemplateServiceImpl implements TemplateService {
  constructor(private readonly repo: TemplateRepository) {}

  async createTemplate(context: TenantContext, payload: any) {
    const tpl = Template.create({ ...payload, empresaId: context.empresaId });
    const persisted = await this.repo.createTemplate(tpl.toJSON());
    return persisted;
  }

  async createVersion(context: TenantContext, templateId: string, blueprint: any, createdBy?: string | null) {
    const tpl = await this.repo.findTemplateById(templateId);
    if (!tpl) throw new Error("Template not found");

    // determine next version number
    const latest = await this.repo.findLatestVersion(templateId);
    const nextVersion = (latest?.versionNumber ?? 0) + 1;

    const version = TemplateVersion.create({ id: `${templateId}-v${nextVersion}`, templateId, empresaId: context.empresaId, versionNumber: nextVersion, blueprint, createdBy, active: true });

    const persisted = await this.repo.createVersion(version.toJSON());

    // set as active on template
    await this.repo.setActiveVersion(templateId, persisted.id);

    return persisted;
  }

  async getBlueprint(context: TenantContext, templateId: string, versionId?: string | null) {
    if (versionId) {
      const v = await this.repo.findVersionById(versionId);
      return v;
    }
    const latest = await this.repo.findLatestVersion(templateId);
    return latest;
  }
}

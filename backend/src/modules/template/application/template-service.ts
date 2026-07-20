import type { TenantContext } from "../../../shared/context/tenant-context";
import type { TemplateProps } from "../domain/template";
import type { TemplateVersionProps } from "../domain/template-version";

export interface TemplateService {
  createTemplate(context: TenantContext, payload: Omit<TemplateProps, "createdAt" | "updatedAt">): Promise<TemplateProps>;
  createVersion(context: TenantContext, templateId: string, blueprint: any, createdBy?: string | null): Promise<TemplateVersionProps>;
  getBlueprint(context: TenantContext, templateId: string, versionId?: string | null): Promise<TemplateVersionProps | null>;
}

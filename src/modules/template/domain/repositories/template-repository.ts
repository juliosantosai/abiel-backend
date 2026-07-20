import type { TemplateProps } from "../template";
import type { TemplateVersionProps } from "../template-version";

export interface TemplateRepository {
  createTemplate(t: TemplateProps): Promise<TemplateProps>;
  findTemplateById(id: string): Promise<TemplateProps | null>;
  // versions
  createVersion(v: TemplateVersionProps): Promise<TemplateVersionProps>;
  findVersionById(id: string): Promise<TemplateVersionProps | null>;
  findLatestVersion(templateId: string): Promise<TemplateVersionProps | null>;
  listVersions(templateId: string): Promise<TemplateVersionProps[]>;
  setActiveVersion(templateId: string, versionId: string | null): Promise<TemplateProps | null>;
}

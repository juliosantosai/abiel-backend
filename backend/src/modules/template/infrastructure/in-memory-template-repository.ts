import type { TemplateRepository } from "../domain/repositories/template-repository";
import type { TemplateProps } from "../domain/template";
import type { TemplateVersionProps } from "../domain/template-version";

export class InMemoryTemplateRepository implements TemplateRepository {
  private templates: Map<string, TemplateProps> = new Map();
  private versions: Map<string, TemplateVersionProps> = new Map();
  private versionsByTemplate: Map<string, string[]> = new Map();

  async createTemplate(t: TemplateProps): Promise<TemplateProps> {
    this.templates.set(t.id, t);
    return t;
  }

  async findTemplateById(id: string): Promise<TemplateProps | null> {
    return this.templates.get(id) ?? null;
  }

  async createVersion(v: TemplateVersionProps): Promise<TemplateVersionProps> {
    this.versions.set(v.id, v);
    const arr = this.versionsByTemplate.get(v.templateId) ?? [];
    arr.push(v.id);
    this.versionsByTemplate.set(v.templateId, arr);
    return v;
  }

  async findVersionById(id: string): Promise<TemplateVersionProps | null> {
    return this.versions.get(id) ?? null;
  }

  async findLatestVersion(templateId: string): Promise<TemplateVersionProps | null> {
    const arr = this.versionsByTemplate.get(templateId) ?? [];
    if (arr.length === 0) return null;
    // assume versions pushed in order; pick highest versionNumber
    let latest: TemplateVersionProps | null = null;
    for (const id of arr) {
      const v = this.versions.get(id)!;
      if (!latest || v.versionNumber > latest.versionNumber) latest = v;
    }
    return latest;
  }

  async listVersions(templateId: string): Promise<TemplateVersionProps[]> {
    const arr = this.versionsByTemplate.get(templateId) ?? [];
    return arr.map((id) => this.versions.get(id)!).filter(Boolean) as TemplateVersionProps[];
  }

  async setActiveVersion(templateId: string, versionId: string | null): Promise<TemplateProps | null> {
    const tpl = this.templates.get(templateId);
    if (!tpl) return null;
    const updated = { ...tpl, activeVersionId: versionId, updatedAt: new Date() } as TemplateProps;
    this.templates.set(templateId, updated);
    return updated;
  }
}

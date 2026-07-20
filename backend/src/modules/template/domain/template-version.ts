import type { Blueprint } from "./blueprint";

export type TemplateVersionProps = {
  id: string;
  templateId: string;
  empresaId: string;
  versionNumber: number;
  blueprint: Blueprint;
  immutableSnapshotAt: Date;
  createdAt: Date;
  createdBy?: string | null;
  active?: boolean;
};

export class TemplateVersion {
  constructor(private readonly props: TemplateVersionProps) {}

  toJSON(): TemplateVersionProps {
    return { ...this.props };
  }

  static create(props: Omit<TemplateVersionProps, "createdAt" | "immutableSnapshotAt">) {
    const now = new Date();
    return new TemplateVersion({ ...props, createdAt: now, immutableSnapshotAt: now });
  }
}

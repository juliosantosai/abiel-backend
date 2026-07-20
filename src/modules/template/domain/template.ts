export type TemplateProps = {
  id: string;
  empresaId: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  activeVersionId?: string | null;
};

export class Template {
  constructor(private readonly props: TemplateProps) {}

  toJSON(): TemplateProps {
    return { ...this.props };
  }

  static create(props: Omit<TemplateProps, "createdAt" | "updatedAt">) {
    const now = new Date();
    return new Template({ ...props, createdAt: now, updatedAt: now });
  }
}

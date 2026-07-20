import type { WorkflowStep } from "./workflow-step";

export type WorkflowDefinitionProps = {
  id: string;
  empresaId: string;
  name: string;
  description?: string | null;
  steps: WorkflowStep[];
  version?: number;
  createdAt: Date;
  updatedAt: Date;
};

export class WorkflowDefinition {
  constructor(private readonly props: WorkflowDefinitionProps) {}

  public toJSON(): WorkflowDefinitionProps {
    return { ...this.props };
  }

  public static create(props: Omit<WorkflowDefinitionProps, "createdAt" | "updatedAt">) {
    const now = new Date();
    return new WorkflowDefinition({ ...props, createdAt: now, updatedAt: now });
  }
}

export interface AgentDefinitionProps {
  promptBase?: string | null;
  temperatura?: number | null;
  modeloPreferido?: string | null;
  instrucciones?: string | null;
}

export class AgentDefinition {
  readonly promptBase?: string | null;
  readonly temperatura?: number | null;
  readonly modeloPreferido?: string | null;
  readonly instrucciones?: string | null;

  constructor(props: AgentDefinitionProps) {
    this.promptBase = props.promptBase ?? null;
    this.temperatura = props.temperatura ?? null;
    this.modeloPreferido = props.modeloPreferido ?? null;
    this.instrucciones = props.instrucciones ?? null;
  }
}

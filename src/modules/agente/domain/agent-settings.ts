export interface AgentSettingsProps {
  timeout?: number;
  maxTokens?: number;
  idioma?: string;
  tono?: string;
}

export class AgentSettings {
  timeout?: number;
  maxTokens?: number;
  idioma?: string;
  tono?: string;

  constructor(props: AgentSettingsProps = {}) {
    this.timeout = props.timeout;
    this.maxTokens = props.maxTokens;
    this.idioma = props.idioma;
    this.tono = props.tono;
  }
}

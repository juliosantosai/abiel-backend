import { AgentStatus } from "./agent-status";
import { AgentDefinition } from "./agent-definition";
import { AgentSettings } from "./agent-settings";
import { AgentCapability } from "./agent-capability";

export type AgentProps = {
  id: string;
  empresaId: string;
  nombre: string;
  descripcion?: string | null;
  estado: AgentStatus;
  configuracionId?: string | null;
  definition?: AgentDefinition;
  settings?: AgentSettings;
  capabilities?: AgentCapability[];
  createdAt: Date;
  updatedAt: Date;
};

export class Agent {
  private readonly _id: string;
  private readonly _empresaId: string;
  private _nombre: string;
  private _descripcion?: string | null;
  private _estado: AgentStatus;
  private _configuracionId?: string | null;
  private _definition?: AgentDefinition;
  private _settings?: AgentSettings;
  private _capabilities: AgentCapability[];
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: AgentProps) {
    if (!props.id) throw new Error("El id del agente es obligatorio");
    if (!props.empresaId) throw new Error("El empresaId del agente es obligatorio");
    if (!props.nombre || !props.nombre.trim()) throw new Error("El nombre del agente es obligatorio");

    this._id = props.id;
    this._empresaId = props.empresaId;
    this._nombre = props.nombre;
    this._descripcion = props.descripcion ?? null;
    this._estado = props.estado;
    this._configuracionId = props.configuracionId ?? null;
    this._definition = props.definition;
    this._settings = props.settings;
    this._capabilities = props.capabilities ?? [];
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id(): string { return this._id; }
  get empresaId(): string { return this._empresaId; }
  get nombre(): string { return this._nombre; }
  get descripcion(): string | null | undefined { return this._descripcion; }
  get estado(): AgentStatus { return this._estado; }
  get configuracionId(): string | null | undefined { return this._configuracionId; }
  get definition(): AgentDefinition | undefined { return this._definition; }
  get settings(): AgentSettings | undefined { return this._settings; }
  get capabilities(): AgentCapability[] { return this._capabilities; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  updateName(nombre: string) {
    if (!nombre || !nombre.trim()) throw new Error("El nombre del agente es obligatorio");
    this._nombre = nombre;
    this._updatedAt = new Date();
  }

  updateDescripcion(descripcion?: string | null) {
    this._descripcion = descripcion ?? null;
    this._updatedAt = new Date();
  }

  updateDefinition(def: AgentDefinition) {
    this._definition = def;
    this._updatedAt = new Date();
  }

  updateSettings(settings: AgentSettings) {
    this._settings = settings;
    this._updatedAt = new Date();
  }

  setCapabilities(capabilities: AgentCapability[]) {
    this._capabilities = capabilities ?? [];
    this._updatedAt = new Date();
  }

  activate() {
    this._estado = AgentStatus.ACTIVE;
    this._updatedAt = new Date();
  }

  pause() {
    this._estado = AgentStatus.PAUSED;
    this._updatedAt = new Date();
  }

  disable() {
    this._estado = AgentStatus.DISABLED;
    this._updatedAt = new Date();
  }

  toJSON(): AgentProps {
    return {
      id: this._id,
      empresaId: this._empresaId,
      nombre: this._nombre,
      descripcion: this._descripcion,
      estado: this._estado,
      configuracionId: this._configuracionId,
      definition: this._definition,
      settings: this._settings,
      capabilities: this._capabilities,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}

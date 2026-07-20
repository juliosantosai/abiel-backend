import { ConversationStatus } from "./conversation-status";

export interface ConversationProps {
  id: string;
  empresaId: string;
  usuarioId: string;
  titulo?: string | null;
  estado: ConversationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Conversation {
  private readonly _id: string;
  private readonly _empresaId: string;
  private readonly _usuarioId: string;
  private _titulo?: string | null;
  private _estado: ConversationStatus;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: ConversationProps) {
    if (!props.id) throw new Error("El id de la conversación es obligatorio");
    if (!props.empresaId) throw new Error("El empresaId de la conversación es obligatorio");
    if (!props.usuarioId) throw new Error("El usuarioId de la conversación es obligatorio");

    this._id = props.id;
    this._empresaId = props.empresaId;
    this._usuarioId = props.usuarioId;
    this._titulo = props.titulo ?? null;
    this._estado = props.estado;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id(): string { return this._id; }
  get empresaId(): string { return this._empresaId; }
  get usuarioId(): string { return this._usuarioId; }
  get titulo(): string | null | undefined { return this._titulo; }
  get estado(): ConversationStatus { return this._estado; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  setTitulo(titulo: string | null | undefined): void {
    this._titulo = titulo ?? null;
    this._updatedAt = new Date();
  }

  cerrar(): void {
    this._estado = ConversationStatus.CLOSED;
    this._updatedAt = new Date();
  }

  archivar(): void {
    this._estado = ConversationStatus.ARCHIVED;
    this._updatedAt = new Date();
  }

  reabrir(): void {
    this._estado = ConversationStatus.OPEN;
    this._updatedAt = new Date();
  }

  iniciarIntervencionHumana(): void {
    this._estado = ConversationStatus.HUMAN_INTERVENTION;
    this._updatedAt = new Date();
  }

  finalizarIntervencionHumana(): void {
    this._estado = ConversationStatus.BOT_ACTIVE;
    this._updatedAt = new Date();
  }

  bloquear(): void {
    this._estado = ConversationStatus.BLOCKED;
    this._updatedAt = new Date();
  }

  toJSON(): ConversationProps {
    return {
      id: this._id,
      empresaId: this._empresaId,
      usuarioId: this._usuarioId,
      titulo: this._titulo,
      estado: this._estado,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}

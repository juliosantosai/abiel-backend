import { MessageRole } from "./message-role";

export interface MessageProps {
  id: string;
  conversationId: string;
  empresaId: string;
  usuarioId: string;
  contenido: string;
  rol: MessageRole;
  createdAt: Date;
}

export class Message {
  private readonly _id: string;
  private readonly _conversationId: string;
  private readonly _empresaId: string;
  private readonly _usuarioId: string;
  private readonly _contenido: string;
  private readonly _rol: MessageRole;
  private readonly _createdAt: Date;

  constructor(props: MessageProps) {
    if (!props.id) throw new Error("El id del mensaje es obligatorio");
    if (!props.conversationId) throw new Error("El conversationId del mensaje es obligatorio");
    if (!props.empresaId) throw new Error("El empresaId del mensaje es obligatorio");
    if (!props.usuarioId) throw new Error("El usuarioId del mensaje es obligatorio");
    if (!props.contenido?.trim()) throw new Error("El contenido del mensaje es obligatorio");

    this._id = props.id;
    this._conversationId = props.conversationId;
    this._empresaId = props.empresaId;
    this._usuarioId = props.usuarioId;
    this._contenido = props.contenido;
    this._rol = props.rol;
    this._createdAt = props.createdAt;
  }

  get id(): string { return this._id; }
  get conversationId(): string { return this._conversationId; }
  get empresaId(): string { return this._empresaId; }
  get usuarioId(): string { return this._usuarioId; }
  get contenido(): string { return this._contenido; }
  get rol(): MessageRole { return this._rol; }
  get createdAt(): Date { return this._createdAt; }

  toJSON(): MessageProps {
    return {
      id: this._id,
      conversationId: this._conversationId,
      empresaId: this._empresaId,
      usuarioId: this._usuarioId,
      contenido: this._contenido,
      rol: this._rol,
      createdAt: this._createdAt,
    };
  }
}

import { describe, expect, it } from "vitest";
import { Conversation } from "../../src/modules/conversacion/domain/conversation";
import { ConversationStatus } from "../../src/modules/conversacion/domain/conversation-status";

describe("Conversation domain entity", () => {
  it("validates required properties and state transitions", () => {
    expect(() => new Conversation({ id: "", empresaId: "e1", usuarioId: "u1", estado: ConversationStatus.BOT_ACTIVE, createdAt: new Date(), updatedAt: new Date() })).toThrow();
    expect(() => new Conversation({ id: "c1", empresaId: "", usuarioId: "u1", estado: ConversationStatus.BOT_ACTIVE, createdAt: new Date(), updatedAt: new Date() })).toThrow();
    expect(() => new Conversation({ id: "c1", empresaId: "e1", usuarioId: "", estado: ConversationStatus.BOT_ACTIVE, createdAt: new Date(), updatedAt: new Date() })).toThrow();

    const conversation = new Conversation({
      id: "c2",
      empresaId: "e1",
      usuarioId: "u1",
      titulo: "Test",
      estado: ConversationStatus.BOT_ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    conversation.cerrar();
    expect(conversation.estado).toBe(ConversationStatus.CLOSED);

    conversation.archivar();
    expect(conversation.estado).toBe(ConversationStatus.ARCHIVED);

    conversation.reabrir();
    expect(conversation.estado).toBe(ConversationStatus.OPEN);

    conversation.iniciarIntervencionHumana();
    expect(conversation.estado).toBe(ConversationStatus.HUMAN_INTERVENTION);

    conversation.finalizarIntervencionHumana();
    expect(conversation.estado).toBe(ConversationStatus.BOT_ACTIVE);

    conversation.bloquear();
    expect(conversation.estado).toBe(ConversationStatus.BLOCKED);
  });

  it("serializes state and metadata through toJSON", () => {
    const conversation = new Conversation({
      id: "c3",
      empresaId: "e1",
      usuarioId: "u1",
      titulo: null,
      estado: ConversationStatus.BOT_ACTIVE,
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
      updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    });

    const json = conversation.toJSON();
    expect(json).toMatchObject({
      id: "c3",
      empresaId: "e1",
      usuarioId: "u1",
      titulo: null,
      estado: ConversationStatus.BOT_ACTIVE,
    });
    expect(json.createdAt.toISOString()).toBe("2025-01-01T00:00:00.000Z");
  });
});

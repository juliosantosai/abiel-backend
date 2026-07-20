import { describe, it, expect } from "vitest";
import { EvolutionWebhookNormalizer } from "../../../src/modules/gateway/application/evolution-webhook-normalizer";
import { GatewayValidationError } from "../../../src/modules/gateway/domain/errors";

describe("EvolutionWebhookNormalizer", () => {
  const normalizer = new EvolutionWebhookNormalizer();

  it("normalizes text conversation payload", () => {
    const normalized = normalizer.normalizeMessage("empresa-1", {
      event: "messages.upsert",
      data: {
        id: "msg-text-1",
        key: { remoteJid: "user@s.whatsapp.net" },
        message: { conversation: "Hola texto" },
        messageTimestamp: 1710000000,
      },
    });

    expect(normalized.contentType).toBe("text");
    expect(normalized.text).toBe("Hola texto");
    expect(normalized.conversationKey).toBe("empresa-1:user@s.whatsapp.net");
  });

  it("normalizes image payload with caption", () => {
    const normalized = normalizer.normalizeMessage("empresa-1", {
      event: "messages.upsert",
      data: {
        id: "msg-image-1",
        key: { remoteJid: "user@s.whatsapp.net" },
        message: {
          imageMessage: {
            mimetype: "image/png",
            caption: "An image caption",
          },
        },
        messageTimestamp: 1710000000,
      },
    });

    expect(normalized.contentType).toBe("image");
    expect(normalized.text).toBe("An image caption");
    expect(normalized.media).toMatchObject({ mimeType: "image/png", caption: "An image caption" });
  });

  it("normalizes location payload to location content type", () => {
    const normalized = normalizer.normalizeMessage("empresa-1", {
      event: "messages.upsert",
      data: {
        id: "msg-location-1",
        key: { remoteJid: "user@s.whatsapp.net" },
        message: {
          locationMessage: {
            jpegThumbnail: "data",
            lat: "-34.6037",
            lng: "-58.3816",
          },
        },
        messageTimestamp: 1710000000,
      },
    });

    expect(normalized.contentType).toBe("location");
    expect(normalized.text).toBeUndefined();
    expect(normalized.media).toBeUndefined();
  });

  it("throws when payload is missing message content", () => {
    expect(() =>
      normalizer.normalizeMessage("empresa-1", {
        event: "messages.upsert",
        data: {
          id: "msg-empty-1",
          key: { remoteJid: "user@s.whatsapp.net" },
          message: {},
          messageTimestamp: 1710000000,
        },
      })
    ).toThrow(GatewayValidationError);
  });

  it("throws when payload is not object", () => {
    expect(() => normalizer.normalizeMessage("empresa-1", "not-json" as any)).toThrow(GatewayValidationError);
  });
});

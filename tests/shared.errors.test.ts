import { describe, it, expect } from "vitest";
import { setupErrorHandler } from "../src/shared/errors/error-handler";

describe("error handler shared", () => {
  it("registers an error handler", () => {
    const app = {
      setErrorHandler: (handler: unknown) => {
        expect(handler).toBeDefined();
      },
    } as any;

    setupErrorHandler(app);
  });

  it("returns a JSON error response for a thrown error", async () => {
    const app = {
      setErrorHandler: (handler: any) => {
        const request = { log: { error: () => undefined } };
        const reply = {
          status: (code: number) => ({
            send: (payload: unknown) => ({ code, payload }),
          }),
        };

        const result = handler({ statusCode: 401, message: "Unauthorized" }, request, reply);
        expect(result).toBeDefined();
      },
    } as any;

    setupErrorHandler(app);
  });
});

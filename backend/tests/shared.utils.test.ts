import { describe, it, expect } from "vitest";
import { generateUuid } from "../src/shared/utils/uuid";

describe("utils shared", () => {
  it("generates a valid UUID", () => {
    const id = generateUuid();

    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });
});

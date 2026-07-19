import { describe, it, expect } from "vitest";
import { signToken, verifyToken } from "../src/shared/auth/jwt";
import { loginUser, getUserFromToken } from "../src/shared/auth/login";

describe("auth shared", () => {
  it("signs and verifies a token", () => {
    const token = signToken({ email: "admin@abiel.com", role: "admin" });
    const payload = verifyToken(token) as { email: string; role: string };

    expect(payload.email).toBe("admin@abiel.com");
    expect(payload.role).toBe("admin");
  });

  it("logs in with valid credentials", () => {
    const result = loginUser("admin@abiel.com", "123456");

    expect(result.user.email).toBe("admin@abiel.com");
    expect(result.user.role).toBe("admin");
    expect(result.token).toBeTruthy();
  });

  it("returns the user from a valid token", () => {
    const token = signToken({ email: "admin@abiel.com", role: "admin" });
    const user = getUserFromToken(token) as { email: string; role: string };

    expect(user.email).toBe("admin@abiel.com");
  });
});

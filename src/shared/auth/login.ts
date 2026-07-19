import { signToken, verifyToken } from "./jwt";

export function loginUser(email: string, password: string) {
  if (email === "admin@abiel.com" && password === "123456") {
    const token = signToken({ email, role: "admin" });
    return { token, user: { email, role: "admin" } };
  }

  throw new Error("Invalid credentials");
}

export function getUserFromToken(token: string) {
  return verifyToken(token);
}

import { sign, verify, type Secret } from "jsonwebtoken";
import { env } from "../config/env";

const validUser = {
  id: "user-1",
  email: "admin@abiel.com",
  name: "Admin",
};

export function loginUser(email: string, password: string) {
  if (email !== "admin@abiel.com" || password !== "123456") {
    throw new Error("Invalid credentials");
  }

  const token = sign({ userId: validUser.id, email: validUser.email }, env.JWT_SECRET as Secret);

  return { token, user: validUser };
}

export function getUserFromToken(token: string) {
  return verify(token, env.JWT_SECRET as Secret);
}

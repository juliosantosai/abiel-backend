import jwt from "jsonwebtoken";
import { env } from "../config/env";

const JWT_SECRET = env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN || "1h";

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}

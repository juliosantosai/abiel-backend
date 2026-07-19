import type { AuthClaims } from "../domain/auth";

export type TokenPayload = AuthClaims;

export interface TokenService {
  generate(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}

import type { TokenService, TokenPayload } from "../application/token-service";

export class NoopTokenService implements TokenService {
  generate(payload: TokenPayload): string {
    return JSON.stringify(payload);
  }

  verify(token: string): TokenPayload {
    return JSON.parse(token) as TokenPayload;
  }
}

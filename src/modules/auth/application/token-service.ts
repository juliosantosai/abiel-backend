export interface TokenPayload {
  usuarioId: string;
  empresaId: string;
  membershipId: string;
  rolId: string;
  iat?: number;
  exp?: number;
}

export interface TokenService {
  generate(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}

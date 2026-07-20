export interface AuthClaims {
  usuarioId: string;
  empresaId: string;
  membershipId: string;
  iat?: number;
  exp?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthIdentity {
  usuarioId: string;
  email: string;
}

export interface AuthenticatedUser extends AuthIdentity {
  activo: boolean;
  membershipId: string | null;
  empresaId: string | null;
  membershipActive: boolean;
  rolIds: string[];
  permisos: string[];
}

export interface AuthErrorContract {
  name: string;
  message: string;
  statusCode: number;
}

export interface TokenValidationErrorContract extends AuthErrorContract {
  code?: string;
}

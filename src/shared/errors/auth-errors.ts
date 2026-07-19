export class AuthError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 401) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super("Invalid credentials", 401);
  }
}

export class TokenValidationError extends AuthError {
  constructor(message = "Invalid token") {
    super(message, 401);
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message = "Unauthorized") {
    super(message, 403);
  }
}

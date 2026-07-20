export class GatewayValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GatewayValidationError";
  }
}

export class GatewayUnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GatewayUnauthorizedError";
  }
}

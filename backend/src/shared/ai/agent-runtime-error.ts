export type AgentRuntimeErrorCode = "RuntimeUnavailable" | "ModelNotSupported" | "Timeout" | "ProviderError" | "Unknown";

export class AgentRuntimeError extends Error {
  public readonly code: AgentRuntimeErrorCode;
  public readonly details?: unknown;

  constructor(code: AgentRuntimeErrorCode, message?: string, details?: unknown) {
    super(message ?? code);
    this.code = code ?? "Unknown";
    this.details = details;
    Object.setPrototypeOf(this, AgentRuntimeError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
    };
  }
}

import type { PasswordHasher } from "../infrastructure/password-hasher";

export class NoopPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return password;
  }

  async verify(password: string, hashedPassword: string): Promise<boolean> {
    return password === hashedPassword;
  }
}

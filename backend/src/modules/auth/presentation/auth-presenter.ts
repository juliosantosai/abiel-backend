import type { AuthIdentity } from "../domain/auth";

export interface AuthPresenter {
  presentLoginSuccess(user: AuthIdentity, token: string): unknown;
}

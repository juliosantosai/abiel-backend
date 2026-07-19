import { NoopAuthService } from "./noop-auth-service";
import { NoopAuthorizationService } from "./noop-authorization-service";
import { NoopAuthContextFactory } from "./noop-auth-context-factory";
import { NoopPasswordHasher } from "./noop-password-hasher";
import { NoopTokenService } from "./noop-token-service";

export function createAuthInfrastructure() {
  const tokenService = new NoopTokenService();
  const passwordHasher = new NoopPasswordHasher();
  const authService = new NoopAuthService();
  const authorizationService = new NoopAuthorizationService();
  const authContextFactory = new NoopAuthContextFactory();

  return {
    tokenService,
    passwordHasher,
    authService,
    authorizationService,
    authContextFactory,
  };
}

import { NoopAuthService } from "./noop-auth-service";
import { NoopAuthorizationService } from "./noop-authorization-service";
import { NoopAuthContextFactory } from "./noop-auth-context-factory";
import { NoopPasswordHasher } from "./noop-password-hasher";
import { NoopTokenService } from "./noop-token-service";
import { PrismaUsuarioRepository } from "../../usuario/infrastructure/prisma-usuario-repository";
import { PrismaMembershipRepository } from "../../usuario/infrastructure/prisma-membership-repository";
import { PrismaRoleRepository } from "../../roles/infrastructure/prisma-role-repository";
import { DatabaseAuthService } from "./database-auth-service";

export function createAuthInfrastructure() {
  const tokenService = new NoopTokenService();
  const passwordHasher = new NoopPasswordHasher();
  const usuarioRepository = new PrismaUsuarioRepository();
  const membershipRepository = new PrismaMembershipRepository();
  const roleRepository = new PrismaRoleRepository();
  // Default to DatabaseAuthService so tests that validate database-backed
  // auth behavior (permissions, memberships) receive real resolution.
  // If you need a NoopAuthService in a specific test, instantiate it there.
  const authService = new DatabaseAuthService(tokenService, usuarioRepository, membershipRepository, roleRepository);
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

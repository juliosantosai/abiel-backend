import type { AuthService } from "../application/auth-service";
import type { TokenService } from "../application/token-service";
import type { UsuarioRepository } from "../../usuario/infrastructure/usuario-repository";
import type { MembershipRepository } from "../../usuario/infrastructure/membership-repository";
import type { RoleRepository } from "../../roles/infrastructure/role-repository";
import type { AuthenticatedUser } from "../domain/auth";
import { TokenValidationError, UnauthorizedError } from "../../../shared/errors/auth-errors";

export class DatabaseAuthService implements AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly usuarioRepository: UsuarioRepository,
    private readonly membershipRepository: MembershipRepository,
    private readonly roleRepository: RoleRepository
  ) {}

  async login(_credentials: any): Promise<{ token: string; user: any; membershipId: string }> {
    throw new Error("Not implemented");
  }

  async validateToken(token: string) {
    return this.tokenService.verify(token);
  }

  async resolveIdentity(token: string): Promise<AuthenticatedUser> {
    let claims: any;
    try {
      claims = this.tokenService.verify(token);
    } catch (err) {
      throw new TokenValidationError("Token verification failed");
    }

    const usuarioId = claims.usuarioId as string | undefined;
    const empresaId = claims.empresaId as string | null | undefined;

    if (!usuarioId) throw new TokenValidationError("Token missing usuarioId");
    if (!empresaId) throw new TokenValidationError("Token missing empresaId");

    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) throw new UnauthorizedError("User not found");
    if (!usuario.activo) throw new UnauthorizedError("User account is inactive");

    const membership = await this.membershipRepository.findByUsuarioAndEmpresa(usuarioId, empresaId);
    if (!membership) throw new UnauthorizedError("Valid membership is required");
    if (!membership.activo) throw new UnauthorizedError("Membership is not active");

    // load permissions from role via RoleRepository
    const role = await this.roleRepository.findById(membership.rolId);
    const permisos: string[] = [];
    if (role && role.activo) {
      const allPermisos = await this.roleRepository.findAllPermisos();
      for (const permiso of allPermisos) {
        const rel = await this.roleRepository.findRolPermisoByRolAndPermiso(role.id, permiso.id);
        if (rel) permisos.push(permiso.slug);
      }
    }

    const identity: AuthenticatedUser = {
      usuarioId: usuario.id,
      email: usuario.email,
      activo: usuario.activo,
      membershipId: membership.id,
      empresaId: membership.empresaId,
      membershipActive: membership.activo,
      rolIds: [membership.rolId],
      permisos,
    };

    return identity;
  }
}

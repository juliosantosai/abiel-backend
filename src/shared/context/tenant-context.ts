export interface TenantContextProps {
  usuarioId: string;
  empresaId: string;
  membershipId: string;
  rolIds: readonly string[];
  permisos: readonly string[];
  isGlobalTenant: boolean;
}

export class TenantContext {
  public readonly usuarioId: string;
  public readonly empresaId: string;
  public readonly membershipId: string;
  public readonly rolIds: readonly string[];
  public readonly permisos: readonly string[];
  public readonly isGlobalTenant: boolean;

  private constructor(props: TenantContextProps) {
    this.usuarioId = props.usuarioId;
    this.empresaId = props.empresaId;
    this.membershipId = props.membershipId;
    this.rolIds = Object.freeze([...props.rolIds]);
    this.permisos = Object.freeze([...props.permisos]);
    this.isGlobalTenant = props.isGlobalTenant;
  }

  public static create(props: TenantContextProps): TenantContext {
    return new TenantContext(props);
  }
}

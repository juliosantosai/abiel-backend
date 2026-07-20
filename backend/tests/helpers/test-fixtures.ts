import { generateUuid } from "../../src/shared/utils/uuid";
import { TenantContext } from "../../src/shared/context/tenant-context";
import jwt from "jsonwebtoken";

export function createTestTenantContext(): TenantContext {
  const usuarioId = generateUuid();
  const empresaId = generateUuid();
  return TenantContext.create({ usuarioId, empresaId, membershipId: generateUuid(), rolIds: [], permisos: [], isGlobalTenant: false });
}

export function generateTestJwt(payload: { usuarioId?: string; empresaId?: string } = {}) {
  const secret = process.env.TEST_JWT_SECRET ?? "test-secret";
  const token = jwt.sign({ usuarioId: payload.usuarioId ?? generateUuid(), empresaId: payload.empresaId ?? generateUuid() }, secret, { algorithm: "HS256", expiresIn: "1h" });
  return token;
}

export function createTestUserAndEmpresa() {
  const usuarioId = generateUuid();
  const empresaId = generateUuid();
  return { usuarioId, empresaId };
}

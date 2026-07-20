import { describe, it, expect } from 'vitest';
import { DatabaseAuthService } from '../../../src/modules/auth/infrastructure/database-auth-service';

function makeFakeDeps() {
  const tokenService = { generate: (p:any)=> 'tok', verify: (t:string)=> { if (t==='bad') throw new Error('bad'); return { usuarioId: 'u1', empresaId: 'e1', membershipId: 'm1' }; } };
  const usuarioRepository = { findById: async (id:string) => ({ id, email: 'a@b.com', activo: true, passwordHash: 'pw' }), findByEmail: async (email:string)=> ({ id: 'u1', email, activo: true, passwordHash: 'pw' }) };
  const membershipRepository = { findByUsuarioId: async (uid:string) => [{ id: 'm1', empresaId: 'e1', activo: true, rolId: 'r1' }], findByUsuarioAndEmpresa: async (u:string, e:string) => ({ id: 'm1', empresaId: e, activo: true, rolId: 'r1' }) };
  const roleRepository = { findById: async (id:string) => ({ id, activo: true }), findAllPermisos: async ()=> [], findRolPermisoByRolAndPermiso: async ()=> null };
  return { tokenService, usuarioRepository, membershipRepository, roleRepository };
}

describe('DatabaseAuthService (unit)', () => {
  it('resolves identity successfully with valid token', async () => {
    const deps = makeFakeDeps();
    const svc = new DatabaseAuthService(deps.tokenService as any, deps.usuarioRepository as any, deps.membershipRepository as any, deps.roleRepository as any);
    const identity = await svc.resolveIdentity('good');
    expect(identity.usuarioId).toBe('u1');
    expect(identity.empresaId).toBe('e1');
  });

  it('throws TokenValidationError for invalid token', async () => {
    const deps = makeFakeDeps();
    const svc = new DatabaseAuthService(deps.tokenService as any, deps.usuarioRepository as any, deps.membershipRepository as any, deps.roleRepository as any);
    await expect(svc.resolveIdentity('bad')).rejects.toThrow();
  });
});

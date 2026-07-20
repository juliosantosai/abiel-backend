# AUTHORIZATION ARCHITECTURE CONTRACT

## 1. Principios de seguridad

- La autorización es un mecanismo transversal y no debe vivir en los controllers.
- Todo servicio de negocio recibe `TenantContext` como primera dependencia.
- `Usuario` es identidad global y no contiene `empresaId`.
- `empresaId` enviado desde frontend no es fuente de verdad.
- Auth no consulta Prisma directamente.
- No puede haber dependencias circulares `auth ↔ usuario` ni `auth ↔ roles`.
- Roles y permisos se resuelven a partir de la membership activa del usuario.
- El `TenantContext` es inmutable durante la request.

## 2. Responsabilidades por módulo

### 2.1 `modules/auth`

- `domain`: define permisos y tipos de claims.
- `application`: define contratos de autorización (`AuthorizationService`) y creación de contexto (`AuthContextFactory`).
- `infrastructure`: proporciona adaptadores de prueba / placeholder, no lógica de negocio.
- `presentation`: expone ganchos / decoradores para Fastify.

### 2.2 `modules/usuario`

- Propiedad de `Membership`.
- Expone contratos para buscar memberships y usuarios (`MembershipFinder`, `UsuarioFinder`).
- No expone roles ni lógica de autorización.

### 2.3 `modules/roles`

- Propiedad de roles y permisos.
- Expone contratos para buscar roles y permisos por `rolId`.
- No ejecuta validaciones de tenancy en la capa de Auth.

### 2.4 `shared`

- Contiene `TenantContext`, `GLOBAL_TENANT_ID`, contratos de finder y errores comunes.
- Define los contratos de comunicación sin acoplar impl.

## 3. Contratos clave

### 3.1 `TenantContext`

```ts
export interface TenantContext {
  readonly usuarioId: string;
  readonly empresaId: string;
  readonly membershipId: string;
  readonly rolIds: string[];
  readonly permisos: string[];
  readonly isGlobalTenant: boolean;
}
```

### 3.2 `AuthorizationService`

```ts
export interface AuthorizationService {
  can(context: TenantContext, permiso: Permission): Promise<boolean>;
  hasRole(context: TenantContext, rolId: string): Promise<boolean>;
  assertPermission(context: TenantContext, permiso: Permission): Promise<void>;
}
```

### 3.3 `Permission`

- Uso de un string enum inmutable para permisos.
- Esto ofrece un contrato escalable, fácil de compartir y compatible con SaaS.
- Permisos se definen en `src/modules/auth/domain/permission.ts`.

### 3.4 Repositorios y contratos compartidos

- `UsuarioFinder`: buscar usuario global por email / id.
- `MembershipFinder`: buscar membership activa por `usuarioId` y `empresaId`.
- `PermissionFinder`: obtener permisos por `rolIds`.
- `RoleFinder`: obtener roles y datos necesarios para validar ownership.

## 4. Flujo de autorización

1. Request llega al servidor.
2. Auth hook verifica el token (futuro JWT) con `TokenService`.
3. `AuthContextFactory` construye `TenantContext`.
4. El request recibe `request.tenantContext`.
5. Fastify `preHandler` o decorador de ruta invoca `AuthorizationService`.
6. Si el permiso es válido, se delega al controller.
7. El controller pasa `TenantContext` al application service.
8. El application service ejecuta lógica de negocio con filtro de tenant.
9. El repository recibe `empresaId` / `membershipId` desde el contexto.

## 5. Reglas obligatorias de Tenant Enforcement

### 5.1 Firma de servicios

Incorrecto:
```ts
async function crearCliente(data: CreateClientInput)
```

Correcto:
```ts
async function crearCliente(context: TenantContext, data: CreateClientInput)
```

### 5.2 Qué evitar

- No pasar `empresaId` desde frontend como prueba de autorización.
- No hacer consultas sin `TenantContext`.
- No permitir a un usuario de empresa A acceder a datos de empresa B.
- No validar roles manualmente en controllers.
- No usar roles como datos de negocio en el módulo `Auth`.

## 6. Guard de permisos / hook

### 6.1 Estrategia recomendada

- `requiresPermission(permission)` se usa como metadata de ruta.
- Fastify ejecuta un hook `authorize` en `preHandler`.
- El hook lee `request.tenantContext` y delega a `AuthorizationService.assertPermission()`.
- Si falta contexto o permiso, se lanza `UnauthorizedError`.

### 6.2 Ejemplo conceptual

```ts
app.post(
  "/agents",
  {
    ...requiresPermission(PERMISSIONS.AGENT_CREATE),
    preHandler: [authorize],
  },
  controller.createAgent
);
```

## 7. Reglas prohibidas

- No controllers validando roles/permissions.
- No servicios leyendo membership directamente.
- No queries a Prisma sin tenant context.
- No frontend enviando `empresaId` como autoridad.
- No roles mezclando lógica de Auth.
- No dependencias circulares entre módulos.

## 8. Ejemplos correctos e incorrectos

### Correcto
```ts
async function actualizarCliente(context: TenantContext, input: UpdateClientInput) {
  await this.clienteRepository.update({ ...input, empresaId: context.empresaId });
}
```

### Incorrecto
```ts
async function actualizarCliente(input: UpdateClientInput) {
  await this.clienteRepository.update({ ...input, empresaId: input.empresaId });
}
```

## 9. Decisiones de diseño

- `Permission` se implementa como literal de string en un archivo compartido.
- El contracto `AuthorizationService.can()` retorna booleano y `assertPermission()` maneja la excepción.
- `TenantContext` es la única fuente de verdad de tenant activo.
- Los permisos siempre se calculan desde datos de membership/roles, no del token.
- Fastify usa un hook `preHandler`, no lógica en controllers.

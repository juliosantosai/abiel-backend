# AUTH CONTEXT LIFECYCLE

## Propósito

Definir el ciclo de vida de `TenantContext` y su papel como la base segura para Auth + Authorization en un SaaS multi-tenant. Este documento valida que la capa de identidad esté aislada y lista para construir los módulos de negocio posteriores.

## Arquitectura

- `modules/auth`: administración de identidad y autorización.
- `shared/context`: definición del `TenantContext` inmutable.
- `modules/usuario`: propiedad de `Membership` y contratos de identidad.
- `modules/roles`: propiedad de roles y permisos.

## Flujo completo

1. Request
2. Auth Hook
3. Token validation (futuro JWT)
4. AuthenticatedUser
5. AuthContextFactory
6. TenantContext
7. AuthorizationService
8. Application Services

## Dónde nace el contexto

El contexto nace en el `AuthContextFactory`.

- El hook de autenticación valida el token y obtiene `AuthenticatedUser`.
- El `AuthContextFactory` convierte esa identidad en un `TenantContext` seguro.

## Dónde vive el contexto

El contexto vive dentro del ciclo de la request.

- Se coloca en el request de Fastify como una propiedad leída por otras capas.
- Debe ser inmutable y solo accesible de lectura.

## Cuándo muere el contexto

- Muere al finalizar la request.
- No se almacena en cachés fuera del request.
- No debe persistir en objetos de dominio ni en estado de aplicación.

## Reglas de seguridad

- El `TenantContext` solo puede construirse mediante `AuthContextFactory`.
- No debe existir un `TenantContext` vacío.
- No se acepta `empresaId` del frontend como autoridad.
- No se debe mutar el contexto.
- Las decisiones de permiso dependen únicamente de `TenantContext`.

## Responsabilidades

- `AuthContextFactory`: crear el contexto a partir del usuario autenticado.
- `TenantContext`: contener solo datos necesarios para autorización.
- `AuthorizationService`: validar permiso + tenancy.
- `Application Services`: recibir `TenantContext` y operar con él.
- `Controllers`: no validan roles ni tenancy.

## Decisiones tomadas

- `TenantContext` es una clase inmutable con `Object.freeze` en arreglos.
- El contexto debe construirse con:
  - `usuarioId`
  - `empresaId`
  - `membershipId`
  - `rolIds`
  - `permisos`
  - `isGlobalTenant`
- La entrada de `AuthContextFactory` es `AuthenticatedUser`, no `TokenPayload`.
- Un usuario inactivo, sin membership o con membership inactiva no crea contexto.
- El contexto no puede ser creado manualmente fuera de Auth.

## Ejemplos correctos

### AuthContextFactory

```ts
const context = await authContextFactory.buildContext(authenticatedUser);
```

### Service signature

```ts
async function crearCliente(context: TenantContext, input: CreateClientInput) {
  // tenant enforcement
}
```

## Ejemplos prohibidos

- `const context = new TenantContext(...)`
- `const empresaId = request.body.empresaId`
- `if (!request.tenantContext) throw ...` dentro del controller
- `repository.findMany({ where: {} })` sin filtro por tenant

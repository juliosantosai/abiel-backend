# AUTH ARCHITECTURE CONTRACT

## 1. Principios generales

- El módulo `auth` es parte del monolito modular de Abiel. Debe respetar la estructura existente: `domain`, `application`, `infrastructure`, `presentation`.
- No se implementa la lógica completa de JWT todavía. Solo se define el contrato y la responsabilidad de cada capa.
- `Usuario` es una identidad global y NO debe tener `empresaId` en su entidad ni en su dominio.
- La relación `Usuario ↔ Empresa ↔ Rol` se materializa únicamente a través de `Membership`.
- `Membership` es propiedad del módulo `usuario` y ese módulo expone los contratos necesarios para que otros módulos (incluido `auth`) accedan a información de tenant.
- No se permite que `Auth` consulte Prisma directamente.
- No se permiten dependencias circulares `Auth ↔ Usuario`.
- No se puede confiar en `empresaId` enviado desde el frontend como fuente de verdad.
- Todo request autenticado debe llevar un `TenantContext` válido antes de ejecutar lógica de negocio.

## 2. Diseño de `src/modules/auth/`

### 2.1 domain
- Contendrá los valores y contratos de identidad propios de la autenticación.
- Entidades / value objects mínimas:
  - `AuthClaims` o `TokenClaims`: estructura del payload de token.
  - `AuthIdentity`: representación inmutable de la identidad autenticada dentro del módulo.
- NO debe importar Prisma ni Fastify.
- NO debe contener reglas de negocio de `Usuario`, `Rol` o `Membership`.

### 2.2 application
- Contendrá casos de uso de autenticación y autorización de alto nivel.
- Responsabilidades:
  - `AuthService` / `AuthenticationService`: validar credenciales, orquestar verificación de usuario, consulta de membership y construcción del `TenantContext`.
  - `TokenService` (ya existe como contrato) y `TokenProvider`: generar/verificar tokens.
  - `AuthorizationService`: validar permisos y roles usando el `TenantContext`.
  - `AuthContextFactory`: construir `TenantContext` desde claims + datos de persistencia.
- Contratos esperados:
  - `TokenService`: `generate(payload)` / `verify(token)`.
  - `AuthService`: `login(credentials)` / `validateToken(token)`.
  - `AuthorizationService`: `checkPermission(context, permission)` / `checkRole(context, role)`.
- No debe contener lógica técnica de persistencia.

### 2.3 infrastructure
- Contendrá adaptadores técnicos para `Auth` pero sin lógica de negocio.
- Responsabilidades:
  - Implementación de `TokenService` (por ahora `NoopTokenService` o placeholder JWT provider que respeta la interfaz).
  - Implementación de `PasswordHasher` / `PasswordVerifier` si se necesita comparar hashes.
  - Adaptadores a contratos de otros módulos: `UsuarioFinder`, `MembershipFinder`, `RoleFinder`.
- Prohibido:
  - consultar Prisma directamente desde `src/modules/auth/infrastructure`.
  - importar entidades concretas de `usuario` o `roles` en esta capa.

### 2.4 presentation
- Contendrá únicamente los controladores y la transformación request/response.
- Responsabilidades:
  - Exponer los endpoints de login/verify solo si se implementa en el futuro.
  - No alojar lógica de autorización.
  - No debe llamar a Prisma ni a repositorios.
- Hoy: solo contratos de controladores y rutas, sin endpoints finales.

## 3. Tenant Context propuesto

### 3.1 Especificación recomendada

```ts
export interface TenantContext {
  usuarioId: string;
  empresaId: string;
  membershipId: string;
  rolIds: string[];
  permisos: string[];
  isGlobalTenant: boolean;
}
```

### 3.2 Qué debe responder
- `usuarioId`: identidad global del usuario autenticado.
- `empresaId`: tenant activo para la request.
- `membershipId`: membership activa que enlaza al usuario con ese tenant.
- `rolIds`: roles activos asociados a la membership.
- `permisos`: permisos resultantes de los roles activos.

### 3.3 Mutabilidad
- El `TenantContext` debe ser **inmutable** durante el ciclo de vida de la request.
- Se construye en el middleware de autenticación y se monta en el request.
- No debe modificarse en los servicios de negocio.
- Permite razonar con seguridad y evita inconsistencias entre pasos de autorización.

## 4. Flujo de autenticación propuesto

1. `Login`
   - El usuario envía credenciales.
2. `Validación usuario`
   - `AuthService` consulta a `UsuarioFinder` por `usuarioId` o `email`.
3. `Password verification`
   - Se compara password plano con hash usando `PasswordVerifier`.
4. `Generación JWT`
   - Si es válido, `TokenService.generate()` crea el token con claims mínimos.
5. `Request autenticado`
   - El cliente incluye el token en `Authorization: Bearer ...`.
6. `Middleware Auth`
   - Un hook Fastify verifica el token con `TokenService.verify()`.
7. `Creación TenantContext`
   - `AuthContextFactory` expande claims con datos de `MembershipFinder` y `RoleFinder`.
   - Se carga en `request.tenantContext`.
8. `Servicios de negocio`
   - Casos de uso reciben `TenantContext` y actúan con él.

## 5. Contenido del JWT

### 5.1 Datos que deben ir dentro del token
- `usuarioId`: identidad global.
- `membershipId`: referencia a la membership activa.
- `empresaId`: tenant activo asociado a esa membership.
- `iat` / `exp`: tiempos de emisión y expiración.
- Opcional: `rolIds[]` cuando el token es de corta vida y el sistema puede tolerar ligeras variaciones de rol antes de refrescar.

### 5.2 Datos que NO deben ir dentro del token
- `email`: no es necesario para autorización y no debe usarse como identidad primaria.
- `permisos`: no deben incluirse completos en JWT porque son dinámicos y generan tokens obsoletos.
- `nombre`, `profile data`: datos de usuario de presentación no pertenecen al token de seguridad.
- `password`, `passwordHash`, u otros datos sensibles.

### 5.3 Motivación
- El token debe ser un carrier de identidad y tenant, no el sistema de autorización.
- Todos los permisos y roles efectivos deben validarse / completarse en runtime a partir de `Membership` y `Role` actuales.
- Esto evita tokens sobre-privilegiados y fugas de estado cuando cambian roles o memberships.

## 6. Authorization Layer propuesta

### 6.1 Principios
- La autorización no se decide en los controllers.
- Los controllers son responsables de datos HTTP y de pasar el `TenantContext` a la capa de aplicación.
- La autorización se realiza en una capa transversal `AuthorizationService` y/o `Guards`.

### 6.2 Componentes
- `AuthorizationService`
  - Método `hasPermission(context, permiso)`.
  - Método `hasRole(context, rol)`.
  - Método `assertPermission(context, permiso)` que lanza si no está autorizado.
- `PermissionGuard`
  - Hook reutilizable que verifica permisos antes de ejecutar un caso de uso.
  - Al conectarse a Fastify puede ser un middleware `preHandler` o un decorador de ruta.
- Decorators / hooks Fastify
  - Ejemplo conceptual: `requiresPermission("CLIENTE_CREATE")`, `requiresRole("AGENTE")`.
  - Estos hooks leen `request.tenantContext` y delegan a `AuthorizationService`.

### 6.3 Patrón recomendado
- `presentation` define decoradores/hook names.
- `application` usa `AuthorizationService` para proteger casos de uso.
- `domain` no hace autorización a nivel HTTP.

## 7. Contratos entre módulos

### 7.1 Desde Auth hacia Usuario
- `UsuarioFinder`: obtener usuario por `id` o `email`.
- `MembershipFinder`: obtener membership activa por `membershipId` y `usuarioId`.
- `RoleFinder`: obtener roles y permisos asociados a esa membership.

### 7.2 Desde Roles hacia Usuario
- `MembershipCreator`: ya existe. El módulo `roles` solo crea membership vía este contrato.

### 7.3 Compartir constantes
- `GLOBAL_TENANT_ID` se usa en todos los módulos.
- `TenantContext` se define de manera compartida en `src/shared/context`.

## 8. Decisiones aprobadas

- `Auth` es un módulo independiente que consume contratos de `usuario` y `roles`, pero no sus implementaciones.
- `Membership` sigue siendo propiedad del módulo `usuario`.
- `Usuario` no debe incorporar `empresaId` en su entidad de dominio.
- El `TenantContext` es inmutable.
- El token incluirá identificadores mínimos y no permisos completos.
- La autorización debe realizarse fuera de los controllers.

## 9. Decisiones prohibidas

- No permitir que `Auth` importe entidades de dominio de `usuario` o `roles`.
- No consultar Prisma desde `src/modules/auth`.
- No usar `empresaId` proveniente del frontend como verdad exclusiva.
- No ejecutar autorización dentro de los `controllers`.
- No dejar que `roles` acceda directamente a `Membership`.
- No usar el token JWT como única fuente de permisos/roles si el sistema requiere revocación o cambios dinámicos.

## 10. Diagramas conceptuales en texto

### 10.1 Flujo de login

```
Frontend -> AuthController -> AuthService -> UsuarioFinder
                                      -> PasswordVerifier
                                      -> TokenService.generate()
                                      -> retorna JWT al cliente
```

### 10.2 Flujo de request autenticado

```
Frontend -> Fastify Auth Hook
          -> TokenService.verify()
          -> AuthContextFactory
             -> MembershipFinder
             -> RoleFinder
             -> AuthorizationService
          -> request.tenantContext
          -> Controller -> Application Service
```

### 10.3 Dependencias entre módulos

```
Auth --> [contracts] --> Usuario
Auth --> [contracts] --> Roles
Roles --> [contracts] --> Usuario (MembershipCreator)
Usuario --> owns --> Membership
```

## 11. Recomendaciones adicionales

- Mantener `TokenService` como contrato estable y permitir múltiples implementaciones (`NoopTokenService`, `JwtTokenService`) en el futuro.
- Definir `TenantContext` en `src/shared/context` para que todos los módulos lo consuman de forma consistente.
- Crear nuevos contratos en `src/shared/contracts` cuando Auth necesite consultar `Usuario` o `Membership`.
- Plantar un `AuthHook` conceptual en `presentation` de Fastify sin implementarlo todavía.

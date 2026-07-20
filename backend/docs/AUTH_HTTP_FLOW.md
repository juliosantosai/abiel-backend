# Auth HTTP Flow

Flow for authenticated requests through the API Platform Layer:

HTTP Request
 ↓
Auth Middleware (src/api/middleware/auth-middleware.ts)
 ↓
TokenService.verify + AuthService.validateToken
 ↓
AuthContextFactory.buildContext (authority to create TenantContext)
 ↓
TenantContext attached to request
 ↓
Controller reads `request.tenantContext` and calls Application Services

Rules:
- Controllers never validate JWTs directly.
- API Layer middleware is responsible for token parsing, validation and building `TenantContext`.
- `AuthContextFactory` is the only component that can produce a `TenantContext`.

Identity Resolution Flow:

- The middleware extracts the raw JWT from `Authorization: Bearer <token>`.
- The middleware delegates to `AuthService.resolveIdentity(token)` to:
	- validate the token,
	- load user record and membership info,
	- resolve roles and permisos,
	- return a complete `AuthenticatedUser`.
- The resulting `AuthenticatedUser` is passed to `AuthContextFactory.buildContext()` which returns the `TenantContext`.
- The controller receives `request.tenantContext` and should not perform any authentication logic.

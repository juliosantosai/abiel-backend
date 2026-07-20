# API Versioning Contract

URI pattern:

/api/{version}/{consumer}/{resource}

Where:
- `version` - semantic API version (for now `v1`).
- `consumer` - one of `admin`, `customer`, `integrations`, `public`.
- `resource` - module resource, e.g. `conversations`, `agents`, `empresas`.

Examples:

- `/api/v1/customer/conversations`
- `/api/v1/customer/agents`
- `/api/v1/admin/empresas`

Notes:
- New versions are additive; v1 endpoints remain stable until deprecation is announced.
- Authentication and tenant extraction are applied at the API Layer.

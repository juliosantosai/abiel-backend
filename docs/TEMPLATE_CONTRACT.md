Estado actual de implementación

- Módulo `Template` implementado con versiones y blueprints:
  - `TemplateServiceImpl` permite crear plantillas y versiones (snapshots `TemplateVersion`).
  - Repositorio in-memory para tests: `src/modules/template/infrastructure/in-memory-template-repository.ts`.

Tests existentes

- `tests/modules/template-service.test.ts` valida creación de template y versiones, y recuperación de blueprint.

Pendientes

- Persistencia Prisma para templates si se requiere persistencia a largo plazo.
- Validaciones de blueprint contra un esquema (opcional).
# Template Contract

Objetivo

Definir los contratos para `BusinessTemplate` y `TemplateVersion` y cómo exponer variables configurables y selección automática por rubro.

1) BusinessTemplate

- id: string
- blueprintId: string
- name: string
- description: string
- ownerTenantId?: string (si es plantilla privada)
- visibility: enum { PUBLIC, TENANT }
- tags: string[]
- createdAt, createdBy

2) TemplateVersion

- id: string
- businessTemplateId: string
- version: string
- snapshot: Json (descripción inmutable de artefactos referenciados)
  - artifacts: [ { type: "AgentTemplate"|"WorkflowTemplate"|"TaskTemplate"|"KnowledgeTemplate", id } ]
- variablesSchema: JsonSchema (definición de variables configurables)
- status: enum { DRAFT, PUBLISHED, DEPRECATED }
- createdAt, createdBy

3) Variables configurables

- Variables definidas mediante `variablesSchema` (JSON Schema).
- Al aplicar un TemplateVersion, `Provisioning` necesita recibir `variables` validables contra schema.

4) Selección automática por rubro

- Cada `BusinessTemplate` contiene metadata `industries: string[]`.
- Motor de selección (Sales Agent o UI) aplica heurística: detectar industria del prospecto y buscar plantillas públicas con `industries` coincidentes; si existe plantilla privada para tenant, priorizarla.

5) Operaciones

- `TemplateService.list(tenantId, filters)` — muestra públicas + privadas del tenant.
- `TemplateService.getVersion(templateId, version)`
- `TemplateService.applyVersion(tenantId, versionId, variables)` — genera eventos `TemplateAppliedEvent`.

6) Versioning

- Versiones inmutables; migración mediante nuevas versiones.

7) Seguridad

- Validar que `apply` sea invocado por actor con permisos suficientes.

8) Ejemplo (simplificado)

{
  "id": "tpl-isp-basic",
  "businessTemplateId": "bt-isp",
  "version": "2.0.0",
  "snapshot": { "artifacts": [ { "type": "WorkflowTemplate", "id": "wf-install-v2" } ] },
  "variablesSchema": { "type":"object","properties":{"plan":{"type":"string"}},"required":["plan"] }
}

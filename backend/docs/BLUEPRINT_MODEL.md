# Blueprint & Template Conceptual Model (Prisma conceptual)

Nota: esto es un modelo conceptual para revisión. No ejecutar código aún.

Entidades principales (concepto + campos clave)

- `Blueprint`:
  - id
  - name
  - industry
  - description
  - createdAt, updatedAt

- `BusinessTemplate`:
  - id
  - blueprintId -> Blueprint
  - name
  - description
  - visibility (PUBLIC | TENANT)
  - createdBy

- `TemplateVersion`:
  - id
  - businessTemplateId
  - version
  - snapshot (json) // references to artefact ids and metadata
  - status (DRAFT | PUBLISHED | DEPRECATED)
  - createdAt

- `AgentTemplate`:
  - id
  - templateVersionId
  - descriptor (json) // capabilities, settings

- `WorkflowTemplate`:
  - id
  - templateVersionId
  - definition (json) // steps, transitions

- `TaskTemplate`:
  - id
  - templateVersionId
  - schema (json)

- `TenantInstance` (registro de instancia creada por provisioning):
  - id
  - tenantId (empresaId)
  - templateVersionId
  - provisioningStatus

Relaciones y consideraciones multi-tenant

- Todas las entidades tenant-aware deben incluir `empresaId` cuando aplique.
- TemplateVersions son globales; instanciación genera artefactos concretos vinculados al `tenantId`.

Ideas de mapping Prisma (conceptual)

model Blueprint {
  id String @id
  name String
  industry String
}

model BusinessTemplate {
  id String @id
  blueprintId String
  name String
  visibility String
}

model TemplateVersion {
  id String @id
  businessTemplateId String
  version String
  snapshot Json
  status String
}

model TenantInstance {
  id String @id
  tenantId String
  templateVersionId String
  status String
}

Esta propuesta se pulirá tras la revisión para incluir índices, constraints y detalles de tenant isolation.

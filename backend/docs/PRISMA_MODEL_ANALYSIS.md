# Análisis del modelo Prisma actual vs requerimientos Fase 1

Fecha: 2026-07-19

Resumen

El esquema Prisma actual (`prisma/schema.prisma`) contiene modelos claves: `Empresa`, `Usuario`, `Conversation`, `Message`, `Agent`, `Rol`, `Permiso`, `Membership`, `RolPermiso`, `Plan`, `Suscripcion`, `Configuracion`.

Evaluación

- Soporte existente: `Agent` model ya existe y tiene `definition`/`settings` en `Json`, lo cual facilita `AgentTemplate` mapping.
- No existen modelos para: `Blueprint`, `BusinessTemplate`, `TemplateVersion`, `Workflow`, `WorkflowStep`, `WorkflowExecution`, `Task`, `Provisioning`, `TenantInstance` ni `execution history`.

Impacto y recomendaciones

1) Añadir modelos nuevos sin modificar los existentes; diseñar migraciones incrementales.
2) Propuesta básica de modelos Prisma a agregar (conceptual):

model Blueprint {
  id        String @id
  name      String
  industry  String
  description String?
  createdAt DateTime
  updatedAt DateTime
}

model BusinessTemplate {
  id           String @id
  blueprintId   String
  blueprint     Blueprint @relation(fields:[blueprintId], references:[id])
  name         String
  visibility   String
  industries   String[]
  createdBy    String
  createdAt    DateTime
}

model TemplateVersion {
  id               String @id
  businessTemplateId String
  version          String
  snapshot         Json
  variablesSchema  Json
  status           String
  createdAt        DateTime
}

model WorkflowTemplate {
  id String @id
  templateVersionId String
  definition Json
}

model Workflow {
  id String @id
  empresaId String
  name String
  version String
  definition Json
  createdAt DateTime
  updatedAt DateTime

  @@index([empresaId])
}

model WorkflowExecution {
  id String @id
  workflowId String
  workflowVersion String
  empresaId String
  state String
  input Json
  output Json?
  startedAt DateTime
  endedAt DateTime?

  @@index([empresaId])
}

model Task {
  id String @id
  empresaId String
  workflowExecutionId String?
  title String
  description String?
  assignedTo String?
  type String
  priority String
  status String
  sla Json?
  metadata Json?
  createdAt DateTime
  updatedAt DateTime

  @@index([empresaId])
}

3) Tenant isolation: todos los modelos tenant-aware deben incluir `empresaId` y tener índices.

4) Backwards compatibility: agregar tablas nuevas no rompe existentes; implementar migraciones y seeds para templates iniciales.

5) Consideraciones de performance:
- Indexar `WorkflowExecution(empresaId, state)` para consultas.
- Archivar ejecuciones antiguas en tablas históricas si volumen alto.

6) Observabilidad y events:
- Añadir triggers en servicios para crear events al mutar ejecuciones y tasks.

Conclusión

El esquema actual facilita la extensión; la implementación requiere añadir ~8 modelos nuevos y cuidar indices, constraints y políticas de tenant isolation. Recomendación: aplicar cambios por fases: Templates+Blueprints → WorkflowTemplates+Workflows → WorkflowExecution+Task → Provisioning/Instances.

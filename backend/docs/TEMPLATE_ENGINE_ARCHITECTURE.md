# Template Engine — Arquitectura

Propósito

Gestionar artefactos reutilizables (Blueprints, BusinessTemplates, TemplateVersions) y relacionarlos con plantillas de Agents, Workflows, Tasks y Knowledge.

Conceptos

- `Blueprint`: agrupa industry-level templates (p.ej. Telecom, Financiera).
- `BusinessTemplate`: plantilla orientada a un caso de negocio (p.ej. Internet Fibra Básico).
- `TemplateVersion`: snapshot inmutable de una BusinessTemplate.
- `Artefactos`: AgentTemplate, WorkflowTemplate, TaskTemplate, KnowledgeTemplate, IntegrationTemplate.

Requisitos

- Versionado y publicación (draft → published → deprecated).
- Plantillas públicas (global) y privadas (por empresa).
- Plantillas componibles: un BusinessTemplate referencia artefactos que se instancian por Provisioning.

Operaciones clave

- `TemplateService.createBlueprint()`
- `TemplateService.publishVersion()`
- `TemplateService.listByTenant()`

Políticas

- TemplateVersion son inmutables; las migraciones se realizan creando nuevas versiones.
- Validar compatibilidad entre artefactos referenciados (p.ej. WorkflowTemplate requiere TaskTemplates existentes).

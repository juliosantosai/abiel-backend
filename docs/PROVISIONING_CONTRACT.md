# Provisioning Contract

Objetivo

Definir el contrato y las garantías para el `Provisioning Engine` que materializa una Tenant Instance a partir de una `TemplateVersion`.

1) Principios

- Idempotencia: invocar provisioning varias veces con el mismo `provisioningId` no debe crear duplicados.
- No-cross-writes: Provisioning NO escribe directamente en tablas de otros dominios; invoca APIs o emite eventos.
- Observabilidad y compensación: usar saga/orchestration pattern para manejar fallos.

2) Proceso (orquestado)

Entrada: { provisioningId, tenantInfo, templateVersionId, variables, correlationId, initiatedBy }

Pasos:
- Validate license/payment
- Create tenant record (minimal)
- Emit `TenantCreatedEvent`
- Emit `TemplateAppliedEvent` (or call `TemplateService` to create domain artifacts)
- For each artifact in snapshot:
  - If AgentTemplate -> call AgentService.createAgent(tenantId, agentTemplate)
  - If WorkflowTemplate -> call WorkflowService.import(template)
  - If TaskTemplate -> call TaskService.import(template)
  - If KnowledgeTemplate -> call KnowledgeService.index(...)
- Wait for acknowledgements and mark provisioning status
- Emit `ProvisioningCompletedEvent` (success or failure)

3) Events

- `ProvisioningStartedEvent` { provisioningId, tenantId?, templateVersionId, correlationId }
- `TenantCreatedEvent` { tenantId, provisioningId }
- `TemplateAppliedEvent` { provisioningId, tenantId, templateVersionId, artifacts }
- `ProvisioningCompletedEvent` { provisioningId, tenantId, success, details }

4) Error handling

- If a step fails, Provisioning can: retry, run compensating actions (delete partially created resources via domain APIs), or mark provisioning as FAILED and notify operators.

5) Idempotency keys

- Use `provisioningId` and artifact-level ids to avoid duplicates.

6) Security

- Actions that create tenants or agents must be authorized; Provisioning service acts as orchestrator but each domain enforces its own ACLs.

Estado actual de implementación

- Se implementó un `WorkflowServiceImpl` con flujo básico de ejecución:
  - `startExecution()` crea ejecución y publica eventos `WorkflowExecutionStarted`.
  - `executeNextStep()` emite `TaskCreateRequested` para pasos `HUMAN`, `AgentExecutionRequested` para `AGENT_CALL` y completa automáticamente pasos `AUTOMATIC`.
  - `handleEvent()` permite continuar ejecución al recibir eventos de completado.

Tests existentes

- Tests unitarios básicos para `WorkflowServiceImpl` en `tests/modules/workflow-service.test.ts`.

Pendientes

- Cobertura adicional para casos de error, timeouts, rollback de ejecuciones y persistencia de estados en repositorio real.
- No se agregó persistencia avanzada ni executor distribuido (pendiente en Fase siguiente).
 
Estado de Workflow Core (implementación actual)

- `WorkflowServiceImpl` implementa creación de ejecuciones, avance de pasos, publicación de eventos (`WorkflowExecutionStarted`, `WorkflowStepCompleted`, `WorkflowExecutionCompleted`, `TaskCreateRequested`, `AgentExecutionRequested`) y manejo de eventos correlacionados para continuar ejecuciones.
- Repositorios: In-memory repository disponible en `src/modules/workflow/infrastructure/in-memory-workflow-repository.ts`.
- EventBus: `InMemoryEventBus` used for intra-process communication in tests and in-memory runs.
- Prisma persistence for workflows: no models defined yet in `prisma/schema.prisma` (Prisma repository pending schema design).
 - Prisma persistence for workflows: models added to `prisma/schema.prisma` and `PrismaWorkflowRepository` implemented at `src/modules/workflow/infrastructure/prisma-workflow-repository.ts`.

Se agregaron tests unitarios que cubren inicio, avance automático, continuación tras `TaskCompleted` y aislamiento por tenant.
Se agregaron tests de persistencia en `tests/modules/prisma-workflow-repository.test.ts`.
# Workflow Contract

Objetivo

Definir el contrato canónico para modelar `WorkflowDefinition`, `WorkflowStep` y `WorkflowExecution` que será usado por `WorkflowService` y `WorkflowEngine`.

1) WorkflowDefinition

- id: string
- name: string
- version: string (semver-like)
- description: string
- steps: WorkflowStep[]
- variables: Record<string, {type: string, required: boolean, default?: any}>
- metadata: {createdBy, createdAt}

2) WorkflowStep

Campos:
- id: string
- name: string
- type: enum { AUTOMATIC, HUMAN, EXTERNAL_EVENT, AGENT_CALL }
- next: string | string[] (id(s) of next step(s))
- retryPolicy?: { retries: number, backoffMs: number }
- timeoutMs?: number
- config?: object (step-specific configuration)

Para `AGENT_CALL` steps, `config` contiene:
- agentTemplateId?: string
- capability?: string
- inputMapping?: object
- outputMapping?: object

3) WorkflowExecution

- executionId: string
- workflowId: string
- workflowVersion: string
- tenantId: string
- correlationId: string
- startedBy?: string
- state: enum { CREATED, RUNNING, WAITING, COMPLETED, FAILED, CANCELLED }
- currentStepId?: string
- input: Json
- output?: Json
- createdAt, updatedAt

4) WorkflowStepExecution (history)

- id
- executionId
- stepId
- startedAt
- endedAt
- status: enum { PENDING, RUNNING, WAITING, COMPLETED, FAILED }
- input
- output
- retries

5) Eventos relevantes (event contracts)

- `WorkflowStartedEvent` { tenantId, correlationId, userId, workflowId, executionId, input }
- `WorkflowStepCompletedEvent` { tenantId, correlationId, userId, workflowId, executionId, stepId, output }
- `WorkflowCompletedEvent` { tenantId, correlationId, userId, workflowId, executionId, result }
- `WorkflowFailedEvent` { tenantId, correlationId, userId, workflowId, executionId, reason }

6) Relación con Agent y Task

- Para pasos que requieren IA, el motor EMITE `AgentExecutionRequestedEvent` con metadata (tenantId, correlationId, executionId, stepId, input).
- El Agent Platform CONSUME `AgentExecutionRequestedEvent` y EMITE `AgentExecutionCompletedEvent` con output.
- Para pasos HUMAN, el motor CREA una `Task` emitiendo `TaskCreatedEvent` y PAUSA la ejecución hasta recibir `TaskCompletedEvent`.

7) Versionado y compatibilidad

- Workflows versionados mediante `version`.
- Las ejecuciones referencian la `workflowVersion` usada.
- Cambios incompatibles requieren nueva `TemplateVersion`.

8) Ejemplo (JSON, simplificado)

{
  "id": "wf-internet-signup",
  "name": "Internet Signup",
  "version": "1.0.0",
  "steps": [
    { "id": "s1", "name": "collect_data", "type": "HUMAN", "next": "s2" },
    { "id": "s2", "name": "check_coverage", "type": "AUTOMATIC", "next": "s3", "config": { "service": "coverage" } },
    { "id": "s3", "name": "agent_decision", "type": "AGENT_CALL", "config": { "capability": "qualification" }, "next": "s4" },
    { "id": "s4", "name": "create_install_task", "type": "HUMAN" }
  ]
}

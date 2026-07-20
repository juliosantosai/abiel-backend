Estado actual de implementación

- Modelo de `Task` implementado en `src/modules/task/domain` y repositorios:
  - In-memory: `src/modules/task/infrastructure/in-memory-task-repository.ts`
  - Prisma: `src/modules/task/infrastructure/prisma-task-repository.ts` (mapeadores explicitos para JSON)

Tests existentes

- Unit tests para `Task` y repositorios en `tests/modules/*` (suite Vitest).

Pendientes

- Revisar y endurecer validaciones de `sla` y `metadata` JSON contra esquema si es necesario.
- Añadir más pruebas de integración Prisma/DB para campos JSON.
# Task Model

Objetivo

Definir el modelo de `Task` que soporta tareas humanas y automatizadas, asignación, SLA y estados.

Entidad `Task` (campos mínimos)

- id: string
- empresaId: string
- workflowExecutionId?: string
- title: string
- description?: string
- group?: string
- assignedTo?: string (userId)
- type: enum { HUMAN, AUTOMATED }
- priority: enum { LOW, MEDIUM, HIGH }
- status: enum { PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED }
- sla: { dueAt?: DateTime, escalationPolicy?: Json }
- metadata: Json
- createdAt, updatedAt

Eventos

- `TaskCreatedEvent` { tenantId, correlationId, taskId, workflowExecutionId? }
- `TaskAssignedEvent` { tenantId, taskId, assignedTo }
- `TaskCompletedEvent` { tenantId, taskId, result? }
- `TaskCancelledEvent`

Assignment and SLA

- Assignment can be manual (user accepts) or automatic (round-robin, skills-based).
- SLA processor watches `dueAt` and emits escalations or reassignments.

Human vs Automated Tasks

- For `AUTOMATED` tasks, the Task engine can call an endpoint or emit an event for a worker to process.
- For `HUMAN` tasks, create UI actions, notifications and wait for `TaskCompletedEvent`.

Audit and history

- Maintain `TaskHistory` entries for status changes and assignment changes.

Example (JSON)

{
  "id": "task-123",
  "empresaId": "empresa-A",
  "title": "Validate ID",
  "type": "HUMAN",
  "status": "PENDING",
  "sla": { "dueAt": "2026-07-22T12:00:00Z" }
}

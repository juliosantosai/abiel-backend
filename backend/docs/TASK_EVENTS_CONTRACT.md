# Task Events Contract

## Eventos principales

### TaskCreatedEvent
- `eventId`
- `eventName`
- `occurredAt`
- `metadata`
  - `tenantId`
  - `userId`
  - `correlationId`
- `payload`
  - `taskId`
  - `status`
  - `workflowExecutionId?`
  - `result?`
  - `reason?`

### TaskAssignedEvent
- `eventId`
- `eventName`
- `occurredAt`
- `metadata`
  - `tenantId`
  - `userId`
  - `correlationId`
- `payload`
  - `taskId`
  - `status`
  - `assignedType`
  - `assignedId`
  - `workflowExecutionId?`

### TaskStartedEvent
- `eventId`
- `eventName`
- `occurredAt`
- `metadata`
  - `tenantId`
  - `userId`
  - `correlationId`
- `payload`
  - `taskId`
  - `status`
  - `workflowExecutionId?`

### TaskCompletedEvent
- `eventId`
- `eventName`
- `occurredAt`
- `metadata`
  - `tenantId`
  - `userId`
  - `correlationId`
- `payload`
  - `taskId`
  - `status`
  - `result?`
  - `workflowExecutionId?`

### TaskFailedEvent
- `eventId`
- `eventName`
- `occurredAt`
- `metadata`
  - `tenantId`
  - `userId`
  - `correlationId`
- `payload`
  - `taskId`
  - `status`
  - `reason`
  - `workflowExecutionId?`

### TaskCancelledEvent
- `eventId`
- `eventName`
- `occurredAt`
- `metadata`
  - `tenantId`
  - `userId`
  - `correlationId`
- `payload`
  - `taskId`
  - `status`
  - `reason?`
  - `workflowExecutionId?`

## Cómo consume Workflow estos eventos

- `Workflow` observa `TaskCompletedEvent` y `TaskFailedEvent`.
- `Workflow` no modifica la entidad Task directamente.
- El Task Engine publica eventos; el Workflow Engine actúa sobre estos eventos para avanzar su propio estado.

# Task Domain Model

## Entidad Task

Task representa una unidad de trabajo ejecutable perteneciente a un tenant.

Campos propuestos:
- `id`
- `empresaId`
- `title`
- `description`
- `status`
- `type`
- `priority`
- `assignedType`
- `assignedId`
- `createdBy`
- `workflowExecutionId`
- `correlationId`
- `metadata`
- `createdAt`
- `updatedAt`

## Enums

### TaskStatus
- `PENDING`
- `ASSIGNED`
- `IN_PROGRESS`
- `WAITING`
- `COMPLETED`
- `FAILED`
- `CANCELLED`

### TaskType
- `HUMAN`
- `AGENT`
- `SYSTEM`

### AssignedType
- `USER`
- `AGENT`
- `SYSTEM`

## Reglas de transición

### Flujo válido básico

- `PENDING` → `ASSIGNED`
- `ASSIGNED` → `IN_PROGRESS`
- `IN_PROGRESS` → `COMPLETED`
- `IN_PROGRESS` → `FAILED`
- `ASSIGNED` → `CANCELLED`
- `PENDING` → `CANCELLED`
- `WAITING` → `IN_PROGRESS`

### Estados inválidos

- `COMPLETED` → cualquier otro estado
- `FAILED` → `IN_PROGRESS` o `COMPLETED`
- `CANCELLED` → `IN_PROGRESS` o `COMPLETED`
- `PENDING` → `COMPLETED` sin pasar por `ASSIGNED`

## Reglas de dominio

- Toda Task requiere `empresaId`.
- Task puede existir sin `assignedId` cuando está `PENDING`.
- `assignedId` puede ser un usuario o agente identificado por `assignedType`.
- `workflowExecutionId` es opcional y sirve para trazabilidad futura.
- `correlationId` permite rastrear el origen dentro del proceso.

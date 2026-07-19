# Task Workflow Integration

## Relación entre Workflow y Task

- El Workflow Engine crea tareas.
- El Task Engine gestiona tareas.
- El Workflow no accede ni modifica directamente las entidades de Task.

## Flujo conceptual

1. WorkflowExecution avanza a un paso que requiere trabajo humano o automático.
2. Workflow publica un evento o invoca el Task Service para crear una Task.
3. Task Core persiste la tarea y publica `TaskCreatedEvent`.
4. El actor asignado ejecuta la tarea.
5. Al finalizar, Task Core publica `TaskCompletedEvent` o `TaskFailedEvent`.
6. Workflow Engine recibe el evento y continúa.

## Ejemplo

Workflow paso:
- `VALIDATE_LOCATION`

Task creada:
- `Validar cobertura zona cliente`

Evento final:
- `TaskCompletedEvent`

Regla sólida:
- Workflow nunca modifica Task directamente.
- Task es el origen de verdad para el estado de la tarea.

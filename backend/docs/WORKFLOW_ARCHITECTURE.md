# Workflow Engine — Arquitectura

Propósito

Motor para modelar y ejecutar procesos empresariales (Workflows). Está desacoplado del motor de IA (Agents).

Conceptos clave

- `Workflow`: definición abstracta compuesta por `WorkflowStep`.
- `WorkflowStep`: unidad de trabajo; tipos: AUTOMATIC, HUMAN, EXTERNAL_EVENT, AGENT_CALL.
- `WorkflowExecution`: instancia en tiempo de ejecución con estado y contexto.
- `ExecutionContext`: contiene `tenantId`, `userId`, `correlationId`, datos compartidos.

Estados y transiciones

- Workflow: DRAFT, ACTIVE, PAUSED, ARCHIVED.
- Execution: CREATED, RUNNING, WAITING, COMPLETED, FAILED, CANCELLED.

Requisitos funcionales

- Soportar pasos secuenciales y paralelos (inicialmente secuenciales).
- Esperas humanas (crear Task y pausar Execution hasta TaskCompleted).
- Esperas automáticas (timeouts, retries, scheduled jobs).
- Integración por eventos: un paso puede emitir/esperar eventos.
- Cuando un paso necesita decisión inteligente, emite `AgentExecutionRequested`.

API de servicios (alto nivel)

- `WorkflowService.create(def)` — crear/validar workflow.
- `WorkflowService.start(workflowId, input)` — iniciar ejecución.
- `ExecutionService.signal(executionId, signal)` — enviar señal (p.ej. TaskCompleted).

Contract con Agent Platform

- Nunca llamar al Agent directamente desde código de negocio; usar eventos:
  - Emite `AgentExecutionRequested` con metadata.
  - Consumidor Agent ejecuta y emite `AgentExecutionCompleted`.

Observabilidad

- Emitir eventos de audit trail en cada transición.
- Integración con tracing (correlationId).

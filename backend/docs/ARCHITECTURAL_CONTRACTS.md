# Contratos arquitectónicos — Workflow, Task, Agent y Correlación de Eventos

Propósito

Definir contratos arquitectónicos entre los bounded contexts principales del Core de Abiel: Workflow Engine, Task Core y Agent Platform. Estos contratos sirven de guía para la implementación respetando: monolito modular, DDD, multitenancy por `empresaId`, arquitectura dirigida por eventos y la regla: el Workflow no contiene lógica de negocio.

Principios generales

- `empresaId` es el primer ciudadano: viaja en cada comando/evento/entidad y es la base del aislamiento tenant.
- Integración por eventos (pub/sub) entre bounded contexts; los contratos son el lenguaje de integración.
- Cada bounded context es dueño de su modelo y responsabilidades; los contratos sólo definen la interfaz (inputs/outputs/events), no la implementación.
- `correlationId` y `causationId` permiten trazabilidad entre dominios; ver `EventCorrelationContract`.

1) WorkflowStepContract

Responsabilidades

- Definir la intención y el tipo de cada paso dentro de un `Workflow`.
- Exponer el contrato de entrada y salida del paso para que consumidores lo materialicen.
- Señalar si el paso debe materializar una `Task`, emitir una petición a un `Agent` o esperar un evento externo.

Entradas

- `id` (string): identificador del step en la definición del workflow.
- `type` (enum): { `AUTOMATIC`, `HUMAN`, `EXTERNAL_EVENT`, `AGENT_CALL` }.
- `name`, `description` (strings).
- `inputSchema` (referencia/JsonSchema, opcional): contrato de la entrada esperada por el paso.
- `outputSchema` (referencia/JsonSchema, opcional): contrato de la salida.
- `expectsTask` (boolean): indica que el paso requiere crear una `Task` y esperar su resolución.
- `retryPolicy`, `timeout`, `metadata` (opcionales).

Salidas

- Documento de definición del step (JSON/objeto) que el motor de Workflow publica como intención.
- Eventos emitidos por el Workflow relacionados con el step: p. ej. `TaskCreateRequested`, `AgentExecutionRequested`, `StepWaiting`.

Eventos

- `AgentExecutionRequested` — cuando `type=AGENT_CALL` con payload `{ input }` y header de correlación.
- `TaskCreateRequested` — cuando `expectsTask=true` y es necesario materializar una `Task` en Task Core.
- `StepCompleted` / `StepFailed` — estados del step en la definición del Workflow.

Límites entre módulos

- Workflow: dueño de la definición del step y de la ejecución del `WorkflowExecution`.
- Task Core y Agent Platform: consumidores de las intenciones del step; son responsables de materializar tareas o ejecutar agentes y devolver resultados por eventos.
- El Workflow no contiene lógica para resolver la tarea — sólo decide el flujo y expectativas (schemas, timeouts, retries).

2) TaskExecutionContract

Responsabilidades

- Task Core es responsable del ciclo de vida de una `Task`: persistencia, validación de transiciones de estado, asignación básica, SLA y publicación de eventos de dominio.

Entradas

- Comando de creación: `{ empresaId, id, title, type, input?, workflowExecutionId?, workflowStepId?, metadata? }`.
- Comandos de control: `assign(taskId, actorId)`, `start(taskId)`, `complete(taskId, result)`, `fail(taskId, error)`, `cancel(taskId, reason)`.

Salidas

- Entidad persistida `Task` con campos mínimos: `id, empresaId, workflowExecutionId?, workflowStepId?, title, type, priority, assignedTo?, status, input?, result?, metadata?, createdAt, updatedAt, resolvedAt?`.

Eventos

- `TaskCreatedEvent` { header: EventCorrelationContract, payload: { taskId, workflowExecutionId?, workflowStepId?, title } }
- `TaskAssignedEvent` { header, payload: { taskId, assignedTo } }
- `TaskStartedEvent` { header, payload: { taskId } }
- `TaskCompletedEvent` { header, payload: { taskId, result? } }
- `TaskFailedEvent` { header, payload: { taskId, error? } }
- `TaskCancelledEvent` { header, payload: { taskId, reason? } }

Límites entre módulos

- Task Core es el único dueño de la persistencia y de las reglas de transición de estado de `Task`.
- Workflow debe interactuar con Task Core únicamente vía eventos definidos (`TaskCreateRequested` -> `TaskCreatedEvent`, `TaskCompletedEvent` para continuar el flujo).
- Task Core no debe invocar Agents directamente; si una `Task` requiere ejecución externa, Task Core publica eventos y deja a Agent Platform suscribirse.

3) AgentIntegrationContract

Responsabilidades

- Definir cómo solicitar la ejecución de un agente externo (Agent Platform) y cómo recibir resultados.
- Mantener desacoplamiento: los agents son consumidores de intenciones/requests y emisores de eventos de resultado.

Entradas

- `AgentExecutionRequested` (evento): header `EventCorrelationContract`; payload: `{ agentId?, capability?, input, timeout?, metadata? }`.
- También puede admitirse un comando/command bus en implementaciones sincrónicas, pero preferir eventos.

Salidas

- `AgentExecutionStarted` (opcional) — para trazabilidad.
- `AgentExecutionCompleted` — payload: `{ executionId, result?, status: COMPLETED|FAILED, error? }`.

Eventos

- `AgentExecutionRequested` — iniciado por Workflow u otro bounded context.
- `AgentExecutionCompleted` — emitido por Agent Platform con resultados.
- `AgentExecutionFailed` — emitido en caso de error persistente.

Límites entre módulos

- Agent Platform es responsable de seleccionar la implementación del agent, manejo de credenciales y ejecución.
- Ni Workflow ni Task Core deben contener lógica para ejecutar agentes; ambos sólo emiten y consumen eventos de integración.

4) EventCorrelationContract

Responsabilidades

- Proveer un encabezado estándar que viaje en todos los eventos/comandos para permitir trazabilidad, autorización por tenant y reconstrucción de causa-efecto.

Campos mínimos (header)

- `empresaId` (string) — tenant owner, obligatorio.
- `correlationId` (string) — id de flujo lógico que agrupa eventos relacionados.
- `causationId` (string | null) — id del evento que causó este evento.
- `workflowExecutionId` (string | null) — si aplica.
- `taskId` (string | null) — si aplica.
- `source` (string) — emisor (`workflow-engine`, `task-core`, `agent-platform`, etc.).
- `timestamp` (ISO8601) — momento de emisión.

Reglas de propagación

- `empresaId` no se debe modificar entre boundaries; validarlo en entradas públicas.
- `correlationId` se crea por el iniciador del flujo (p. ej. `WorkflowService.start`) y se copia en eventos derivados.
- `causationId` apunta al evento predecesor inmediato y facilita reconstrucción de la causalidad.

Envelope recomendado

- `header`: `EventCorrelationContract`.
- `eventType`: string constante.
- `payload`: evento específico.

Consideraciones prácticas y ejemplos de interacción

- Flujo típico (Workflow step que requiere tarea humana):
  1. Workflow emite `TaskCreateRequested` con header que incluye `empresaId`, `correlationId` y `workflowExecutionId`.
  2. Task Core escucha, crea `Task` persistida y publica `TaskCreatedEvent` con el mismo `correlationId` y `taskId`.
  3. UI/actor completa la task → Task Core publica `TaskCompletedEvent`.
  4. Workflow escucha `TaskCompletedEvent` y continúa ejecución.

- Flujo típico (Workflow step que llama Agent):
  1. Workflow emite `AgentExecutionRequested` con header y payload `input`.
  2. Agent Platform consume, ejecuta y publica `AgentExecutionCompleted` con `result`.
  3. Workflow recibe el resultado y continúa.

Checklist de cumplimiento de restricciones

- Modular Monolith: cada contrato mantiene límites claros entre módulos dentro del mismo despliegue.
- DDD: cada bounded context es dueño de su modelo; contratos son antas de integración.
- Multitenancy: `empresaId` obligatorio y difundido en headers y persistencia.
- Event Driven: interacción por eventos con `EventCorrelationContract`.
- Workflow sin lógica de negocio: Workflow define intención y esquema, no reglas de negocio ni asignación/ejecución.

Siguientes pasos (recomendado)

- Revisar estos contratos con los equipos de Workflow, Task Core y Agent Platform.
- Acordar formato de `inputSchema`/`outputSchema` (p. ej. JSON Schema) y quién valida cada esquema.
- Publicar catálogo de `eventType` y topologías/topics (nombres de topics/queues) a usar.

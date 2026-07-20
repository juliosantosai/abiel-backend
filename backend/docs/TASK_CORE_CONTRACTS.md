# Contratos — Task Core

Propósito

Definir los contratos de integración y dominio que necesita implementar Task Core antes de desarrollar Task Core internamente. Estos contratos respetan las restricciones del proyecto: monolito modular, DDD, multitenancy por `empresaId`, eventos desacoplados y que el Workflow no conozca lógica de negocio.

Resumen

- `WorkflowStepContract`: define tipos de pasos, entrada/salida y la relación del paso con Agents y Tasks.
- `TaskExecutionContract`: contrato para creación, estados, asignación y resultados de una ejecución de tarea.
- `EventCorrelationContract`: esquema mínimo de correlación para trazabilidad distribuida y multitenant.

**Principios compartidos**

- Todo evento publicado por Task Core debe incluir el `EventCorrelationContract` en su encabezado (header) y en la carga (cuando aplique).
- `empresaId` es la raíz de aislamiento multi-tenant y debe viajar en cada comando/evento/entidad persistida.
- La orquestación se realiza por eventos: nunca invocar internamente a Agents o a Workflow con llamadas síncronas desde el dominio de Task Core.
- Workflow y Task Core son dominios distintos: Workflow define pasos y flujo; Task Core provee objetos ejecutables y su ciclo de vida. Workflow no contiene lógica de negocio de tareas.

1) WorkflowStepContract

Objetivo

Modelar qué es un paso del workflow y cómo comunicar su intención a consumidores (p. ej. Task Core, Agent Platform, sistemas externos).

Campos principales

- `id` (string): identificador del paso dentro del `Workflow` (definición estática).
- `type` (enum): { `AUTOMATIC`, `HUMAN`, `EXTERNAL_EVENT`, `AGENT_CALL` } — determina cómo se debe materializar el trabajo.
- `name` (string): nombre legible del paso.
- `description` (string, opcional).
- `inputSchema` (JsonSchema | referencia): contrato de entrada esperado por el paso (opcional, sólo contrato, no validación ejecutable obligatoria en Task Core).
- `outputSchema` (JsonSchema | referencia): contrato de salida que el paso producirá al completar.
- `retryPolicy` (object, opcional): parámetros de reintento para pasos automáticos.
- `timeout` (duration, opcional): tiempo máximo que el step puede esperar antes de emitir timeout/escala.
- `expectsTask` (boolean): si true, el Workflow espera la creación y resolución de una `Task` para continuar.
- `metadata` (Json): información opaca que pueden usar Workflow o agentes; Task Core no debe contener lógica sobre este metadata.

Relación con Agent y Task

- `AGENT_CALL`: el Workflow emite un evento `AgentExecutionRequested` con el `input` del step y cabeceras de correlación; la Agent Platform es responsable de consumirlo y emitir `AgentExecutionCompleted`.
- `HUMAN`: el Workflow crea una `Task` (o emite `TaskCreateRequested`) y queda en espera hasta recibir `TaskCompleted` o `TaskCancelled` según resultado.
- `AUTOMATIC`: el Workflow puede ejecutar internamente sin crear Task (p. ej. transformaciones simples), o bien delegar a un worker emitiendo un evento que no materializa Task.
- `EXTERNAL_EVENT`: el step espera que un evento externo (con `EventCorrelationContract`) active la continuación.

Ejemplo (conceptual)

{
  "id": "step-validate-id",
  "type": "HUMAN",
  "name": "Validar identidad",
  "inputSchema": { "$ref": "#/definitions/ValidateIdInput" },
  "outputSchema": { "$ref": "#/definitions/ValidateIdResult" },
  "expectsTask": true
}

Notas de diseño

- El Workflow describe `inputSchema`/`outputSchema` como contrato de integración; Task Core sólo persiste y transporta `metadata` y `input`/`result` sin ejecutar validaciones de negocio internas (puede validar formatos básicos).
- No incluir lógica de negocio en `metadata` ni en los schemas; estos son acuerdos entre productores y consumidores.

2) TaskExecutionContract

Objetivo

Definir la forma en que se crea, asigna, progresa y cierra una ejecución de `Task` dentro del dominio Task Core.

Entidad principal: TaskExecution (Task)

Campos mínimos (persistidos)

- `id` (string): identificador único de la tarea.
- `empresaId` (string): tenant owner.
- `workflowExecutionId` (string | null): referencia a la ejecución del workflow que originó la tarea.
- `workflowStepId` (string | null): referencia al `WorkflowStep.id` que originó la tarea (cuando aplique).
- `title` (string)
- `description` (string | null)
- `type` (enum): { `HUMAN`, `AUTOMATED` }
- `priority` (enum): { `LOW`, `MEDIUM`, `HIGH` }
- `assignedTo` (string | null): id del actor responsable (userId, queueId, system) — ver modelo de asignación.
- `status` (enum): ver estados abajo.
- `sla` (object | null): { `dueAt`?: timestamp, `escalationPolicy`?: Json }
- `input` (Json | null): payload inicial del trabajo.
- `result` (Json | null): payload de salida o resultado final.
- `metadata` (Json): datos opacos para consumidores.
- `createdAt`, `updatedAt`, `resolvedAt` (timestamps)

Estados (status)

- `PENDING` — creada, no asignada.
- `ASSIGNED` — asignada a un actor/responsable.
- `IN_PROGRESS` — consumo/ejecución en curso.
- `WAITING` — espera externa (p. ej. espera evento o aprobación).
- `COMPLETED` — terminada con éxito; `result` poblado opcionalmente.
- `FAILED` — terminó por error; mantener `error` metadata opcional.
- `CANCELLED` — cancelada por usuario o proceso.

Transiciones permitidas (resumen)

- `PENDING` -> `ASSIGNED` | `CANCELLED`
- `ASSIGNED` -> `IN_PROGRESS` | `CANCELLED`
- `IN_PROGRESS` -> `COMPLETED` | `FAILED` | `WAITING`
- `WAITING` -> `IN_PROGRESS` | `CANCELLED` | `FAILED`

Creación

- Origen: Workflow (cuando `expectsTask=true`) o sistemas externos.
- Payload de creación mínimo: `{ empresaId, title, type, input, workflowExecutionId?, workflowStepId? }`.
- Task Core persiste la tarea y publica `TaskCreatedEvent` con `EventCorrelationContract`.

Asignación

- La asignación es responsabilidad de Task Core y/o de un Assignment Service:
  - Manual: `assignedTo` actualizado por interacción humana.
  - Automática: reglas de queue/skills/routing fuera del dominio (Task Core solo aplica la decisión recibida y publica `TaskAssignedEvent`).
- No implementar en Task Core algoritmos de negocio complejos; en DDD, la lógica de asignación avanzada puede vivir en un subdominio 'Assignment'.

Resultados

- Al completar, Task Core acepta un `result` (estructura libre) que debe cumplir `outputSchema` si existe, pero la validación estricta es responsabilidad del consumidor que creó el schema.
- Publicar `TaskCompletedEvent` con `result` y cabeceras de correlación.

Eventos emitidos (mínimos)

- `TaskCreatedEvent` { header: EventCorrelationContract, payload: { taskId, workflowExecutionId?, workflowStepId?, title } }
- `TaskAssignedEvent` { header, payload: { taskId, assignedTo } }
- `TaskStartedEvent` { header, payload: { taskId } }
- `TaskCompletedEvent` { header, payload: { taskId, result? } }
- `TaskFailedEvent` { header, payload: { taskId, error } }
- `TaskCancelledEvent` { header, payload: { taskId, reason? } }

Reglas de consistencia

- `empresaId` es inmutable para la tarea.
- `workflowExecutionId` puede ser nulo pero, si se setea, debe ser consistente con `workflowStepId` (si existe).
- El dominio Task Core valida transiciones de estado; eventos externos deben respetar el flujo permitido.

3) EventCorrelationContract

Objetivo

Proveer un encabezado mínimo y consistente para todos los eventos/commands dentro del ecosistema para permitir trazabilidad, autorización básica por tenant y correlación entre Workflow, Task y Agents.

Campos requeridos (header)

- `empresaId` (string): tenant identifier — siempre presente.
- `workflowExecutionId` (string | null): id de la ejecución del workflow que originó el evento.
- `taskId` (string | null): id de la task relacionada cuando aplique.
- `correlationId` (string): id única por flujo lógico (opcionalmente UUID v4) — permite correlación entre múltiples eventos emitidos por la misma operación.
- `causationId` (string | null): referencia al id del evento/command que causó este evento (opcional, para auditoría y reconstrucción de causalidad).
- `source` (string): identificador del emisor (p. ej. `workflow-engine`, `task-core`, `agent-platform`).
- `timestamp` (ISO8601): momento de emisión.

Ejemplo de header

{
  "empresaId": "empresa-A",
  "workflowExecutionId": "we-123",
  "taskId": "task-456",
  "correlationId": "corr-789",
  "causationId": "evt-321",
  "source": "task-core",
  "timestamp": "2026-07-19T12:00:00Z"
}

Reglas de propagación

- `empresaId` debe propagarse sin cambios entre boundaries; ningún componente debe inferir tenant desde otra fuente.
- `correlationId` se crea por el iniciador del flujo (p. ej. WorkflowService.start) y debe copiarse en eventos derivados.
- `causationId` apunta al evento que originó este evento; facilita reconstrucción de causa-efecto.
- Todos los consumidores deben incluir el header en las respuestas o en eventos derivados.

Envelope de evento recomendado

- `header`: `EventCorrelationContract`.
- `eventType`: string.
- `payload`: contenido del evento.

Consideraciones arquitectónicas y DDD

- Bounded contexts:
  - Workflow: dueño de definiciones de workflow/steps y ejecución de procesos.
  - Task Core: dueño de `Task` y su ciclo de vida.
  - Agent Platform: consumidor que ejecuta `AGENT_CALL`.
- Integración por eventos: usar colas/topic (pub/sub). Los contratos definidos aquí son la capa de integración entre bounded contexts.
- Multitenancy: `empresaId` como primer ciudadano; todos los repositorios y eventos deben filtrar/escapar por `empresaId`.
- Observabilidad: incluir `correlationId` en logs y trazas; emitir eventos de audit trail para transiciones claves.
- Seguridad: validar que `empresaId` provenga de una fuente autorizada en los límites API; Task Core no infiere permisos por sí mismo.

Siguientes pasos sugeridos (no implementar aún)

- Revisar estos contratos con equipos de Workflow y Agent Platform.
- Acordar schemas comunes (`inputSchema`/`outputSchema`) y el mecanismo de validación (quién valida qué).
- Definir el catálogo de `eventType` y el transporte (topics, formatos, TTL).

Archivo creado para alineación entre dominios y análisis arquitectural.

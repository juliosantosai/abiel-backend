# AgentRuntime Architecture (Contract)

## Responsabilidad

`AgentRuntime` es el contrato que define cómo un runtime externo puede ejecutar acciones en nombre de un `Agent` configurado. Es una interfaz pura y agnóstica al proveedor. Su única responsabilidad es exponer métodos asincrónicos para ejecutar, consultar soporte de capacidades, verificar salud y apagar el runtime.

## Qué NO hace

- No implementa lógica de ejecución.
- No integra SDKs de proveedores de IA.
- No contiene adaptadores concretos.

## Relación con `Agent`

- `Agent` es el agregado de dominio que contiene configuración, capacidades e identidad.
- `AgentRuntime` consume (como contrato) solo datos serializables extraídos del dominio (por ejemplo, `AgentRequest`).

## Relación con `Conversation` y `EventBus`

- `Conversation` publica eventos como `MessageReceivedEvent`.
- Un futuro `AgentOrchestrator` escuchará esos eventos, construirá un `AgentRequest` y delegará la ejecución al `AgentRuntime`.
- `AgentRuntime` es el único punto donde los adaptadores de proveedores pueden ser conectados.

## Flujo arquitectónico

```mermaid
flowchart TD
  Conversation -->|MessageReceivedEvent| AgentOrchestrator[AgentOrchestrator (futuro)]
  AgentOrchestrator -->|build request| AgentRuntime[AgentRuntime (contrato)]
  AgentRuntime -->|adapter| Adapter[Adapter (futuro)]
  Adapter -->|provider| Provider[Proveedor IA (futuro)]
```

## Ready-for-adapter checklist

- Contratos (`AgentRequest`, `AgentResponse`, `AgentResult`, `AgentRuntimeError`) definidos y serializables.
- `AgentRuntime` interfaz en su lugar sin implementaciones concretas.
- Tests que validan inmutabilidad y serialización de objetos.
 
## AgentExecution and Orchestration

- `AgentExecution` domain entity represents a single execution: id, agentId, conversationId, empresaId, status (PENDING,RUNNING,COMPLETED,FAILED), timestamps and metadata.
- `AgentOrchestrator` responsibility: listen `MessageReceived`, verify conversation belongs to tenant, select agent for tenant, create `AgentExecution`, publish `AgentExecutionStarted`, build `AgentExecutionContext`, call `AgentRuntime.execute`, publish `AgentExecutionCompleted` or `AgentExecutionFailed`.

This separation guarantees the runtime remains a provider-agnostic port while application-layer orchestrator handles domain flows and tenant-safety.


# Agente Module

## Propósito

El módulo `agente` ejecuta la lógica de respuesta automática mediante un patrón de capacidades. Su función es recibir eventos de mensaje, seleccionar un agente activo y ejecutar una capability que produzca una salida.

## Componentes principales

- `agent-orchestrator.ts`: orquesta la ejecución de agentes y capacidades.
- `agent-service.ts`: administra agentes, ciclo de vida y emisiones de eventos de agente.
- `capability-registry.ts`: registro dinámico de capacidades disponibles.
- `echo-capability.ts`: ejemplo de capability que devuelve una respuesta de eco.
- `message-received-event-handler.ts`: suscriptor de `MessageReceived` que invoca el orquestador.

## Arquitectura de capabilities

- Cada capability implementa `ExecutableCapability`.
- Una capability define `canHandle(context)` para decidir si debe procesar el mensaje.
- Si coincide, `execute(context)` produce un `AgentResult` y puede publicar eventos.

## Flujo de ejecución

1. El `EventBus` entrega `MessageReceived` a `MessageReceivedEventHandler`.
2. El handler invoca al `AgentOrchestrator`.
3. El orquestador valida el tenant y el estado de la conversación.
4. Busca el agente activo del tenant y resuelve sus capabilities.
5. Ejecuta la primera capability que responde `true` en `canHandle`.
6. La capability publica `SendMessageRequested`.
7. El `OutboundMessageHandler` procesa el evento y despacha el mensaje.

## Eventos relevantes

- `AgentExecutionStarted`
- `AgentExecutionCompleted`
- `AgentExecutionFailed`
- `SendMessageRequested`

## Restricciones de negocio

- La ejecución sólo ocurre si `conversation.estado` es `BOT_ACTIVE`.
- Si la conversación está en `HUMAN_INTERVENTION` o `BLOCKED`, la orquestación se detiene.
- El orquestador sólo usa agentes cuya `empresaId` coincide con el tenant actual.

## Extensiones comunes

- Añadir nuevas capabilities registrándolas en `CapabilityRegistry`.
- Reemplazar `NoopAgentRuntime` por un runtime real para capacidades basadas en LLM.
- Soportar múltiples agentes por tenant con reglas de selección adicionales.

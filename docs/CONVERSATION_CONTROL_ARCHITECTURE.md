# Conversation Control Architecture

## Objetivo

El módulo de conversación ahora soporta dos mecanismos de control para evitar que el agente reaccione en momentos inapropiados:

- Intervención humana: la conversación pasa a un estado de control manual.
- Buffer de mensajes: los mensajes rápidos se agrupan para evitar reacciones inmediatas del agente.

## Estados de conversación

Se añadieron los siguientes estados:

- `BOT_ACTIVE`: el bot sigue activo y puede procesar mensajes.
- `HUMAN_INTERVENTION`: la intervención humana toma el control de la conversación.
- `BLOCKED`: la conversación queda temporalmente bloqueada para la ejecución del agente.

Los estados `CLOSED` y `ARCHIVED` siguen cerrando la posibilidad de añadir mensajes nuevos.

## Flujo de intervención humana

1. Se inicia la intervención humana con `ConversationService.iniciarIntervencionHumana()`.
2. La conversación cambia a `HUMAN_INTERVENTION` y publica el evento `HumanInterventionStarted`.
3. Al finalizar, `ConversationService.finalizarIntervencionHumana()` vuelve al estado `BOT_ACTIVE` y publica `HumanInterventionEnded`.

## Buffer de mensajes

Cuando una conversación está en `HUMAN_INTERVENTION` o `BLOCKED`, los mensajes nuevos se guardan y se publican como un único evento `MessagesBuffered` tras un debounce configurable.

Esto evita que el agente ejecute acciones por cada mensaje de una secuencia rápida.

## Integración con el agente

El `AgentOrchestrator` consulta el estado de la conversación antes de ejecutar un agente. Si la conversación está en `HUMAN_INTERVENTION` o `BLOCKED`, se omite la ejecución y se devuelve `null`.

## Eventos relevantes

- `ConversationCreated`
- `MessageCreated`
- `MessagesBuffered`
- `HumanInterventionStarted`
- `HumanInterventionEnded`

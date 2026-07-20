# Conversacion Module

## Propósito

El módulo `conversacion` gestiona la persistencia del flujo de conversación, guarda mensajes y mantiene el estado de la conversación con soporte para intervención humana.

## Componentes principales

- `conversation-service.ts`: lógica de dominio para crear conversaciones, agregar mensajes y cambiar estados.
- `message-received-event-handler.ts`: suscriptor de `MessageReceived` que materializa mensajes entrantes.
- `message-buffer-service.ts`: bufferiza mensajes cuando la conversación no está lista para procesarlos inmediatamente.
- `conversation.ts`: entidad raíz del agregado con reglas de estado.
- `message.ts`: entidad de mensaje con rol y contenido.

## Flujo interno

1. `MessageReceivedEventHandler` recibe un evento de mensaje entrante.
2. Se construye un `TenantContext` con `empresaId` y `usuarioId`.
3. `ConversationService.procesarMensajeEntrante` busca o crea la conversación en el tenant.
4. Se persiste el mensaje y se publica `MessageCreated` o `MessagesBuffered`.

## Estados de conversación

- `BOT_ACTIVE`: el bot puede responder.
- `HUMAN_INTERVENTION`: un operador humano controla la conversación.
- `BLOCKED`: no se permiten respuestas automáticas.
- `CLOSED` / `ARCHIVED`: la conversación ya no acepta mensajes.

## Contratos relevantes

- `MessageReceived`: id de mensaje, conversación y tenant.
- `MessageCreated`: notifica que un mensaje fue persistido.
- `MessagesBuffered`: notifica que un mensaje se guardó en buffer en lugar de procesarse.

## Regla de tenant isolation

- Todos los métodos de servicio usan `TenantContext`.
- Repositorios utilizan `findById(id, empresaId)` y `update(id, empresaId, patch)`.
- No se mezclan conversaciones de diferentes `empresaId` en un solo flujo.

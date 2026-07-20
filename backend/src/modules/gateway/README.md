# Gateway Module

## Propósito

El módulo `gateway` es el adaptador de entrada para proveedores externos de mensajes. Su responsabilidad es validar y normalizar webhooks, deduplicar envíos y emitir eventos internos de dominio.

## Componentes principales

- `webhook.controller.ts`: expone la ruta HTTP `/webhooks/whatsapp/:webhookToken`.
- `message-gateway.ts`: procesa webhooks, aplica validación, deduplicación y publica `MessageReceived`.
- `evolution-webhook-normalizer.ts`: normaliza el payload de Evolution/WhatsApp a un modelo común.
- `send-message-requested.event.ts`: define el contrato `SendMessageRequested` que dispara la entrega outbound.
- `webhook-delivery-repository.ts`: interfaz para persistir estado de entrega y evitar duplicados.

## Flujo interno

1. El webhook llega a `registerWebhookController`.
2. El token se valida contra `empresaRepository`.
3. El payload se normaliza con `EvolutionWebhookNormalizer`.
4. `MessageGateway` publica un evento `MessageReceived` en el `EventBus`.
5. `MessageReceived` es consumido por los módulos de conversación y agente.

## Contratos y seguridad

- El webhook debe incluir un token válido para determinar el `tenant`.
- `MessageReceived` lleva metadata con `tenantId` y `correlationId`.
- La deduplicación se aplica usando `deliveryKey = tenantId:messageId`.

## Extensiones comunes

- Soporte para nuevos proveedores de webhook: agregar un normalizador específico y extender el `Gateway`.
- Salida real de mensajes: reemplazar `OutboundMessageHandler` con un adaptador a WhatsApp u otro canal.
- Auditoría de entregas: mejorar `WebhookDeliveryRepository` para registrar intentos y errores.

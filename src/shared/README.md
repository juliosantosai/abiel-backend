# Shared Module

## Propósito

El módulo `shared` agrupa contratos de infraestructura común, utilidades y el bus de eventos que conecta los módulos del monolito.

## Componentes principales

- `events/event-bus.ts`: definición del contrato `EventBus`.
- `events/in-memory-event-bus.ts`: implementación en memoria del bus.
- `events/domain-event.ts`: definición de `DomainEvent`, payload y metadata.
- `context/tenant-context.ts`: contexto de tenant para seguridad y aislamiento.
- `ai/agent-execution-context.ts`: contexto de ejecución para capacidades de agente.
- `database/prisma.ts`: configuración de Prisma compartida.

## Principios de diseño

- No contener lógica de negocio específica de un módulo.
- Exponer contratos simples y reutilizables.
- Mantener el `EventBus` desacoplado de infraestructura externa.
- Proveer objetos de contexto inmutables para seguridad y trazabilidad.

## Uso principal

- Módulos publican eventos de dominio con `EventBus.publish(event)`.
- Los consumidores se suscriben con `EventBus.subscribe(eventName, handler)`.
- El `tenantId` viaja en la metadata de cada evento para asegurar multi-tenant.

## Extensiones comunes

- Implementar un `KafkaEventBus` o un bus persistente si se necesita escalabilidad.
- Añadir validadores de metadata para garantizar `tenantId` y `correlationId`.
- Agregar utilidades de trazado (`correlationId`, `causationId`) en eventos.

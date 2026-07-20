# EVENT BUS ARCHITECTURE

## Qué es un Domain Event

Un Domain Event describe un hecho relevante del dominio que ya ocurrió. Es una notificación inmutable y serializable que expresa un cambio de estado desde el punto de vista del dominio.

## Diferencia entre comando y evento

- Comando: instrucción para que el sistema haga algo. Tiene un único responsable.
- Evento: notificación de que algo ya ocurrió. Puede tener múltiples consumidores.

## Componentes creados

- `DomainEvent`: contrato inmutable y serializable.
- `EventBus`: contrato para publicar y suscribir eventos.
- `EventHandler`: contrato para manejar eventos.
- `InMemoryEventBus`: implementación en memoria sin dependencias externas.
- `UsuarioCreatedEvent`: evento real del dominio de usuario.

## Flujo de comunicación

1. `UsuarioService` crea el usuario.
2. `UsuarioService` publica `UsuarioCreatedEvent` en el `EventBus`.
3. El `EventBus` invoca todos los handlers registrados para `UsuarioCreated`.
4. Los handlers reaccionan sin que `UsuarioService` los conozca.

## Reglas de uso

- Los servicios publican eventos después de completar la acción.
- Los eventos son inmutables.
- Los eventos no deben contener datos sensibles.
- Los módulos conocen solo contratos (`EventBus`, `DomainEvent`, `EventHandler`).
- No se debe usar Prisma ni Fastify dentro de la infraestructura de eventos.
- El `UsuarioService` no conoce consumidores.

## Qué está prohibido

- `UsuarioService` llamando directamente a `EmailService` o `WhatsAppService`.
- Consumidores dentro del módulo de usuario.
- Dependencias de negocio dentro de `src/shared/events`.
- Eventos con `password` u otros datos sensibles.

## Seguridad multi-tenant

- Si un evento afecta a un tenant, debe incluir `empresaId`.
- Ejemplo: `MessageReceivedEvent` debe llevar `empresaId`, `conversationId` y `message`.
- Los eventos globales pueden omitir `empresaId` solo si no pertenecen a un tenant.

## Diagramas conceptuales

Correcto:

```text
UsuarioService
       |
 UsuarioCreatedEvent
       |
 EventBus
       |---- AuditHandler
       |---- WelcomeMessageHandler
       |---- AnalyticsHandler
```

Incorrecto:

```text
UsuarioService
       |
 EmailService
       |
 WhatsAppService
```

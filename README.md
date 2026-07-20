# Abiel Backend

## Documentación técnica

Este repositorio contiene la implementación del backend de Abiel con un enfoque modular y dirigido por eventos.

- `ARCHITECTURE.md` — visión general de la arquitectura, flujos críticos y contratos de eventos.
- `src/modules/gateway/README.md` — documentación del módulo de entrada de webhooks y normalización.
- `src/modules/conversacion/README.md` — documentación del módulo de conversación, persistencia y buffering.
- `src/modules/agente/README.md` — documentación del módulo de agente, orquestación y capabilities.
- `src/shared/README.md` — documentación de los contratos compartidos, EventBus y contexto de tenant.

## Estructura principal

- `src/app.ts` — configuración de Fastify, wiring de dependencias y suscripción de handlers.
- `src/modules/gateway` — adaptadores de entrada y eventos relacionados con webhooks.
- `src/modules/conversacion` — dominio de conversaciones y mensajes.
- `src/modules/agente` — orquestación de agentes y ejecución de capacidades.
- `src/shared` — infraestructura común, eventos y utilidades.

## Cómo navegar la documentación

1. Empieza por `ARCHITECTURE.md` para comprender los patrones generales y los flujos críticos.
2. Continúa con los README de cada módulo para ver responsabilidades específicas.
3. Revisa los contratos de evento en los archivos `domain/events` dentro de cada módulo.

## Cómo contribuir

- Agrega nuevas capacidades en `src/modules/agente/application` y registra en `CapabilityRegistry`.
- Define nuevos eventos en `src/shared/events/domain-event.ts` y `src/modules/*/domain/events`.
- Mantén `empresaId` y `tenantId` en la metadata de cada evento para preservar el aislamiento multitenant.

# Task Agent Integration

## Principio

Task Core y Agent Runtime son dominios separados. El Task Engine no depende del Agent y el Agent no crea Tasks directamente.

## Relación conceptual

- Agent detecta señales, intenciones o eventos conversacionales.
- Agent publica eventos de dominio como `LeadQualifiedEvent` o `IntentDetectedEvent`.
- Workflow Engine decide si se debe crear una Task basada en esos eventos.
- Una vez creada, Task Core administra la tarea.

## Ejemplo

1. Cliente pregunta por una cámara.
2. Agent identifica intención `purchase_camera`.
3. Agent publica `LeadQualifiedEvent`.
4. Workflow recibe el evento y crea un Task: `Validar cobertura`.
5. Task Core persiste la tarea y publica `TaskCreatedEvent`.

## Reglas

- Agent NO crea tareas.
- Agent NO ejecuta tareas.
- Agent NO conoce estados de Task.
- Agent comunica intenciones y resultados, Task Core gestiona el trabajo.

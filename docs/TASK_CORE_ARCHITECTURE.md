# Task Core Architecture

## Qué es Task Core dentro de Abiel Automation OS

Task Core es el módulo responsable de representar y gestionar unidades de trabajo ejecutables dentro del Automation OS. Es un dominio independiente cuya única responsabilidad es el ciclo de vida de las tareas que emergen de procesos empresariales.

Task Core no es un motor de proceso ni un sistema de orquestación. No conoce la lógica de negocio ni las decisiones específicas de sectores como cámaras, internet o préstamos.

## Responsabilidad

- Persistir tareas tenant-aware.
- Validar reglas de dominio de Task.
- Gestionar transiciones de estado.
- Publicar eventos de Task cuando cambian.
- Exponer contratos para crear, asignar, iniciar y cerrar tareas.

## Límites del dominio

Task Core se mantiene estrictamente dentro de su propio dominio:

- Task representa trabajo ejecutable.
- Task tiene un estado, asignación y metadatos.
- Task no conoce cómo se generó.
- Task no decide qué Workflow o Template se debe ejecutar.
- Task no sabe qué agente resuelve la tarea.

## Qué NO pertenece a Task Core

Task NO debe contener:

- Conocimiento de Workflow.
- Conocimiento de Agent.
- Conocimiento de Template o Blueprint.
- Reglas específicas de negocio.
- Lógica de orquestación o decisión.
- Lógica de provisión de tenant.

## Ejemplos conceptuales

Venta cámaras:
- `Validar cobertura`
- `Preparar pedido`
- `Coordinar delivery`

Internet fibra:
- `Revisar disponibilidad técnica`
- `Solicitar documentación`
- `Confirmar instalación`

Préstamo:
- `Analizar solicitud`
- `Verificar historial`
- `Emitir seguimiento`

Estos ejemplos ilustran tareas; Task Core solo almacena que existe una tarea con estado y asignación, sin saber el contexto sectorial.

# Task Template Integration

## Principio

Las plantillas describen estructuras de proceso y reglas, pero no incluyen tareas ya ejecutadas.

## Relación con Task

- Un Template puede contener referencias a `Task Rules` o `Task definitions`.
- Al ejecutar un Workflow basado en una Template, se generan Tasks en tiempo de ejecución.
- Las Tasks no se crean durante provisioning; nacen durante la ejecución del proceso.

## Ejemplo

Template `Venta cámaras` contiene:
- `Agent Template`
- `Workflow Template`
- `Task Rules`

Cuando Provisioning crea un tenant:
- clona configuración de Agents
- clona definición de Workflows
- clona reglas de tarea

Pero NO clona Tasks existentes.

## Reglas

- Task Core no conoce Template ni Blueprint.
- Task Core recibe tareas creadas por el Workflow Engine.
- Las tareas se generan dinámicamente según la ejecución del proceso.

## Implicación para el diseño

- Los templates deben definir la estructura del proceso, no el inventario de tareas ejecutadas.
- La persistencia de Task es runtime y tenant-aware.

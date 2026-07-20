# Abiel Sales Agent — Diseño

Propósito

Agente interno que actúa como cliente de la plataforma para asistir ventas y onboarding.

Capability principal

- `SAAS_SALES`: detectar industry, recomendar Blueprints, mostrar demo y disparar Provisioning.

Flujo principal

1. Interacción conversacional con prospecto.
2. Preguntas guiadas para inferir tipo de negocio y requerimientos.
3. Detectar `Blueprint` candidato y presentar opciones (TemplateVersions).
4. Crear Trial y, si procede, iniciar Provisioning emitiendo `ProvisioningStarted`.
5. Registrar configuración candidata como `BusinessTemplate` privada para revisión.

Integración con plataforma

- Sales Agent usa `AgentExecutionRequested`/`AgentExecutionCompleted` para procesamiento de IA.
- Emite events: `TemplateSelectedEvent`, `ProvisioningStartedEvent`.

Privilegios y seguridad

- Sales Agent es cliente con permissions restringidos; las acciones de provisioning deben requerir confirmación explícita de un usuario autorizado.

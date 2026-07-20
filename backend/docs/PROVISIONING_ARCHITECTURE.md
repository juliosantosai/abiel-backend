# Provisioning Engine — Arquitectura

Propósito

Orquestador responsable de materializar una Tenant Instance a partir de una TemplateVersion. NO debe escribir directamente en tablas de otros dominios; delega mediante llamadas a servicios o emite eventos que los dominios consumidores procesan.

Flujo de alto nivel

1. Cliente solicita provisioning (UI o Sales Agent).
2. Provisioning valida pago/licencia y emite `ProvisioningStarted`.
3. Provisioning crea Tenant (registro mínimo) y emite `TenantCreated`.
4. Provisioning solicita a TemplateService la materialización de artefactos (o emite `TemplateApplied`).
5. Provisioning orquesta llamadas/esperas para: crear Agents, registrar Workflows, crear Tasks iniciales, indexar Knowledge.
6. Al finalizar emite `ProvisioningCompleted`.

Contratos y garantías

- Provisioning debe ser idempotente y observable.
- Provisioning no modifica directamente tablas de otros dominios: en su lugar, invoca APIs de esos dominios o emite eventos que ellos consumen.

Errores y retries

- Uso de sagas / orchestration pattern: si un paso falla, emitir compensación o marcar la instance como `PROVISIONING_FAILED`.

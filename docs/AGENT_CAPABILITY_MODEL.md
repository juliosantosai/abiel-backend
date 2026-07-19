# Agent Capability Model

Objetivo

Establecer cómo un `Agent` declara capacidades y cómo los workflows/plantillas referencian esas capacidades.

1) Declaración de capability (Agent manifest)

- agentId
- version
- name
- capabilities: [ { name: string, description?: string, inputSchema?: JsonSchema, outputSchema?: JsonSchema, costEstimate?: number } ]
- tools: [ { name, descriptor } ]
- runtimeRequirements: { memory?, concurrency? }

2) Matching y selección

- Workflows y TemplateSteps referencian `capability` (string) en lugar de un agentId específico.
- En tiempo de ejecución, el Agent Orchestrator selecciona un Agent disponible con la `capability` requerida y suficiente `runtime`.

3) Execution contract

- Request: { requestId, tenantId, correlationId, userId?, input, meta }
- Response: { requestId, tenantId, correlationId, output, status }

4) Versioning

- Agents versionados; `AgentTemplate` referencia `agentId` + `version` o `capability` + constraints.

5) Example: SalesAgent

{
  "agentId": "sales-agent",
  "version": "1.2.0",
  "capabilities": [ { "name": "sales", "inputSchema": {"type":"object"}, "outputSchema": {"type":"object"} }, { "name": "qualification" } ]
}

6) Security & tenancy

- Agent executions carry `tenantId` and must run in tenant-scoped contexts (data access must be filtered by tenantId).
- Agent platform must prevent leakage across tenants.

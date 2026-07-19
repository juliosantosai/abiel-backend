# Catálogo de Event Contracts

Reglas generales

- Todos los eventos deben incluir: `tenantId`, `correlationId`, `userId` (opcional si sistema), `timestamp`.
- Usar JSON-serializable payloads; evitar domain leakage.

Eventos principales

- `TemplateSelectedEvent` {
  tenantId, correlationId, userId, templateId, versionId
}

- `TemplateAppliedEvent` {
  tenantId, correlationId, userId, templateId, versionId, artifacts:[]
}

- `ProvisioningStartedEvent` {
  tenantId, correlationId, userId, blueprintId, templateId, versionId
}

- `ProvisioningCompletedEvent` {
  tenantId, correlationId, userId, provisioningId, success: boolean, details?
}

- `WorkflowStartedEvent` {
  tenantId, correlationId, userId, workflowId, executionId, input
}

- `WorkflowStepCompletedEvent` {
  tenantId, correlationId, userId, workflowId, executionId, stepId, output
}

- `TaskCreatedEvent` {
  tenantId, correlationId, userId, taskId, workflowExecutionId, assignedTo?
}

- `TaskCompletedEvent` {
  tenantId, correlationId, userId, taskId, result
}

- `AgentExecutionRequestedEvent` {
  tenantId, correlationId, userId, agentId, requestId, input
}

- `AgentExecutionCompletedEvent` {
  tenantId, correlationId, userId, agentId, requestId, output, status
}

Versionado y extensibilidad

- Cada contrato debe versionarse (v1, v2) y mantener compatibilidad hacia atrás cuando sea posible.

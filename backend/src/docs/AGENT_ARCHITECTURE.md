# Agente Architecture

**Qué es un Agente**

Un `Agente` es una entidad del dominio que representa una unidad funcional configurable perteneciente a una `Empresa` (tenant). No es un runtime, ni un motor de IA, ni un orquestador. Es el modelo de configuración y capacidades que un futuro `AgentRuntime` consumirá.

**Qué NO es un Agente**

- No es un runtime de ejecución.
- No ejecuta prompts ni llama a LLMs.
- No contiene lógica de integración con LangChain, LangGraph, OpenAI, Claude, Gemini, Ollama ni otros proveedores.
- No mantiene estado de sesión de conversaciones ni memorias vectoriales.

**Responsabilidades**

- Mantener identidad y configuración del agente.
- Validar invariantes del dominio (nombre, tenant, estado válido).
- Exponer una representación inmutable para persistencia.
- Publicar eventos de dominio cuando cambia su ciclo de vida.

**Separación con Conversation**

- `Conversation` es un agregado que representa el historial de mensajes y contexto conversacional.
- `Agent` es un agregado separado que representa configuración, capacidades y políticas del agente.
- Comunicación futura entre ambos se hará a través de eventos (e.g., `MessageReceivedEvent`) y no por importaciones directas.

**Separación con Runtime e IA**

- `AgentRuntime` será una capa externa que consumirá `Agent` y `Conversation` vía repositorios y eventos.
- El dominio `Agent` permanece libre de dependencias de IA.

**Diagrama (futuro flujo de integración)**

```mermaid
flowchart TD
  Conversation -->|MessageReceivedEvent| AgentOrchestrator[AgentOrchestrator (futuro)]
  AgentOrchestrator -->|dispatch| AgentRuntime[AgentRuntime (futuro)]
  AgentRuntime -->|calls| LLMAdapter[LLM Adapter (futuro)]
```

**Ready-for-runtime checklist**

- Repositorios tenant-aware implementados.
- Eventos de dominio disponibles para orquestación.
- Dominio validado y cubierto por tests.

**Next steps (futuro, opcional)**

- Implementar `AgentRuntime` adapter y orquestador fuera del dominio.
- Crear adapters para LLM providers fuera del módulo `agente`.


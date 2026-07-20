import type { EventHandler } from "../../../shared/events/event-handler";
import type { DomainEvent } from "../../../shared/events/domain-event";
import type { AgentOrchestrator } from "./agent-orchestrator";

export class MessageReceivedEventHandler implements EventHandler {
  constructor(private readonly orchestrator: AgentOrchestrator) {}

  async handle(event: DomainEvent): Promise<void> {
    try {
      await this.orchestrator.orchestrateMessage(event);
    } catch (error) {
      // handler must not crash the event bus
      console.warn("Agent orchestrator failed", error);
    }
  }
}

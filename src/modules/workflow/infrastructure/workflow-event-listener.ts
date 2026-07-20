import type { EventHandler } from "../../../shared/events/event-handler";
import type { DomainEvent } from "../../../shared/events/domain-event";
import type { WorkflowService } from "../application/workflow-service";

export class WorkflowEventListener implements EventHandler<DomainEvent> {
  constructor(private readonly service: WorkflowService) {}

  async handle(event: DomainEvent): Promise<void> {
    // Delegate to service for handling correlated events
    await this.service.handleEvent(event);
  }
}

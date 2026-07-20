export type Blueprint = {
  // Snapshot of workflow, agents, tasks and rules needed to instantiate a runtime
  workflow?: unknown;
  agents?: unknown;
  tasks?: unknown;
  rules?: unknown;
  metadata?: Record<string, unknown>;
};

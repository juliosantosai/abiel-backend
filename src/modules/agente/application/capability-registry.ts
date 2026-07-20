import type { ExecutableCapability } from "../domain/executable-capability";

/**
 * Capability Registry
 * 
 * Central registry to manage and resolve executable capabilities.
 * Allows dynamic registration and lookup of capabilities.
 */
export class CapabilityRegistry {
  private capabilities: Map<string, ExecutableCapability> = new Map();

  /**
   * Register a capability
   */
  register(capability: ExecutableCapability): void {
    this.capabilities.set(capability.id, capability);
  }

  /**
   * Resolve a capability by ID
   */
  get(id: string): ExecutableCapability | undefined {
    return this.capabilities.get(id);
  }

  /**
   * Get multiple capabilities by IDs
   */
  getMany(ids: string[]): ExecutableCapability[] {
    return ids.map((id) => this.capabilities.get(id)).filter((c) => c !== undefined) as ExecutableCapability[];
  }

  /**
   * Get all registered capabilities
   */
  getAll(): ExecutableCapability[] {
    return Array.from(this.capabilities.values());
  }

  /**
   * Check if a capability is registered
   */
  has(id: string): boolean {
    return this.capabilities.has(id);
  }
}

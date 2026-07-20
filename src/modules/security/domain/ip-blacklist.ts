import { IncidentType } from "./severity";

export interface BlacklistEntry {
  ip: string;
  reason: IncidentType;
  addedAt: Date;
  expiresAt: Date;
}

export class IPBlacklist {
  private readonly entries: Map<string, BlacklistEntry> = new Map();

  add(ip: string, reason: IncidentType, ttlMs: number): void {
    const now = new Date();
    this.entries.set(ip, {
      ip,
      reason,
      addedAt: now,
      expiresAt: new Date(now.getTime() + ttlMs),
    });
  }

  isBlocked(ip: string): boolean {
    const entry = this.entries.get(ip);
    if (!entry) return false;

    if (entry.expiresAt < new Date()) {
      this.entries.delete(ip);
      return false;
    }

    return true;
  }

  getEntry(ip: string): BlacklistEntry | undefined {
    return this.entries.get(ip);
  }

  remove(ip: string): void {
    this.entries.delete(ip);
  }

  clear(): void {
    this.entries.clear();
  }

  count(): number {
    return this.entries.size;
  }

  getAll(): BlacklistEntry[] {
    return Array.from(this.entries.values());
  }
}

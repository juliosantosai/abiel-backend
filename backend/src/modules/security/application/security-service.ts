import { generateUuid } from "../../../shared/utils/uuid";
import { SecurityIncident, type SecurityIncidentProps } from "../domain/security-incident";
import { SecurityPolicy } from "../domain/security-policy";
import { IPBlacklist } from "../domain/ip-blacklist";
import { Severity, IncidentType } from "../domain/severity";
import type { NotificationService, SecurityNotification } from "./notification-service";
import type { SecurityRepository } from "../infrastructure/security-repository";

export interface CheckRequestInput {
  ip: string;
  endpoint: string;
  userAgent?: string;
}

export interface CheckRequestResult {
  allow: boolean;
  reason?: IncidentType;
  message?: string;
}

export class SecurityService {
  private policy: SecurityPolicy;
  private readonly ipBlacklist: IPBlacklist;
  private readonly jwtFailureMap: Map<string, { count: number; lastFailAt: Date }> = new Map();

  constructor(
    private readonly notificationService: NotificationService,
    private readonly repository: SecurityRepository,
    private readonly adminWhatsAppNumber: string
  ) {
    this.policy = new SecurityPolicy();
    this.ipBlacklist = new IPBlacklist();
  }

  /**
   * Toggle global security policy.
   * Only the admin (via WhatsApp) can toggle.
   */
  async toggleGlobalSecurity(
    callerNumber: string,
    newState: boolean,
    reason: string
  ): Promise<{ success: boolean; newState: boolean }> {
    if (callerNumber !== this.adminWhatsAppNumber) {
      throw new Error("Unauthorized: Only admin can toggle security");
    }

    const oldState = this.policy.isActive;
    this.policy = this.policy.toggle();

    const incident = new SecurityIncident({
      id: generateUuid(),
      severity: Severity.INFO,
      type: IncidentType.SECURITY_TOGGLE,
      ipAddress: "ADMIN", // Pseudo IP for admin actions
      endpoint: "SECURITY_CONTROL",
      metadata: {
        oldState,
        newState: this.policy.isActive,
        reason,
        callerNumber,
      },
      createdAt: new Date(),
    });

    await this.repository.create(incident.toJSON());

    // Notify about the toggle
    await this.notificationService.sendSecurityAlert({
      recipientNumber: this.adminWhatsAppNumber,
      severity: Severity.INFO,
      title: "🔐 Security Policy Updated",
      body: `Security is now **${this.policy.isActive ? "ENABLED" : "DISABLED"}**\nReason: ${reason}`,
      metadata: {
        incidentId: incident.id,
        timestamp: new Date().toISOString(),
        ip: "ADMIN",
      },
    });

    return {
      success: true,
      newState: this.policy.isActive,
    };
  }

  /**
   * Report a malicious activity and optionally notify admin.
   */
  async reportMaliciousActivity(
    incident: SecurityIncident,
    shouldNotify: boolean = true
  ): Promise<void> {
    // Persist to database
    await this.repository.create(incident.toJSON());

    // Add IP to blacklist if threshold reached
    if (incident.severity === Severity.CRITICAL) {
      this.ipBlacklist.add(incident.ipAddress, incident.type, this.policy.blacklistTTLMs);
    }

    // Notify admin if needed
    if (shouldNotify && incident.severity === Severity.CRITICAL) {
      await this.notificationService.sendSecurityAlert({
        recipientNumber: this.adminWhatsAppNumber,
        severity: incident.severity,
        title: `🚨 Security Alert: ${incident.type}`,
        body: `Incident from IP: **${incident.ipAddress}**\nEndpoint: ${incident.endpoint}\nDetails: ${JSON.stringify(incident.metadata, null, 2)}`,
        metadata: {
          incidentId: incident.id,
          timestamp: incident.createdAt.toISOString(),
          ip: incident.ipAddress,
        },
      });
    }
  }

  /**
   * Check if a request should be allowed based on security policies.
   * O(1) complexity: no database queries.
   */
  async checkRequest(input: CheckRequestInput): Promise<CheckRequestResult> {
    // If security is disabled, allow all requests
    if (!this.policy.isActive) {
      return { allow: true };
    }

    const { ip, endpoint, userAgent } = input;

    // Check whitelist
    if (this.policy.isWhitelisted(ip)) {
      return { allow: true };
    }

    // Check IP blacklist
    if (this.ipBlacklist.isBlocked(ip)) {
      const entry = this.ipBlacklist.getEntry(ip);
      return {
        allow: false,
        reason: entry?.reason,
        message: `IP blocked due to ${entry?.reason}`,
      };
    }

    // Check for suspicious user-agent
    if (this.policy.isSuspiciousUserAgent(userAgent)) {
      return {
        allow: false,
        reason: IncidentType.SCANNER_DETECTED,
        message: "Scanner detected",
      };
    }

    // Check JWT failure count (simplified: we check if IP has recent failures)
    const failureData = this.jwtFailureMap.get(ip);
    if (failureData && failureData.count >= this.policy.jwtFailThreshold) {
      return {
        allow: false,
        reason: IncidentType.BRUTE_FORCE,
        message: `Too many JWT failures from ${ip}`,
      };
    }

    return { allow: true };
  }

  /**
   * Record a failed JWT attempt from an IP.
   */
  recordJWTFailure(ip: string): void {
    const current = this.jwtFailureMap.get(ip) ?? { count: 0, lastFailAt: new Date() };
    current.count += 1;
    current.lastFailAt = new Date();
    this.jwtFailureMap.set(ip, current);

    // If threshold exceeded, blacklist the IP
    if (current.count >= this.policy.jwtFailThreshold) {
      this.ipBlacklist.add(ip, IncidentType.BRUTE_FORCE, this.policy.blacklistTTLMs);
    }
  }

  /**
   * Clear a failed JWT count for an IP (for testing or admin override).
   */
  clearJWTFailures(ip: string): void {
    this.jwtFailureMap.delete(ip);
  }

  /**
   * Get current security policy (read-only).
   */
  getPolicy(): SecurityPolicy {
    return this.policy;
  }

  /**
   * Clear all IP blacklist entries (use carefully).
   */
  clearBlacklist(): void {
    this.ipBlacklist.clear();
  }

  /**
   * Get blacklist statistics (for monitoring).
   */
  getBlacklistStats(): {
    count: number;
    entries: Array<{ ip: string; reason: string; expiresAt: string }>;
  } {
    return {
      count: this.ipBlacklist.count(),
      entries: this.ipBlacklist.getAll().map((e) => ({
        ip: e.ip,
        reason: e.reason,
        expiresAt: e.expiresAt.toISOString(),
      })),
    };
  }
}

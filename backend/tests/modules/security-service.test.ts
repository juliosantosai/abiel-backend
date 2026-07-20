import { describe, it, expect, vi } from "vitest";
import { SecurityService } from "../../src/modules/security/application/security-service";
import { SecurityIncident } from "../../src/modules/security/domain/security-incident";
import { Severity, IncidentType } from "../../src/modules/security/domain/severity";
import type { NotificationService } from "../../src/modules/security/application/notification-service";
import type { SecurityRepository } from "../../src/modules/security/infrastructure/security-repository";

describe("SecurityService", () => {
  const createMockRepository = (): SecurityRepository => ({
    create: vi.fn().mockResolvedValue({}),
    findByIP: vi.fn().mockResolvedValue([]),
    findByType: vi.fn().mockResolvedValue([]),
    countRecent: vi.fn().mockResolvedValue(0),
  });

  const createMockNotificationService = (): NotificationService => ({
    sendSecurityAlert: vi.fn().mockResolvedValue(undefined),
  });

  it("checks request when security is disabled", async () => {
    const repo = createMockRepository();
    const notif = createMockNotificationService();
    const service = new SecurityService(notif, repo, "+1234567890");

    // Toggle off
    await service.toggleGlobalSecurity("+1234567890", false, "Testing");

    const result = await service.checkRequest({
      ip: "192.168.1.1",
      endpoint: "/api/v1/login",
      userAgent: "sqlmap",
    });

    // Should allow even with scanner UA because security is disabled
    expect(result.allow).toBe(true);
  });

  it("blocks request from whitelisted IP", async () => {
    const repo = createMockRepository();
    const notif = createMockNotificationService();
    const service = new SecurityService(notif, repo, "+1234567890");

    const result = await service.checkRequest({
      ip: "127.0.0.1",
      endpoint: "/api/v1/login",
      userAgent: "Mozilla/5.0",
    });

    expect(result.allow).toBe(true);
  });

  it("blocks request from blacklisted IP", async () => {
    const repo = createMockRepository();
    const notif = createMockNotificationService();
    const service = new SecurityService(notif, repo, "+1234567890");

    // Manually blacklist an IP
    const incident = new SecurityIncident({
      id: "incident-1",
      severity: Severity.CRITICAL,
      type: IncidentType.BRUTE_FORCE,
      ipAddress: "192.168.1.1",
      endpoint: "/api/v1/login",
      metadata: { attemptCount: 3 },
      createdAt: new Date(),
    });

    await service.reportMaliciousActivity(incident, false);

    const result = await service.checkRequest({
      ip: "192.168.1.1",
      endpoint: "/api/v1/login",
    });

    expect(result.allow).toBe(false);
    expect(result.reason).toBe(IncidentType.BRUTE_FORCE);
  });

  it("blocks request with suspicious user-agent", async () => {
    const repo = createMockRepository();
    const notif = createMockNotificationService();
    const service = new SecurityService(notif, repo, "+1234567890");

    const result = await service.checkRequest({
      ip: "192.168.1.1",
      endpoint: "/api/v1/login",
      userAgent: "sqlmap/1.0",
    });

    expect(result.allow).toBe(false);
    expect(result.reason).toBe(IncidentType.SCANNER_DETECTED);
  });

  it("records JWT failures and blacklists after threshold", async () => {
    const repo = createMockRepository();
    const notif = createMockNotificationService();
    const service = new SecurityService(notif, repo, "+1234567890");

    service.recordJWTFailure("192.168.1.1");
    service.recordJWTFailure("192.168.1.1");

    // Before threshold
    let result = await service.checkRequest({
      ip: "192.168.1.1",
      endpoint: "/api/v1/login",
    });
    expect(result.allow).toBe(true);

    service.recordJWTFailure("192.168.1.1");

    // After threshold (3)
    result = await service.checkRequest({
      ip: "192.168.1.1",
      endpoint: "/api/v1/login",
    });
    expect(result.allow).toBe(false);
    expect(result.reason).toBe(IncidentType.BRUTE_FORCE);
  });

  it("toggles global security policy", async () => {
    const repo = createMockRepository() as any;
    const notif = createMockNotificationService();
    const service = new SecurityService(notif, repo, "+1234567890");

    expect(service.getPolicy().isActive).toBe(true);

    const result = await service.toggleGlobalSecurity("+1234567890", false, "Testing");

    expect(result.success).toBe(true);
    expect(result.newState).toBe(false);
    expect(service.getPolicy().isActive).toBe(false);
    expect(repo.create).toHaveBeenCalled();
    expect(notif.sendSecurityAlert).toHaveBeenCalled();
  });

  it("rejects toggle from unauthorized number", async () => {
    const repo = createMockRepository();
    const notif = createMockNotificationService();
    const service = new SecurityService(notif, repo, "+1234567890");

    await expect(
      service.toggleGlobalSecurity("+9999999999", false, "Unauthorized")
    ).rejects.toThrow("Unauthorized");
  });

  it("reports malicious activity and logs to repository", async () => {
    const repo = createMockRepository() as any;
    const notif = createMockNotificationService() as any;
    const service = new SecurityService(notif, repo, "+1234567890");

    const incident = new SecurityIncident({
      id: "incident-2",
      severity: Severity.CRITICAL,
      type: IncidentType.MALICIOUS_JWT,
      ipAddress: "10.0.0.1",
      endpoint: "/api/v1/conversations",
      metadata: { reason: "Invalid signature" },
      createdAt: new Date(),
    });

    await service.reportMaliciousActivity(incident, true);

    expect(repo.create).toHaveBeenCalledWith(incident.toJSON());
    expect(notif.sendSecurityAlert).toHaveBeenCalled();
  });

  it("provides blacklist statistics", async () => {
    const repo = createMockRepository();
    const notif = createMockNotificationService();
    const service = new SecurityService(notif, repo, "+1234567890");

    const incident1 = new SecurityIncident({
      id: "incident-1",
      severity: Severity.CRITICAL,
      type: IncidentType.BRUTE_FORCE,
      ipAddress: "192.168.1.1",
      endpoint: "/api/v1/login",
      metadata: {},
      createdAt: new Date(),
    });

    const incident2 = new SecurityIncident({
      id: "incident-2",
      severity: Severity.CRITICAL,
      type: IncidentType.SCANNER_DETECTED,
      ipAddress: "10.0.0.1",
      endpoint: "/api",
      metadata: {},
      createdAt: new Date(),
    });

    await service.reportMaliciousActivity(incident1, false);
    await service.reportMaliciousActivity(incident2, false);

    const stats = service.getBlacklistStats();

    expect(stats.count).toBe(2);
    expect(stats.entries.length).toBe(2);
    expect(stats.entries.map((e) => e.ip)).toContain("192.168.1.1");
  });
});

import { describe, it, expect } from "vitest";
import { SecurityIncident } from "../../src/modules/security/domain/security-incident";
import { SecurityPolicy } from "../../src/modules/security/domain/security-policy";
import { IPBlacklist } from "../../src/modules/security/domain/ip-blacklist";
import { Severity, IncidentType } from "../../src/modules/security/domain/severity";

describe("SecurityIncident domain", () => {
  it("creates an incident with required properties", () => {
    const incident = new SecurityIncident({
      id: "incident-1",
      severity: Severity.WARNING,
      type: IncidentType.BRUTE_FORCE,
      ipAddress: "192.168.1.1",
      endpoint: "/api/v1/login",
      metadata: { attemptCount: 3 },
      createdAt: new Date(),
    });

    expect(incident.id).toBe("incident-1");
    expect(incident.severity).toBe(Severity.WARNING);
    expect(incident.type).toBe(IncidentType.BRUTE_FORCE);
    expect(incident.ipAddress).toBe("192.168.1.1");
  });

  it("throws error if id is missing", () => {
    expect(
      () =>
        new SecurityIncident({
          id: "",
          severity: Severity.INFO,
          type: IncidentType.SCANNER_DETECTED,
          ipAddress: "192.168.1.1",
          endpoint: "/api",
          metadata: {},
          createdAt: new Date(),
        })
    ).toThrow("Incident ID is required");
  });

  it("serializes to JSON", () => {
    const incident = new SecurityIncident({
      id: "incident-2",
      severity: Severity.CRITICAL,
      type: IncidentType.MALICIOUS_JWT,
      ipAddress: "10.0.0.1",
      endpoint: "/api/v1/conversations",
      metadata: { jwt: "malformed" },
      createdAt: new Date("2026-01-01"),
    });

    const json = incident.toJSON();
    expect(json.id).toBe("incident-2");
    expect(json.severity).toBe(Severity.CRITICAL);
    expect(json.metadata.jwt).toBe("malformed");
  });
});

describe("SecurityPolicy value object", () => {
  it("creates with default values", () => {
    const policy = new SecurityPolicy();

    expect(policy.isActive).toBe(true);
    expect(policy.jwtFailThreshold).toBe(3);
    expect(policy.rateLimitPerMin).toBe(100);
    expect(policy.scannerUA.length).toBeGreaterThan(0);
  });

  it("creates with custom values", () => {
    const policy = new SecurityPolicy({
      isActive: false,
      jwtFailThreshold: 5,
      rateLimitPerMin: 200,
      whitelistIPs: ["10.0.0.0/8"],
    });

    expect(policy.isActive).toBe(false);
    expect(policy.jwtFailThreshold).toBe(5);
    expect(policy.rateLimitPerMin).toBe(200);
    expect(policy.whitelistIPs).toContain("10.0.0.0/8");
  });

  it("checks if IP is whitelisted", () => {
    const policy = new SecurityPolicy({
      whitelistIPs: ["127.0.0.1", "10.0.0.1"],
    });

    expect(policy.isWhitelisted("127.0.0.1")).toBe(true);
    expect(policy.isWhitelisted("192.168.1.1")).toBe(false);
  });

  it("detects suspicious user-agents", () => {
    const policy = new SecurityPolicy();

    expect(policy.isSuspiciousUserAgent("sqlmap/1.0")).toBe(true);
    expect(policy.isSuspiciousUserAgent("nmap scanner")).toBe(true);
    expect(policy.isSuspiciousUserAgent("Mozilla/5.0")).toBe(false);
  });

  it("toggles security policy", () => {
    const policy1 = new SecurityPolicy({ isActive: true });
    const policy2 = policy1.toggle();

    expect(policy1.isActive).toBe(true);
    expect(policy2.isActive).toBe(false);
  });

  it("serializes to JSON", () => {
    const policy = new SecurityPolicy({ isActive: false, jwtFailThreshold: 5 });
    const json = policy.toJSON();

    expect(json.isActive).toBe(false);
    expect(json.jwtFailThreshold).toBe(5);
  });
});

describe("IPBlacklist value object", () => {
  it("adds and checks blocked IPs", () => {
    const blacklist = new IPBlacklist();

    blacklist.add("192.168.1.1", IncidentType.BRUTE_FORCE, 1000);
    expect(blacklist.isBlocked("192.168.1.1")).toBe(true);
    expect(blacklist.isBlocked("192.168.1.2")).toBe(false);
  });

  it("removes expired entries automatically", () => {
    const blacklist = new IPBlacklist();

    // Add with very short TTL
    blacklist.add("192.168.1.1", IncidentType.SCANNER_DETECTED, 1);

    // Wait for expiration
    setTimeout(() => {
      expect(blacklist.isBlocked("192.168.1.1")).toBe(false);
    }, 100);
  });

  it("returns blacklist entry details", () => {
    const blacklist = new IPBlacklist();

    blacklist.add("10.0.0.1", IncidentType.RATE_LIMIT_EXCEEDED, 5000);
    const entry = blacklist.getEntry("10.0.0.1");

    expect(entry).toBeDefined();
    expect(entry?.ip).toBe("10.0.0.1");
    expect(entry?.reason).toBe(IncidentType.RATE_LIMIT_EXCEEDED);
  });

  it("removes entry by IP", () => {
    const blacklist = new IPBlacklist();

    blacklist.add("192.168.1.1", IncidentType.BRUTE_FORCE, 5000);
    expect(blacklist.isBlocked("192.168.1.1")).toBe(true);

    blacklist.remove("192.168.1.1");
    expect(blacklist.isBlocked("192.168.1.1")).toBe(false);
  });

  it("clears all entries", () => {
    const blacklist = new IPBlacklist();

    blacklist.add("192.168.1.1", IncidentType.BRUTE_FORCE, 5000);
    blacklist.add("10.0.0.1", IncidentType.SCANNER_DETECTED, 5000);

    expect(blacklist.count()).toBe(2);

    blacklist.clear();
    expect(blacklist.count()).toBe(0);
  });

  it("returns all entries", () => {
    const blacklist = new IPBlacklist();

    blacklist.add("192.168.1.1", IncidentType.BRUTE_FORCE, 5000);
    blacklist.add("10.0.0.1", IncidentType.SCANNER_DETECTED, 5000);

    const all = blacklist.getAll();
    expect(all.length).toBe(2);
    expect(all.map((e) => e.ip)).toContain("192.168.1.1");
    expect(all.map((e) => e.ip)).toContain("10.0.0.1");
  });
});

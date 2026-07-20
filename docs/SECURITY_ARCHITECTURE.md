# Security Architecture: Edge Shield Pattern

## Overview

The Security module implements an **Edge Shield** pattern—a defensive perimeter that operates outside the business logic domain. Its sole responsibility is to detect, log, and respond to security threats without interfering with core business operations (Agent, Conversation, Task, etc.).

## Design Principles

### 1. Fail-Fast
Malicious traffic is discarded at the middleware layer, **before** any expensive deserialization, database queries, or business logic execution.

```
Request → [Security Check] → Pass/Block → Business Logic
          ↓ (Malicious)
          [Log Incident] → [Alert Admin]
```

### 2. Out-of-Band (OOB) Management
Critical security decisions (Panic Button, IP Unblock) are managed **outside** the HTTP request/response cycle via WhatsApp notifications to `ADMIN_WHATSAPP_NUMBER`.

### 3. No-Domain Principle
Security is **infrastructure**, not domain logic. No business module (Agente, Conversacion, Task) should import, depend on, or reference the Security module.

---

## Defense Rules (IDS)

### JWT Guard
- **Rule**: Count failed JWT validations per identity
- **Threshold**: 3 consecutive failures → Trigger security alert
- **Action**: Add IP to temporary blacklist (12 hours)
- **Metadata**: Store attempt details (user-agent, payload hash, timestamp)

### Burst Protection (Rate Limiting)
- **Rule**: Track HTTP requests per IP per endpoint
- **Threshold**: 100 requests/minute → Trigger alert
- **Action**: Block IP at middleware layer
- **Whitelist**: Exempt internal/proxy IPs (configurable via ENV)

### User-Agent Filter
- **Rule**: Reject requests with known scanner user-agents
- **Blacklist**: `sqlmap`, `nmap`, `nikto`, `masscan`, `gobuster`
- **Action**: Log as `SCANNER_DETECTED`, add IP to 24h blacklist

### Panic Button
- **Rule**: Single global flag `isSecurityActive` (default: true)
- **Control**: Only `ADMIN_WHATSAPP_NUMBER` can toggle
- **Effect**: 
  - If `true` → All defense rules active
  - If `false` → Defense rules bypassed (for testing/debugging)
- **Audit**: All toggles logged with timestamp and reason

---

## Module Structure

```
src/modules/security/
├── domain/
│   ├── security-incident.ts       // Domain entity: incident record
│   ├── security-policy.ts         // Value object: global policy state
│   └── ip-blacklist.ts            // Value object: IP blocklist
├── application/
│   ├── security-service.ts        // Orchestrator: toggles, reports, checks
│   └── notification-service.ts    // Abstract: send alerts (WhatsApp, email)
├── infrastructure/
│   ├── security-middleware.ts     // Fastify middleware: the perimeter
│   ├── prisma-security-repo.ts    // Persistence: SystemEventLog
│   └── whatsapp-notification-adapter.ts // Concrete: WhatsApp adapter
└── presentation/
    └── whatsapp-security-hook.ts  // Event listener: admin commands
```

---

## Data Models

### Prisma: SystemEventLog

```typescript
model SystemEventLog {
  id          String   @id @default(uuid())
  severity    Severity // CRITICAL, WARNING, INFO
  type        String   // MALICIOUS_JWT, BRUTE_FORCE, SCANNER_DETECTED, etc
  ipAddress   String   @db.VarChar(45)  // IPv4 or IPv6
  endpoint    String   // GET /api/v1/conversations
  metadata    Json     // { attemptCount, reason, userAgent, correlationId, etc }
  createdAt   DateTime @default(now())
  
  @@index([ipAddress])
  @@index([type])
  @@index([createdAt])
}

enum Severity {
  INFO
  WARNING
  CRITICAL
}
```

### Domain Entity: SecurityIncident

```typescript
interface SecurityIncidentProps {
  id: string;
  severity: Severity;
  type: IncidentType;
  ipAddress: string;
  endpoint: string;
  metadata: {
    attemptCount?: number;
    userAgent?: string;
    reason?: string;
    correlationId?: string;
  };
  createdAt: Date;
}

enum IncidentType {
  MALICIOUS_JWT = "MALICIOUS_JWT",
  BRUTE_FORCE = "BRUTE_FORCE",
  SCANNER_DETECTED = "SCANNER_DETECTED",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  SUSPICIOUS_PAYLOAD = "SUSPICIOUS_PAYLOAD",
  SECURITY_TOGGLE = "SECURITY_TOGGLE",
}

class SecurityIncident {
  // Immutable: domain events are never modified
  constructor(props: SecurityIncidentProps) { ... }
  
  toJSON(): SecurityIncidentProps { ... }
}
```

### Value Object: SecurityPolicy

```typescript
interface SecurityPolicyProps {
  isActive: boolean;
  jwtFailThreshold: number;        // Default: 3
  rateLimitPerMin: number;         // Default: 100
  blacklistTTL: number;            // Default: 43200000 (12h in ms)
  scannerUA: string[];             // Blacklisted user-agents
  whitelistIPs: string[];          // Exempt IPs
}

class SecurityPolicy {
  readonly isActive: boolean;
  readonly jwtFailThreshold: number;
  // ... other properties
  
  canProcess(ipAddress: string): boolean {
    if (!this.isActive) return true;
    return !this.isBlacklisted(ipAddress);
  }
  
  toggle(): SecurityPolicy {
    return new SecurityPolicy({ ...this.toJSON(), isActive: !this.isActive });
  }
}
```

### Value Object: IPBlacklist

```typescript
interface BlacklistEntry {
  ip: string;
  reason: IncidentType;
  addedAt: Date;
  expiresAt: Date;
}

class IPBlacklist {
  private readonly entries: Map<string, BlacklistEntry> = new Map();
  
  add(ip: string, reason: IncidentType, ttl: number): void {
    this.entries.set(ip, {
      ip,
      reason,
      addedAt: new Date(),
      expiresAt: new Date(Date.now() + ttl),
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
  
  clear(): void {
    this.entries.clear();
  }
}
```

---

## Event Contracts

### SecurityEventBus

```typescript
interface SystemAlertEvent extends DomainEvent {
  eventName: "SystemAlertTriggered" | "SecurityToggled";
  payload: {
    severity: Severity;
    type: IncidentType;
    ipAddress: string;
    message: string;
    metadata: {
      attemptCount?: number;
      reason?: string;
      correlationId?: string;
    };
  };
  metadata: {
    tenantId?: string;  // Not applicable for security events
    securityEventId: string;
  };
}
```

### WhatsApp Notification Contract

```typescript
interface SecurityNotification {
  recipientNumber: string;  // Admin WhatsApp number
  severity: Severity;
  title: string;
  body: string;
  metadata: {
    incidentId: string;
    timestamp: string;
    ip: string;
  };
}
```

---

## Application Service: SecurityService

### Responsibilities

1. **toggleGlobalSecurity(adminNumber, newState, reason)**
   - Verify caller is `ADMIN_WHATSAPP_NUMBER`
   - Transition `SecurityPolicy.isActive`
   - Log toggle as `SECURITY_TOGGLE` incident
   - Publish event to EventBus

2. **reportMaliciousActivity(incident, shouldNotify)**
   - Create `SecurityIncident` domain object
   - Persist to `SystemEventLog`
   - Add IP to `IPBlacklist` (in-memory)
   - If `shouldNotify`, dispatch notification via `NotificationService`
   - Publish event to EventBus

3. **checkRequest(request, context)**
   - Validate IP against blacklist (O(1))
   - Validate JWT attempt count
   - Validate rate limit per IP
   - Validate user-agent against scanner filter
   - Return `allow` or `block` decision

4. **getPolicy()**
   - Return current `SecurityPolicy` (for testing)

5. **clearBlacklist()**
   - Wipe in-memory IP blacklist
   - (Rarely used; for admin override)

---

## Middleware: SecurityMiddleware

### Injection Point
Register **before** auth middleware in Fastify pipeline:

```typescript
app.addHook("onRequest", securityMiddleware.handle);
```

### Flow

```
1. Extract IP from request (X-Forwarded-For → fallback to remoteAddress)
2. Call SecurityService.checkRequest(ip, endpoint, userAgent)
   ├─ Check IP blacklist
   ├─ Check rate limit
   ├─ Check user-agent
   └─ Return { allow, reason? }
3. If NOT allow:
   ├─ Log incident
   ├─ Reply with 403 Forbidden + `x-security-block: true`
   ├─ Notify admin if CRITICAL
   └─ Halt request pipeline (throw UnauthorizedError)
4. If allow:
   ├─ Attach request.security = { ip, timestamp, blocked: false }
   └─ Continue to next middleware
```

### Pseudo-code

```typescript
export class SecurityMiddleware {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const ip = this.extractIP(request);
    const policy = this.securityService.getPolicy();
    
    if (!policy.isActive) {
      // Bypass security if disabled
      request.security = { ip, blocked: false };
      return;
    }
    
    const decision = await this.securityService.checkRequest({
      ip,
      endpoint: request.url,
      userAgent: request.headers["user-agent"],
    });
    
    if (!decision.allow) {
      const incident = new SecurityIncident({
        severity: Severity.WARNING,
        type: decision.reason,
        ipAddress: ip,
        endpoint: request.url,
        metadata: { reason: decision.reason },
      });
      
      await this.securityService.reportMaliciousActivity(incident, true);
      
      return reply
        .status(403)
        .header("x-security-block", "true")
        .send({ error: "Request blocked by security policy" });
    }
    
    request.security = { ip, blocked: false };
  }
}
```

---

## Notification Service (Abstract)

### Interface

```typescript
export interface NotificationService {
  sendSecurityAlert(notification: SecurityNotification): Promise<void>;
}
```

### Implementations

1. **WhatsAppNotificationAdapter** (Phase 4)
   - Sends via WhatsApp API / Twilio
   - Formats message for readability
   - Retries on failure

2. **EmailNotificationAdapter** (Future)
   - Sends email to admin

3. **SlackNotificationAdapter** (Future)
   - Sends to Slack webhook

### Strategy Pattern

```typescript
// In app.ts
const notificationService = new WhatsAppNotificationAdapter(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.ADMIN_WHATSAPP_NUMBER
);

const securityService = new SecurityService(
  notificationService,
  securityRepository,
  ipBlacklist
);
```

---

## Integration Points

### 1. Fastify Bootstrap (src/app.ts)
- Register `SecurityMiddleware` before auth
- Inject `NotificationService`
- Create `SecurityService` instance

### 2. EventBus Subscription (src/app.ts)
- Subscribe to `SystemAlertTriggered` → maybe send to monitoring system
- Subscribe to `SecurityToggled` → audit log

### 3. WhatsApp Hook (Phase 4, src/modules/security/presentation/whatsapp-security-hook.ts)
- Listen for incoming messages from `ADMIN_WHATSAPP_NUMBER`
- Parse command: "security on" or "security off"
- Call `SecurityService.toggleGlobalSecurity()`
- Reply with confirmation

---

## Multi-Tenant Considerations

**Important**: Security incidents are **not** scoped to a single tenant.

- `SecurityPolicy` is **global** (applies to entire system)
- `SystemEventLog` is **global** (audit trail for all tenants)
- IP blacklist is **global** (blocks IP for all tenants)
- Alerts go to **system admin**, not tenant admin

This ensures:
- Tenant A cannot disable security
- One malicious tenant cannot bypass protections
- Incident correlation across tenants

---

## Testing Strategy

### Unit Tests

1. **SecurityIncident domain**
   - Immutability
   - Serialization

2. **SecurityPolicy value object**
   - Toggle transitions
   - Blacklist operations

3. **IPBlacklist value object**
   - Add/remove entries
   - TTL expiration
   - O(1) lookup performance

4. **SecurityService**
   - checkRequest with various scenarios
   - reportMaliciousActivity logging
   - toggleGlobalSecurity admin override

### Integration Tests

1. **Middleware blocking**
   - Request with blacklisted IP → 403
   - Request with malicious JWT → logged + blacklisted
   - Request from whitelist → allowed

2. **End-to-end**
   - User triggers 3 JWT failures → IP blacklisted
   - Admin toggles security off → all requests pass
   - Incident logged to database

### Performance Tests

1. **Middleware latency**
   - IP lookup < 1ms (O(1) Map)
   - No database queries in hot path

2. **Memory usage**
   - IP blacklist grows linearly with incidents
   - Old entries expire automatically

---

## Configuration (Environment Variables)

```env
# Security
SECURITY_ENABLED=true
SECURITY_JWT_FAIL_THRESHOLD=3
SECURITY_RATE_LIMIT_PER_MIN=100
SECURITY_BLACKLIST_TTL_MS=43200000  # 12 hours
SECURITY_WHITELIST_IPS="127.0.0.1,10.0.0.0/8"

# Notifications
ADMIN_WHATSAPP_NUMBER="+1234567890"
TWILIO_ACCOUNT_SID="xxx"
TWILIO_AUTH_TOKEN="xxx"
TWILIO_WHATSAPP_FROM="+14155552671"
```

---

## Observability

### Metrics to Monitor

1. **Incidents per minute** (by type)
2. **Blocked IPs count** (current)
3. **Middleware latency** (p50, p99)
4. **Security toggle frequency**
5. **Failed notifications** (if any)

### Logging Points

```typescript
logger.info("Security check passed", { ip, endpoint });
logger.warn("IP blacklisted", { ip, reason, ttl });
logger.error("Security middleware error", { error, ip });
```

### Audit Trail

All security decisions logged to `SystemEventLog`:
- IP blocks
- JWT failures
- Rate limit violations
- Scanner detections
- Admin toggles

---

## Future Extensions (Out of Scope, Phase 5+)

1. **Persistent Blacklist** → Redis for multi-instance sync
2. **Geolocation Blocking** → Reject requests from high-risk regions
3. **Anomaly Detection** → ML-based behavioral analysis
4. **API Key Rotation** → Automatic key management
5. **DDoS Mitigation** → Connection pooling + circuit breaker

---

## Security Guarantees

✅ **No business logic interference** - Domain modules unchanged  
✅ **Fail-fast** - Block before expensive operations  
✅ **Multi-tenant isolation** - Global policy, no tenant bypass  
✅ **Audit trail** - All incidents logged  
✅ **Admin control** - Panic button accessible via WhatsApp  
✅ **Performance** - O(1) IP checks, no hot-path database queries  

---

## Implementation Roadmap

### Phase 1: Infrastructure ✅ (This PR)
- [ ] Prisma `SystemEventLog` model
- [ ] Domain entities (SecurityIncident, SecurityPolicy, IPBlacklist)
- [ ] NotificationService interface

### Phase 2: Motor ✅ (This PR)
- [ ] SecurityService (check, report, toggle)
- [ ] SecurityService tests
- [ ] In-memory IP blacklist management

### Phase 3: Middleware (Next PR)
- [ ] SecurityMiddleware implementation
- [ ] Fastify integration
- [ ] Middleware tests

### Phase 4: Admin Integration (Subsequent PR)
- [ ] WhatsApp notification adapter
- [ ] WhatsApp webhook handler (admin commands)
- [ ] E2E tests

### Phase 5: Monitoring (Future)
- [ ] Metrics export
- [ ] Dashboard
- [ ] Alert thresholds

---

**Status**: Design Approved, Ready for Phase 1-2 Implementation

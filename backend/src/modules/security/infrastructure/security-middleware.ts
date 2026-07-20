import type { FastifyRequest, FastifyReply } from "fastify";
import { generateUuid } from "../../../shared/utils/uuid";
import { SecurityIncident } from "../domain/security-incident";
import { Severity, IncidentType } from "../domain/severity";
import type { SecurityService } from "../application/security-service";

export class SecurityMiddleware {
  constructor(private readonly securityService: SecurityService) {}

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const ip = this.getClientIp(request);
    const userAgent = request.headers["user-agent"] as string | undefined;
    const endpoint = request.url || request.raw.url || "unknown";

    const result = await this.securityService.checkRequest({ ip, endpoint, userAgent });

    if (!result.allow) {
      const incident = new SecurityIncident({
        id: generateUuid(),
        severity: Severity.WARNING,
        type: result.reason ?? IncidentType.SUSPICIOUS_PAYLOAD,
        ipAddress: ip,
        endpoint,
        metadata: {
          reason: result.message,
          userAgent,
        },
        createdAt: new Date(),
      });

      await this.securityService.reportMaliciousActivity(incident, false);
      reply.header("x-security-block", "true");
      reply.code(403);
      return reply.send({ error: result.message ?? "Request blocked by security policy" });
    }

    (request as any).security = { ip, blocked: false };
  }

  private getClientIp(request: FastifyRequest): string {
    const forwarded = request.headers["x-forwarded-for"];
    if (typeof forwarded === "string" && forwarded.length > 0) {
      return forwarded.split(",")[0].trim();
    }

    if (Array.isArray(forwarded) && forwarded.length > 0) {
      return forwarded[0];
    }

    const remote = request.ip || request.raw.socket.remoteAddress || "127.0.0.1";
    return remote;
  }
}

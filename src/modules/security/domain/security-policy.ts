export interface SecurityPolicyProps {
  isActive: boolean;
  jwtFailThreshold: number;
  rateLimitPerMin: number;
  blacklistTTLMs: number;
  scannerUA: string[];
  whitelistIPs: string[];
}

export class SecurityPolicy {
  private readonly _isActive: boolean;
  private readonly _jwtFailThreshold: number;
  private readonly _rateLimitPerMin: number;
  private readonly _blacklistTTLMs: number;
  private readonly _scannerUA: string[];
  private readonly _whitelistIPs: string[];

  constructor(props: Partial<SecurityPolicyProps> = {}) {
    this._isActive = props.isActive ?? true;
    this._jwtFailThreshold = props.jwtFailThreshold ?? 3;
    this._rateLimitPerMin = props.rateLimitPerMin ?? 100;
    this._blacklistTTLMs = props.blacklistTTLMs ?? 43200000; // 12 hours
    this._scannerUA = props.scannerUA ?? [
      "sqlmap",
      "nmap",
      "nikto",
      "masscan",
      "gobuster",
      "acunetix",
    ];
    this._whitelistIPs = props.whitelistIPs ?? ["127.0.0.1"];
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get jwtFailThreshold(): number {
    return this._jwtFailThreshold;
  }

  get rateLimitPerMin(): number {
    return this._rateLimitPerMin;
  }

  get blacklistTTLMs(): number {
    return this._blacklistTTLMs;
  }

  get scannerUA(): string[] {
    return this._scannerUA;
  }

  get whitelistIPs(): string[] {
    return this._whitelistIPs;
  }

  isWhitelisted(ip: string): boolean {
    return this._whitelistIPs.includes(ip);
  }

  isSuspiciousUserAgent(ua: string | undefined): boolean {
    if (!ua) return false;
    return this._scannerUA.some((scanner) => ua.toLowerCase().includes(scanner.toLowerCase()));
  }

  toggle(): SecurityPolicy {
    return new SecurityPolicy({
      isActive: !this._isActive,
      jwtFailThreshold: this._jwtFailThreshold,
      rateLimitPerMin: this._rateLimitPerMin,
      blacklistTTLMs: this._blacklistTTLMs,
      scannerUA: this._scannerUA,
      whitelistIPs: this._whitelistIPs,
    });
  }

  toJSON(): SecurityPolicyProps {
    return {
      isActive: this._isActive,
      jwtFailThreshold: this._jwtFailThreshold,
      rateLimitPerMin: this._rateLimitPerMin,
      blacklistTTLMs: this._blacklistTTLMs,
      scannerUA: this._scannerUA,
      whitelistIPs: this._whitelistIPs,
    };
  }
}

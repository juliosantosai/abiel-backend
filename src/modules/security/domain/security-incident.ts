import { Severity, IncidentType } from "./severity";

export interface SecurityIncidentProps {
  id: string;
  severity: Severity;
  type: IncidentType;
  ipAddress: string;
  endpoint: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export class SecurityIncident {
  private readonly _id: string;
  private readonly _severity: Severity;
  private readonly _type: IncidentType;
  private readonly _ipAddress: string;
  private readonly _endpoint: string;
  private readonly _metadata: Record<string, any>;
  private readonly _createdAt: Date;

  constructor(props: SecurityIncidentProps) {
    if (!props.id) throw new Error("Incident ID is required");
    if (!props.ipAddress) throw new Error("IP address is required");

    this._id = props.id;
    this._severity = props.severity;
    this._type = props.type;
    this._ipAddress = props.ipAddress;
    this._endpoint = props.endpoint;
    this._metadata = props.metadata ?? {};
    this._createdAt = props.createdAt;
  }

  get id(): string {
    return this._id;
  }

  get severity(): Severity {
    return this._severity;
  }

  get type(): IncidentType {
    return this._type;
  }

  get ipAddress(): string {
    return this._ipAddress;
  }

  get endpoint(): string {
    return this._endpoint;
  }

  get metadata(): Record<string, any> {
    return this._metadata;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  toJSON(): SecurityIncidentProps {
    return {
      id: this._id,
      severity: this._severity,
      type: this._type,
      ipAddress: this._ipAddress,
      endpoint: this._endpoint,
      metadata: this._metadata,
      createdAt: this._createdAt,
    };
  }
}

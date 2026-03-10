export interface AuditLog {
  id: number;
  action: string;
  user: string;
  module: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

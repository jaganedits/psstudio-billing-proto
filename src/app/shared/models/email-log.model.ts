export interface EmailLog {
  id: number;
  to: string;
  subject: string;
  template: string;
  status: 'Sent' | 'Failed' | 'Pending';
  sentAt: string;
  error: string;
}

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  module: string;
  read: boolean;
  timestamp: string;
  link: string;
}

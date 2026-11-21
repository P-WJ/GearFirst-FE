export interface NotificationItem {
  id: number;
  eventId: string;
  type: string;
  message: string;
  receiver: string;
  read: boolean;
  createdAt?: string;
}

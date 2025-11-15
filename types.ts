export type SendStatus = 'pending' | 'attempting' | 'sent' | 'failed' | 'retrying';
export type DeliveryStatus = 'pending' | 'delivered';
export type ReadStatus = 'pending' | 'read';
export type BroadcastStatus = 'idle' | 'running' | 'completed' | 'cancelled' | 'error';

export interface MessageStatus {
  id: string;
  phoneNumber: string;
  sendStatus: SendStatus;
  deliveryStatus: DeliveryStatus;
  readStatus: ReadStatus;
  messageId: string | null;
  timestamp: string;
  error?: string;
  retries: number;
}

export type BroadcastEvent = 
  | { type: 'ATTEMPT'; phoneNumber: string }
  | { type: 'SENT'; phoneNumber: string; messageId: string }
  | { type: 'FAILED'; phoneNumber: string; error: string; shouldRetry: boolean }
  | { type: 'DELIVERED'; messageId: string }
  | { type: 'READ'; messageId: string }
  | { type: 'RETRY'; phoneNumber: string };

export interface MessageContent {
  text: string;
  image?: File | null;
}

export interface ApiConfig {
  accessToken: string;
  phoneNumberId: string;
}

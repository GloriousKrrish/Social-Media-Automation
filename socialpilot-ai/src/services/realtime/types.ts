/**
 * SocialPilot AI — Enterprise Realtime Infrastructure Types
 */

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error";

export type PostgresEventType = "INSERT" | "UPDATE" | "DELETE" | "*";

export type TableName =
  | "notifications"
  | "workspaces"
  | "settings"
  | "api_keys"
  | "audit_logs"
  | "dashboard_stats";

export interface PostgresPayload<T = any> {
  schema: string;
  table: TableName | string;
  commit_timestamp: string;
  eventType: PostgresEventType;
  new: T;
  old: Partial<T>;
  errors?: string[] | null;
}

export type RealtimeEventHandler<T = any> = (payload: PostgresPayload<T>) => void;

export interface SubscriptionConfig {
  table: TableName | string;
  schema?: string;
  event?: PostgresEventType;
  handler: RealtimeEventHandler;
}

export interface RealtimeContextType {
  status: ConnectionStatus;
  isConnected: boolean;
  error: Error | null;
  reconnect: () => void;
  activeSubscriptionsCount: number;
}

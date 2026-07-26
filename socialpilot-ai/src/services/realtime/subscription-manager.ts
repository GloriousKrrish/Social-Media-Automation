/**
 * SocialPilot AI — Subscription Manager (Multiplexed over Single Connection)
 */

import { realtimeClient } from "./realtime-client";
import { TableName, PostgresEventType, RealtimeEventHandler, PostgresPayload } from "./types";

type SubscriptionKey = string;

class SubscriptionManager {
  private static instance: SubscriptionManager | null = null;
  private handlersMap: Map<SubscriptionKey, Set<RealtimeEventHandler>> = new Map();
  private boundTables: Set<string> = new Set();

  private constructor() {}

  public static getInstance(): SubscriptionManager {
    if (!SubscriptionManager.instance) {
      SubscriptionManager.instance = new SubscriptionManager();
    }
    return SubscriptionManager.instance;
  }

  private makeKey(table: string, event: PostgresEventType = "*", schema = "public"): SubscriptionKey {
    return `${schema}:${table}:${event}`;
  }

  public subscribe<T = any>(
    table: TableName | string,
    event: PostgresEventType = "*",
    handler: RealtimeEventHandler<T>,
    schema = "public"
  ): () => void {
    const key = this.makeKey(table, event, schema);

    if (!this.handlersMap.has(key)) {
      this.handlersMap.set(key, new Set());
    }

    const handlers = this.handlersMap.get(key)!;
    handlers.add(handler);

    // Bind postgres_changes listener on the single shared channel if not yet attached for this table
    this.ensureTableBinding(table, schema);

    return () => {
      this.unsubscribe(table, event, handler, schema);
    };
  }

  public unsubscribe<T = any>(
    table: TableName | string,
    event: PostgresEventType = "*",
    handler: RealtimeEventHandler<T>,
    schema = "public"
  ): void {
    const key = this.makeKey(table, event, schema);
    const handlers = this.handlersMap.get(key);

    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlersMap.delete(key);
      }
    }
  }

  private ensureTableBinding(table: string, schema: string) {
    const bindingKey = `${schema}:${table}`;
    if (this.boundTables.has(bindingKey)) return;

    const channel = realtimeClient.getChannel();
    if (channel) {
      this.boundTables.add(bindingKey);
      channel.on(
        "postgres_changes" as any,
        { event: "*", schema, table },
        (payload: any) => {
          this.handleIncomingPayload(payload);
        }
      );
    }
  }

  public handleIncomingPayload(payload: PostgresPayload): void {
    if (realtimeClient.isDuplicateEvent(payload)) {
      return;
    }

    const { table, schema, eventType } = payload;

    // Dispatch to specific event listeners (e.g. public:notifications:INSERT)
    const specificKey = this.makeKey(table, eventType, schema);
    const wildcardKey = this.makeKey(table, "*", schema);

    const specificHandlers = this.handlersMap.get(specificKey);
    if (specificHandlers) {
      specificHandlers.forEach((fn) => fn(payload));
    }

    const wildcardHandlers = this.handlersMap.get(wildcardKey);
    if (wildcardHandlers) {
      wildcardHandlers.forEach((fn) => fn(payload));
    }
  }

  public getActiveSubscriptionsCount(): number {
    let count = 0;
    this.handlersMap.forEach((set) => {
      count += set.size;
    });
    return count;
  }

  public clearAll(): void {
    this.handlersMap.clear();
    this.boundTables.clear();
  }
}

export const subscriptionManager = SubscriptionManager.getInstance();

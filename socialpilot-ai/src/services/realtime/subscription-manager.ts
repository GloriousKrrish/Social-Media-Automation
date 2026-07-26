/**
 * SocialPilot AI — Subscription Manager (Multiplexed over Single Connection)
 */

import { realtimeClient } from "./realtime-client";
import { TableName, PostgresEventType, RealtimeEventHandler, PostgresPayload } from "./types";
import { RealtimeLogger } from "./logger";

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
    
    // React 18/19 StrictMode safety check
    if (!handlers.has(handler)) {
      handlers.add(handler);
      RealtimeLogger.debug("SubscriptionManager", `Subscribed listener to ${key}. Total listeners for key: ${handlers.size}`);
    }

    // Ensure postgres_changes binding attached to single channel for this table
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
      RealtimeLogger.debug("SubscriptionManager", `Unsubscribed listener from ${key}. Remaining: ${handlers.size}`);
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
      RealtimeLogger.info("SubscriptionManager", `Attaching postgres_changes binding for table: ${bindingKey}`);
      
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
    RealtimeLogger.info("SubscriptionManager", `Processing event [${eventType}] on ${schema}.${table}`);

    const specificKey = this.makeKey(table, eventType, schema);
    const wildcardKey = this.makeKey(table, "*", schema);

    const specificHandlers = this.handlersMap.get(specificKey);
    if (specificHandlers && specificHandlers.size > 0) {
      specificHandlers.forEach((fn) => {
        try {
          fn(payload);
        } catch (err) {
          RealtimeLogger.error("SubscriptionManager", `Error executing handler for ${specificKey}`, err);
        }
      });
    }

    const wildcardHandlers = this.handlersMap.get(wildcardKey);
    if (wildcardHandlers && wildcardHandlers.size > 0) {
      wildcardHandlers.forEach((fn) => {
        try {
          fn(payload);
        } catch (err) {
          RealtimeLogger.error("SubscriptionManager", `Error executing wildcard handler for ${wildcardKey}`, err);
        }
      });
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
    RealtimeLogger.info("SubscriptionManager", "Clearing all active table handlers and bindings.");
    this.handlersMap.clear();
    this.boundTables.clear();
  }
}

export const subscriptionManager = SubscriptionManager.getInstance();

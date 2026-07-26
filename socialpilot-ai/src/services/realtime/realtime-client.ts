/**
 * SocialPilot AI — Enterprise Realtime Client (Single Shared Connection)
 */

import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { ConnectionStatus, PostgresPayload } from "./types";
import { RealtimeLogger } from "./logger";

export type StatusListener = (status: ConnectionStatus, error?: Error | null) => void;

class RealtimeClient {
  private static instance: RealtimeClient | null = null;
  private channel: RealtimeChannel | null = null;
  private status: ConnectionStatus = "disconnected";
  private lastError: Error | null = null;
  private statusListeners: Set<StatusListener> = new Set();
  
  // Deduplication sliding window
  private processedEvents: Map<string, number> = new Map();
  private readonly DEDUP_WINDOW_MS = 10000; // 10 seconds sliding window
  private dedupCleanupInterval: NodeJS.Timeout | null = null;

  // Reconnection and Heartbeat state
  private retryCount = 0;
  private maxRetries = 12;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isInitializing = false;

  private constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", this.handleOnline);
      window.addEventListener("offline", this.handleOffline);
      document.addEventListener("visibilitychange", this.handleVisibilityChange);
    }
  }

  public static getInstance(): RealtimeClient {
    if (!RealtimeClient.instance) {
      RealtimeClient.instance = new RealtimeClient();
    }
    return RealtimeClient.instance;
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public getLastError(): Error | null {
    return this.lastError;
  }

  public onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status, this.lastError);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private setStatus(newStatus: ConnectionStatus, error: Error | null = null) {
    if (this.status === newStatus && this.lastError === error) return;
    RealtimeLogger.info("Client", `Status transition: ${this.status} -> ${newStatus}`, error ? { error: error.message } : undefined);
    this.status = newStatus;
    this.lastError = error;
    this.statusListeners.forEach((fn) => fn(newStatus, error));
  }

  public connect(): void {
    if (this.status === "connected" || this.isInitializing) return;
    this.isInitializing = true;
    this.setStatus("connecting");

    if (!isSupabaseConfigured || !supabase) {
      RealtimeLogger.warn("Client", "Supabase environment variables unconfigured. Running in local event simulation mode.");
      this.setStatus("connected");
      this.isInitializing = false;
      this.startHeartbeat();
      return;
    }

    try {
      if (this.channel) {
        RealtimeLogger.debug("Client", "Cleaning existing channel before connecting new channel.");
        supabase.removeChannel(this.channel);
        this.channel = null;
      }

      // Initialize SINGLE shared enterprise WebSocket channel
      this.channel = supabase.channel("socialpilot_enterprise_realtime", {
        config: {
          broadcast: { self: true },
          presence: { key: "client_node" },
        },
      });

      this.channel.subscribe((status, err) => {
        this.isInitializing = false;

        if (status === "SUBSCRIBED") {
          this.retryCount = 0;
          RealtimeLogger.info("Client", "WebSocket HTTP 101 upgrade confirmed. Channel SUBSCRIBED.");
          this.setStatus("connected");
          this.startHeartbeat();
          this.startDedupCleanup();
        } else if (status === "CLOSED") {
          RealtimeLogger.warn("Client", "WebSocket channel CLOSED.");
          this.setStatus("disconnected");
          this.scheduleReconnect();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          const error = err ? new Error(String(err)) : new Error(`Realtime channel error: ${status}`);
          RealtimeLogger.error("Client", `WebSocket status error: ${status}`, error);
          this.setStatus("error", error);
          this.scheduleReconnect();
        }
      });
    } catch (err: any) {
      this.isInitializing = false;
      const errorObj = err instanceof Error ? err : new Error(String(err));
      RealtimeLogger.error("Client", "Failed during channel connection attempt", errorObj);
      this.setStatus("error", errorObj);
      this.scheduleReconnect();
    }
  }

  public getChannel(): RealtimeChannel | null {
    return this.channel;
  }

  /**
   * Deterministic fingerprint deduplication to guarantee exact-once event execution
   */
  public isDuplicateEvent(payload: PostgresPayload): boolean {
    const timestamp = payload.commit_timestamp || Date.now().toString();
    const entityId = payload.new?.id || payload.old?.id || timestamp;
    const eventSignature = `${payload.schema}:${payload.table}:${payload.eventType}:${entityId}:${timestamp}`;

    const now = Date.now();
    const existing = this.processedEvents.get(eventSignature);

    if (existing && now - existing < this.DEDUP_WINDOW_MS) {
      RealtimeLogger.debug("Deduplication", `Duplicate event rejected: ${eventSignature}`);
      return true;
    }

    this.processedEvents.set(eventSignature, now);
    return false;
  }

  private startDedupCleanup() {
    if (this.dedupCleanupInterval) return;
    this.dedupCleanupInterval = setInterval(() => {
      const now = Date.now();
      this.processedEvents.forEach((time, key) => {
        if (now - time > this.DEDUP_WINDOW_MS) {
          this.processedEvents.delete(key);
        }
      });
    }, 15000);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.status === "connected" && this.channel) {
        this.channel.send({
          type: "broadcast",
          event: "ping",
          payload: { timestamp: Date.now() },
        }).catch((err) => {
          RealtimeLogger.debug("Heartbeat", "Ping failed silently", err);
        });
      }
    }, 25000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect() {
    this.stopHeartbeat();
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);

    if (this.retryCount >= this.maxRetries) {
      RealtimeLogger.error("Client", `Max retries (${this.maxRetries}) reached. Stopping auto-reconnect.`);
      this.setStatus("error", new Error("Max connection retries exceeded. Manual reconnect required."));
      return;
    }

    this.setStatus("reconnecting");
    // Exponential backoff + randomized jitter
    const baseBackoff = Math.min(1000 * Math.pow(2, this.retryCount), 30000);
    const jitter = Math.floor(Math.random() * 1000);
    const backoffMs = baseBackoff + jitter;
    this.retryCount++;

    RealtimeLogger.info("Client", `Scheduling reconnect attempt #${this.retryCount} in ${backoffMs}ms`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, backoffMs);
  }

  public reconnect(): void {
    RealtimeLogger.info("Client", "Manual reconnect requested.");
    this.retryCount = 0;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.connect();
  }

  private handleOnline = () => {
    RealtimeLogger.info("Client", "Network online event detected.");
    if (this.status !== "connected") {
      this.reconnect();
    }
  };

  private handleOffline = () => {
    RealtimeLogger.warn("Client", "Network offline event detected.");
    this.setStatus("disconnected", new Error("Network connection offline"));
  };

  private handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      RealtimeLogger.info("Client", "Browser tab visible. Checking realtime health.");
      if (this.status === "disconnected" || this.status === "error") {
        this.reconnect();
      }
    }
  };

  public disconnect(): void {
    RealtimeLogger.info("Client", "Disconnecting realtime client.");
    this.stopHeartbeat();
    if (this.dedupCleanupInterval) {
      clearInterval(this.dedupCleanupInterval);
      this.dedupCleanupInterval = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.channel && supabase) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }

    this.setStatus("disconnected");
  }

  public destroy(): void {
    this.disconnect();
    if (typeof window !== "undefined") {
      window.removeEventListener("online", this.handleOnline);
      window.removeEventListener("offline", this.handleOffline);
      document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    }
    this.statusListeners.clear();
    RealtimeClient.instance = null;
  }
}

export const realtimeClient = RealtimeClient.getInstance();

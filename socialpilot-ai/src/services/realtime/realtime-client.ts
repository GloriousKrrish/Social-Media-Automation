/**
 * SocialPilot AI — Enterprise Realtime Client (Single Shared Connection)
 */

import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { ConnectionStatus, PostgresPayload, PostgresEventType } from "./types";

export type StatusListener = (status: ConnectionStatus, error?: Error | null) => void;

class RealtimeClient {
  private static instance: RealtimeClient | null = null;
  private channel: RealtimeChannel | null = null;
  private status: ConnectionStatus = "disconnected";
  private lastError: Error | null = null;
  private statusListeners: Set<StatusListener> = new Set();
  
  // Deduplication sliding window
  private processedEvents: Map<string, number> = new Map();
  private readonly DEDUP_WINDOW_MS = 5000; // 5 seconds
  private dedupCleanupInterval: NodeJS.Timeout | null = null;

  // Reconnection and Heartbeat state
  private retryCount = 0;
  private maxRetries = 10;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isInitializing = false;

  private constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", this.handleOnline);
      window.addEventListener("offline", this.handleOffline);
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
    this.status = newStatus;
    this.lastError = error;
    this.statusListeners.forEach((fn) => fn(newStatus, error));
  }

  public connect(): void {
    if (this.status === "connected" || this.isInitializing) return;
    this.isInitializing = true;
    this.setStatus("connecting");

    if (!isSupabaseConfigured || !supabase) {
      // In offline/unconfigured fallback mode, mark as connected to allow mock/local simulation
      this.setStatus("connected");
      this.isInitializing = false;
      this.startHeartbeat();
      return;
    }

    try {
      if (this.channel) {
        supabase.removeChannel(this.channel);
        this.channel = null;
      }

      // Initialize the SINGLE shared enterprise channel
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
          this.setStatus("connected");
          this.startHeartbeat();
          this.startDedupCleanup();
        } else if (status === "CLOSED") {
          this.setStatus("disconnected");
          this.scheduleReconnect();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          const error = err ? new Error(String(err)) : new Error(`Realtime channel error: ${status}`);
          this.setStatus("error", error);
          this.scheduleReconnect();
        }
      });
    } catch (err: any) {
      this.isInitializing = false;
      this.setStatus("error", err instanceof Error ? err : new Error(String(err)));
      this.scheduleReconnect();
    }
  }

  public getChannel(): RealtimeChannel | null {
    return this.channel;
  }

  public isDuplicateEvent(payload: PostgresPayload): boolean {
    const timestamp = payload.commit_timestamp || Date.now().toString();
    const eventKey = `${payload.table}:${payload.eventType}:${payload.new?.id || payload.old?.id || timestamp}`;

    const now = Date.now();
    const existing = this.processedEvents.get(eventKey);

    if (existing && now - existing < this.DEDUP_WINDOW_MS) {
      return true;
    }

    this.processedEvents.set(eventKey, now);
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
    }, 10000);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.status === "connected" && this.channel) {
        // Send a lightweight ping over the single channel
        this.channel.send({
          type: "broadcast",
          event: "ping",
          payload: { timestamp: Date.now() },
        }).catch(() => {
          // Silent catch for heartbeat ping errors
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
      this.setStatus("error", new Error("Max connection retries exceeded. Manual reconnect required."));
      return;
    }

    this.setStatus("reconnecting");
    const backoffMs = Math.min(1000 * Math.pow(2, this.retryCount) + Math.random() * 1000, 30000);
    this.retryCount++;

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, backoffMs);
  }

  public reconnect(): void {
    this.retryCount = 0;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.connect();
  }

  private handleOnline = () => {
    if (this.status !== "connected") {
      this.reconnect();
    }
  };

  private handleOffline = () => {
    this.setStatus("disconnected", new Error("Network connection offline"));
  };

  public disconnect(): void {
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
    }
    this.statusListeners.clear();
    RealtimeClient.instance = null;
  }
}

export const realtimeClient = RealtimeClient.getInstance();

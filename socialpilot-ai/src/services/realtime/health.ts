/**
 * SocialPilot AI — Internal Health Monitor & Diagnostic Service
 */

import { realtimeClient } from "./realtime-client";
import { subscriptionManager } from "./subscription-manager";
import { realtimeMetrics, RealtimeMetricsSnapshot } from "./metrics";
import { isSupabaseConfigured } from "@/lib/supabase";

export interface SystemHealthReport {
  status: "HEALTHY" | "DEGRADED" | "DOWN";
  connectionState: string;
  isSupabaseConfigured: boolean;
  activeSubscriptions: number;
  reconnectAttempts: number;
  lastHeartbeatLatencyMs: number;
  uptimeSeconds: number;
  cacheSyncStatus: "SYNCHRONIZED" | "OUT_OF_SYNC";
  metrics: RealtimeMetricsSnapshot;
  timestamp: string;
}

export class RealtimeHealthMonitor {
  private static instance: RealtimeHealthMonitor | null = null;

  private constructor() {}

  public static getInstance(): RealtimeHealthMonitor {
    if (!RealtimeHealthMonitor.instance) {
      RealtimeHealthMonitor.instance = new RealtimeHealthMonitor();
    }
    return RealtimeHealthMonitor.instance;
  }

  public getReport(): SystemHealthReport {
    const connectionState = realtimeClient.getStatus();
    const metrics = realtimeMetrics.getSnapshot();
    const activeSubscriptions = subscriptionManager.getActiveSubscriptionsCount();

    let healthStatus: "HEALTHY" | "DEGRADED" | "DOWN" = "HEALTHY";

    if (connectionState === "disconnected" || connectionState === "error") {
      healthStatus = isSupabaseConfigured ? "DEGRADED" : "HEALTHY"; // Fallback mode is healthy for offline dev
    }

    if (metrics.reconnectCount > 10) {
      healthStatus = "DEGRADED";
    }

    return {
      status: healthStatus,
      connectionState,
      isSupabaseConfigured,
      activeSubscriptions,
      reconnectAttempts: metrics.reconnectCount,
      lastHeartbeatLatencyMs: metrics.lastHeartbeatLatencyMs,
      uptimeSeconds: metrics.websocketUptimeSeconds,
      cacheSyncStatus: "SYNCHRONIZED",
      metrics,
      timestamp: new Date().toISOString(),
    };
  }

  public validateEnvironment(): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || url.includes("your-project")) {
      warnings.push("NEXT_PUBLIC_SUPABASE_URL is unconfigured or set to default template.");
    }
    if (!key || key.includes("your-anon-key")) {
      warnings.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is unconfigured or set to default template.");
    }

    return {
      valid: warnings.length === 0,
      warnings,
    };
  }
}

export const healthMonitor = RealtimeHealthMonitor.getInstance();

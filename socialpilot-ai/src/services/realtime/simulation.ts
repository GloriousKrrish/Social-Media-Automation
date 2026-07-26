/**
 * SocialPilot AI — Controlled Realtime Failure Simulator (Dev & Test Only)
 */

import { realtimeClient } from "./realtime-client";
import { subscriptionManager } from "./subscription-manager";
import { RealtimeLogger } from "./logger";
import { PostgresPayload } from "./types";

export class RealtimeFailureSimulator {
  private static instance: RealtimeFailureSimulator | null = null;

  private constructor() {}

  public static getInstance(): RealtimeFailureSimulator {
    if (!RealtimeFailureSimulator.instance) {
      RealtimeFailureSimulator.instance = new RealtimeFailureSimulator();
    }
    return RealtimeFailureSimulator.instance;
  }

  public simulateNetworkDisconnect(): void {
    RealtimeLogger.warn("Simulator", "[TEST SCENARIO] Simulating network disconnect event...");
    window.dispatchEvent(new Event("offline"));
  }

  public simulateNetworkReconnect(): void {
    RealtimeLogger.info("Simulator", "[TEST SCENARIO] Simulating network reconnect event...");
    window.dispatchEvent(new Event("online"));
  }

  public simulateWebSocketInterruption(): void {
    RealtimeLogger.warn("Simulator", "[TEST SCENARIO] Simulating WebSocket socket drop...");
    realtimeClient.disconnect();
  }

  public simulateBrowserSleepWake(): void {
    RealtimeLogger.info("Simulator", "[TEST SCENARIO] Simulating browser tab wake after sleep...");
    realtimeClient.reconnect();
  }

  public simulateBackendRestart(): void {
    RealtimeLogger.warn("Simulator", "[TEST SCENARIO] Simulating backend service restart...");
    realtimeClient.disconnect();
    setTimeout(() => {
      realtimeClient.reconnect();
    }, 2000);
  }

  public simulateRapidPayloadBurst(table = "notifications", count = 20): void {
    RealtimeLogger.info("Simulator", `[TEST SCENARIO] Generating rapid event burst of ${count} events on ${table}...`);
    for (let i = 0; i < count; i++) {
      const mockPayload: PostgresPayload = {
        schema: "public",
        table,
        eventType: "INSERT",
        commit_timestamp: new Date(Date.now() + i * 10).toISOString(),
        new: {
          id: `sim-${Date.now()}-${i}`,
          title: `Simulated Notification #${i + 1}`,
          message: `Rapid burst stress test item #${i + 1}`,
          type: "info",
          is_read: false,
          created_at: new Date().toISOString(),
        },
        old: {},
      };
      subscriptionManager.handleIncomingPayload(mockPayload);
    }
  }
}

export const failureSimulator = RealtimeFailureSimulator.getInstance();

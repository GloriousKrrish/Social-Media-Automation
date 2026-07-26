/**
 * SocialPilot AI — Realtime Telemetry & Metrics Manager
 */

export interface RealtimeMetricsSnapshot {
  activeConnections: number;
  reconnectCount: number;
  reconnectDurationMs: number;
  eventsProcessed: number;
  duplicateEventsIgnored: number;
  cacheUpdates: number;
  cacheInvalidations: number;
  subscriptionCount: number;
  lastHeartbeatLatencyMs: number;
  averageEventProcessingTimeMs: number;
  websocketUptimeSeconds: number;
}

class RealtimeMetricsManager {
  private static instance: RealtimeMetricsManager | null = null;

  private activeConnections = 0;
  private reconnectCount = 0;
  private reconnectDurationMs = 0;
  private eventsProcessed = 0;
  private duplicateEventsIgnored = 0;
  private cacheUpdates = 0;
  private cacheInvalidations = 0;
  private subscriptionCount = 0;
  private lastHeartbeatLatencyMs = 0;
  private totalProcessingTimeMs = 0;
  private startTime: number = Date.now();

  private constructor() {}

  public static getInstance(): RealtimeMetricsManager {
    if (!RealtimeMetricsManager.instance) {
      RealtimeMetricsManager.instance = new RealtimeMetricsManager();
    }
    return RealtimeMetricsManager.instance;
  }

  public recordConnectionEstablished() {
    this.activeConnections = 1;
  }

  public recordConnectionLost() {
    this.activeConnections = 0;
  }

  public recordReconnectAttempt(durationMs: number) {
    this.reconnectCount++;
    this.reconnectDurationMs += durationMs;
  }

  public recordEventProcessed(processingTimeMs: number) {
    this.eventsProcessed++;
    this.totalProcessingTimeMs += processingTimeMs;
  }

  public recordDuplicateEventIgnored() {
    this.duplicateEventsIgnored++;
  }

  public recordCacheUpdate() {
    this.cacheUpdates++;
  }

  public recordCacheInvalidation() {
    this.cacheInvalidations++;
  }

  public setSubscriptionCount(count: number) {
    this.subscriptionCount = count;
  }

  public recordHeartbeatLatency(latencyMs: number) {
    this.lastHeartbeatLatencyMs = latencyMs;
  }

  public getSnapshot(): RealtimeMetricsSnapshot {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const avgProcessingTime =
      this.eventsProcessed > 0
        ? Math.round((this.totalProcessingTimeMs / this.eventsProcessed) * 100) / 100
        : 0;

    return {
      activeConnections: this.activeConnections,
      reconnectCount: this.reconnectCount,
      reconnectDurationMs: this.reconnectDurationMs,
      eventsProcessed: this.eventsProcessed,
      duplicateEventsIgnored: this.duplicateEventsIgnored,
      cacheUpdates: this.cacheUpdates,
      cacheInvalidations: this.cacheInvalidations,
      subscriptionCount: this.subscriptionCount,
      lastHeartbeatLatencyMs: this.lastHeartbeatLatencyMs,
      averageEventProcessingTimeMs: avgProcessingTime,
      websocketUptimeSeconds: uptime,
    };
  }

  public reset() {
    this.reconnectCount = 0;
    this.reconnectDurationMs = 0;
    this.eventsProcessed = 0;
    this.duplicateEventsIgnored = 0;
    this.cacheUpdates = 0;
    this.cacheInvalidations = 0;
    this.totalProcessingTimeMs = 0;
  }
}

export const realtimeMetrics = RealtimeMetricsManager.getInstance();

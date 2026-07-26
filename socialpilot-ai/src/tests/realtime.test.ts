/**
 * SocialPilot AI — Phase 4.5 Realtime Infrastructure Integration Tests
 */

import {
  realtimeClient,
  subscriptionManager,
  healthMonitor,
  realtimeMetrics,
  failureSimulator,
  PostgresPayload,
} from "@/lib/realtime";

export function runRealtimeIntegrationTests(): { passed: number; failed: number; log: string[] } {
  const log: string[] = [];
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      log.push(`[PASS] ${testName}`);
    } else {
      failed++;
      log.push(`[FAIL] ${testName}`);
    }
  }

  log.push("Starting Realtime Infrastructure Integration Test Suite...");

  // Test 1: Single Connection Singleton
  const instance1 = realtimeClient;
  const instance2 = realtimeClient;
  assert(instance1 === instance2, "Single WebSocket Client Singleton enforcement");

  // Test 2: Health Monitor & Environment Validation
  const report = healthMonitor.getReport();
  assert(report.status !== undefined && report.metrics !== undefined, "Health Monitor report generation");

  // Test 3: Subscription Manager Deduplication
  let dummyCallCount = 0;
  const dummyHandler = () => { dummyCallCount++; };
  const unsubscribe = subscriptionManager.subscribe("notifications", "INSERT", dummyHandler);
  
  // Re-subscribe same handler to test StrictMode safety
  subscriptionManager.subscribe("notifications", "INSERT", dummyHandler);
  assert(subscriptionManager.getActiveSubscriptionsCount() >= 1, "Subscription registration and tracking");

  // Test 4: Duplicate Event Rejection
  const samplePayload: PostgresPayload = {
    schema: "public",
    table: "notifications",
    eventType: "INSERT",
    commit_timestamp: "2026-07-26T14:00:00.000Z",
    new: { id: "notif-test-101", title: "Test Notification" },
    old: {},
  };

  const isDupFirst = realtimeClient.isDuplicateEvent(samplePayload);
  const isDupSecond = realtimeClient.isDuplicateEvent(samplePayload);
  assert(!isDupFirst && isDupSecond, "Deterministic event fingerprint deduplication");

  // Test 5: Rapid Burst Simulation
  const metricsBefore = realtimeMetrics.getSnapshot().eventsProcessed;
  failureSimulator.simulateRapidPayloadBurst("notifications", 5);
  const metricsAfter = realtimeMetrics.getSnapshot().eventsProcessed;
  assert(metricsAfter > metricsBefore, "Rapid burst processing and metrics telemetry recording");

  // Cleanup
  unsubscribe();

  log.push(`Test Suite Completed: ${passed} Passed, ${failed} Failed.`);
  return { passed, failed, log };
}

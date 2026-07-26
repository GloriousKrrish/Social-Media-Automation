# SocialPilot AI — Realtime Infrastructure Architecture Document

## Overview

SocialPilot AI implements a single-connection, event-driven realtime architecture wrapping Supabase Realtime and TanStack React Query. The system synchronizes backend database changes directly into the React Query cache without triggering full page reloads or redundant API requests.

---

## 1. Single Connection Architecture

```text
Database Changes
       │
       ▼
Supabase Realtime (Postgres Changes)
       │
       ▼
Single Shared Channel ("socialpilot_enterprise_realtime")
       │
       ▼
RealtimeClient (Singleton Connection Manager)
       │
       ▼
SubscriptionManager (Multiplexed Event Router)
       │
       ▼
CacheUpdater (queryClient.setQueryData)
       │
       ▼
React Query Cache
       │
       ▼
UI Components
```

- **Single Connection Rule**: Exactly ONE WebSocket client connection and channel is initialized via `RealtimeClient.getInstance()`. Components do NOT instantiate independent WebSocket connections.
- **Multiplexing**: The `SubscriptionManager` binds a single `postgres_changes` listener per table on the shared channel and dispatches events to registered component handlers.

---

## 2. Connection Lifecycle & Reconnect Strategy

- **States**: `disconnected` -> `connecting` -> `connected` -> `reconnecting` -> `error`.
- **Heartbeat Monitoring**: A 25-second ping frame measures WebSocket vitality and records latency telemetry into `RealtimeMetricsManager`.
- **Tab Sleep/Wake Recovery**: A `visibilitychange` listener on `document` automatically triggers reconnection health checks when a browser tab resumes from sleep.
- **Exponential Backoff with Jitter**: When network loss occurs, reconnection retries use exponential backoff (`1s`, `2s`, `4s`, `8s`, `16s`, `30s` max) with a 0–1000ms randomized jitter to prevent server thundering herds.

---

## 3. Event Lifecycle & Deduplication

1. **Payload Reception**: Raw `postgres_changes` payload received from Supabase.
2. **Fingerprint Signature**: A signature is computed: `${schema}:${table}:${eventType}:${id}:${commit_timestamp}`.
3. **Deduplication Check**: Rejects duplicate events received within a 10-second rolling sliding window.
4. **Cache Synchronization**: Payload passed to `CacheUpdater` which applies atomic `queryClient.setQueryData()` updates.

---

## 4. Telemetry & Health Monitoring

- **`RealtimeLogger`**: Logs structured events with automatic redaction of `Bearer` tokens, API keys, and JWT secrets.
- **`RealtimeMetricsManager`**: Tracks active connections, event counts, processing times, cache updates, duplicate rejections, and heartbeat latency.
- **`RealtimeHealthMonitor`**: Exposes diagnostic health reports (`HEALTHY`, `DEGRADED`, `DOWN`) for administrative and operational monitoring.

---

## 5. Troubleshooting Guide

| Symptom | Probable Cause | Diagnostic / Solution |
|---|---|---|
| Connections stuck in `connecting` | Unconfigured Supabase environment variables | Check `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`. App operates in safe local simulation mode. |
| Duplicate UI updates | Missed unmount cleanup | Ensure custom hooks invoke `unsubscribe()` on unmount. |
| Stale cache after reconnect | Missed commit timestamp | `CacheUpdater` automatically filters stale timestamps older than cached state. |

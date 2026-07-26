"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { realtimeClient, subscriptionManager, ConnectionStatus, RealtimeContextType } from "@/lib/realtime";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import { useRealtimeWorkspaces } from "@/hooks/useRealtimeWorkspaces";
import { useRealtimeSettings } from "@/hooks/useRealtimeSettings";
import { useRealtimeAuditLogs } from "@/hooks/useRealtimeAuditLogs";
import { useRealtimeApiKeys } from "@/hooks/useRealtimeApiKeys";

const RealtimeContext = createContext<RealtimeContextType>({
  status: "disconnected",
  isConnected: false,
  error: null,
  reconnect: () => {},
  activeSubscriptionsCount: 0,
});

export function useRealtimeContext() {
  return useContext(RealtimeContext);
}

// Inner component that activates all domain realtime hooks on the single connection
function RealtimeSubscriptionActivator() {
  useRealtimeNotifications();
  useRealtimeDashboard();
  useRealtimeWorkspaces();
  useRealtimeSettings();
  useRealtimeAuditLogs();
  useRealtimeApiKeys();
  return null;
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>(realtimeClient.getStatus());
  const [error, setError] = useState<Error | null>(realtimeClient.getLastError());
  const [activeSubscriptionsCount, setActiveSubscriptionsCount] = useState<number>(0);

  useEffect(() => {
    // 1. Connect the single shared realtime client
    realtimeClient.connect();

    // 2. Listen to connection status changes
    const unsubscribeStatus = realtimeClient.onStatusChange((newStatus, err) => {
      setStatus(newStatus);
      setError(err || null);
      setActiveSubscriptionsCount(subscriptionManager.getActiveSubscriptionsCount());
    });

    return () => {
      unsubscribeStatus();
      realtimeClient.disconnect();
    };
  }, []);

  const value = useMemo<RealtimeContextType>(
    () => ({
      status,
      isConnected: status === "connected",
      error,
      reconnect: () => realtimeClient.reconnect(),
      activeSubscriptionsCount,
    }),
    [status, error, activeSubscriptionsCount]
  );

  return (
    <RealtimeContext.Provider value={value}>
      <RealtimeSubscriptionActivator />
      {children}
    </RealtimeContext.Provider>
  );
}

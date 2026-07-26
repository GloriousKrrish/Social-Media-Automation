"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { subscriptionManager, cacheUpdater, PostgresPayload } from "@/lib/realtime";
import { AuditLogItem } from "@/hooks/useInfrastructure";

export function useRealtimeAuditLogs() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleAuditLog = (payload: PostgresPayload<AuditLogItem>) => {
      // Stream new security log entries into React Query cache
      cacheUpdater.handleAuditLogEvent(queryClient, payload);
    };

    const unsubscribe = subscriptionManager.subscribe<AuditLogItem>(
      "audit_logs",
      "INSERT",
      handleAuditLog
    );

    return () => {
      unsubscribe();
    };
  }, [queryClient]);
}

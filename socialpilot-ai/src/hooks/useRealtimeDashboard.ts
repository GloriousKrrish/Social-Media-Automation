"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { subscriptionManager, cacheUpdater, PostgresPayload } from "@/lib/realtime";
import { DashboardStats } from "@/hooks/useInfrastructure";

export function useRealtimeDashboard() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleDashboardStats = (payload: PostgresPayload<Partial<DashboardStats>>) => {
      // Synchronize KPI cards and stats instantly in React Query cache
      cacheUpdater.handleDashboardStatsEvent(queryClient, payload);
    };

    const unsubscribe = subscriptionManager.subscribe<Partial<DashboardStats>>(
      "dashboard_stats",
      "*",
      handleDashboardStats
    );

    return () => {
      unsubscribe();
    };
  }, [queryClient]);
}

"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { subscriptionManager, cacheUpdater, PostgresPayload } from "@/lib/realtime";
import { AppSettingsData } from "@/hooks/useInfrastructure";

export function useRealtimeSettings() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleSettings = (payload: PostgresPayload<Partial<AppSettingsData>>) => {
      // Synchronize brand name, timezone, publishing settings in React Query cache
      cacheUpdater.handleSettingsEvent(queryClient, payload);
    };

    const unsubscribe = subscriptionManager.subscribe<Partial<AppSettingsData>>(
      "settings",
      "*",
      handleSettings
    );

    return () => {
      unsubscribe();
    };
  }, [queryClient]);
}

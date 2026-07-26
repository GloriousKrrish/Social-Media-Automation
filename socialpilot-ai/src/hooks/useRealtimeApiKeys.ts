"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { subscriptionManager, cacheUpdater, PostgresPayload } from "@/lib/realtime";
import { ApiKeyItem } from "@/hooks/useInfrastructure";

export function useRealtimeApiKeys() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleApiKey = (payload: PostgresPayload<ApiKeyItem>) => {
      // Synchronize key creation, deletion, rotation, and status in React Query cache
      cacheUpdater.handleApiKeyEvent(queryClient, payload);
    };

    const unsubscribe = subscriptionManager.subscribe<ApiKeyItem>(
      "api_keys",
      "*",
      handleApiKey
    );

    return () => {
      unsubscribe();
    };
  }, [queryClient]);
}

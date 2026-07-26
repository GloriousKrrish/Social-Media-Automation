"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { subscriptionManager, cacheUpdater, PostgresPayload } from "@/lib/realtime";
import { NotificationItem } from "@/hooks/useInfrastructure";

export function useRealtimeNotifications() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleNotification = (payload: PostgresPayload<NotificationItem>) => {
      // 1. Update React Query cache directly
      cacheUpdater.handleNotificationEvent(queryClient, payload);
    };

    const unsubscribe = subscriptionManager.subscribe<NotificationItem>(
      "notifications",
      "*",
      handleNotification
    );

    return () => {
      unsubscribe();
    };
  }, [queryClient]);
}

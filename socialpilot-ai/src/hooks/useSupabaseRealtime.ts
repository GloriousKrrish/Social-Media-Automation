"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { subscriptionManager, PostgresPayload, PostgresEventType } from "@/lib/realtime";

interface RealtimeOptions {
  table?: string;
  schema?: string;
  event?: PostgresEventType;
  queryKeysToInvalidate?: string[][];
  onPayload?: (payload: any) => void;
}

export function useSupabaseRealtime({
  table = "notifications",
  schema = "public",
  event = "*",
  queryKeysToInvalidate = [["notifications"], ["dashboard_stats"]],
  onPayload,
}: RealtimeOptions = {}) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handlePayload = (payload: PostgresPayload) => {
      if (onPayload) {
        onPayload(payload);
      }
      if (queryKeysToInvalidate && queryKeysToInvalidate.length > 0) {
        queryKeysToInvalidate.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
    };

    const unsubscribe = subscriptionManager.subscribe(
      table,
      event,
      handlePayload,
      schema
    );

    return () => {
      unsubscribe();
    };
  }, [table, schema, event, queryClient, onPayload]);
}



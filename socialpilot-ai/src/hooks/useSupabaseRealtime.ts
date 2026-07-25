"use client";

import { useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

interface RealtimeOptions {
  table?: string;
  schema?: string;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  queryKeysToInvalidate?: string[][];
  onPayload?: (payload: any) => void;
}

export function useSupabaseRealtime({
  table = "notifications",
  schema = "public",
  event = "*",
  queryKeysToInvalidate = [["notifications"], ["dashboard"]],
  onPayload,
}: RealtimeOptions = {}) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const channelName = `realtime_${table}_${event}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes" as any,
        {
          event,
          schema,
          table,
        },
        (payload) => {
          if (onPayload) {
            onPayload(payload);
          }
          queryKeysToInvalidate.forEach((key) => {
            queryClient.invalidateQueries({ queryKey: key });
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, schema, event, queryClient]);
}

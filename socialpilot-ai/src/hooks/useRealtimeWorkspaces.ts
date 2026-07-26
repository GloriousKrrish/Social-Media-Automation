"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { subscriptionManager, cacheUpdater, PostgresPayload } from "@/lib/realtime";
import { WorkspaceItem } from "@/hooks/useInfrastructure";

export function useRealtimeWorkspaces() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleWorkspace = (payload: PostgresPayload<WorkspaceItem>) => {
      // Synchronize workspace creation, updates, and deletion in React Query cache
      cacheUpdater.handleWorkspaceEvent(queryClient, payload);
    };

    const unsubscribe = subscriptionManager.subscribe<WorkspaceItem>(
      "workspaces",
      "*",
      handleWorkspace
    );

    return () => {
      unsubscribe();
    };
  }, [queryClient]);
}

"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/app-store";

/**
 * Live Auto-Sync Engine Hook
 * Keeps all modules (Content, Scheduler, Approvals, Agents, Analytics) synchronized in real-time.
 */
export function useAutoSyncEngine() {
  const { publishScheduledPosts, settings } = useAppStore();

  useEffect(() => {
    // 10-second heartbeat ticker to simulate auto-publishing & live status updates
    const interval = setInterval(() => {
      if (settings.autoPublish) {
        publishScheduledPosts();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [publishScheduledPosts, settings.autoPublish]);
}

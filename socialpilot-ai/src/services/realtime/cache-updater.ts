/**
 * SocialPilot AI — Cache Updater Service
 * Synchronizes Supabase Realtime payloads with the React Query cache.
 */

import { QueryClient } from "@tanstack/react-query";
import { PostgresPayload } from "./types";
import { RealtimeLogger } from "./logger";
import {
  NotificationItem,
  WorkspaceItem,
  ApiKeyItem,
  AuditLogItem,
  DashboardStats,
  AppSettingsData,
} from "@/hooks/useInfrastructure";

export class CacheUpdater {
  private static instance: CacheUpdater | null = null;

  private constructor() {}

  public static getInstance(): CacheUpdater {
    if (!CacheUpdater.instance) {
      CacheUpdater.instance = new CacheUpdater();
    }
    return CacheUpdater.instance;
  }

  // --- Notifications ---
  public handleNotificationEvent(queryClient: QueryClient, payload: PostgresPayload<NotificationItem>) {
    const { eventType, new: newItem, old: oldItem } = payload;
    RealtimeLogger.debug("CacheUpdater", `Notification event: ${eventType}`, { id: newItem?.id || oldItem?.id });

    queryClient.setQueryData<NotificationItem[]>(["notifications"], (oldData) => {
      const currentList = oldData ? [...oldData] : [];

      if (eventType === "INSERT" && newItem?.id) {
        if (!currentList.some((item) => item.id === newItem.id)) {
          RealtimeLogger.info("CacheUpdater", `Prepend new notification: ${newItem.title}`);
          return [newItem, ...currentList];
        }
        return currentList;
      }

      if (eventType === "UPDATE" && newItem?.id) {
        return currentList.map((item) => (item.id === newItem.id ? { ...item, ...newItem } : item));
      }

      if (eventType === "DELETE" && oldItem?.id) {
        RealtimeLogger.info("CacheUpdater", `Removed notification: ${oldItem.id}`);
        return currentList.filter((item) => item.id !== oldItem.id);
      }

      return currentList;
    });
  }

  // --- Dashboard Stats ---
  public handleDashboardStatsEvent(queryClient: QueryClient, payload: PostgresPayload<Partial<DashboardStats>>) {
    const { new: newStats } = payload;
    RealtimeLogger.debug("CacheUpdater", "Updating dashboard_stats cache");

    queryClient.setQueryData<DashboardStats>(["dashboard_stats"], (oldStats) => {
      if (!oldStats) return newStats as DashboardStats;
      return {
        ...oldStats,
        ...newStats,
        kpis: newStats?.kpis || oldStats.kpis,
      };
    });
  }

  // --- Workspaces ---
  public handleWorkspaceEvent(queryClient: QueryClient, payload: PostgresPayload<WorkspaceItem>) {
    const { eventType, new: newItem, old: oldItem } = payload;
    RealtimeLogger.debug("CacheUpdater", `Workspace event: ${eventType}`, { id: newItem?.id || oldItem?.id });

    queryClient.setQueryData<WorkspaceItem[]>(["workspaces"], (oldData) => {
      const currentList = oldData ? [...oldData] : [];

      if (eventType === "INSERT" && newItem?.id) {
        if (!currentList.some((w) => w.id === newItem.id)) {
          RealtimeLogger.info("CacheUpdater", `Added workspace: ${newItem.name}`);
          return [newItem, ...currentList];
        }
        return currentList;
      }

      if (eventType === "UPDATE" && newItem?.id) {
        RealtimeLogger.info("CacheUpdater", `Updated workspace: ${newItem.name}`);
        return currentList.map((w) => (w.id === newItem.id ? { ...w, ...newItem } : w));
      }

      if (eventType === "DELETE" && oldItem?.id) {
        RealtimeLogger.info("CacheUpdater", `Deleted workspace: ${oldItem.id}`);
        return currentList.filter((w) => w.id !== oldItem.id);
      }

      return currentList;
    });
  }

  // --- Settings ---
  public handleSettingsEvent(queryClient: QueryClient, payload: PostgresPayload<Partial<AppSettingsData>>) {
    const { new: newSettings } = payload;
    RealtimeLogger.debug("CacheUpdater", "Updating app_settings cache", newSettings);

    queryClient.setQueryData<AppSettingsData>(["app_settings"], (oldSettings) => {
      if (!oldSettings) return newSettings as AppSettingsData;
      return {
        ...oldSettings,
        ...newSettings,
      };
    });
  }

  // --- API Keys ---
  public handleApiKeyEvent(queryClient: QueryClient, payload: PostgresPayload<ApiKeyItem>) {
    const { eventType, new: newItem, old: oldItem } = payload;
    RealtimeLogger.debug("CacheUpdater", `API Key event: ${eventType}`, { id: newItem?.id || oldItem?.id });

    queryClient.setQueryData<ApiKeyItem[]>(["api_keys"], (oldData) => {
      const currentList = oldData ? [...oldData] : [];

      if (eventType === "INSERT" && newItem?.id) {
        if (!currentList.some((k) => k.id === newItem.id)) {
          RealtimeLogger.info("CacheUpdater", `Added API Key: ${newItem.name}`);
          return [newItem, ...currentList];
        }
        return currentList;
      }

      if (eventType === "UPDATE" && newItem?.id) {
        return currentList.map((k) => (k.id === newItem.id ? { ...k, ...newItem } : k));
      }

      if (eventType === "DELETE" && oldItem?.id) {
        RealtimeLogger.info("CacheUpdater", `Deleted API Key: ${oldItem.id}`);
        return currentList.filter((k) => k.id !== oldItem.id);
      }

      return currentList;
    });
  }

  // --- Audit Logs ---
  public handleAuditLogEvent(queryClient: QueryClient, payload: PostgresPayload<AuditLogItem>) {
    const { eventType, new: newItem } = payload;

    if (eventType === "INSERT" && newItem?.id) {
      RealtimeLogger.info("CacheUpdater", `Streamed audit log: ${newItem.action}`);
      queryClient.setQueryData<AuditLogItem[]>(["audit_logs"], (oldData) => {
        const currentList = oldData ? [...oldData] : [];
        if (!currentList.some((log) => log.id === newItem.id)) {
          return [newItem, ...currentList];
        }
        return currentList;
      });
    }
  }
}

export const cacheUpdater = CacheUpdater.getInstance();

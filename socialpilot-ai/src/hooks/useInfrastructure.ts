"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  organization_id: string;
  members_count: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
}

export interface AuditLogItem {
  id: string;
  actor_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  ip_address?: string;
  created_at: string;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
}

export interface DashboardStats {
  total_published: number;
  scheduled_posts: number;
  active_agents: number;
  avg_engagement: number;
  kpis: Array<{
    id: string;
    label: string;
    value: number;
    change: number;
    suffix?: string;
    icon: string;
    color: string;
  }>;
}

export interface UserProfileData {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  is_active: boolean;
  is_verified: boolean;
}

export interface AppSettingsData {
  brand_name: string;
  timezone: string;
  date_format: string;
  auto_publish: boolean;
  openai_key?: string;
  anthropic_key?: string;
  gemini_key?: string;
}


export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: () => apiClient.get<WorkspaceItem[]>("/workspaces"),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    gcTime: 1000 * 60 * 15,
    retry: 2,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiClient.get<NotificationItem[]>("/notifications"),
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5,
    retry: 2,
  });
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ["audit_logs"],
    queryFn: () => apiClient.get<AuditLogItem[]>("/audit-logs"),
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 10,
    retry: 2,
  });
}

export function useApiKeys() {
  return useQuery({
    queryKey: ["api_keys"],
    queryFn: () => apiClient.get<ApiKeyItem[]>("/api-keys"),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10,
    retry: 2,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard_stats"],
    queryFn: () => apiClient.get<DashboardStats>("/dashboard/stats"),
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5,
    retry: 2,
  });
}

export function useUserProfile() {
  return useQuery({
    queryKey: ["user_profile"],
    queryFn: () => apiClient.get<UserProfileData>("/users/me"),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30,
    retry: 1,
  });
}

export function useAppSettings() {
  return useQuery({
    queryKey: ["app_settings"],
    queryFn: () => apiClient.get<AppSettingsData>("/settings"),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15,
    retry: 2,
  });
}

export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: ["global_search", query],
    queryFn: () => apiClient.get<any[]>(`/search?q=${encodeURIComponent(query)}`),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 10, // 10 seconds
    gcTime: 1000 * 60 * 2,
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => apiClient.post<ApiKeyItem>("/api-keys", { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api_keys"] });
      queryClient.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}

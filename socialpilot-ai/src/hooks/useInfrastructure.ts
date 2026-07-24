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

export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: () => apiClient.get<WorkspaceItem[]>("/workspaces"),
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiClient.get<NotificationItem[]>("/notifications"),
  });
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ["audit_logs"],
    queryFn: () => apiClient.get<AuditLogItem[]>("/audit-logs"),
  });
}

export function useApiKeys() {
  return useQuery({
    queryKey: ["api_keys"],
    queryFn: () => apiClient.get<ApiKeyItem[]>("/api-keys"),
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => apiClient.post<ApiKeyItem>("/api-keys", { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api_keys"] });
    },
  });
}

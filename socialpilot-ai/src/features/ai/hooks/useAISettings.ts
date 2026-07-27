import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { aiService } from "../services/ai-service";
import { WorkspaceAISettings } from "../types/ai-types";

export function useAISettings(workspaceId: string = "default") {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ["ai-settings", workspaceId],
    queryFn: () => aiService.getWorkspaceSettings(workspaceId),
  });

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<WorkspaceAISettings>) =>
      aiService.updateWorkspaceSettings(workspaceId, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(["ai-settings", workspaceId], data);
    },
  });

  return {
    ...settingsQuery,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}

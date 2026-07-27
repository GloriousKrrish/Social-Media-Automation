import { useQuery } from "@tanstack/react-query";
import { aiService } from "../services/ai-service";

export function useAIHistory(workspaceId?: string) {
  return useQuery({
    queryKey: ["ai-history", workspaceId],
    queryFn: () => aiService.getHistory(workspaceId),
    refetchInterval: 15000,
  });
}

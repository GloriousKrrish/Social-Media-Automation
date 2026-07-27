import { useQuery } from "@tanstack/react-query";
import { aiService } from "../services/ai-service";

export function useAIUsage(workspaceId?: string) {
  return useQuery({
    queryKey: ["ai-usage", workspaceId],
    queryFn: () => aiService.getUsageStats(workspaceId),
  });
}



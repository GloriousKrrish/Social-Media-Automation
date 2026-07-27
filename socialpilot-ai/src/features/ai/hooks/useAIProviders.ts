import { useQuery } from "@tanstack/react-query";
import { aiService } from "../services/ai-service";

export function useAIProviders() {
  return useQuery({
    queryKey: ["ai-providers"],
    queryFn: () => aiService.getProviders(),
    staleTime: 60000,
  });
}

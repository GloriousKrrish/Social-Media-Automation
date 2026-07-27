import { useMutation, useQueryClient } from "@tanstack/react-query";
import { aiService } from "../services/ai-service";
import { TextGenerationRequest } from "../types/ai-types";

export function useAIGenerate() {
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: (req: TextGenerationRequest) => aiService.generateText(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-history"] });
      queryClient.invalidateQueries({ queryKey: ["ai-usage"] });
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: (req: Partial<TextGenerationRequest>) => aiService.regenerateText(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-history"] });
      queryClient.invalidateQueries({ queryKey: ["ai-usage"] });
    },
  });

  return {
    generate: generateMutation.mutateAsync,
    regenerate: regenerateMutation.mutateAsync,
    isGenerating: generateMutation.isPending || regenerateMutation.isPending,
    error: generateMutation.error || regenerateMutation.error,
  };
}

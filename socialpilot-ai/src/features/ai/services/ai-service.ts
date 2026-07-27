import {
  ProviderStatus,
  TextGenerationRequest,
  TextGenerationResponse,
  PromptTemplateSchema,
  WorkspaceAISettings,
  AIHistoryRecord,
  AIUsageStat,
} from "../types/ai-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const aiService = {
  async getProviders(): Promise<ProviderStatus[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/providers`);
      if (!res.ok) throw new Error("Failed to fetch providers");
      return await res.json();
    } catch {
      // Fallback mock data if server unavailable
      return [
        {
          provider_id: "openai",
          name: "OpenAI",
          is_available: true,
          is_configured: true,
          default_model: "gpt-4o",
          supported_models: [
            { id: "gpt-4o", name: "GPT-4o", provider: "openai", max_tokens: 4096, supports_vision: true },
            { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai", max_tokens: 4096 },
          ],
        },
        {
          provider_id: "gemini",
          name: "Google Gemini",
          is_available: true,
          is_configured: true,
          default_model: "gemini-1.5-pro",
          supported_models: [
            { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "gemini", max_tokens: 8192, supports_vision: true },
          ],
        },
        {
          provider_id: "anthropic",
          name: "Anthropic Claude",
          is_available: true,
          is_configured: true,
          default_model: "claude-3-5-sonnet-20241022",
          supported_models: [
            { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", provider: "anthropic", max_tokens: 4096 },
          ],
        },
      ];
    }
  },

  async getPrompts(): Promise<PromptTemplateSchema[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/prompts`);
      if (!res.ok) throw new Error("Failed to fetch prompt templates");
      return await res.json();
    } catch {
      return [];
    }
  },

  async generateText(req: TextGenerationRequest): Promise<TextGenerationResponse> {
    const res = await fetch(`${API_BASE_URL}/ai/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error("AI Text Generation request failed");
    return await res.json();
  },

  async regenerateText(req: Partial<TextGenerationRequest>): Promise<TextGenerationResponse> {
    const res = await fetch(`${API_BASE_URL}/ai/regenerate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error("AI Content Regeneration request failed");
    return await res.json();
  },


  async getWorkspaceSettings(workspaceId: string = "default"): Promise<WorkspaceAISettings> {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/workspaces/${workspaceId}/settings`);
      if (!res.ok) throw new Error("Failed to fetch AI settings");
      return await res.json();
    } catch {
      return {
        id: "ws-ai-1",
        workspace_id: workspaceId,
        preferred_provider: "openai",
        preferred_model: "gpt-4o",
        default_language: "English",
        writing_tone: "Professional",
        creativity: 0.7,
        target_audience: "General Business",
        brand_voice: "Empathetic & Authoritative",
        response_length: "Medium",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  },

  async updateWorkspaceSettings(
    workspaceId: string = "default",
    updates: Partial<WorkspaceAISettings>
  ): Promise<WorkspaceAISettings> {
    const res = await fetch(`${API_BASE_URL}/ai/workspaces/${workspaceId}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update AI settings");
    return await res.json();
  },

  async getHistory(workspaceId?: string): Promise<AIHistoryRecord[]> {
    try {
      const url = workspaceId
        ? `${API_BASE_URL}/ai/history?workspace_id=${workspaceId}`
        : `${API_BASE_URL}/ai/history`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch history");
      return await res.json();
    } catch {
      return [];
    }
  },

  async getUsageStats(workspaceId?: string): Promise<AIUsageStat> {
    try {
      const url = workspaceId
        ? `${API_BASE_URL}/ai/usage?workspace_id=${workspaceId}`
        : `${API_BASE_URL}/ai/usage`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch usage stats");
      return await res.json();
    } catch {
      return {
        total_requests: 0,
        successful_generations: 0,
        failed_generations: 0,
        average_latency_ms: 0.0,
        total_tokens_used: 0,
        provider_distribution: { openai: 0, gemini: 0, anthropic: 0 },
      };
    }
  },
};

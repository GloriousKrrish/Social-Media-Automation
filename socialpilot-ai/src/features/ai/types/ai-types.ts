export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  description?: string;
  max_tokens: number;
  supports_vision?: boolean;
  supports_function_calling?: boolean;
}

export interface ProviderStatus {
  provider_id: string;
  name: string;
  is_available: boolean;
  is_configured: boolean;
  health_state?: string;
  default_model: string;
  supported_models: ModelInfo[];
  error_message?: string | null;
}

export interface TextGenerationRequest {
  prompt: string;
  generation_type?: string;
  context_input?: string;
  template_variables?: Record<string, any>;
  system_prompt?: string;
  provider?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  workspace_id?: string;
}

export interface RegenerateRequest {
  history_id?: string;
  prompt?: string;
  generation_type?: string;
  context_input?: string;
  provider?: string;
  model?: string;
  temperature?: number;
  workspace_id?: string;
}

export interface TextGenerationResponse {
  text: string;
  provider: string;
  model: string;
  generation_type: string;
  rendered_prompt?: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  latency_ms: number;
  finish_reason: string;
  usage_metadata: Record<string, any>;
}

export interface PromptTemplateSchema {
  id: string;
  name: string;
  category: string;
  description: string;
  system_prompt: string;
  user_prompt_template: string;
  variables: string[];
  version: string;
}

export interface WorkspaceAISettings {
  id: string;
  workspace_id: string;
  preferred_provider: string;
  preferred_model: string;
  default_language: string;
  writing_tone: string;
  creativity: number;
  target_audience: string;
  brand_voice: string;
  response_length: string;
  created_at: string;
  updated_at: string;
}

export interface AIHistoryRecord {
  id: string;
  workspace_id?: string;
  prompt: string;
  rendered_prompt?: string;
  generation_type?: string;
  response: string;
  provider: string;
  model: string;
  status: string;
  latency_ms: number;
  usage_metadata: Record<string, any>;
  created_at: string;
}

export interface AIUsageStat {
  total_requests: number;
  successful_generations: number;
  failed_generations: number;
  average_latency_ms: number;
  total_tokens_used: number;
  provider_distribution: Record<string, number>;
}

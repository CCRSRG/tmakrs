import type { AIProvider } from '@/types';
import { AI_SERVICE_URLS } from '@/lib/constants/urls';
import { t } from '@/lib/i18n';

const PROVIDER_DEFAULT_BASE_URL: Partial<Record<AIProvider, string>> = {
  openai: AI_SERVICE_URLS.OPENAI,
  deepseek: AI_SERVICE_URLS.DEEPSEEK,
  siliconflow: AI_SERVICE_URLS.SILICONFLOW
};

const OPENAI_COMPATIBLE_PROVIDERS = new Set<AIProvider>(['openai', 'deepseek', 'siliconflow', 'custom']);

const sanitizeBaseUrl = (baseUrl: string): string => {
  const trimmed = baseUrl.trim();
  if (!trimmed) {
    return trimmed;
  }

  return trimmed
    .replace(/\s+/g, '')
    .replace(/\/chat\/completions$/, '')
    .replace(/\/$/, '');
};

const resolveBaseUrl = (provider: AIProvider, apiUrl?: string): string | undefined => {
  if (apiUrl && apiUrl.trim()) {
    return sanitizeBaseUrl(apiUrl);
  }

  const fallback = PROVIDER_DEFAULT_BASE_URL[provider];
  return fallback ? sanitizeBaseUrl(fallback) : undefined;
};

const fetchOpenAIStyleModels = async (baseUrl: string, apiKey: string): Promise<string[]> => {
  const url = `${baseUrl}/models`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(t('error_fetch_models', [String(response.status), errorText || response.statusText]));
  }

  const json = await response.json();
  if (!Array.isArray(json?.data)) {
    throw new Error(t('error_model_list_invalid'));
  }

  const models = json.data
    .map((item: unknown) => {
      if (item && typeof item === 'object' && 'id' in item) {
        return (item as { id: unknown }).id;
      }
      return undefined;
    })
    .filter((id: unknown): id is string => typeof id === 'string' && id.length > 0);

  if (models.length === 0) {
    throw new Error(t('error_model_list_empty'));
  }

  return models;
};

export const canFetchModels = (provider: AIProvider, apiUrl?: string): boolean => {
  if (!OPENAI_COMPATIBLE_PROVIDERS.has(provider)) {
    return false;
  }

  if (provider === 'custom') {
    const trimmed = apiUrl?.trim();
    return Boolean(trimmed && /^https?:\/\//.test(trimmed));
  }

  return true;
};

export async function fetchAvailableModels(
  provider: AIProvider,
  apiKey: string,
  apiUrl?: string
): Promise<string[]> {
  if (!OPENAI_COMPATIBLE_PROVIDERS.has(provider)) {
    throw new Error(t('error_provider_not_supported'));
  }

  if (!apiKey.trim()) {
    throw new Error(t('error_missing_api_key'));
  }

  const baseUrl = resolveBaseUrl(provider, apiUrl);
  if (!baseUrl) {
    throw new Error(t('error_missing_api_url'));
  }

  return fetchOpenAIStyleModels(baseUrl, apiKey);
}

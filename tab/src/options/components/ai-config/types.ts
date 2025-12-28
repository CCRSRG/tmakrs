/**
 * AI 配置组件类型定义
 */

import { t } from '@/lib/i18n';
import type { AIProvider, AIConnectionInfo } from '@/types';

export interface AIConfigFormData {
  aiProvider: AIProvider;
  apiKey: string;
  apiUrl: string;
  aiModel: string;
}

export interface AIConfigSectionProps {
  formData: AIConfigFormData;
  setFormData: (data: any) => void;
  handleProviderChange: (provider: AIProvider) => void;
  handleTestConnection: () => Promise<void>;
  isTesting: boolean;
  availableModels: string[];
  isFetchingModels: boolean;
  modelFetchError: string | null;
  onRefreshModels: () => void;
  modelFetchSupported: boolean;
  allSavedConnections: Array<AIConnectionInfo & { provider: AIProvider }>;
  onApplySavedConnection: (connection: AIConnectionInfo, providerOverride?: AIProvider) => void;
  onDeleteSavedConnection: (connection: AIConnectionInfo, providerOverride?: AIProvider) => void;
  onSaveConnectionPreset: () => void;
}

export const getProviderName = (provider: AIProvider): string => {
  const nameMap: Record<AIProvider, string> = {
    openai: t('provider_openai'),
    claude: t('provider_claude'),
    deepseek: t('provider_deepseek'),
    zhipu: t('provider_zhipu'),
    modelscope: t('provider_modelscope'),
    siliconflow: t('provider_siliconflow'),
    iflow: t('provider_iflow'),
    custom: t('provider_custom'),
  };
  return nameMap[provider];
};

// Keep for backward compatibility - use getProviderName() for i18n support
export const providerNameMap: Record<AIProvider, string> = {
  openai: 'OpenAI',
  claude: 'Claude',
  deepseek: 'DeepSeek',
  zhipu: 'Zhipu AI',
  modelscope: 'ModelScope',
  siliconflow: 'SiliconFlow',
  iflow: 'iFlytek Spark',
  custom: 'Custom',
};

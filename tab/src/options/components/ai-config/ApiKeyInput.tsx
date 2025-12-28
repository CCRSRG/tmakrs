/**
 * API Key 输入组件
 */

import { t } from '@/lib/i18n';
import type { AIProvider } from '@/types';
import { AI_SERVICE_DOCS } from '@/lib/constants/urls';

interface ApiKeyInputProps {
  provider: AIProvider;
  apiKey: string;
  onChange: (apiKey: string) => void;
}

const getApiKeyPlaceholder = (provider: AIProvider): string => {
  const placeholders: Record<AIProvider, string> = {
    openai: t('options_api_key_placeholder_openai'),
    claude: t('options_api_key_placeholder_claude'),
    deepseek: t('options_api_key_placeholder_deepseek'),
    zhipu: t('options_api_key_placeholder_zhipu'),
    modelscope: t('options_api_key_placeholder_modelscope'),
    siliconflow: t('options_api_key_placeholder_siliconflow'),
    iflow: t('options_api_key_placeholder_iflow'),
    custom: t('options_api_key_placeholder_custom'),
  };
  return placeholders[provider];
};

const providerDocs: Partial<Record<AIProvider, { name: string; url: string }>> = {
  openai: { name: 'OpenAI Platform', url: AI_SERVICE_DOCS.OPENAI },
  claude: { name: 'Anthropic Console', url: AI_SERVICE_DOCS.CLAUDE },
  deepseek: { name: 'DeepSeek Platform', url: AI_SERVICE_DOCS.DEEPSEEK },
  zhipu: { name: 'Zhipu AI Platform', url: AI_SERVICE_DOCS.ZHIPU },
  modelscope: { name: 'ModelScope', url: AI_SERVICE_DOCS.MODELSCOPE },
  siliconflow: { name: 'SiliconFlow', url: AI_SERVICE_DOCS.SILICONFLOW },
  iflow: { name: 'iFlytek Platform', url: AI_SERVICE_DOCS.IFLOW },
};

export function ApiKeyInput({ provider, apiKey, onChange }: ApiKeyInputProps) {
  const doc = providerDocs[provider];

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--tab-options-text)] mb-3">
        API Key
      </label>
      <input
        type="password"
        value={apiKey}
        onChange={(e) => onChange(e.target.value)}
        placeholder={getApiKeyPlaceholder(provider)}
        className="w-full px-3 py-2 border border-[color:var(--tab-options-button-border)] rounded-lg bg-[color:var(--tab-options-card-bg)] text-[var(--tab-options-title)] focus:outline-none focus:ring-2 focus:ring-[var(--tab-options-button-primary-bg)]"
      />
      {doc && (
        <p className="mt-2 text-xs text-[var(--tab-options-text-muted)]">
          {t('options_get_api_key')}:
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--tab-options-pill-text)] hover:underline"
          >
            {doc.name}
          </a>
        </p>
      )}
    </div>
  );
}

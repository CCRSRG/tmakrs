/**
 * AI 配置区块组件
 */

import { useEffect, useState } from 'react';
import { t } from '@/lib/i18n';
import type { AIProvider } from '@/types';
import { AI_SERVICE_URLS } from '@/lib/constants/urls';
import { SavedConnectionsList } from './SavedConnectionsList';
import { ModelSelector } from './ModelSelector';
import { ApiKeyInput } from './ApiKeyInput';
import type { AIConfigSectionProps } from './types';

export function AIConfigSection({
  formData,
  setFormData,
  handleProviderChange,
  handleTestConnection,
  isTesting,
  availableModels,
  isFetchingModels,
  modelFetchError,
  onRefreshModels,
  modelFetchSupported,
  allSavedConnections,
  onApplySavedConnection,
  onDeleteSavedConnection,
  onSaveConnectionPreset,
}: AIConfigSectionProps) {
  const [showAllConnections, setShowAllConnections] = useState(false);

  useEffect(() => {
    if (allSavedConnections.length <= 3 && showAllConnections) {
      setShowAllConnections(false);
    }
  }, [allSavedConnections.length, showAllConnections]);

  const showApiUrlInput =
    formData.aiProvider === 'custom' ||
    formData.aiProvider === 'siliconflow' ||
    formData.aiProvider === 'deepseek' ||
    formData.aiProvider === 'openai';

  const getApiUrlPlaceholder = () => {
    switch (formData.aiProvider) {
      case 'openai':
        return AI_SERVICE_URLS.OPENAI;
      case 'deepseek':
        return AI_SERVICE_URLS.DEEPSEEK;
      case 'siliconflow':
        return AI_SERVICE_URLS.SILICONFLOW;
      default:
        return t('options_custom_api_placeholder');
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[color:var(--tab-options-card-border)] bg-[color:var(--tab-options-card-bg)] shadow-sm backdrop-blur transition-shadow hover:shadow-lg">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--tab-options-modal-topbar-from)] via-[var(--tab-options-modal-topbar-via)] to-[var(--tab-options-modal-topbar-to)]" />

      <div className="p-8 pt-12 space-y-8">
        {/* 头部 */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--tab-options-title)]">{t('options_ai_config_title')}</h2>
            <p className="mt-2 text-sm text-[var(--tab-options-text)]">
              {t('options_ai_config_desc')}
            </p>
          </div>
          <button
            type="button"
            onClick={onSaveConnectionPreset}
            disabled={!formData.apiKey.trim()}
            className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              formData.apiKey.trim()
                ? 'bg-[var(--tab-options-button-primary-bg)] text-[var(--tab-options-button-primary-text)] hover:bg-[var(--tab-options-button-primary-hover)] shadow-sm'
                : 'bg-[var(--tab-options-button-hover-bg)] text-[var(--tab-options-text-muted)] cursor-not-allowed'
            }`}
          >
            {t('options_save_config')}
          </button>
        </div>

        <div className="space-y-6">
          {/* 已保存配置列表 */}
          <SavedConnectionsList
            connections={allSavedConnections}
            showAll={showAllConnections}
            onToggleShowAll={() => setShowAllConnections((prev) => !prev)}
            onApply={onApplySavedConnection}
            onDelete={onDeleteSavedConnection}
            currentProvider={formData.aiProvider}
          />

          {/* AI 引擎选择 */}
          <div>
            <label className="block text-sm font-medium text-[var(--tab-options-text)] mb-3">
              {t('options_ai_engine')}
            </label>
            <select
              value={formData.aiProvider}
              onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
              className="w-full px-3 py-2 border border-[color:var(--tab-options-button-border)] rounded-lg bg-[color:var(--tab-options-card-bg)] text-[var(--tab-options-title)] focus:outline-none focus:ring-2 focus:ring-[var(--tab-options-button-primary-bg)]"
            >
              <option value="openai">{t('provider_openai')}</option>
              <option value="claude">{t('provider_claude')}</option>
              <option value="deepseek">{t('provider_deepseek')}</option>
              <option value="zhipu">{t('provider_zhipu')}</option>
              <option value="modelscope">{t('provider_modelscope')}</option>
              <option value="siliconflow">{t('provider_siliconflow')}</option>
              <option value="iflow">{t('provider_iflow')}</option>
              <option value="custom">{t('provider_custom')}</option>
            </select>
          </div>

          {/* API 地址 */}
          {showApiUrlInput && (
            <div>
              <label className="block text-sm font-medium text-[var(--tab-options-text)] mb-3">
                {t('options_api_url')}
              </label>
              <input
                type="url"
                value={formData.apiUrl}
                onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                placeholder={getApiUrlPlaceholder()}
                className="w-full px-3 py-2 border border-[color:var(--tab-options-button-border)] rounded-lg bg-[color:var(--tab-options-card-bg)] text-[var(--tab-options-title)] focus:outline-none focus:ring-2 focus:ring-[var(--tab-options-button-primary-bg)]"
              />
            </div>
          )}

          {/* API Key */}
          <ApiKeyInput
            provider={formData.aiProvider}
            apiKey={formData.apiKey}
            onChange={(apiKey) => setFormData({ ...formData, apiKey })}
          />

          {/* 模型选择 */}
          <ModelSelector
            model={formData.aiModel}
            provider={formData.aiProvider}
            availableModels={availableModels}
            isFetchingModels={isFetchingModels}
            modelFetchError={modelFetchError}
            modelFetchSupported={modelFetchSupported}
            apiKey={formData.apiKey}
            onModelChange={(aiModel) => setFormData({ ...formData, aiModel })}
            onRefreshModels={onRefreshModels}
          />

          {/* 测试连接按钮 */}
          <div>
            <button
              onClick={handleTestConnection}
              disabled={isTesting || !formData.apiKey}
              className="px-4 py-2 bg-[var(--tab-options-button-primary-bg)] hover:bg-[var(--tab-options-button-primary-hover)] disabled:opacity-50 text-[var(--tab-options-button-primary-text)] rounded-lg transition-colors duration-200"
            >
              {isTesting ? t('options_testing') : t('options_test_connection')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

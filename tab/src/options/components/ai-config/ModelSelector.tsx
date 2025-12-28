/**
 * 模型选择器组件
 */

import { useEffect, useRef, useState } from 'react';
import { t } from '@/lib/i18n';
import type { AIProvider } from '@/types';

interface ModelSelectorProps {
  model: string;
  provider: AIProvider;
  availableModels: string[];
  isFetchingModels: boolean;
  modelFetchError: string | null;
  modelFetchSupported: boolean;
  apiKey: string;
  onModelChange: (model: string) => void;
  onRefreshModels: () => void;
}

const modelPlaceholders: Record<AIProvider, string> = {
  openai: 'gpt-4o-mini (recommended) or gpt-4o',
  claude: 'claude-3-5-sonnet-20241022 (recommended)',
  deepseek: 'deepseek-chat',
  zhipu: 'glm-4-flash (recommended) or glm-4-plus',
  modelscope: 'qwen-plus or qwen-turbo',
  siliconflow: 'Qwen/Qwen2.5-7B-Instruct',
  iflow: 'spark-lite or spark-pro',
  custom: 'Enter model name',
};

export function ModelSelector({
  model,
  provider,
  availableModels,
  isFetchingModels,
  modelFetchError,
  modelFetchSupported,
  apiKey,
  onModelChange,
  onRefreshModels,
}: ModelSelectorProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const hasModelOptions = availableModels.length > 0;

  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    if (!hasModelOptions) {
      setDropdownOpen(false);
    }
  }, [hasModelOptions]);

  const handleSelectModel = (selectedModel: string) => {
    onModelChange(selectedModel);
    setDropdownOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-[var(--tab-options-text)]">{t('options_model')}</label>
        <button
          type="button"
          onClick={onRefreshModels}
          disabled={!modelFetchSupported || isFetchingModels || !apiKey.trim()}
          className={`text-xs px-3 py-1 rounded-lg transition-colors ${
            !modelFetchSupported || isFetchingModels || !apiKey.trim()
              ? 'bg-[var(--tab-options-button-hover-bg)] text-[var(--tab-options-text-muted)] cursor-not-allowed'
              : 'bg-[var(--tab-options-button-primary-bg)] text-[var(--tab-options-button-primary-text)] hover:bg-[var(--tab-options-button-primary-hover)]'
          }`}
        >
          {isFetchingModels ? t('options_fetching_models') : t('options_refresh_models')}
        </button>
      </div>

      <div className="relative w-full" ref={dropdownRef}>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            placeholder={modelPlaceholders[provider]}
            className="flex-1 px-3 py-2 border border-[color:var(--tab-options-button-border)] rounded-lg bg-[color:var(--tab-options-card-bg)] text-[var(--tab-options-title)] focus:outline-none focus:ring-2 focus:ring-[var(--tab-options-button-primary-bg)]"
          />
          {hasModelOptions && (
            <button
              type="button"
              onClick={() => setDropdownOpen((open) => !open)}
              className="px-3 py-2 rounded-lg bg-[var(--tab-options-button-hover-bg)] text-[var(--tab-options-button-text)] hover:bg-[color:var(--tab-options-button-border)] transition-colors flex items-center gap-1"
            >
              <span className="text-sm font-medium">{t('options_select_model')}</span>
              <span className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>▾</span>
            </button>
          )}
        </div>

        {hasModelOptions && dropdownOpen && (
          <div className="absolute z-10 mt-2 right-0 w-full max-h-[33vh] overflow-y-auto rounded-lg border border-[color:var(--tab-options-card-border)] bg-[color:var(--tab-options-modal-bg)] shadow-2xl">
            {availableModels.map((m) => {
              const isActive = model === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleSelectModel(m)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-[color:var(--tab-options-pill-bg)] text-[var(--tab-options-pill-text)]'
                      : 'text-[var(--tab-options-button-text)] hover:bg-[var(--tab-options-button-hover-bg)]'
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {hasModelOptions && (
        <p className="mt-2 text-xs text-[var(--tab-options-pill-text)]">
          {t('options_models_loaded', [availableModels.length.toString()])}
        </p>
      )}
      {modelFetchError && (
        <p className="mt-2 text-xs text-[var(--tab-options-danger-text)]">
          {t('options_model_load_failed')}: {modelFetchError}
        </p>
      )}
      {!hasModelOptions && modelFetchSupported && !modelFetchError && !isFetchingModels && (
        <p className="mt-2 text-xs text-[var(--tab-options-text-muted)]">
          {t('options_model_fetch_hint')}
        </p>
      )}
    </div>
  );
}

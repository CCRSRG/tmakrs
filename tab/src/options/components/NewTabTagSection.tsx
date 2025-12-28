import { useState } from 'react';
import { t } from '@/lib/i18n';
import { NEWTAB_FOLDER_PROMPT_TEMPLATE } from '@/lib/constants/newtabPrompts';

interface NewTabTagSectionProps {
  formData: {
    enableNewtabAI: boolean;
    newtabFolderRecommendCount: number;
    enableNewtabFolderPrompt: boolean;
    newtabFolderPrompt: string;
  };
  setFormData: (data: any) => void;
  setSuccessMessage: (msg: string | null) => void;
}

export function NewTabTagSection({ formData, setFormData, setSuccessMessage }: NewTabTagSectionProps) {
  const [isLoadingFolderPaths, setIsLoadingFolderPaths] = useState(false);
  const [folderPathsError, setFolderPathsError] = useState<string | null>(null);
  const [folderPaths, setFolderPaths] = useState<string[]>([]);

  const loadFolderPaths = async () => {
    try {
      setIsLoadingFolderPaths(true);
      setFolderPathsError(null);

      if (!chrome?.runtime?.sendMessage) {
        throw new Error(t('options_chrome_runtime_error'));
      }

      const resp = (await chrome.runtime.sendMessage({
        type: 'GET_NEWTAB_FOLDERS',
      })) as {
        success: boolean;
        data?: {
          rootId: string;
          folders: Array<{ id: string; title: string; parentId: string | null; path: string }>;
        };
        error?: string;
      };

      if (!resp?.success) {
        throw new Error(resp?.error || t('options_load_paths_failed'));
      }

      const paths = (resp.data?.folders || [])
        .filter((f) => f.id !== resp.data?.rootId)
        .map((f) => f.path)
        .filter(Boolean);

      setFolderPaths(paths);
      setSuccessMessage(t('options_load_paths_success'));
    } catch (e) {
      setFolderPathsError(e instanceof Error ? e.message : t('options_load_paths_failed'));
      setFolderPaths([]);
    } finally {
      setIsLoadingFolderPaths(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[color:var(--tab-options-card-border)] bg-[color:var(--tab-options-card-bg)] shadow-sm backdrop-blur transition-shadow hover:shadow-lg">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--tab-options-modal-topbar-from)] via-[var(--tab-options-modal-topbar-via)] to-[var(--tab-options-modal-topbar-to)]" />

      <div className="p-6 pt-10 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-[var(--tab-options-title)]">{t('options_newtab_folder_title')}</h2>
          <p className="mt-2 text-sm text-[var(--tab-options-text)]">
            {t('options_newtab_folder_desc')}
          </p>
          <p className="mt-2 text-xs text-[var(--tab-options-text-muted)]">
            {t('options_newtab_root_hint')}
          </p>
          <p className="mt-1 text-xs text-[var(--tab-options-text-muted)]">
            {t('options_newtab_ai_organize_hint')}
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-[var(--tab-options-text)]">
                {t('options_enable_newtab_ai')}
              </label>
              <p className="mt-1 text-xs text-[var(--tab-options-text-muted)]">
                {t('options_enable_newtab_ai_desc')}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={formData.enableNewtabAI}
              onClick={() => setFormData({ ...formData, enableNewtabAI: !formData.enableNewtabAI })}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--tab-options-button-primary-bg)] focus:ring-offset-2 ${
                formData.enableNewtabAI
                  ? 'bg-[var(--tab-options-button-primary-bg)]'
                  : 'bg-[var(--tab-options-button-hover-bg)]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[var(--tab-options-switch-thumb)] shadow ring-0 transition duration-200 ease-in-out ${
                  formData.enableNewtabAI ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--tab-options-text)] mb-2">
              {t('options_recommend_count')}: {formData.newtabFolderRecommendCount}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={formData.newtabFolderRecommendCount}
              onChange={(e) =>
                setFormData({ ...formData, newtabFolderRecommendCount: Number(e.target.value) })
              }
              className="w-full"
            />
            <p className="mt-1 text-xs text-[var(--tab-options-text-muted)]">
              {t('options_recommend_count_hint')}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-[var(--tab-options-text)]">
                {t('options_custom_prompt')}
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={formData.enableNewtabFolderPrompt}
                onClick={() =>
                  setFormData({ ...formData, enableNewtabFolderPrompt: !formData.enableNewtabFolderPrompt })
                }
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.enableNewtabFolderPrompt
                    ? 'bg-[var(--tab-options-button-primary-bg)]'
                    : 'bg-[var(--tab-options-button-hover-bg)]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-[var(--tab-options-switch-thumb)] shadow ring-0 transition duration-200 ease-in-out ${
                    formData.enableNewtabFolderPrompt ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {formData.enableNewtabFolderPrompt && (
              <div className="space-y-2">
                <textarea
                  value={formData.newtabFolderPrompt}
                  onChange={(e) => setFormData({ ...formData, newtabFolderPrompt: e.target.value })}
                  placeholder={NEWTAB_FOLDER_PROMPT_TEMPLATE}
                  rows={8}
                  className="w-full rounded-lg border border-[var(--tab-options-card-border)] bg-[var(--tab-options-card-bg)] px-3 py-2 text-sm text-[var(--tab-options-text)] placeholder-[var(--tab-options-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--tab-options-button-primary-bg)]"
                />
                <p className="text-xs text-[var(--tab-options-text-muted)]">
                  {t('options_prompt_variables')}: {'{{title}}'}, {'{{url}}'}, {'{{description}}'}, {'{{folderPaths}}'},{' '}
                  {'{{recommendCount}}'}
                </p>
              </div>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={loadFolderPaths}
              disabled={isLoadingFolderPaths}
              className="rounded-lg bg-[var(--tab-options-button-primary-bg)] px-4 py-2 text-sm font-medium text-[var(--tab-options-button-primary-text)] hover:opacity-90 disabled:opacity-50"
            >
              {isLoadingFolderPaths ? t('options_loading_paths') : t('options_load_paths')}
            </button>
            {folderPathsError && (
              <p className="mt-2 text-xs text-red-500">{folderPathsError}</p>
            )}
            {folderPaths.length > 0 && (
              <div className="mt-2 max-h-32 overflow-y-auto rounded-lg border border-[var(--tab-options-card-border)] bg-[var(--tab-options-card-bg)] p-2">
                <p className="text-xs text-[var(--tab-options-text-muted)] mb-1">
                  {t('options_paths_loaded', [folderPaths.length.toString()])}
                </p>
                {folderPaths.slice(0, 10).map((path, i) => (
                  <div key={i} className="text-xs text-[var(--tab-options-text)]">
                    {path}
                  </div>
                ))}
                {folderPaths.length > 10 && (
                  <div className="text-xs text-[var(--tab-options-text-muted)]">
                    {t('options_more_paths', [(folderPaths.length - 10).toString()])}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

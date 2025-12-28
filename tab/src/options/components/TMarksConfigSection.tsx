import { t } from '@/lib/i18n';
import { TMARKS_URLS } from '@/lib/constants/urls';

interface TMarksConfigSectionProps {
  formData: {
    bookmarkApiUrl: string;
    bookmarkApiKey: string;
  };
  setFormData: (data: any) => void;
}

export function TMarksConfigSection({ formData, setFormData }: TMarksConfigSectionProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[color:var(--tab-options-tmarks-card-border)] bg-[color:var(--tab-options-tmarks-card-bg)] shadow-sm backdrop-blur transition-shadow hover:shadow-lg">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--tab-options-tmarks-topbar-from)] via-[var(--tab-options-tmarks-topbar-via)] to-[var(--tab-options-tmarks-topbar-to)]" />

      <div className="p-6 pt-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[var(--tab-options-title)]">{t('options_sync_title')}</h2>
            <p className="mt-2 text-sm text-[var(--tab-options-text)]">
              {t('options_sync_desc')}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[color:var(--tab-options-tmarks-badge-bg)] text-xs font-medium text-[var(--tab-options-tmarks-badge-text)]">
            {t('options_recommended')}
          </span>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--tab-options-text)] mb-3">
            {t('options_server_address')}
          </label>
          <input
            type="url"
            value={formData.bookmarkApiUrl}
            onChange={(e) => setFormData({ ...formData, bookmarkApiUrl: e.target.value })}
            placeholder={TMARKS_URLS.DEFAULT_BASE_URL}
            className="w-full px-3 py-2 border border-[var(--tab-options-tmarks-input-border)] rounded-lg bg-[var(--tab-options-tmarks-input-bg)] text-[var(--tab-options-tmarks-input-text)] focus:outline-none focus:ring-2 focus:ring-[var(--tab-options-tmarks-input-ring)]"
          />
          <p className="mt-2 text-xs text-[var(--tab-options-text-muted)]">
            <span className="font-medium">{t('options_tmarks_official')}</span>
            <code className="ml-1 px-1.5 py-0.5 bg-[var(--tab-options-tmarks-code-bg)] rounded">{TMARKS_URLS.DEFAULT_BASE_URL}</code>
          </p>
          <div className="mt-2 p-3 bg-[var(--tab-options-tmarks-info-bg)] rounded-lg">
            <p className="text-xs text-[var(--tab-options-tmarks-info-text)] mb-2">
              <span className="font-semibold text-[var(--tab-options-tmarks-info-title)]">{t('options_tmarks_info_title')}</span>
            </p>
            <ul className="text-xs text-[var(--tab-options-tmarks-info-text)] space-y-1">
              <li>• {t('options_tmarks_info_1')}</li>
              <li>• {t('options_tmarks_info_2')}</li>
              <li>• {t('options_tmarks_info_3')}</li>
              <li>• {t('options_tmarks_info_4')}<code className="px-1 bg-[var(--tab-options-tmarks-code-bg)] rounded">https://tmarks.669696.xyz</code></li>
            </ul>
          </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--tab-options-text)] mb-3">
            {t('options_api_key')}
          </label>
          <input
            type="password"
            value={formData.bookmarkApiKey}
            onChange={(e) => setFormData({ ...formData, bookmarkApiKey: e.target.value })}
            placeholder={t('options_api_key_placeholder')}
            className="w-full px-3 py-2 border border-[var(--tab-options-tmarks-input-border)] rounded-lg bg-[var(--tab-options-tmarks-input-bg)] text-[var(--tab-options-tmarks-input-text)] focus:outline-none focus:ring-2 focus:ring-[var(--tab-options-tmarks-input-ring)]"
          />
          <p className="mt-2 text-xs text-[var(--tab-options-text-muted)]">
            {t('options_api_key_hint')}
          </p>
          </div>
        </div>
      </div>
    </div>
  );
}

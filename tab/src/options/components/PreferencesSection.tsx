import { t } from '@/lib/i18n';

interface PreferencesSectionProps {
  formData: {
    theme: 'light' | 'dark' | 'auto';
    themeStyle: 'default' | 'bw' | 'tmarks';
    defaultVisibility: 'public' | 'private';
    defaultIncludeThumbnail: boolean;
    defaultCreateSnapshot: boolean;
    tagTheme: 'classic' | 'mono' | 'bw';
  };
  setFormData: (data: any) => void;
}

export function PreferencesSection({ formData, setFormData }: PreferencesSectionProps) {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-[color:var(--tab-options-card-border)] bg-[color:var(--tab-options-card-bg)] shadow-sm backdrop-blur transition-shadow hover:shadow-lg">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--tab-options-modal-topbar-from)] via-[var(--tab-options-modal-topbar-via)] to-[var(--tab-options-modal-topbar-to)]" />

        <div className="p-6 pt-10 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-[var(--tab-options-title)]">{t('pref_appearance_title')}</h2>
            <p className="mt-2 text-sm text-[var(--tab-options-text)]">{t('pref_appearance_desc')}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[var(--tab-options-text)] mb-2">{t('pref_theme')}</label>
              <div className="inline-flex rounded-xl border border-[color:var(--tab-options-card-border)] bg-[color:var(--tab-options-card-bg)] p-1 text-sm font-medium text-[var(--tab-options-text)]">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, theme: 'auto' })}
                  className={`rounded-lg px-3 py-1.5 transition-colors ${
                    formData.theme === 'auto'
                      ? 'bg-[var(--tab-options-button-primary-bg)] text-[var(--tab-options-button-primary-text)] shadow'
                      : 'hover:text-[var(--tab-options-title)]'
                  }`}
                >
                  {t('pref_theme_auto')}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, theme: 'light' })}
                  className={`rounded-lg px-3 py-1.5 transition-colors ${
                    formData.theme === 'light'
                      ? 'bg-[var(--tab-options-button-primary-bg)] text-[var(--tab-options-button-primary-text)] shadow'
                      : 'hover:text-[var(--tab-options-title)]'
                  }`}
                >
                  {t('pref_theme_light')}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, theme: 'dark' })}
                  className={`rounded-lg px-3 py-1.5 transition-colors ${
                    formData.theme === 'dark'
                      ? 'bg-[var(--tab-options-button-primary-bg)] text-[var(--tab-options-button-primary-text)] shadow'
                      : 'hover:text-[var(--tab-options-title)]'
                  }`}
                >
                  {t('pref_theme_dark')}
                </button>
              </div>
              <p className="mt-2 text-xs text-[var(--tab-options-text-muted)]">{t('pref_theme_hint')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--tab-options-text)] mb-2">{t('pref_theme_style')}</label>
              <div className="inline-flex rounded-xl border border-[color:var(--tab-options-card-border)] bg-[color:var(--tab-options-card-bg)] p-1 text-sm font-medium text-[var(--tab-options-text)]">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, themeStyle: 'default' })}
                  className={`rounded-lg px-3 py-1.5 transition-colors ${
                    formData.themeStyle === 'default'
                      ? 'bg-[var(--tab-options-button-primary-bg)] text-[var(--tab-options-button-primary-text)] shadow'
                      : 'hover:text-[var(--tab-options-title)]'
                  }`}
                >
                  {t('pref_style_default')}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, themeStyle: 'bw' })}
                  className={`rounded-lg px-3 py-1.5 transition-colors ${
                    formData.themeStyle === 'bw'
                      ? 'bg-[var(--tab-options-button-primary-bg)] text-[var(--tab-options-button-primary-text)] shadow'
                      : 'hover:text-[var(--tab-options-title)]'
                  }`}
                >
                  {t('pref_style_bw')}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, themeStyle: 'tmarks' })}
                  className={`rounded-lg px-3 py-1.5 transition-colors ${
                    formData.themeStyle === 'tmarks'
                      ? 'bg-[var(--tab-options-button-primary-bg)] text-[var(--tab-options-button-primary-text)] shadow'
                      : 'hover:text-[var(--tab-options-title)]'
                  }`}
                >
                  TMarks
                </button>
              </div>
              <p className="mt-2 text-xs text-[var(--tab-options-text-muted)]">{t('pref_style_hint')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--tab-options-text)] mb-2">{t('pref_tag_style')}</label>
              <div className="inline-flex rounded-xl border border-[color:var(--tab-options-card-border)] bg-[color:var(--tab-options-card-bg)] p-1 text-sm font-medium text-[var(--tab-options-text)]">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tagTheme: 'classic' })}
                  className={`rounded-lg px-3 py-1.5 transition-colors ${
                    formData.tagTheme === 'classic'
                      ? 'bg-[var(--tab-options-button-primary-bg)] text-[var(--tab-options-button-primary-text)] shadow'
                      : 'hover:text-[var(--tab-options-title)]'
                  }`}
                >
                  {t('pref_tag_classic')}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tagTheme: 'mono' })}
                  className={`rounded-lg px-3 py-1.5 transition-colors ${
                    formData.tagTheme === 'mono'
                      ? 'bg-[var(--tab-options-button-primary-bg)] text-[var(--tab-options-button-primary-text)] shadow'
                      : 'hover:text-[var(--tab-options-title)]'
                  }`}
                >
                  {t('pref_tag_mono')}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tagTheme: 'bw' })}
                  className={`rounded-lg px-3 py-1.5 transition-colors ${
                    formData.tagTheme === 'bw'
                      ? 'bg-[var(--tab-options-button-primary-bg)] text-[var(--tab-options-button-primary-text)] shadow'
                      : 'hover:text-[var(--tab-options-title)]'
                  }`}
                >
                  {t('pref_style_bw')}
                </button>
              </div>
              <p className="mt-2 text-xs text-[var(--tab-options-text-muted)]">{t('pref_tag_hint')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-[color:var(--tab-options-card-border)] bg-[color:var(--tab-options-card-bg)] shadow-sm backdrop-blur transition-shadow hover:shadow-lg">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--tab-options-modal-topbar-from)] via-[var(--tab-options-modal-topbar-via)] to-[var(--tab-options-modal-topbar-to)]" />

        <div className="p-6 pt-10 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-[var(--tab-options-title)]">{t('pref_defaults_title')}</h2>
            <p className="mt-2 text-sm text-[var(--tab-options-text)]">{t('pref_defaults_desc')}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--tab-options-text)] mb-2">{t('pref_visibility')}</label>
              <div className="inline-flex rounded-xl border border-[color:var(--tab-options-card-border)] bg-[color:var(--tab-options-card-bg)] p-1 text-sm font-medium text-[var(--tab-options-text)]">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, defaultVisibility: 'public' })}
                  className={`rounded-lg px-3 py-1.5 transition-colors ${
                    formData.defaultVisibility === 'public'
                      ? 'bg-[var(--tab-options-button-primary-bg)] text-[var(--tab-options-button-primary-text)] shadow'
                      : 'hover:text-[var(--tab-options-title)]'
                  }`}
                >
                  {t('pref_visibility_public')}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, defaultVisibility: 'private' })}
                  className={`rounded-lg px-3 py-1.5 transition-colors ${
                    formData.defaultVisibility === 'private'
                      ? 'bg-[var(--tab-options-button-primary-bg)] text-[var(--tab-options-button-primary-text)] shadow'
                      : 'hover:text-[var(--tab-options-title)]'
                  }`}
                >
                  {t('pref_visibility_private')}
                </button>
              </div>
              <p className="mt-2 text-xs text-[var(--tab-options-text-muted)]">{t('pref_visibility_hint')}</p>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-[color:var(--tab-options-card-border)]">
              <div>
                <label className="block text-sm font-medium text-[var(--tab-options-text)]">{t('pref_thumbnail')}</label>
                <p className="mt-1 text-xs text-[var(--tab-options-text-muted)]">{t('pref_thumbnail_hint')}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.defaultIncludeThumbnail}
                onClick={() => setFormData({ ...formData, defaultIncludeThumbnail: !formData.defaultIncludeThumbnail })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--tab-options-button-primary-bg)] focus:ring-offset-2 ${
                  formData.defaultIncludeThumbnail ? 'bg-[var(--tab-options-button-primary-bg)]' : 'bg-[var(--tab-options-button-hover-bg)]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[var(--tab-options-switch-thumb)] shadow ring-0 transition duration-200 ease-in-out ${
                    formData.defaultIncludeThumbnail ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-[color:var(--tab-options-card-border)]">
              <div>
                <label className="block text-sm font-medium text-[var(--tab-options-text)]">{t('pref_snapshot')}</label>
                <p className="mt-1 text-xs text-[var(--tab-options-text-muted)]">{t('pref_snapshot_hint')}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.defaultCreateSnapshot}
                onClick={() => setFormData({ ...formData, defaultCreateSnapshot: !formData.defaultCreateSnapshot })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--tab-options-button-primary-bg)] focus:ring-offset-2 ${
                  formData.defaultCreateSnapshot ? 'bg-[var(--tab-options-button-primary-bg)]' : 'bg-[var(--tab-options-button-hover-bg)]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[var(--tab-options-switch-thumb)] shadow ring-0 transition duration-200 ease-in-out ${
                    formData.defaultCreateSnapshot ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

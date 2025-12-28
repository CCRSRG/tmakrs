import { useMemo, useState } from 'react';
import { ErrorMessage } from '@/components/ErrorMessage';
import { SuccessMessage } from '@/components/SuccessMessage';
import { AIConfigSection } from './components/AIConfigSection';
import { TMarksConfigSection } from './components/TMarksConfigSection';
import { PreferencesSection } from './components/PreferencesSection';
import { CacheStatusSection } from './components/CacheStatusSection';
import { PresetModal } from './components/PresetModal';
import { TMarksTagSection } from './components/TMarksTagSection';
import { NewTabTagSection } from './components/NewTabTagSection';
import { useOptionsForm } from './hooks/useOptionsForm';
import { t } from '@/lib/i18n';

export function Options() {
  const {
    error,
    successMessage,
    isLoading,
    setError,
    setSuccessMessage,

    formData,
    setFormData,

    stats,
    isTesting,

    availableModels,
    isFetchingModels,
    modelFetchError,
    modelFetchSupported,

    allSavedConnections,

    isPresetModalOpen,
    presetLabel,
    isSavingPreset,
    presetError,

    setPresetLabel,

    handleProviderChange,
    refreshModelOptions,
    handleSave,
    handleSync,
    formatDate,
    handleReset,
    handleTestAPI,

    handleSaveConnectionPreset,
    handleConfirmSaveConnectionPreset,
    handleClosePresetModal,
    handleApplySavedConnection,
    handleDeleteSavedConnection,
  } = useOptionsForm();

  type OptionsTab = 'ai' | 'tmarkstag' | 'newtabtag' | 'preferences' | 'tmarks';
  const [activeTab, setActiveTab] = useState<OptionsTab>('ai');

  const tabs = useMemo(
    () =>
      [
        { id: 'ai' as const, label: t('options_tab_ai') },
        { id: 'tmarkstag' as const, label: 'TMarks' },
        { id: 'newtabtag' as const, label: 'NewTab' },
        { id: 'preferences' as const, label: t('options_tab_preferences') },
        { id: 'tmarks' as const, label: t('options_tab_tmarks') },
      ],
    []
  );

  return (
    <>
      <div className="min-h-screen w-screen bg-gradient-to-br from-[var(--tab-options-page-bg-from)] via-[var(--tab-options-page-bg-via)] to-[var(--tab-options-page-bg-to)]">
        <div className="w-4/5 mx-auto px-6 py-12">
          <div className="relative overflow-hidden rounded-3xl border border-[color:var(--tab-options-card-border)] bg-[color:var(--tab-options-card-bg)] shadow-sm backdrop-blur mb-10">
            <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--tab-options-hero-gradient-from)] via-[color:var(--tab-options-hero-gradient-via)] to-[color:var(--tab-options-hero-gradient-to)]" />
            <div className="relative p-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[color:var(--tab-options-pill-bg)] text-sm font-medium text-[var(--tab-options-pill-text)]">
                {t('options_title')}
              </div>
              <h1 className="mt-4 text-4xl font-bold text-[var(--tab-options-title)] tracking-tight">{t('options_subtitle')}</h1>
              <p className="mt-3 max-w-2xl text-base text-[var(--tab-options-text)]">
                {t('options_description')}
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-xs font-medium text-[var(--tab-options-text-muted)]">
                <span className="px-3 py-1 rounded-full bg-[color:var(--tab-options-tag-bg)] border border-[color:var(--tab-options-tag-border)]">{t('options_tag_ai')}</span>
                <span className="px-3 py-1 rounded-full bg-[color:var(--tab-options-tag-bg)] border border-[color:var(--tab-options-tag-border)]">{t('options_tag_sync')}</span>
                <span className="px-3 py-1 rounded-full bg-[color:var(--tab-options-tag-bg)] border border-[color:var(--tab-options-tag-border)]">{t('options_tag_security')}</span>
              </div>
            </div>
          </div>

          <div className="mb-10 space-y-4">
            {error && (
              <ErrorMessage message={error} onDismiss={() => setError(null)} />
            )}
            {successMessage && <SuccessMessage message={successMessage} />}
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <div className="sticky top-8 space-y-4">
                <div className="rounded-2xl border border-[color:var(--tab-options-card-border)] bg-[color:var(--tab-options-card-bg)] shadow-sm backdrop-blur p-3">
                  <div className="space-y-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-[var(--tab-options-button-primary-bg)] text-[var(--tab-options-button-primary-text)]'
                            : 'text-[var(--tab-options-text)] hover:bg-[var(--tab-options-button-hover-bg)]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-[color:var(--tab-options-card-border)] pt-4 space-y-3">
                    <div className="text-xs font-semibold text-[var(--tab-options-text-muted)]">{t('options_save_sync')}</div>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="w-full rounded-lg border border-[color:var(--tab-options-button-border)] px-3 py-2 text-sm font-medium text-[var(--tab-options-button-text)] hover:bg-[var(--tab-options-button-hover-bg)] transition-colors"
                      >
                        {t('btn_reset')}
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isLoading}
                        className="w-full rounded-lg bg-[var(--tab-options-button-primary-bg)] px-3 py-2 text-sm font-medium text-[var(--tab-options-button-primary-text)] shadow-sm hover:bg-[var(--tab-options-button-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
                      >
                        {isLoading ? t('btn_saving') : t('btn_save')}
                      </button>
                    </div>
                  </div>
                </div>

                <CacheStatusSection stats={stats} handleSync={handleSync} isLoading={isLoading} formatDate={formatDate} />
              </div>
            </div>

            <div className="lg:col-span-9 space-y-8">
              {activeTab === 'ai' && (
                <AIConfigSection
                  formData={formData}
                  setFormData={setFormData}
                  handleProviderChange={handleProviderChange}
                  handleTestConnection={handleTestAPI}
                  isTesting={isTesting}
                  availableModels={availableModels}
                  isFetchingModels={isFetchingModels}
                  modelFetchError={modelFetchError}
                  onRefreshModels={refreshModelOptions}
                  modelFetchSupported={modelFetchSupported}
                  allSavedConnections={allSavedConnections}
                  onApplySavedConnection={handleApplySavedConnection}
                  onDeleteSavedConnection={handleDeleteSavedConnection}
                  onSaveConnectionPreset={handleSaveConnectionPreset}
                />
              )}

              {activeTab === 'tmarkstag' && (
                <TMarksTagSection formData={formData} setFormData={setFormData} setSuccessMessage={setSuccessMessage} />
              )}

              {activeTab === 'newtabtag' && (
                <NewTabTagSection formData={formData} setFormData={setFormData} setSuccessMessage={setSuccessMessage} />
              )}

              {activeTab === 'preferences' && (
                <PreferencesSection formData={formData} setFormData={setFormData} />
              )}

              {activeTab === 'tmarks' && (
                <TMarksConfigSection formData={formData} setFormData={setFormData} />
              )}

            </div>
          </div>
        </div>
      </div>

      <PresetModal
        isOpen={isPresetModalOpen}
        presetLabel={presetLabel}
        presetError={presetError}
        isSaving={isSavingPreset}
        onClose={handleClosePresetModal}
        onConfirm={handleConfirmSaveConnectionPreset}
        onChangeLabel={setPresetLabel}
      />
    </>
  );
}

import { t } from '@/lib/i18n';

interface PresetModalProps {
  isOpen: boolean;
  presetLabel: string;
  presetError: string | null;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onChangeLabel: (label: string) => void;
}

export function PresetModal({
  isOpen,
  presetLabel,
  presetError,
  isSaving,
  onClose,
  onConfirm,
  onChangeLabel,
}: PresetModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[color:var(--tab-options-modal-overlay)] backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[color:var(--tab-options-modal-border)] bg-[color:var(--tab-options-modal-bg)] shadow-xl">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--tab-options-modal-topbar-from)] via-[var(--tab-options-modal-topbar-via)] to-[var(--tab-options-modal-topbar-to)]" />
        <div className="p-6 pt-10 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--tab-options-title)]">{t('options_save_config')}</h3>
              <p className="mt-1 text-sm text-[var(--tab-options-text)]">{t('options_save_config_desc')}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-transparent px-3 py-1 text-xl leading-none text-[var(--tab-options-modal-close-text)] transition-colors hover:border-[var(--tab-options-modal-close-hover-border)] hover:text-[var(--tab-options-modal-close-hover-text)]"
              aria-label={t('options_close')}
            >
              ×
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--tab-options-text)]">{t('options_config_name')}</label>
            <input
              type="text"
              value={presetLabel}
              onChange={(e) => onChangeLabel(e.target.value)}
              autoFocus
              className="w-full rounded-lg border border-[color:var(--tab-options-button-border)] bg-[color:var(--tab-options-card-bg)] px-3 py-2 text-[var(--tab-options-title)] focus:outline-none focus:ring-2 focus:ring-[var(--tab-options-button-primary-bg)]"
              placeholder={t('options_config_name_placeholder')}
            />
          </div>

          {presetError && (
            <div className="rounded-lg border border-[color:var(--tab-options-danger-border)] bg-[color:var(--tab-options-danger-bg)] px-3 py-2 text-sm text-[var(--tab-options-danger-text)]">
              {presetError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-lg border border-[color:var(--tab-options-button-border)] px-4 py-2 text-sm font-medium text-[var(--tab-options-button-text)] transition-colors hover:bg-[var(--tab-options-button-hover-bg)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t('btn_cancel')}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSaving}
              className="rounded-lg bg-[var(--tab-options-button-primary-bg)] px-4 py-2 text-sm font-medium text-[var(--tab-options-button-primary-text)] shadow-sm transition-colors hover:bg-[var(--tab-options-button-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? t('btn_saving') : t('btn_confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { t } from '@/lib/i18n';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface CacheStatusSectionProps {
  stats: {
    tags: number;
    bookmarks: number;
    lastSync: number;
  };
  handleSync: () => Promise<void>;
  isLoading: boolean;
  formatDate: (timestamp: number) => string;
}

export function CacheStatusSection({
  stats,
  handleSync,
  isLoading,
  formatDate
}: CacheStatusSectionProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[color:var(--tab-options-card-border)] bg-[color:var(--tab-options-card-bg)] shadow-sm backdrop-blur transition-shadow hover:shadow-lg">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--tab-options-modal-topbar-from)] via-[var(--tab-options-modal-topbar-via)] to-[var(--tab-options-modal-topbar-to)]" />

      <div className="p-6 pt-10 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-[var(--tab-options-title)]">{t('options_cache_title')}</h2>
          <p className="mt-2 text-sm text-[var(--tab-options-text)]">
            {t('options_cache_desc')}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[color:var(--tab-options-card-border)] bg-[color:var(--tab-options-tag-bg)] p-4 text-center">
            <p className="text-2xl font-bold text-[var(--tab-options-pill-text)]">{stats.tags}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-[var(--tab-options-text-muted)]">{t('options_tags_count')}</p>
          </div>
          <div className="rounded-xl border border-[color:var(--tab-options-card-border)] bg-[color:var(--tab-options-tag-bg)] p-4 text-center">
            <p className="text-2xl font-bold text-[var(--tab-options-pill-text)]">{stats.bookmarks}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-[var(--tab-options-text-muted)]">{t('options_bookmarks_count')}</p>
          </div>
          <div className="rounded-xl border border-[color:var(--tab-options-card-border)] bg-[color:var(--tab-options-tag-bg)] p-4 text-center">
            <p className="text-xs font-medium text-[var(--tab-options-text)]">{formatDate(stats.lastSync)}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-[var(--tab-options-text-muted)]">{t('options_last_sync')}</p>
          </div>
        </div>

        <button
          onClick={handleSync}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-[var(--tab-options-button-primary-bg)] hover:bg-[var(--tab-options-button-primary-hover)] text-[var(--tab-options-button-primary-text)] rounded-lg font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {isLoading ? (
            <>
              <LoadingSpinner />
              <span>{t('options_syncing')}</span>
            </>
          ) : (
            t('options_sync_now')
          )}
        </button>
      </div>
    </div>
  );
}

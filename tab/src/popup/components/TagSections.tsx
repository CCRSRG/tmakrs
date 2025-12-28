/**
 * 标签相关区域组件
 */

import { TagList } from '@/components/TagList';
import { getExistingTagClass, getSelectedTagClass, type TagTheme } from '@/lib/utils/tagStyles';
import { t } from '@/lib/i18n';

interface SelectedTagsSectionProps {
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  tagTheme: TagTheme;
}

export function SelectedTagsSection({ selectedTags, onToggleTag, tagTheme }: SelectedTagsSectionProps) {
  if (selectedTags.length === 0) return null;

  return (
    <section className="rounded-xl border border-[var(--tab-popup-section-blue-border)] bg-gradient-to-br from-[var(--tab-popup-section-blue-from)] to-[var(--tab-popup-section-blue-to)] p-3.5 shadow-lg">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-[var(--tab-popup-text)]">{t('popup_selected_tags')}</p>
          <span className="text-[10px] text-[var(--tab-popup-text-muted)]">{t('popup_click_to_remove')}</span>
        </div>
        <span className="rounded-full bg-[var(--tab-popup-section-blue-badge-bg)] px-2 py-0.5 text-xs font-medium text-[var(--tab-popup-section-blue-badge-text)]">
          {selectedTags.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {selectedTags.map((tag) => (
          <button
            key={tag}
            onClick={() => onToggleTag(tag)}
            title={t('popup_click_to_remove')}
            className={getSelectedTagClass(tagTheme)}
          >
            <span className="truncate max-w-[120px]">{tag}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

interface RecommendedTagsSectionProps {
  recommendedTags: Array<{ name: string; isNew: boolean; confidence: number }>;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  tagTheme: TagTheme;
}

export function RecommendedTagsSection({
  recommendedTags,
  selectedTags,
  onToggleTag,
  tagTheme,
}: RecommendedTagsSectionProps) {
  if (recommendedTags.length === 0) return null;

  return (
    <section className="rounded-xl border border-[var(--tab-popup-section-purple-border)] bg-gradient-to-br from-[var(--tab-popup-section-purple-from)] to-[var(--tab-popup-section-purple-to)] p-3.5 shadow-lg">
      <div className="mb-2.5 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--tab-popup-text)]">
            {t('ai_recommend_title')}
          </h2>
          <p className="mt-1 text-xs text-[var(--tab-popup-text-muted)]">{t('ai_recommend_desc')}</p>
        </div>
        <span className="rounded-full bg-[var(--tab-popup-section-purple-badge-bg)] px-2 py-0.5 text-xs font-medium text-[var(--tab-popup-section-purple-badge-text)]">
          {recommendedTags.length}
        </span>
      </div>
      <TagList tags={recommendedTags} selectedTags={selectedTags} onToggle={onToggleTag} theme={tagTheme} />
    </section>
  );
}

interface ExistingTag {
  id: string;
  name: string;
  color?: string;
  count: number;
}

interface ExistingTagsSectionProps {
  existingTags: ExistingTag[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  tagTheme: TagTheme;
  isLoading: boolean;
}

export function ExistingTagsSection({
  existingTags,
  selectedTags,
  onToggleTag,
  tagTheme,
  isLoading,
}: ExistingTagsSectionProps) {
  return (
    <section className="rounded-xl border border-[var(--tab-popup-section-emerald-border)] bg-gradient-to-br from-[var(--tab-popup-section-emerald-from)] to-[var(--tab-popup-section-emerald-to)] p-3.5 shadow-lg">
      <div className="mb-2.5 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--tab-popup-text)]">
            <svg className="h-4 w-4 text-[var(--tab-popup-section-emerald-icon)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {t('tag_library')}
          </h2>
          <p className="mt-1 text-xs text-[var(--tab-popup-text-muted)]">{t('tag_library_desc')}</p>
        </div>
        <span className="rounded-full bg-[var(--tab-popup-section-emerald-badge-bg)] px-2 py-0.5 text-xs font-medium text-[var(--tab-popup-section-emerald-badge-text)]">
          {existingTags.length}
        </span>
      </div>
      <div className="max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[var(--tab-popup-border-strong)] scrollbar-track-transparent">
        {existingTags.length === 0 ? (
          <div className="flex items-center justify-center py-6">
            <p className="text-xs text-[var(--tab-popup-text-muted)]">
              {isLoading ? t('loading') : t('no_tags')}
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {existingTags
              .sort((a, b) => b.count - a.count)
              .map((tag) => {
                const isSelected = selectedTags.includes(tag.name);
                return (
                  <button
                    key={tag.id}
                    onClick={() => onToggleTag(tag.name)}
                    className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-200 active:scale-95 ${
                      getExistingTagClass(tagTheme, isSelected)
                    }`}
                  >
                    {tagTheme !== 'bw' && (
                      <span
                        className="mr-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: tag.color || 'var(--tab-message-success-icon)' }}
                      />
                    )}
                    <span className="truncate max-w-[110px]">{tag.name}</span>
                    {tag.count > 0 && (
                      <span className="ml-1 text-[10px] opacity-60">({tag.count})</span>
                    )}
                  </button>
                );
              })}
          </div>
        )}
      </div>
    </section>
  );
}

interface AIDisabledNoticeProps {}

export function AIDisabledNotice({}: AIDisabledNoticeProps) {
  return (
    <section className="rounded-xl border border-[var(--tab-popup-section-amber-border)] bg-gradient-to-br from-[var(--tab-popup-section-amber-from)] to-[var(--tab-popup-section-amber-to)] p-3.5 shadow-lg">
      <div className="flex items-start gap-3">
        <svg className="h-5 w-5 flex-shrink-0 text-[var(--tab-popup-section-amber-icon)] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-sm font-medium text-[var(--tab-popup-section-amber-title)]">{t('popup_ai_disabled_title')}</p>
          <p className="mt-1 text-xs text-[var(--tab-popup-section-amber-text)]">{t('popup_ai_disabled_desc')}</p>
        </div>
      </div>
    </section>
  );
}

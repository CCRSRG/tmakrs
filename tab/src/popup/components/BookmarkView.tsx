/**
 * 书签保存视图
 */

import { t } from '@/lib/i18n';
import { TagList } from '@/components/TagList';
import { PageInfoCard } from '@/components/PageInfoCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { TagTheme } from '@/lib/utils/tagStyles';
import { getExistingTagClass, getSelectedTagClass } from '@/lib/utils/tagStyles';

interface BookmarkViewProps {
  // Page info
  currentPage: {
    title: string;
    url: string;
    description?: string;
    thumbnail?: string;
    thumbnails?: string[];
    favicon?: string;
  } | null;
  setCurrentPage: (page: any) => void;

  // Tags
  recommendedTags: Array<{ name: string; isNew?: boolean; confidence?: number }>;
  existingTags: Array<{ id: string; name: string; color: string; count: number }>;
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  tagTheme: TagTheme;

  // UI state
  isLoading: boolean;
  isRecommending: boolean;
  isAIEnabled: boolean;

  // Options
  isPublic: boolean;
  setIsPublic: (v: boolean) => void;
  includeThumbnail: boolean;
  handleToggleThumbnail: () => void;
  createSnapshot: boolean;
  setCreateSnapshot: (v: boolean) => void;

  // Title/Description editing
  showTitleEdit: boolean;
  setShowTitleEdit: (v: boolean) => void;
  showDescEdit: boolean;
  setShowDescEdit: (v: boolean) => void;
  titleOverride: string;
  setTitleOverride: (v: string) => void;
  descriptionOverride: string;
  setDescriptionOverride: (v: string) => void;
  handleApplyTitleOverride: () => void;
  handleApplyDescriptionOverride: () => void;
}

export function BookmarkView({
  currentPage,
  setCurrentPage,
  recommendedTags,
  existingTags,
  selectedTags,
  toggleTag,
  tagTheme,
  isLoading,
  isRecommending,
  isAIEnabled,
  isPublic,
  setIsPublic,
  includeThumbnail,
  handleToggleThumbnail,
  createSnapshot,
  setCreateSnapshot,
  showTitleEdit,
  setShowTitleEdit,
  showDescEdit,
  setShowDescEdit,
  titleOverride,
  setTitleOverride,
  descriptionOverride,
  setDescriptionOverride,
  handleApplyTitleOverride,
  handleApplyDescriptionOverride,
}: BookmarkViewProps) {
  return (
    <>
      {isRecommending && (
        <section className="flex items-center gap-3 rounded-xl border border-[var(--tab-popup-border)] bg-[var(--tab-popup-section-gray-bg)] p-3.5 text-sm text-[var(--tab-popup-text)] shadow-lg">
          <LoadingSpinner />
          <p>{t('popup_ai_analyzing')}</p>
        </section>
      )}

      {!isAIEnabled && !isRecommending && recommendedTags.length === 0 && (
        <AIDisabledNotice />
      )}

      {selectedTags.length > 0 && (
        <SelectedTagsSection
          selectedTags={selectedTags}
          toggleTag={toggleTag}
          tagTheme={tagTheme}
        />
      )}

      {currentPage && (
        <PageInfoSection
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          isPublic={isPublic}
          setIsPublic={setIsPublic}
          includeThumbnail={includeThumbnail}
          handleToggleThumbnail={handleToggleThumbnail}
          createSnapshot={createSnapshot}
          setCreateSnapshot={setCreateSnapshot}
          showTitleEdit={showTitleEdit}
          setShowTitleEdit={setShowTitleEdit}
          showDescEdit={showDescEdit}
          setShowDescEdit={setShowDescEdit}
          titleOverride={titleOverride}
          setTitleOverride={setTitleOverride}
          descriptionOverride={descriptionOverride}
          setDescriptionOverride={setDescriptionOverride}
          handleApplyTitleOverride={handleApplyTitleOverride}
          handleApplyDescriptionOverride={handleApplyDescriptionOverride}
        />
      )}

      {recommendedTags.length > 0 && (
        <RecommendedTagsSection
          recommendedTags={recommendedTags}
          selectedTags={selectedTags}
          toggleTag={toggleTag}
          tagTheme={tagTheme}
        />
      )}

      <ExistingTagsSection
        existingTags={existingTags}
        selectedTags={selectedTags}
        toggleTag={toggleTag}
        tagTheme={tagTheme}
        isLoading={isLoading}
      />
    </>
  );
}

function AIDisabledNotice() {
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

function SelectedTagsSection({
  selectedTags,
  toggleTag,
  tagTheme,
}: {
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  tagTheme: TagTheme;
}) {
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
            onClick={() => toggleTag(tag)}
            title={t('tooltip_click_remove_tag')}
            className={getSelectedTagClass(tagTheme)}
          >
            <span className="truncate max-w-[120px]">{tag}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function PageInfoSection({
  currentPage,
  setCurrentPage,
  isPublic,
  setIsPublic,
  includeThumbnail,
  handleToggleThumbnail,
  createSnapshot,
  setCreateSnapshot,
  showTitleEdit,
  setShowTitleEdit,
  showDescEdit,
  setShowDescEdit,
  titleOverride,
  setTitleOverride,
  descriptionOverride,
  setDescriptionOverride,
  handleApplyTitleOverride,
  handleApplyDescriptionOverride,
}: {
  currentPage: NonNullable<BookmarkViewProps['currentPage']>;
  setCurrentPage: (page: any) => void;
  isPublic: boolean;
  setIsPublic: (v: boolean) => void;
  includeThumbnail: boolean;
  handleToggleThumbnail: () => void;
  createSnapshot: boolean;
  setCreateSnapshot: (v: boolean) => void;
  showTitleEdit: boolean;
  setShowTitleEdit: (v: boolean) => void;
  showDescEdit: boolean;
  setShowDescEdit: (v: boolean) => void;
  titleOverride: string;
  setTitleOverride: (v: string) => void;
  descriptionOverride: string;
  setDescriptionOverride: (v: string) => void;
  handleApplyTitleOverride: () => void;
  handleApplyDescriptionOverride: () => void;
}) {
  return (
    <section className="rounded-xl border border-[var(--tab-popup-section-gray-border)] bg-[var(--tab-popup-section-gray-bg)] p-3.5 shadow-lg">
      <div className="mb-3 flex items-center justify-center gap-2">
        <OptionButton
          active={isPublic}
          onClick={() => setIsPublic(!isPublic)}
          title={isPublic ? t('tooltip_public') : t('tooltip_private')}
          activeClass="bg-[var(--tab-popup-action-emerald-bg)] text-[var(--tab-popup-action-emerald-text)] hover:bg-[var(--tab-popup-action-emerald-bg-hover)]"
        >
          {isPublic ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          )}
        </OptionButton>

        <OptionButton
          active={includeThumbnail}
          onClick={handleToggleThumbnail}
          disabled={!currentPage.thumbnail}
          title={includeThumbnail ? t('tooltip_include_thumbnail') : t('tooltip_no_thumbnail')}
          activeClass="bg-[var(--tab-popup-action-amber-bg)] text-[var(--tab-popup-action-amber-text)] hover:bg-[var(--tab-popup-action-amber-bg-hover)]"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </OptionButton>

        <OptionButton
          active={createSnapshot}
          onClick={() => setCreateSnapshot(!createSnapshot)}
          title={createSnapshot ? t('tooltip_create_snapshot') : t('tooltip_no_snapshot')}
          activeClass="bg-[var(--tab-popup-action-purple-bg)] text-[var(--tab-popup-action-purple-text)] hover:bg-[var(--tab-popup-action-purple-bg-hover)]"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </OptionButton>

        <OptionButton
          active={showTitleEdit}
          onClick={() => setShowTitleEdit(!showTitleEdit)}
          title={showTitleEdit ? t('tooltip_edit_title_collapse') : t('tooltip_edit_title_expand')}
          activeClass="bg-[var(--tab-popup-action-blue-bg)] text-[var(--tab-popup-action-blue-text)] hover:bg-[var(--tab-popup-action-blue-bg-hover)]"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </OptionButton>

        <OptionButton
          active={showDescEdit}
          onClick={() => setShowDescEdit(!showDescEdit)}
          title={showDescEdit ? t('tooltip_edit_desc_collapse') : t('tooltip_edit_desc_expand')}
          activeClass="bg-[var(--tab-popup-action-blue-bg)] text-[var(--tab-popup-action-blue-text)] hover:bg-[var(--tab-popup-action-blue-bg-hover)]"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
        </OptionButton>
      </div>

      <div className="mb-2.5 space-y-2">
        {showTitleEdit && (
          <EditInput
            value={titleOverride}
            onChange={setTitleOverride}
            onApply={handleApplyTitleOverride}
            placeholder={t('placeholder_custom_title')}
            disabled={!titleOverride.trim() || !currentPage}
          />
        )}

        {showDescEdit && (
          <EditTextarea
            value={descriptionOverride}
            onChange={setDescriptionOverride}
            onApply={handleApplyDescriptionOverride}
            placeholder={t('placeholder_custom_desc')}
            disabled={!currentPage}
          />
        )}
      </div>

      <PageInfoCard
        title={currentPage.title}
        url={currentPage.url}
        description={currentPage.description}
        thumbnail={includeThumbnail ? currentPage.thumbnail : undefined}
        thumbnails={includeThumbnail ? currentPage.thumbnails : undefined}
        favicon={currentPage.favicon}
        onThumbnailChange={(newThumbnail) => {
          setCurrentPage({ ...currentPage, thumbnail: newThumbnail });
        }}
      />
    </section>
  );
}

function OptionButton({
  active,
  onClick,
  disabled,
  title,
  activeClass,
  children,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  title: string;
  activeClass: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150 ${
        active
          ? activeClass
          : 'bg-[var(--tab-popup-action-neutral-bg)] text-[var(--tab-popup-action-neutral-text)] hover:bg-[var(--tab-popup-action-neutral-bg-hover)]'
      } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
      title={title}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {children}
      </svg>
    </button>
  );
}

function EditInput({
  value,
  onChange,
  onApply,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onApply: () => void;
  placeholder: string;
  disabled: boolean;
}) {
  return (
    <div className="flex gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onApply();
        }}
        placeholder={placeholder}
        className="flex-1 rounded-xl border border-[var(--tab-popup-input-border)] bg-[var(--tab-popup-input-bg)] px-3 py-2 text-sm text-[var(--tab-popup-input-text)] placeholder:text-[var(--tab-popup-input-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--tab-popup-input-focus-ring)] focus:border-[var(--tab-popup-input-focus-border)]"
        autoFocus
      />
      <button
        onClick={onApply}
        disabled={disabled}
        className="rounded-xl bg-gradient-to-r from-[var(--tab-popup-primary-from)] to-[var(--tab-popup-primary-via)] px-4 py-2 text-sm font-medium text-[var(--tab-popup-primary-text)] shadow-sm transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
      >
        {t('popup_apply')}
      </button>
    </div>
  );
}

function EditTextarea({
  value,
  onChange,
  onApply,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onApply: () => void;
  placeholder: string;
  disabled: boolean;
}) {
  return (
    <div className="flex gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.ctrlKey) onApply();
        }}
        placeholder={placeholder}
        rows={2}
        className="flex-1 rounded-xl border border-[var(--tab-popup-input-border)] bg-[var(--tab-popup-input-bg)] px-3 py-2 text-sm text-[var(--tab-popup-input-text)] placeholder:text-[var(--tab-popup-input-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--tab-popup-input-focus-ring)] focus:border-[var(--tab-popup-input-focus-border)] resize-none"
        autoFocus
      />
      <button
        onClick={onApply}
        disabled={disabled}
        className="rounded-xl bg-gradient-to-r from-[var(--tab-popup-primary-from)] to-[var(--tab-popup-primary-via)] px-4 py-2 text-sm font-medium text-[var(--tab-popup-primary-text)] shadow-sm transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
      >
        {t('popup_apply')}
      </button>
    </div>
  );
}

function RecommendedTagsSection({
  recommendedTags,
  selectedTags,
  toggleTag,
  tagTheme,
}: {
  recommendedTags: Array<{ name: string; isNew?: boolean; confidence?: number }>;
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  tagTheme: TagTheme;
}) {
  // 转换为 TagSuggestion 类型
  const tags = recommendedTags.map((t) => ({
    name: t.name,
    isNew: t.isNew ?? false,
    confidence: t.confidence ?? 0.5,
  }));

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
      <TagList tags={tags} selectedTags={selectedTags} onToggle={toggleTag} theme={tagTheme} />
    </section>
  );
}

function ExistingTagsSection({
  existingTags,
  selectedTags,
  toggleTag,
  tagTheme,
  isLoading,
}: {
  existingTags: Array<{ id: string; name: string; color: string; count: number }>;
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  tagTheme: TagTheme;
  isLoading: boolean;
}) {
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
                    onClick={() => toggleTag(tag.name)}
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

import type { TagSuggestion } from '@/types';
import { TAG_CHIP_BASE_CLASS, getSuggestedTagClass, type TagTheme } from '@/lib/utils/tagStyles';
import { t } from '@/lib/i18n';

interface TagListProps {
  tags: TagSuggestion[];
  selectedTags: string[];
  onToggle: (tagName: string) => void;
  theme?: TagTheme;
}

export function TagList({ tags, selectedTags, onToggle, theme = 'classic' }: TagListProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag.name);
        const isNew = tag.isNew;
        const stateClasses = getSuggestedTagClass(theme, isSelected, isNew);

        return (
          <button
            key={tag.name}
            onClick={() => onToggle(tag.name)}
            className={`${TAG_CHIP_BASE_CLASS} ${stateClasses}`}
          >
            <span className="truncate max-w-[110px]">{tag.name}</span>
            {isNew && (
              <span
                className={`ml-1 text-[10px] italic uppercase tracking-widest ${
                  theme === 'bw'
                    ? isSelected
                      ? 'text-[var(--tab-tag-selected-text)]'
                      : 'text-[var(--tab-tag-new-indicator)]'
                    : isSelected
                    ? 'text-[var(--tab-message-warning-icon)]'
                    : 'text-[var(--tab-message-info-icon)]'
                }`}
              >
                {` ${t('tag_new')} `}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

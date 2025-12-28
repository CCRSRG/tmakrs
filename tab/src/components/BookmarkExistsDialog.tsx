import { useState, useEffect } from 'react';
import { StorageService } from '@/lib/utils/storage';
import { LoadingMessage } from '@/components/LoadingMessage';
import { t } from '@/lib/i18n';

interface ExistingBookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  tags: Array<{ id: string; name: string; color: string | null }>;
  has_snapshot?: boolean;
  snapshot_count?: number;
  created_at: string;
}

interface BookmarkExistsDialogProps {
  bookmark: ExistingBookmark;
  newTags: string[];
  onUpdateTags: (tags: string[]) => Promise<void>;
  onUpdateDescription: (description: string) => Promise<void>;
  onCreateSnapshot: () => Promise<void>;
  onCancel: () => void;
}

export function BookmarkExistsDialog({
  bookmark,
  newTags,
  onUpdateTags,
  onUpdateDescription,
  onCreateSnapshot,
  onCancel,
}: BookmarkExistsDialogProps) {
  const [selectedAction, setSelectedAction] = useState<'snapshot' | 'update-tags' | 'update-description' | null>(null);
  const [tmarksUrl, setTmarksUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [descriptionInput, setDescriptionInput] = useState(bookmark.description || '');

  useEffect(() => {
    // Load TMarks URL from storage
    StorageService.getBookmarkSiteApiUrl().then(url => {
      if (url) {
        // Remove /api suffix if present
        const baseUrl = url.replace(/\/api$/, '');
        setTmarksUrl(baseUrl);
      }
    });
  }, []);

  const existingTagNames = bookmark.tags.map(t => t.name);
  const newTagsToAdd = newTags.filter(tag => !existingTagNames.includes(tag));
  const hasNewTags = newTagsToAdd.length > 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleConfirm = async () => {
    if (selectedAction === 'snapshot') {
      setIsProcessing(true);
      setProcessingMessage(t('msg_capturing'));
      
      try {
        await onCreateSnapshot();
        setProcessingMessage(t('msg_snapshot_success'));
        
        setTimeout(() => {
          setIsProcessing(false);
          onCancel();
        }, 1500);
      } catch (error) {
        setProcessingMessage(t('msg_snapshot_failed'));
        setTimeout(() => {
          setIsProcessing(false);
        }, 2000);
      }
    } else if (selectedAction === 'update-tags') {
      setIsProcessing(true);
      setProcessingMessage(t('msg_updating_tags'));
      
      try {
        await onUpdateTags(newTags);
        setProcessingMessage(t('msg_tags_success'));
        
        setTimeout(() => {
          setIsProcessing(false);
          onCancel();
        }, 1500);
      } catch (error) {
        setProcessingMessage(t('msg_tags_failed'));
        setTimeout(() => {
          setIsProcessing(false);
        }, 2000);
      }
    } else if (selectedAction === 'update-description') {
      setIsProcessing(true);
      setProcessingMessage(t('msg_updating_desc'));
      
      try {
        await onUpdateDescription(descriptionInput.trim());
        setProcessingMessage(t('msg_desc_success'));
        
        setTimeout(() => {
          setIsProcessing(false);
          onCancel();
        }, 1500);
      } catch (error) {
        setProcessingMessage(t('msg_desc_failed'));
        setTimeout(() => {
          setIsProcessing(false);
        }, 2000);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[color:var(--tab-overlay)] backdrop-blur-sm animate-in fade-in duration-200">
      {/* Loading Message */}
      {isProcessing && (
        <div className="absolute top-4 left-0 right-0 px-4 z-50">
          <LoadingMessage message={processingMessage} />
        </div>
      )}
      
        <div className="bg-[color:var(--tab-surface)] rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-[color:var(--tab-surface)] border-b border-[color:var(--tab-border)] px-6 py-4 rounded-t-xl">
          <div className="flex items-start gap-3">
            <div className="bg-[color:var(--tab-message-warning-icon-bg)] rounded-full p-2 flex-shrink-0">
              <svg
                className="w-6 h-6 text-[var(--tab-message-warning-icon)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[var(--tab-text)]">
                {t('bookmark_exists_title')}
              </h3>
              <p className="text-sm text-[var(--tab-text-muted)] mt-1">
                {t('bookmark_exists_desc')}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Existing bookmark info */}
          <div className="bg-[color:var(--tab-surface-muted)] rounded-lg p-4 space-y-3">
            <div>
              <div className="text-xs text-[var(--tab-text-muted)] mb-1">{t('label_title')}</div>
              <div className="text-sm font-medium text-[var(--tab-text)]">
                {bookmark.title}
              </div>
            </div>

            <div>
              <div className="text-xs text-[var(--tab-text-muted)] mb-1">{t('label_created_at')}</div>
              <div className="text-sm text-[var(--tab-text)]">
                {formatDate(bookmark.created_at)}
              </div>
            </div>

            {/* Existing description */}
            {bookmark.description && (
              <div>
                <div className="text-xs text-[var(--tab-text-muted)] mb-1">{t('label_description')}</div>
                <div className="text-sm text-[var(--tab-text)]">
                  {bookmark.description}
                </div>
              </div>
            )}

            {/* Existing tags */}
            {bookmark.tags.length > 0 && (
              <div>
                <div className="text-xs text-[var(--tab-text-muted)] mb-2">{t('label_existing_tags')}</div>
                <div className="flex flex-wrap gap-2">
                  {bookmark.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[color:var(--tab-message-info-icon-bg)] text-[var(--tab-message-info-icon)]"
                      style={
                        tag.color
                          ? {
                              backgroundColor: `${tag.color}20`,
                              color: tag.color,
                            }
                          : undefined
                      }
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Snapshot info */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-[var(--tab-text-muted)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-[var(--tab-text)]">
                  {bookmark.has_snapshot
                    ? t('snapshot_count', String(bookmark.snapshot_count || 0))
                    : t('no_snapshot')}
                </span>
              </div>
              {bookmark.has_snapshot && tmarksUrl && (
                <a
                  href={`${tmarksUrl}/bookmarks/${bookmark.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[var(--tab-message-info-icon)] hover:opacity-90 hover:bg-[color:var(--tab-message-info-icon-bg)] rounded transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t('view_snapshot')}
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* New tags hint */}
          {hasNewTags && (
            <div className="bg-[color:var(--tab-message-success-bg)] border border-[color:var(--tab-message-success-border)] rounded-lg p-3">
              <div className="text-xs text-[var(--tab-message-success-icon)] mb-2">
                {t('label_new_tags_detected')}
              </div>
              <div className="flex flex-wrap gap-2">
                {newTagsToAdd.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[color:var(--tab-message-success-icon-bg)] text-[var(--tab-message-success-icon)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action options */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-[var(--tab-text)] mb-3">
              {t('label_select_action')}
            </div>

            {/* Create snapshot */}
            <label
              className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selectedAction === 'snapshot'
                  ? 'border-[color:var(--tab-message-info-icon)] bg-[color:var(--tab-message-info-bg)]'
                  : 'border-[color:var(--tab-border)] hover:border-[color:var(--tab-border-strong)]'
              }`}
            >
              <input
                type="radio"
                name="action"
                value="snapshot"
                checked={selectedAction === 'snapshot'}
                onChange={() => setSelectedAction('snapshot')}
                className="mt-0.5 w-4 h-4 text-[var(--tab-message-info-icon)] focus:ring-[var(--tab-message-info-icon)]"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-[var(--tab-text)]">
                  {t('action_create_snapshot')}
                </div>
                <div className="text-xs text-[var(--tab-text-muted)] mt-1">
                  {t('action_create_snapshot_desc')}
                </div>
              </div>
            </label>

            {/* Update tags */}
            {hasNewTags && (
              <label
                className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedAction === 'update-tags'
                    ? 'border-[color:var(--tab-message-info-icon)] bg-[color:var(--tab-message-info-bg)]'
                    : 'border-[color:var(--tab-border)] hover:border-[color:var(--tab-border-strong)]'
                }`}
              >
                <input
                  type="radio"
                  name="action"
                  value="update-tags"
                  checked={selectedAction === 'update-tags'}
                  onChange={() => setSelectedAction('update-tags')}
                  className="mt-0.5 w-4 h-4 text-[var(--tab-message-info-icon)] focus:ring-[var(--tab-message-info-icon)]"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-[var(--tab-text)]">
                    {t('action_add_tags')}
                  </div>
                  <div className="text-xs text-[var(--tab-text-muted)] mt-1">
                    {t('action_add_tags_desc')}
                  </div>
                </div>
              </label>
            )}

            {/* Update description */}
            <label
              className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selectedAction === 'update-description'
                  ? 'border-[color:var(--tab-message-info-icon)] bg-[color:var(--tab-message-info-bg)]'
                  : 'border-[color:var(--tab-border)] hover:border-[color:var(--tab-border-strong)]'
              }`}
            >
              <input
                type="radio"
                name="action"
                value="update-description"
                checked={selectedAction === 'update-description'}
                onChange={() => setSelectedAction('update-description')}
                className="mt-0.5 w-4 h-4 text-[var(--tab-message-info-icon)] focus:ring-[var(--tab-message-info-icon)]"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-[var(--tab-text)]">
                  {t('action_update_desc')}
                </div>
                <div className="text-xs text-[var(--tab-text-muted)] mt-1">
                  {t('action_update_desc_desc')}
                </div>
                {selectedAction === 'update-description' && (
                  <textarea
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                    placeholder={t('placeholder_new_desc')}
                    rows={3}
                    className="mt-2 w-full rounded-lg border border-[color:var(--tab-border-strong)] bg-[color:var(--tab-surface)] px-3 py-2 text-sm text-[var(--tab-text)] placeholder:text-[var(--tab-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--tab-message-info-icon)] resize-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[color:var(--tab-surface-muted)] border-t border-[color:var(--tab-border)] px-6 py-4 rounded-b-xl flex gap-3">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--tab-text)] bg-[color:var(--tab-surface)] border border-[color:var(--tab-border-strong)] rounded-lg hover:bg-[color:var(--tab-surface-muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t('btn_cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedAction || isProcessing}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--tab-popup-primary-text)] bg-[var(--tab-popup-primary-from)] rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? t('btn_processing') : t('btn_confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 备忘录组件 - 网格版本
 */

import { useState, useEffect, useRef, memo } from 'react';
import { StickyNote } from 'lucide-react';
import { t } from '@/lib/i18n';
import type { WidgetRendererProps } from './types';

const NOTES_STORAGE_KEY = 'newtab_notes';

export const NotesWidget = memo(function NotesWidget({
  item: _item,
  onRemove: _onRemove,
  isEditing: _isEditing,
}: WidgetRendererProps) {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // 加载笔记
  useEffect(() => {
    chrome.storage.local.get(NOTES_STORAGE_KEY).then((result) => {
      const data = result[NOTES_STORAGE_KEY] as { content: string; updatedAt: number } | undefined;
      if (data?.content) {
        setContent(data.content);
      }
    });
  }, []);

  // 自动保存
  const handleChange = (value: string) => {
    setContent(value);
    setIsSaving(true);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      chrome.storage.local.set({
        [NOTES_STORAGE_KEY]: { content: value, updatedAt: Date.now() },
      });
      setIsSaving(false);
    }, 500);
  };

  return (
    <div className="group relative h-full p-3 rounded-xl glass-card flex flex-col">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-white/80">
          <StickyNote className="w-4 h-4" />
          <span className="text-sm font-medium">{t('widget_notes_title')}</span>
        </div>
        {isSaving && (
          <span className="text-xs text-white/40">{t('btn_saving')}</span>
        )}
      </div>

      {/* 文本区域 */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={t('widget_notes_placeholder')}
        className="flex-1 w-full bg-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none 
                   border border-white/10 focus:border-white/30 placeholder-white/40 resize-none"
      />
    </div>
  );
});

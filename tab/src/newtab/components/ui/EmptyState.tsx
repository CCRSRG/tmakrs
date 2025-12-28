/**
 * iOS 风格空状态组件
 */

import { Inbox, Search, Bookmark, CheckSquare, FileText, TrendingUp } from 'lucide-react';
import { t } from '@/lib/i18n';

type EmptyStateType = 'default' | 'search' | 'bookmark' | 'todo' | 'notes' | 'hotsearch';

interface EmptyStateProps {
  type?: EmptyStateType;
  message?: string;
  description?: string;
}

const ICONS: Record<EmptyStateType, React.ReactNode> = {
  default: <Inbox className="w-8 h-8" />,
  search: <Search className="w-8 h-8" />,
  bookmark: <Bookmark className="w-8 h-8" />,
  todo: <CheckSquare className="w-8 h-8" />,
  notes: <FileText className="w-8 h-8" />,
  hotsearch: <TrendingUp className="w-8 h-8" />,
};

const getDefaultMessage = (type: EmptyStateType): string => {
  const messages: Record<EmptyStateType, string> = {
    default: t('empty_default'),
    search: t('empty_search'),
    bookmark: t('empty_bookmark'),
    todo: t('empty_todo'),
    notes: t('empty_notes'),
    hotsearch: t('empty_hotsearch'),
  };
  return messages[type];
};

export function EmptyState({
  type = 'default',
  message,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-white/40">
      <div className="mb-2 opacity-50">
        {ICONS[type]}
      </div>
      <p className="text-sm">{message || getDefaultMessage(type)}</p>
      {description && (
        <p className="text-xs text-white/30 mt-1">{description}</p>
      )}
    </div>
  );
}

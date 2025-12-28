/**
 * 编辑按钮组件
 */

import { memo } from 'react';
import { Settings2, Check } from 'lucide-react';
import { t } from '@/lib/i18n';

interface EditButtonProps {
  isEditing: boolean;
  onToggle: () => void;
}

export const EditButton = memo(function EditButton({ isEditing, onToggle }: EditButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={onToggle}
        className={`p-3 rounded-full shadow-lg transition-all ${
          isEditing
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'glass hover:bg-white/20 text-white/70'
        }`}
        title={isEditing ? t('newtab_edit_done') : t('newtab_edit_layout')}
      >
        {isEditing ? <Check className="w-5 h-5" /> : <Settings2 className="w-5 h-5" />}
      </button>
    </div>
  );
});

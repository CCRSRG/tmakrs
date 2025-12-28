import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Folder, X } from 'lucide-react';
import { t } from '@/lib/i18n';
import { Z_INDEX } from '../constants/z-index';

interface AddBookmarkFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  initialName?: string;
}

export function AddBookmarkFolderModal({
  isOpen,
  onClose,
  onSave,
  initialName,
}: AddBookmarkFolderModalProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    setName(initialName || '');
  }, [initialName, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim());
    setName('');
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 animate-fadeIn"
      style={{ zIndex: Z_INDEX.MODAL_BACKDROP }}
      onClick={onClose}
    >
      <div
        className="relative w-80 rounded-2xl glass-modal-dark overflow-hidden"
        style={{ zIndex: Z_INDEX.MODAL_CONTENT, animation: 'modalScale 0.2s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-white/70" />
            <h3 className="text-base font-medium text-white">{t('modal_new_folder')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('placeholder_folder_name')}
            className="w-full bg-white/10 text-white text-sm rounded-lg px-3 py-2.5 outline-none border border-white/10 focus:border-white/30 placeholder-white/40"
            autoFocus
          />

          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70 text-sm"
            >
              {t('btn_cancel')}
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white text-sm"
            >
              {t('btn_create')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

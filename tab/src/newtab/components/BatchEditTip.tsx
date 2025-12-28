/**
 * 批量编辑模式提示组件
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, MousePointerClick } from 'lucide-react';
import { t } from '@/lib/i18n';
import { Z_INDEX } from '../constants/z-index';

const STORAGE_KEY = 'tmarks_batch_edit_tip_dismissed';

interface BatchEditTipProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BatchEditTip({ isOpen, onClose }: BatchEditTipProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // 检查是否已经选择不再显示
      const dismissed = localStorage.getItem(STORAGE_KEY);
      setShouldShow(dismissed !== 'true');
    }
  }, [isOpen]);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    onClose();
  };

  if (!isOpen || !shouldShow) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
      style={{ zIndex: Z_INDEX.MODAL_BACKDROP }}
      onClick={handleClose}
    >
      <div
        className="relative w-[min(420px,calc(100vw-32px))] rounded-2xl glass-modal p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-blue-500/20">
            <MousePointerClick className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">{t('batch_edit_mode')}</h3>
        </div>

        <div className="space-y-3 text-sm text-white/80">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/30 text-blue-300 flex items-center justify-center text-xs font-medium">
              1
            </span>
            <div>
              <p className="font-medium text-white/90">{t('batch_tip_click')}</p>
              <p className="text-white/60 text-xs mt-0.5">{t('batch_tip_click_desc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/30 text-purple-300 flex items-center justify-center text-xs font-medium">
              2
            </span>
            <div>
              <p className="font-medium text-white/90">{t('batch_tip_double_click')}</p>
              <p className="text-white/60 text-xs mt-0.5">{t('batch_tip_double_click_desc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/30 text-amber-300 flex items-center justify-center text-xs font-medium">
              !
            </span>
            <div>
              <p className="font-medium text-white/90">{t('batch_tip_auto_delete')}</p>
              <p className="text-white/60 text-xs mt-0.5">{t('batch_tip_auto_delete_desc')}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-white/10">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500/50"
            />
            <span className="text-xs text-white/60">{t('batch_tip_dont_show')}</span>
          </label>
        </div>

        <button
          onClick={handleClose}
          className="mt-4 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
        >
          {t('batch_tip_got_it')}
        </button>
      </div>
    </div>,
    document.body
  );
}

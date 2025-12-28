/**
 * 组件选择器 - 用于添加新组件到网格
 */

import { memo } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Link, Cloud, Clock, CheckSquare, StickyNote, TrendingUp, BookOpen, Folder } from 'lucide-react';
import type { GridItemType } from '../../types';
import { getWidgetRegistry } from './widgetRegistry';
import { t } from '@/lib/i18n';

// 图标映射
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Link,
  Folder,
  Cloud,
  Clock,
  CheckSquare,
  StickyNote,
  TrendingUp,
  BookOpen,
};

interface WidgetSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: GridItemType) => void;
  excludeTypes?: GridItemType[];
}

export const WidgetSelector = memo(function WidgetSelector({
  isOpen,
  onClose,
  onSelect,
  excludeTypes = [],
}: WidgetSelectorProps) {
  if (!isOpen) return null;

  // 获取动态注册表（支持 i18n）
  const widgetRegistry = getWidgetRegistry();
  
  // 过滤掉已排除的类型
  const availableWidgets = Object.values(widgetRegistry).filter(
    (widget) => !excludeTypes.includes(widget.type)
  );

  const handleSelect = (type: GridItemType) => {
    onSelect(type);
    onClose();
  };

  return createPortal(
    <>
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black/50 z-[100] animate-fadeIn"
        onClick={onClose}
      />
      
      {/* 选择器面板 */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] 
                      w-full max-w-md p-6 rounded-2xl glass-modal" style={{ animation: 'modalScale 0.2s ease-out' }}>
        {/* 标题 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">{t('widget_selector_title')}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* 组件列表 */}
        <div className="grid grid-cols-2 gap-3">
          {availableWidgets.map((widget) => {
            const IconComponent = ICON_MAP[widget.icon] || Plus;
            return (
              <button
                key={widget.type}
                onClick={() => handleSelect(widget.type)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl 
                           bg-white/5 hover:bg-white/10 border border-white/10 
                           hover:border-white/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center
                                group-hover:bg-white/20 transition-colors">
                  <IconComponent className="w-5 h-5 text-white/70" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-white/90">{widget.name}</div>
                  <div className="text-xs text-white/50 mt-0.5">{widget.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 提示 */}
        <p className="mt-4 text-xs text-white/40 text-center">
          {t('widget_selector_hint')}
        </p>
      </div>
    </>,
    document.body
  );
});

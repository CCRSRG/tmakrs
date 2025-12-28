/**
 * 批量编辑快捷方式弹窗
 */

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { FolderInput, CheckCircle2 } from 'lucide-react';
import { t } from '@/lib/i18n';
import { ConfirmModal } from './ui/ConfirmModal';
import { useNewtabStore } from '../hooks/useNewtabStore';
import { Z_INDEX } from '../constants/z-index';

interface BatchEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: Set<string>;
  onSelectedIdsChange: (next: Set<string>) => void;
}

export function BatchEditModal({ isOpen, onClose, selectedIds, onSelectedIdsChange }: BatchEditModalProps) {
  const { shortcutGroups, getFilteredGridItems, removeGridItem, updateGridItem, activeGroupId, currentFolderId, gridItems, cleanupAllEmptyFolders, cleanupEmptyGroups } =
    useNewtabStore();
  const [targetGroupId, setTargetGroupId] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 与主界面视图一致：直接取当前视图的过滤结果
  const filteredItems = useMemo(() => {
    const inView = getFilteredGridItems();
    return inView.sort((a, b) => a.position - b.position);
  }, [getFilteredGridItems, activeGroupId, currentFolderId, gridItems]);

  useEffect(() => {
    if (!isOpen) {
      setTargetGroupId('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectAll = () => {
    // 检查当前视图中的所有项目是否都已选中
    const allSelected = filteredItems.length > 0 && filteredItems.every((i) => selectedIds.has(i.id));
    
    if (allSelected) {
      // 取消选择当前视图中的所有项目
      const next = new Set(selectedIds);
      filteredItems.forEach((i) => next.delete(i.id));
      onSelectedIdsChange(next);
    } else {
      // 选择当前视图中的所有项目
      const next = new Set(selectedIds);
      filteredItems.forEach((i) => next.add(i.id));
      onSelectedIdsChange(next);
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    setShowDeleteConfirm(true);
  };

  const confirmBatchDelete = () => {
    selectedIds.forEach(id => removeGridItem(id));
    onSelectedIdsChange(new Set());
    setShowDeleteConfirm(false);
  };

  const handleBatchMove = () => {
    if (selectedIds.size === 0 || !targetGroupId) return;
    
    selectedIds.forEach(id => {
      const item = gridItems.find(i => i.id === id);
      if (!item) return;
      
      // 如果目标分组和当前分组相同，且已经在根目录，跳过
      if (item.groupId === targetGroupId && !item.parentId) return;
      
      // 更新 groupId 和清除 parentId（移动到分组根目录）
      updateGridItem(id, { groupId: targetGroupId, parentId: undefined });
    });
    
    // cleanupEmptyGroups 会在 updateGridItem 后自动触发（如果需要的话）
    // 但 updateGridItem 本身不会触发，所以这里手动调用一次
    setTimeout(() => {
      cleanupAllEmptyFolders();
      cleanupEmptyGroups();
    }, 100);
    
    onSelectedIdsChange(new Set());
    onClose();
  };

  const handleComplete = () => {
    onSelectedIdsChange(new Set());
    setTargetGroupId('');
    onClose();
  };

  const isAllSelected = filteredItems.length > 0 && filteredItems.every((i) => selectedIds.has(i.id));

  return createPortal(
    <>
      <div
        className="fixed bottom-20 left-1/2 -translate-x-1/2"
        style={{ zIndex: Z_INDEX.BATCH_EDIT_BAR }}
      >
        <div
          className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl glass-dark shadow-2xl w-[min(920px,calc(100vw-32px))]"
          style={{
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 18px 42px rgba(0,0,0,0.42)',
          }}
        >
          <button
            onClick={handleSelectAll}
            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-xs text-white/80"
          >
            {isAllSelected ? t('batch_deselect_all') : t('batch_select_all')}
          </button>

          <span className="flex items-center gap-1 text-xs text-white/70 min-w-[76px]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t('batch_selected_count', selectedIds.size.toString())}
          </span>

          <div className="h-5 w-px bg-white/15" />

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleComplete}
              className="px-3 py-1.5 rounded-full bg-green-500/20 text-green-300 hover:bg-green-500/30 transition-colors text-xs"
            >
              {t('batch_complete')}
            </button>
            <button
              onClick={handleComplete}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-xs text-white/80"
            >
              {t('btn_cancel')}
            </button>
            <button
              onClick={handleBatchDelete}
              disabled={selectedIds.size === 0}
              className="px-3 py-1.5 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors disabled:opacity-30 text-xs"
            >
              {t('ui_delete')}
            </button>
          </div>

          <div className="h-5 w-px bg-white/15" />

          <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
            <FolderInput className="w-4 h-4 text-white/70" />
            <select
              value={targetGroupId}
              onChange={(e) => setTargetGroupId(e.target.value)}
              className="bg-white/10 text-white text-xs rounded-xl px-3 py-2 outline-none border border-white/15 min-w-[140px] max-w-[280px]"
            >
              <option value="">{t('batch_select_group')}</option>
              {shortcutGroups.map((group) => (
                <option key={group.id} value={group.id} className="bg-slate-900 text-white">
                  {group.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleBatchMove}
              disabled={!targetGroupId || selectedIds.size === 0}
              className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-medium transition-colors disabled:opacity-40"
            >
              {t('batch_move')}
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title={t('batch_delete_confirm_title')}
        message={t('batch_delete_confirm_message', selectedIds.size.toString())}
        confirmText={t('ui_delete')}
        cancelText={t('btn_cancel')}
        confirmVariant="danger"
        onConfirm={confirmBatchDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>,
    document.body
  );
}

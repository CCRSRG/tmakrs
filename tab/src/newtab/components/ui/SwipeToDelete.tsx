/**
 * iOS 风格滑动删除组件
 */

import { useState, useRef, useCallback, type ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { t } from '@/lib/i18n';

interface SwipeToDeleteProps {
  children: ReactNode;
  onDelete: () => void;
  deleteText?: string;
  threshold?: number;
  disabled?: boolean;
}

export function SwipeToDelete({
  children,
  onDelete,
  deleteText,
  threshold = 80,
  disabled = false,
}: SwipeToDeleteProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const finalDeleteText = deleteText || t('ui_delete');

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    isDraggingRef.current = true;
  }, [disabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDraggingRef.current || disabled) return;
    
    currentXRef.current = e.touches[0].clientX;
    const diff = currentXRef.current - startXRef.current;
    
    // 只允许向左滑动
    if (diff < 0) {
      // 添加阻尼效果
      const dampedDiff = diff * 0.5;
      setTranslateX(Math.max(dampedDiff, -threshold * 1.5));
    }
  }, [disabled, threshold]);

  const handleTouchEnd = useCallback(() => {
    if (!isDraggingRef.current || disabled) return;
    isDraggingRef.current = false;

    if (translateX < -threshold) {
      // 触发删除
      setIsDeleting(true);
      setTranslateX(-threshold);
    } else {
      // 回弹
      setTranslateX(0);
    }
  }, [disabled, threshold, translateX]);

  const handleDelete = useCallback(() => {
    setTranslateX(-300); // 滑出屏幕
    setTimeout(() => {
      onDelete();
      setTranslateX(0);
      setIsDeleting(false);
    }, 200);
  }, [onDelete]);

  const handleCancel = useCallback(() => {
    setTranslateX(0);
    setIsDeleting(false);
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* 删除按钮背景 */}
      <div 
        className="absolute inset-y-0 right-0 flex items-center bg-red-500"
        style={{ width: threshold }}
      >
        <button
          onClick={isDeleting ? handleDelete : undefined}
          className="w-full h-full flex items-center justify-center text-white"
        >
          <Trash2 className="w-5 h-5" />
          <span className="ml-1 text-sm font-medium">{finalDeleteText}</span>
        </button>
      </div>

      {/* 内容 */}
      <div
        className="relative bg-inherit transition-transform duration-200 ease-out"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDraggingRef.current ? 'none' : undefined,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={isDeleting ? handleCancel : undefined}
      >
        {children}
      </div>
    </div>
  );
}

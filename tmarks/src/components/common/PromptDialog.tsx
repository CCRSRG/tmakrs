import { useState, useEffect } from 'react'
import { Z_INDEX } from '@/lib/constants/z-index'

interface PromptDialogProps {
  isOpen: boolean
  title: string
  message?: string
  placeholder?: string
  defaultValue?: string
  confirmText?: string
  cancelText?: string
  onConfirm: (value: string) => void
  onCancel: () => void
}

export function PromptDialog({
  isOpen,
  title,
  message,
  placeholder,
  defaultValue = '',
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  onCancel,
}: PromptDialogProps) {
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue)
    }
  }, [isOpen, defaultValue])

  const handleConfirm = () => {
    onConfirm(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm()
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      style={{ zIndex: Z_INDEX.DIALOG }}
      onClick={onCancel}
    >
      <div
        className="card rounded-2xl shadow-2xl w-full max-w-sm border border-border animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题 */}
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
        </div>

        {/* 内容 */}
        <div className="px-6 py-4 space-y-4">
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
      
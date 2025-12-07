import { create } from 'zustand'

// 确认对话框配置
export interface ConfirmOptions {
  title: string
  message: string
  type?: 'info' | 'warning' | 'error'
  confirmText?: string
  cancelText?: string
}

// 输入对话框配置
export interface PromptOptions {
  title: string
  message?: string
  placeholder?: string
  defaultValue?: string
  confirmText?: string
  cancelText?: string
}

// 确认对话框状态
interface ConfirmState extends ConfirmOptions {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

// 输入对话框状态
interface PromptState extends PromptOptions {
  isOpen: boolean
  onConfirm: (value: string) => void
  onCancel: () => void
}

interface DialogState {
  // 确认对话框
  confirm: ConfirmState | null
  showConfirm: (options: ConfirmOptions) => Promise<boolean>

  // 输入对话框
  prompt: PromptState | null
  showPrompt: (options: PromptOptions) => Promise<string | null>
}

export const useDialogStore = create<DialogState>((set) => ({
  // 确认对话框
  confirm: null,
  showConfirm: (options) => {
    return new Promise((resolve) => {
      set({
        confirm: {
          isOpen: true,
          type: 'warning',
          confirmText: '确定',
          cancelText: '取消',
          ...options,
          onConfirm: () => {
            resolve(true)
            set({ confirm: null })
          },
          onCancel: () => {
            resolve(false)
            set({ confirm: null })
          },
        },
      })
    })
  },

  // 输入对话框
  prompt: null,
  showPrompt: (options) => {
    return new Promise((resolve) => {
      set({
        prompt: {
          isOpen: true,
          confirmText: '确定',
          cancelText: '取消',
          ...options,
          onConfirm: (value: string) => {
            resolve(value)
            set({ prompt: null })
          },
          onCancel: () => {
            resolve(null)
            set({ prompt: null })
          },
        },
      })
    })
  },
}))

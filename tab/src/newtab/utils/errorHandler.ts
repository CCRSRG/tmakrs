/**
 * 统一错误处理工具
 */

import { t } from '@/lib/i18n';
import { toast } from '../components/ui/Toast';

// 错误类型
export type ErrorType = 'network' | 'storage' | 'sync' | 'bookmark' | 'unknown';

// 获取错误消息
const getErrorMessage = (type: ErrorType): string => {
  const messages: Record<ErrorType, string> = {
    network: t('error_network'),
    storage: t('error_storage'),
    sync: t('error_sync'),
    bookmark: t('error_bookmark'),
    unknown: t('error_unknown_operation'),
  };
  return messages[type];
};

// 错误日志
interface ErrorLog {
  type: ErrorType;
  message: string;
  error: unknown;
  timestamp: number;
}

const errorLogs: ErrorLog[] = [];
const MAX_LOGS = 50;

/**
 * 处理错误并显示 Toast
 */
export function handleError(
  error: unknown,
  type: ErrorType = 'unknown',
  showToast = true
): string {
  const message = error instanceof Error ? error.message : getErrorMessage(type);
  
  // 记录错误日志
  errorLogs.push({
    type,
    message,
    error,
    timestamp: Date.now(),
  });
  
  // 保持日志数量限制
  if (errorLogs.length > MAX_LOGS) {
    errorLogs.shift();
  }
  
  // 控制台输出
  console.error(`[${type.toUpperCase()}]`, message, error);
  
  // 显示 Toast
  if (showToast) {
    toast.error(message);
  }
  
  return message;
}

/**
 * 安全执行异步操作
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  options: {
    type?: ErrorType;
    showToast?: boolean;
    fallback?: T;
    onError?: (error: unknown) => void;
  } = {}
): Promise<T | undefined> {
  const { type = 'unknown', showToast = true, fallback, onError } = options;
  
  try {
    return await fn();
  } catch (error) {
    handleError(error, type, showToast);
    onError?.(error);
    return fallback;
  }
}

/**
 * 获取错误日志
 */
export function getErrorLogs(): readonly ErrorLog[] {
  return errorLogs;
}

/**
 * 清除错误日志
 */
export function clearErrorLogs(): void {
  errorLogs.length = 0;
}

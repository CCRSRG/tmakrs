/**
 * i18n 国际化工具
 * 支持手动语言切换
 */

// 支持的语言列表
export const SUPPORTED_LANGUAGES = [
  { code: 'zh_CN', name: '简体中文', nativeName: '简体中文' },
  { code: 'en', name: 'English', nativeName: 'English' },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

// 语言存储键
const LANGUAGE_STORAGE_KEY = 'tmarks_language';

// 当前语言（内存缓存）
let currentLanguage: LanguageCode | null = null;

// 翻译消息缓存
const messagesCache: Record<string, Record<string, { message: string; placeholders?: Record<string, { content: string }> }>> = {};

/**
 * 获取浏览器默认语言
 */
function getBrowserLanguage(): LanguageCode {
  try {
    if (typeof chrome !== 'undefined' && chrome.i18n) {
      const lang = chrome.i18n.getUILanguage();
      if (lang.startsWith('zh')) return 'zh_CN';
    }
    const navLang = navigator.language;
    if (navLang.startsWith('zh')) return 'zh_CN';
  } catch {
    // ignore
  }
  return 'en';
}

/**
 * 获取当前语言设置
 */
export async function getCurrentLanguage(): Promise<LanguageCode> {
  if (currentLanguage) return currentLanguage;

  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const result = await chrome.storage.local.get(LANGUAGE_STORAGE_KEY);
      if (result[LANGUAGE_STORAGE_KEY]) {
        currentLanguage = result[LANGUAGE_STORAGE_KEY] as LanguageCode;
        return currentLanguage;
      }
    }
  } catch {
    // ignore
  }

  currentLanguage = getBrowserLanguage();
  return currentLanguage;
}

/**
 * 同步获取当前语言（使用缓存）
 */
export function getCurrentLanguageSync(): LanguageCode {
  return currentLanguage || getBrowserLanguage();
}

/**
 * 设置语言
 */
export async function setLanguage(lang: LanguageCode): Promise<void> {
  currentLanguage = lang;

  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.set({ [LANGUAGE_STORAGE_KEY]: lang });
    }
  } catch {
    // ignore
  }

  // 清除消息缓存，强制重新加载
  delete messagesCache[lang];
}

/**
 * 加载翻译消息
 */
async function loadMessages(lang: LanguageCode): Promise<Record<string, { message: string; placeholders?: Record<string, { content: string }> }>> {
  if (messagesCache[lang]) {
    return messagesCache[lang];
  }

  try {
    // 尝试从扩展资源加载
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      const url = chrome.runtime.getURL(`_locales/${lang}/messages.json`);
      const response = await fetch(url);
      if (response.ok) {
        const messages = await response.json();
        messagesCache[lang] = messages;
        return messages;
      }
    }
  } catch {
    // ignore
  }

  // 后备：返回空对象
  return {};
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 获取国际化消息
 */
export function getMessage(messageName: string, substitutions?: string | string[]): string {
  const lang = getCurrentLanguageSync();
  const messages = messagesCache[lang];

  if (messages && messages[messageName]) {
    let message = messages[messageName].message;
    const messageEntry = messages[messageName];

    // 处理替换参数
    if (substitutions) {
      const subs = Array.isArray(substitutions) ? substitutions : [substitutions];
      
      // 如果有 placeholders 定义，使用命名占位符替换
      if (messageEntry.placeholders) {
        const placeholderNames = Object.keys(messageEntry.placeholders);
        placeholderNames.forEach((name) => {
          const placeholder = messageEntry.placeholders![name];
          // placeholder.content 格式为 "$1", "$2" 等
          const indexMatch = placeholder.content.match(/^\$(\d+)$/);
          if (indexMatch) {
            const index = parseInt(indexMatch[1], 10) - 1;
            if (index >= 0 && index < subs.length) {
              // 替换 $name$ 格式的占位符
              // 使用 split/join 避免正则替换中 $ 的特殊含义问题
              const placeholder_pattern = '$' + name + '$';
              message = message.split(placeholder_pattern).join(subs[index]);
            }
          }
        });
      } else {
        // 后备：直接替换 $1, $2 等位置占位符
        subs.forEach((sub, index) => {
          const placeholder_pattern = '$' + (index + 1);
          message = message.split(placeholder_pattern).join(sub);
        });
      }
    }

    return message;
  }

  // 后备：使用 Chrome i18n API
  try {
    if (typeof chrome !== 'undefined' && chrome.i18n) {
      const message = chrome.i18n.getMessage(messageName, substitutions);
      if (message) return message;
    }
  } catch {
    // ignore
  }

  return messageName;
}

/**
 * 简写别名
 */
export const t = getMessage;

/**
 * 获取当前语言（兼容旧 API）
 */
export function getUILanguage(): string {
  return getCurrentLanguageSync();
}

/**
 * 检查是否为中文环境
 */
export function isChineseLocale(): boolean {
  const lang = getCurrentLanguageSync();
  return lang.startsWith('zh');
}

/**
 * 初始化 i18n（应在应用启动时调用）
 */
export async function initI18n(): Promise<void> {
  const lang = await getCurrentLanguage();
  await loadMessages(lang);
}

/**
 * React Hook: 获取 i18n 函数
 */
export function useI18n() {
  return {
    t: getMessage,
    getMessage,
    getUILanguage,
    isChineseLocale,
    getCurrentLanguage: getCurrentLanguageSync,
    setLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
}

export default {
  getMessage,
  t,
  getUILanguage,
  isChineseLocale,
  initI18n,
  getCurrentLanguage,
  getCurrentLanguageSync,
  setLanguage,
  useI18n,
  SUPPORTED_LANGUAGES,
};

/**
 * 设置面板基础组件
 */

import { useState, useEffect } from 'react';
import { t } from '@/lib/i18n';
import { useNewtabStore } from '../../../hooks/useNewtabStore';

// 设置分组
export function SettingSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 rounded-xl p-4">
      <h3 className="text-sm font-medium text-white/80 mb-4">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

// 开关项
export function ToggleItem({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-white/80">{label}</span>
      <button
        onClick={() => {
          if (disabled) return;
          onChange(!checked);
        }}
        disabled={disabled}
        className={`w-10 h-6 rounded-full transition-colors ${
          disabled ? 'bg-white/10 cursor-not-allowed' : checked ? 'bg-blue-500' : 'bg-white/20'
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white transition-transform mx-1 ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

// 选择项
export function SelectItem({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-white/80">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white/10 text-white text-sm rounded-lg px-3 py-1.5 outline-none border border-white/10"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-gray-800">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// 颜色选择
export function ColorItem({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-white/80">{label}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded cursor-pointer"
      />
    </div>
  );
}

// 文本输入
export function TextItem({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-white/80 flex-shrink-0">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-white/10 text-white text-sm rounded-lg px-3 py-1.5 outline-none border border-white/10"
      />
    </div>
  );
}

// 滑块
export function RangeItem({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-white/80">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="range"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-24"
        />
        <span className="text-xs text-white/60 w-8">{value}</span>
      </div>
    </div>
  );
}

// 缓存图标按钮
export function CacheFaviconsButton() {
  const { shortcuts, updateShortcut, gridItems, updateGridItem } = useNewtabStore();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [storageInfo, setStorageInfo] = useState<{ used: number; total: number } | null>(null);

  useEffect(() => {
    const loadStorageInfo = async () => {
      try {
        const bytes = await chrome.storage.local.getBytesInUse();
        const quota = chrome.storage.local.QUOTA_BYTES || 10485760;
        setStorageInfo({ used: bytes, total: quota });
      } catch (error) {
        console.error('Failed to get storage info:', error);
      }
    };
    loadStorageInfo();
  }, [isLoading]);

  const handleCacheFavicons = async () => {
    setIsLoading(true);
    setProgress({ current: 0, total: 0 });

    try {
      const { batchDownloadFavicons } = await import('../../../utils/favicon');
      let totalCached = 0;
      
      if (shortcuts.length > 0) {
        const results = await batchDownloadFavicons(shortcuts, (current, total) => {
          setProgress({ current, total });
        });
        
        results.forEach((base64, id) => {
          updateShortcut(id, { faviconBase64: base64 });
        });
        totalCached += results.size;
      }

      const gridShortcuts = gridItems.filter(item => item.type === 'shortcut' && item.shortcut);
      if (gridShortcuts.length > 0) {
        const gridResults = await batchDownloadFavicons(
          gridShortcuts.map(item => ({
            id: item.id,
            url: item.shortcut!.url,
            favicon: item.shortcut!.favicon,
            faviconBase64: item.shortcut!.faviconBase64,
          })),
          (current, total) => {
            setProgress({ current: current + shortcuts.length, total: total + shortcuts.length });
          }
        );

        gridResults.forEach((base64, id) => {
          const item = gridItems.find(i => i.id === id);
          if (item?.shortcut) {
            updateGridItem(id, {
              shortcut: {
                ...item.shortcut,
                faviconBase64: base64,
              },
            });
          }
        });
        totalCached += gridResults.size;
      }

      alert(t('settings_cache_success', totalCached.toString()));
    } catch (error) {
      console.error('Failed to cache favicons:', error);
      alert(t('settings_cache_failed'));
    } finally {
      setIsLoading(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const totalShortcuts = shortcuts.length + gridItems.filter(item => item.type === 'shortcut').length;
  const cachedCount = shortcuts.filter(s => s.faviconBase64).length + 
    gridItems.filter(item => item.type === 'shortcut' && item.shortcut?.faviconBase64).length;

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-sm text-white/80">{t('settings_cache_download')}</div>
          <div className="text-xs text-white/50 mt-1">
            {t('settings_cache_count', [cachedCount.toString(), totalShortcuts.toString()])}
          </div>
          {storageInfo && (
            <div className="text-xs text-white/40 mt-0.5">
              {t('settings_storage_usage', [formatBytes(storageInfo.used), formatBytes(storageInfo.total), ((storageInfo.used / storageInfo.total) * 100).toFixed(1)])}
            </div>
          )}
        </div>
        <button
          onClick={handleCacheFavicons}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-white/20 text-white text-sm transition-colors"
        >
          {isLoading ? t('settings_caching') : t('settings_cache_now')}
        </button>
      </div>
      {isLoading && progress.total > 0 && (
        <div className="space-y-1">
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
          <div className="text-xs text-white/50 text-center">
            {progress.current} / {progress.total}
          </div>
        </div>
      )}
      <div className="text-xs text-white/40 leading-relaxed">
        {t('settings_cache_hint')}
      </div>
    </div>
  );
}

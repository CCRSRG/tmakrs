/**
 * 组件配置弹窗 - 用于配置组件的设置和尺寸
 */

import { useState, memo } from 'react';
import { createPortal } from 'react-dom';
import { X, Maximize2 } from 'lucide-react';
import { t } from '@/lib/i18n';
import type { GridItem, GridItemSize } from '../../types';
import { getWidgetRegistry, getSizeSpan } from './widgetRegistry';

interface WidgetConfigModalProps {
  item: GridItem;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<GridItem>) => void;
  onRemove: (id: string) => void;
}

// 尺寸选项显示名称
const getSizeLabel = (size: GridItemSize): string => {
  const labels: Record<GridItemSize, string> = {
    '1x1': t('widget_size_small'),
    '2x1': t('widget_size_wide'),
    '1x2': t('widget_size_tall'),
    '2x2': t('widget_size_medium'),
    '2x3': t('widget_size_large'),
    '2x4': t('widget_size_xlarge'),
  };
  return labels[size];
};

export const WidgetConfigModal = memo(function WidgetConfigModal({
  item,
  isOpen,
  onClose,
  onUpdate,
  onRemove,
}: WidgetConfigModalProps) {
  const [localConfig, setLocalConfig] = useState(item.config || {});
  const registry = getWidgetRegistry();
  const meta = registry[item.type];

  if (!isOpen) return null;

  const handleSizeChange = (size: GridItemSize) => {
    onUpdate(item.id, { size });
  };

  const handleConfigChange = (_key: string, value: any) => {
    const newConfig = { ...localConfig, [item.type]: { ...localConfig[item.type as keyof typeof localConfig], ...value } };
    setLocalConfig(newConfig);
    onUpdate(item.id, { config: newConfig });
  };

  const handleRemove = () => {
    onRemove(item.id);
    onClose();
  };

  return createPortal(
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* 弹窗 */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] w-[360px] max-w-[90vw]" style={{ animation: 'modalScale 0.2s ease-out' }}>
        <div className="glass-modal rounded-2xl p-5 border border-white/10">
          {/* 标题栏 */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-white">
              {meta.name} {t('widget_settings')}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>

          <div className="space-y-4">
            {/* 尺寸选择 */}
            {meta.sizeConfig.allowedSizes.length > 1 && (
              <div>
                <label className="flex items-center gap-2 text-sm text-white/60 mb-2">
                  <Maximize2 className="w-4 h-4" />
                  {t('widget_size')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {meta.sizeConfig.allowedSizes.map((size) => {
                    const { cols, rows } = getSizeSpan(size);
                    return (
                      <button
                        key={size}
                        onClick={() => handleSizeChange(size)}
                        className={`p-2 rounded-lg border transition-all ${
                          item.size === size
                            ? 'bg-blue-500/30 border-blue-500/50 text-white'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex justify-center mb-1">
                          <div
                            className="grid gap-0.5"
                            style={{
                              gridTemplateColumns: `repeat(${cols}, 8px)`,
                              gridTemplateRows: `repeat(${rows}, 8px)`,
                            }}
                          >
                            {Array.from({ length: cols * rows }).map((_, i) => (
                              <div
                                key={i}
                                className={`rounded-sm ${
                                  item.size === size ? 'bg-blue-400' : 'bg-white/40'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs">{getSizeLabel(size)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 组件特定配置 */}
            {item.type === 'clock' && (
              <ClockConfig
                config={localConfig.clock || {}}
                onChange={(value) => handleConfigChange('clock', value)}
              />
            )}

            {item.type === 'weather' && (
              <WeatherConfig
                config={localConfig.weather || {}}
                onChange={(value) => handleConfigChange('weather', value)}
              />
            )}

            {item.type === 'todo' && (
              <TodoConfig
                config={localConfig.todo || {}}
                onChange={(value) => handleConfigChange('todo', value)}
              />
            )}

            {/* 删除按钮 */}
            <button
              onClick={handleRemove}
              className="w-full py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
            >
              {t('widget_delete')}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
});

// 时钟配置
function ClockConfig({
  config,
  onChange,
}: {
  config: { format?: string; showDate?: boolean; showSeconds?: boolean; showLunar?: boolean };
  onChange: (value: any) => void;
}) {
  return (
    <div className="space-y-3">
      <ToggleOption
        label={t('widget_show_date')}
        checked={config.showDate !== false}
        onChange={(v) => onChange({ showDate: v })}
      />
      <ToggleOption
        label={t('widget_show_seconds')}
        checked={config.showSeconds === true}
        onChange={(v) => onChange({ showSeconds: v })}
      />
      <ToggleOption
        label={t('widget_show_lunar')}
        checked={config.showLunar === true}
        onChange={(v) => onChange({ showLunar: v })}
      />
      <SelectOption
        label={t('widget_time_format')}
        value={config.format || '24h'}
        options={[
          { value: '24h', label: t('widget_24h') },
          { value: '12h', label: t('widget_12h') },
        ]}
        onChange={(v) => onChange({ format: v })}
      />
    </div>
  );
}

// 天气配置
function WeatherConfig({
  config,
  onChange,
}: {
  config: { unit?: string };
  onChange: (value: any) => void;
}) {
  return (
    <div className="space-y-3">
      <SelectOption
        label={t('widget_temp_unit')}
        value={config.unit || 'C'}
        options={[
          { value: 'C', label: t('widget_celsius') },
          { value: 'F', label: t('widget_fahrenheit') },
        ]}
        onChange={(v) => onChange({ unit: v })}
      />
    </div>
  );
}

// 待办配置
function TodoConfig({
  config,
  onChange,
}: {
  config: { showCompleted?: boolean };
  onChange: (value: any) => void;
}) {
  return (
    <div className="space-y-3">
      <ToggleOption
        label={t('widget_show_completed')}
        checked={config.showCompleted === true}
        onChange={(v) => onChange({ showCompleted: v })}
      />
    </div>
  );
}

// 开关选项
function ToggleOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-white/80">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-9 h-5 rounded-full transition-colors ${
          checked ? 'bg-blue-500' : 'bg-white/20'
        }`}
      >
        <div
          className={`w-3.5 h-3.5 rounded-full bg-white transition-transform mx-0.5 ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

// 选择选项
function SelectOption({
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
        className="bg-white/10 text-white text-sm rounded-lg px-2 py-1 outline-none border border-white/10"
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

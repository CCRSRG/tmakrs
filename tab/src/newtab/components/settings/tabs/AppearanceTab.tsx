/**
 * 设置面板 - 外观标签页
 */

import { t } from '@/lib/i18n';
import { useNewtabStore } from '../../../hooks/useNewtabStore';
import {
  SettingSection,
  ToggleItem,
  SelectItem,
  ColorItem,
  TextItem,
  RangeItem,
} from '../components/SettingItems';
import type { WallpaperType } from '../../../types';

export function AppearanceTab() {
  const { settings, updateSettings } = useNewtabStore();

  return (
    <div className="space-y-6">
      <SettingSection title={t('settings_shortcuts')}>
        <ToggleItem
          label={t('settings_show_shortcuts')}
          checked={settings.showShortcuts}
          onChange={(v) => updateSettings({ showShortcuts: v })}
        />
        <SelectItem
          label={t('settings_per_row')}
          value={String(settings.shortcutColumns)}
          options={[
            { value: '6', label: t('settings_count_items', '6') },
            { value: '8', label: t('settings_count_items', '8') },
            { value: '10', label: t('settings_count_items', '10') },
          ]}
          onChange={(v) => updateSettings({ shortcutColumns: Number(v) as 6 | 8 | 10 })}
        />
        <SelectItem
          label={t('settings_style')}
          value={settings.shortcutStyle}
          options={[
            { value: 'icon', label: t('settings_style_icon') },
            { value: 'card', label: t('settings_style_card') },
          ]}
          onChange={(v) => updateSettings({ shortcutStyle: v as 'icon' | 'card' })}
        />
      </SettingSection>

      <SettingSection title={t('settings_wallpaper')}>
        <SelectItem
          label={t('settings_wallpaper_type')}
          value={settings.wallpaper.type}
          options={[
            { value: 'color', label: t('settings_wallpaper_color') },
            { value: 'bing', label: t('settings_wallpaper_bing') },
            { value: 'unsplash', label: t('settings_wallpaper_unsplash') },
            { value: 'image', label: t('settings_wallpaper_custom') },
          ]}
          onChange={(v) => updateSettings({ wallpaper: { ...settings.wallpaper, type: v as WallpaperType } })}
        />
        {settings.wallpaper.type === 'color' && (
          <ColorItem
            label={t('settings_bg_color')}
            value={settings.wallpaper.value}
            onChange={(v) => updateSettings({ wallpaper: { ...settings.wallpaper, value: v } })}
          />
        )}
        {settings.wallpaper.type === 'bing' && (
          <>
            <SelectItem
              label={t('settings_history_image')}
              value={String(settings.wallpaper.bingHistoryIndex || 0)}
              options={[
                { value: '0', label: t('settings_today') },
                { value: '1', label: t('settings_yesterday') },
                { value: '2', label: t('settings_days_ago', '2') },
                { value: '3', label: t('settings_days_ago', '3') },
                { value: '4', label: t('settings_days_ago', '4') },
                { value: '5', label: t('settings_days_ago', '5') },
                { value: '6', label: t('settings_days_ago', '6') },
                { value: '7', label: t('settings_days_ago', '7') },
              ]}
              onChange={(v) => updateSettings({ wallpaper: { ...settings.wallpaper, bingHistoryIndex: Number(v) } })}
            />
            <ToggleItem
              label={t('settings_show_image_info')}
              checked={settings.wallpaper.showBingInfo || false}
              onChange={(v) => updateSettings({ wallpaper: { ...settings.wallpaper, showBingInfo: v } })}
            />
          </>
        )}
        {settings.wallpaper.type === 'image' && (
          <TextItem
            label={t('settings_image_url')}
            value={settings.wallpaper.value}
            placeholder="https://..."
            onChange={(v) => updateSettings({ wallpaper: { ...settings.wallpaper, value: v } })}
          />
        )}
        <RangeItem
          label={t('settings_blur')}
          value={settings.wallpaper.blur}
          min={0}
          max={20}
          onChange={(v) => updateSettings({ wallpaper: { ...settings.wallpaper, blur: v } })}
        />
        <RangeItem
          label={t('settings_brightness')}
          value={settings.wallpaper.brightness}
          min={20}
          max={100}
          onChange={(v) => updateSettings({ wallpaper: { ...settings.wallpaper, brightness: v } })}
        />
      </SettingSection>
    </div>
  );
}

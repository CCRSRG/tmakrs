/**
 * 设置面板 - 常规标签页
 */

import { useState } from 'react';
import { t, getCurrentLanguageSync, setLanguage, SUPPORTED_LANGUAGES, type LanguageCode } from '@/lib/i18n';
import { useNewtabStore } from '../../../hooks/useNewtabStore';
import { SEARCH_ENGINES } from '../../../constants';
import {
  SettingSection,
  ToggleItem,
  TextItem,
  SelectItem,
  CacheFaviconsButton,
} from '../components/SettingItems';
import type { ClockFormat, SearchEngine } from '../../../types';

export function GeneralTab() {
  const { settings, updateSettings } = useNewtabStore();
  const [currentLang, setCurrentLang] = useState<LanguageCode>(getCurrentLanguageSync());

  const handleLanguageChange = async (lang: LanguageCode) => {
    await setLanguage(lang);
    setCurrentLang(lang);
    // 刷新页面以应用新语言
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* 语言设置 */}
      <SettingSection title={t('settings_language')}>
        <SelectItem
          label={t('settings_language_select')}
          value={currentLang}
          options={SUPPORTED_LANGUAGES.map((l) => ({ value: l.code, label: l.nativeName }))}
          onChange={(v) => handleLanguageChange(v as LanguageCode)}
        />
        <div className="text-xs text-white/50 mt-1">{t('settings_language_hint')}</div>
      </SettingSection>

      {/* 个性化 */}
      <SettingSection title={t('settings_personalization')}>
        <ToggleItem
          label={t('settings_show_greeting')}
          checked={settings.showGreeting}
          onChange={(v) => updateSettings({ showGreeting: v })}
        />
        <TextItem
          label={t('settings_your_name')}
          value={settings.userName}
          placeholder={t('settings_optional')}
          onChange={(v) => updateSettings({ userName: v })}
        />
      </SettingSection>

      {/* 时钟 */}
      <SettingSection title={t('settings_clock')}>
        <ToggleItem
          label={t('settings_show_clock')}
          checked={settings.showClock}
          onChange={(v) => updateSettings({ showClock: v })}
        />
        {settings.showClock && (
          <>
            <ToggleItem
              label={t('settings_show_date')}
              checked={settings.showDate}
              onChange={(v) => updateSettings({ showDate: v })}
            />
            <ToggleItem
              label={t('settings_show_seconds')}
              checked={settings.showSeconds}
              onChange={(v) => updateSettings({ showSeconds: v })}
            />
            <ToggleItem
              label={t('settings_show_lunar')}
              checked={settings.showLunar}
              onChange={(v) => updateSettings({ showLunar: v })}
            />
            <SelectItem
              label={t('settings_time_format')}
              value={settings.clockFormat}
              options={[
                { value: '24h', label: t('settings_24h') },
                { value: '12h', label: t('settings_12h') },
              ]}
              onChange={(v) => updateSettings({ clockFormat: v as ClockFormat })}
            />
          </>
        )}
      </SettingSection>

      <SettingSection title={t('settings_poetry')}>
        <ToggleItem
          label={t('settings_show_poetry')}
          checked={settings.showPoetry}
          onChange={(v) => updateSettings({ showPoetry: v })}
        />
      </SettingSection>

      <SettingSection title={t('settings_search')}>
        <ToggleItem
          label={t('settings_show_search')}
          checked={settings.showSearch}
          onChange={(v) => updateSettings({ showSearch: v })}
        />
        <SelectItem
          label={t('settings_search_engine')}
          value={settings.searchEngine}
          options={SEARCH_ENGINES.map((e) => ({ value: e.id, label: e.name }))}
          onChange={(v) => updateSettings({ searchEngine: v as SearchEngine })}
        />
      </SettingSection>

      <SettingSection title={t('settings_offline_cache')}>
        <CacheFaviconsButton />
      </SettingSection>

      <SettingSection title={t('settings_usage_guide')}>
        <div className="text-sm text-white/70 leading-relaxed space-y-2">
          <div>{t('settings_guide_1')}</div>
          <div>{t('settings_guide_2')}</div>
          <div>{t('settings_guide_3')}</div>
        </div>
      </SettingSection>
    </div>
  );
}

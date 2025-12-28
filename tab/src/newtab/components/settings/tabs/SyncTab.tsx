/**
 * 设置面板 - 同步标签页
 */

import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { t } from '@/lib/i18n';
import { useNewtabStore } from '../../../hooks/useNewtabStore';
import { StorageService } from '@/lib/utils/storage';
import { getTMarksUrls } from '@/lib/constants/urls';
import { SettingSection, ToggleItem, SelectItem } from '../components/SettingItems';

export function SyncTab() {
  const { settings, updateSettings } = useNewtabStore();
  const [tmarksUrl, setTmarksUrl] = useState('');

  useEffect(() => {
    const loadTMarksUrl = async () => {
      const config = await StorageService.getTMarksConfig();
      if (config?.bookmarkApiUrl) {
        const baseUrl = config.bookmarkApiUrl.replace(/\/api\/?$/, '');
        setTmarksUrl(baseUrl);
      } else {
        setTmarksUrl(getTMarksUrls().BASE_URL);
      }
    };
    loadTMarksUrl();
  }, []);

  return (
    <div className="space-y-6">
      <SettingSection title={t('settings_tmarks_sync')}>
        <ToggleItem
          label={t('settings_show_pinned_bookmarks')}
          checked={settings.showPinnedBookmarks}
          onChange={(v) => updateSettings({ showPinnedBookmarks: v })}
        />
        <ToggleItem
          label={t('settings_search_suggestions')}
          checked={settings.enableSearchSuggestions}
          onChange={(v) => updateSettings({ enableSearchSuggestions: v })}
        />
        {tmarksUrl && (
          <a
            href={tmarksUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 mt-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <span className="text-sm text-white/70">{t('settings_open_tmarks')}</span>
            <ExternalLink className="w-4 h-4 text-white/50" />
          </a>
        )}
        <div className="text-xs text-white/40 mt-2">
          {t('settings_api_key_hint')}
        </div>
      </SettingSection>

      <SettingSection title={t('settings_auto_refresh')}>
        <ToggleItem
          label={t('settings_auto_refresh_pinned')}
          checked={settings.autoRefreshPinnedBookmarks}
          onChange={(v) => updateSettings({ autoRefreshPinnedBookmarks: v })}
        />
        {settings.autoRefreshPinnedBookmarks && (
          <>
            <SelectItem
              label={t('settings_refresh_time')}
              value={settings.pinnedBookmarksRefreshTime}
              options={[
                { value: 'morning', label: t('settings_morning_8') },
                { value: 'evening', label: t('settings_evening_22') },
              ]}
              onChange={(v) => updateSettings({ pinnedBookmarksRefreshTime: v as 'morning' | 'evening' })}
            />
            <div className="text-xs text-white/40 -mt-1 ml-1">
              {t('settings_auto_refresh_hint')}
            </div>
          </>
        )}
      </SettingSection>
    </div>
  );
}

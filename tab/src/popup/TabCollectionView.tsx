/**
 * Tab Collection View Component
 * Displays current window tabs and allows user to select which tabs to collect
 */

import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { SuccessMessage } from '@/components/SuccessMessage';
import { CollectionOptionsDialog, type CollectionOption } from '@/components/CollectionOptionsDialog';
import { getCurrentWindowTabs, collectCurrentWindowTabs, closeTabs } from '@/lib/services/tab-collection';
import { createTMarksClient } from '@/lib/api/tmarks';
import { normalizeApiUrl } from '@/lib/constants/urls';
import { t } from '@/lib/i18n';
import type { BookmarkSiteConfig } from '@/types';
import type { TMarksTabGroup } from '@/lib/api/tmarks/tab-groups';

interface TabCollectionViewProps {
  config: BookmarkSiteConfig;
  onBack: () => void;
}

interface TabInfo {
  id: number;
  title: string;
  url: string;
  favIconUrl?: string;
}

export function TabCollectionView({ config, onBack }: TabCollectionViewProps) {
  const [tabs, setTabs] = useState<TabInfo[]>([]);
  const [selectedTabIds, setSelectedTabIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isCollecting, setIsCollecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [collectedTabIds, setCollectedTabIds] = useState<number[]>([]);
  const [showOptionsDialog, setShowOptionsDialog] = useState(false);
  const [groups, setGroups] = useState<TMarksTabGroup[]>([]);

  useEffect(() => {
    loadTabs();
    loadGroups();
  }, []);

  const loadTabs = async () => {
    try {
      setIsLoading(true);
      const allTabs = await getCurrentWindowTabs();

      // Filter out chrome:// and extension pages
      const validTabs = allTabs
        .filter((tab) => tab.id && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://'))
        .map((tab) => ({
          id: tab.id!,
          title: tab.title || 'Untitled',
          url: tab.url!,
          favIconUrl: tab.favIconUrl,
        }));

      setTabs(validTabs);
      setSelectedTabIds(new Set(validTabs.map((tab) => tab.id)));
    } catch (err) {
      setError(t('tab_collection_load_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const client = createTMarksClient({
        baseUrl: normalizeApiUrl(config.apiUrl),
        apiKey: config.apiKey,
      });
      const allGroups = await client.tabGroups.getAllTabGroups();
      setGroups(allGroups);
    } catch (err) {
      console.error(t('tab_collection_load_groups_failed'), err);
      setGroups([]);
    }
  };

  const handleCreateFolder = async (title: string): Promise<TMarksTabGroup> => {
    try {
      const client = createTMarksClient({
        baseUrl: normalizeApiUrl(config.apiUrl),
        apiKey: config.apiKey,
      });
      const response = await client.tabGroups.createFolder(title);
      const newFolder = response.data.tab_group;
      setGroups([...groups, newFolder]);
      return newFolder;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : t('tab_collection_create_folder_failed'));
    }
  };

  const toggleTab = (tabId: number) => {
    const newSelected = new Set(selectedTabIds);
    if (newSelected.has(tabId)) {
      newSelected.delete(tabId);
    } else {
      newSelected.add(tabId);
    }
    setSelectedTabIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedTabIds.size === tabs.length) {
      setSelectedTabIds(new Set());
    } else {
      setSelectedTabIds(new Set(tabs.map((tab) => tab.id)));
    }
  };

  const handleQuickCollect = async () => {
    if (selectedTabIds.size === 0) {
      setError(t('tab_collection_select_at_least_one'));
      return;
    }

    setIsCollecting(true);
    setError(null);

    try {
      const result = await collectCurrentWindowTabs(config, selectedTabIds);

      if (result.success) {
        setSuccessMessage(result.message || t('tab_collection_success'));
        setCollectedTabIds(Array.from(selectedTabIds));
        setShowCloseConfirm(true);
      } else {
        setError(result.error || t('tab_collection_failed'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tab_collection_failed'));
    } finally {
      setIsCollecting(false);
    }
  };

  const handleShowOptions = () => {
    if (selectedTabIds.size === 0) {
      setError(t('tab_collection_select_at_least_one'));
      return;
    }
    setShowOptionsDialog(true);
  };

  const handleConfirmCollection = async (option: CollectionOption) => {
    setShowOptionsDialog(false);
    setIsCollecting(true);
    setError(null);

    try {
      const result = await collectCurrentWindowTabs(config, selectedTabIds, option);

      if (result.success) {
        setSuccessMessage(result.message || t('tab_collection_success'));
        setCollectedTabIds(Array.from(selectedTabIds));
        setShowCloseConfirm(true);
      } else {
        setError(result.error || t('tab_collection_failed'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tab_collection_failed'));
    } finally {
      setIsCollecting(false);
    }
  };

  const handleCloseTabs = async () => {
    try {
      await closeTabs(collectedTabIds);
      window.close();
    } catch (err) {
      setError(t('tab_collection_close_tabs_failed'));
    }
  };

  const handleKeepTabs = () => {
    setShowCloseConfirm(false);
    setCollectedTabIds([]);
    window.close();
  };

  return (
    <div className="relative h-[80vh] min-h-[620px] w-[380px] overflow-hidden rounded-b-2xl bg-[color:var(--tab-popup-bg)] text-[var(--tab-text)] shadow-2xl">
      {showOptionsDialog && (
        <CollectionOptionsDialog
          tabCount={selectedTabIds.size}
          groups={groups}
          onConfirm={handleConfirmCollection}
          onCancel={() => setShowOptionsDialog(false)}
          onCreateFolder={handleCreateFolder}
        />
      )}

      <div className="pointer-events-none fixed top-0 left-0 right-0 z-50 px-4 pt-2 space-y-2">
        {error && (
          <div className="pointer-events-auto">
            <ErrorMessage message={error} onDismiss={() => setError(null)} />
          </div>
        )}
        {successMessage && (
          <div className="pointer-events-auto">
            <SuccessMessage message={successMessage} onDismiss={() => setSuccessMessage(null)} />
          </div>
        )}
      </div>

      <div className="relative flex h-full flex-col">
        <header className="fixed top-0 left-0 right-0 z-20 px-3 pt-2 pb-2.5 bg-[color:var(--tab-surface)] border-b border-[color:var(--tab-border)] shadow-sm rounded-b-2xl">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[var(--tab-text-muted)] transition-all duration-200 hover:bg-[color:var(--tab-surface-muted)] active:scale-95"
              title={t('popup_back')}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-[color:var(--tab-message-success-bg)] px-2 py-1 text-[10px] text-[var(--tab-message-success-icon)] font-medium">
              {t('tab_collection_total', String(tabs.length))}
            </span>
            <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-[color:var(--tab-message-success-bg)] px-2 py-1 text-[10px] text-[var(--tab-message-success-icon)] font-medium">
              {t('tab_collection_selected', String(selectedTabIds.size))}
            </span>
            <div className="ml-auto flex gap-1.5">
              <button
                onClick={onBack}
                className="rounded-lg border border-[color:var(--tab-border-strong)] bg-[color:var(--tab-surface)] px-3 py-1.5 text-[11px] font-medium text-[var(--tab-text)] transition-all duration-200 hover:bg-[color:var(--tab-surface-muted)] active:scale-95"
              >
                {t('btn_cancel')}
              </button>
              <button
                onClick={handleShowOptions}
                disabled={isCollecting || selectedTabIds.size === 0}
                className="rounded-lg border border-[color:var(--tab-border-strong)] bg-[color:var(--tab-surface)] px-3 py-1.5 text-[11px] font-medium text-[var(--tab-text)] transition-all duration-200 hover:bg-[color:var(--tab-surface-muted)] disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
              >
                {t('tab_collection_options')}
              </button>
              <button
                onClick={handleQuickCollect}
                disabled={isCollecting || selectedTabIds.size === 0}
                className="rounded-lg px-4 py-1.5 text-[11px] font-semibold shadow-sm transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
                style={{
                  background: `linear-gradient(90deg, var(--tab-popup-success-from), var(--tab-popup-success-to))`,
                  color: 'var(--tab-popup-success-text)',
                }}
              >
                {isCollecting ? (
                  <span className="flex items-center justify-center gap-1">
                    <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24" style={{ color: 'var(--tab-popup-success-text)' }}>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('tab_collection_collecting')}
                  </span>
                ) : (
                  t('tab_collection_collect')
                )}
              </button>
            </div>
          </div>
        </header>

        {showCloseConfirm && (
          <div className="fixed top-[60px] left-0 right-0 z-40 px-4 pt-2 animate-in slide-in-from-top-5 fade-in duration-300">
            <section
              className="rounded-2xl border border-[color:var(--tab-message-success-border)] p-4 shadow-lg"
              style={{
                background: `linear-gradient(135deg, var(--tab-message-success-bg), var(--tab-message-success-icon-bg))`,
              }}
            >
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--tab-message-success-icon-bg)]">
                  <svg className="h-5 w-5 text-[var(--tab-message-success-icon)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[var(--tab-text)]">{t('tab_collection_success')}</h3>
                  <p className="mt-1 text-xs text-[var(--tab-text-muted)]">
                    {t('tab_collection_collected_count', String(collectedTabIds.length))}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleKeepTabs}
                  className="flex-1 rounded-xl border border-[color:var(--tab-border-strong)] bg-[color:var(--tab-surface)] px-4 py-2 text-sm font-medium text-[var(--tab-text)] transition-all duration-200 hover:bg-[color:var(--tab-surface-muted)] active:scale-95"
                >
                  {t('tab_collection_keep_tabs')}
                </button>
                <button
                  onClick={handleCloseTabs}
                  className="flex-1 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-200 hover:shadow-md active:scale-95"
                  style={{
                    background: `linear-gradient(90deg, var(--tab-popup-success-from), var(--tab-popup-success-to))`,
                    color: 'var(--tab-popup-success-text)',
                  }}
                >
                  {t('tab_collection_close_tabs')}
                </button>
              </div>
            </section>
          </div>
        )}

        <main className={`relative flex-1 space-y-3 overflow-y-auto px-4 pb-5 bg-[color:var(--tab-popup-bg)] ${showCloseConfirm ? 'pt-[180px]' : 'pt-[60px]'}`}>
          {isLoading ? (
            <section className="flex items-center gap-3 rounded-2xl border border-[color:var(--tab-border)] bg-[color:var(--tab-surface)] p-4 text-sm text-[var(--tab-text)] shadow-sm">
              <LoadingSpinner />
              <p>{t('tab_collection_loading')}</p>
            </section>
          ) : (
            <>
              <section className="rounded-2xl border border-[color:var(--tab-border)] bg-[color:var(--tab-surface)] p-3 shadow-sm">
                <button
                  onClick={toggleAll}
                  className="flex w-full items-center justify-between rounded-xl bg-[color:var(--tab-surface-muted)] px-4 py-2 text-sm font-medium text-[var(--tab-text)] transition-all duration-200 hover:opacity-90 active:scale-95"
                >
                  <span>{selectedTabIds.size === tabs.length ? t('tab_collection_deselect_all') : t('tab_collection_select_all')}</span>
                  <span className="text-xs text-[var(--tab-text-muted)]">
                    {selectedTabIds.size} / {tabs.length}
                  </span>
                </button>
              </section>

              <section className="space-y-2">
                {tabs.map((tab) => {
                  const isSelected = selectedTabIds.has(tab.id);
                  return (
                    <button
                      key={tab.id}
                      onClick={() => toggleTab(tab.id)}
                      className={`group w-full rounded-2xl border p-3 text-left transition-all duration-200 active:scale-[0.98] ${
                        isSelected
                          ? 'border-[color:var(--tab-message-success-border)] bg-[color:var(--tab-message-success-bg)] shadow-md'
                          : 'border-[color:var(--tab-border)] bg-[color:var(--tab-surface)] hover:bg-[color:var(--tab-surface-muted)]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-200 ${
                          isSelected
                            ? 'border-[color:var(--tab-popup-success-from)] bg-[color:var(--tab-popup-success-from)]'
                            : 'border-[color:var(--tab-border-strong)] bg-[color:var(--tab-surface)]'
                        }`}>
                          {isSelected && (
                            <svg className="h-3 w-3 text-[var(--tab-popup-success-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        {tab.favIconUrl && (
                          <img src={tab.favIconUrl} alt="" className="h-5 w-5 rounded" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-[var(--tab-text)]">{tab.title}</p>
                          <p className="truncate text-xs text-[var(--tab-text-muted)]">{tab.url}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

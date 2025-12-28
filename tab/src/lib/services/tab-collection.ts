/**
 * Tab Collection Service
 * Handles OneTab-like tab collection functionality
 */

import { db } from '@/lib/db';
import { createTMarksClient } from '@/lib/api/tmarks';
import type { TabGroupInput, TabGroupResult } from '@/types';
import type { BookmarkSiteConfig } from '@/types';
import { EXTERNAL_SERVICES, normalizeApiUrl } from '@/lib/constants/urls';
import { t } from '@/lib/i18n';

/**
 * Get all tabs in the current window
 */
export async function getCurrentWindowTabs(): Promise<chrome.tabs.Tab[]> {
  return new Promise((resolve) => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      resolve(tabs);
    });
  });
}

/**
 * Close tabs by IDs
 */
export async function closeTabs(tabIds: number[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.tabs.remove(tabIds, () => {
      resolve();
    });
  });
}

/**
 * Generate favicon URL using Google Favicon API
 */
function getFaviconUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  try {
    const urlObj = new URL(url);
    return `${EXTERNAL_SERVICES.GOOGLE_FAVICON}?domain=${urlObj.hostname}&sz=32`;
  } catch (error) {
    return '';
  }
}

/**
 * Collection options for tab collection
 */
export interface CollectionOptions {
  mode: 'new' | 'existing' | 'folder';
  targetId?: string; // Group ID for 'existing' mode, or parent folder ID for 'folder' mode
  title?: string; // Optional title for new group
}

/**
 * Collect selected tabs in current window and save to TMarks
 */
export async function collectCurrentWindowTabs(
  config: BookmarkSiteConfig,
  selectedTabIds?: Set<number>,
  options?: CollectionOptions
): Promise<TabGroupResult> {
  try {
    // Get all tabs in current window
    const tabs = await getCurrentWindowTabs();

    // Filter out empty tabs and current popup
    let validTabs = tabs.filter(
      (tab) => tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')
    );

    // If selectedTabIds is provided, only collect selected tabs
    if (selectedTabIds && selectedTabIds.size > 0) {
      validTabs = validTabs.filter((tab) => tab.id && selectedTabIds.has(tab.id));
    }

    if (validTabs.length === 0) {
      return {
        success: false,
        error: t('error_no_tabs_to_collect'),
      };
    }

    // Prepare items
    const items = validTabs.map((tab) => ({
      title: tab.title || 'Untitled',
      url: tab.url!,
      favicon: getFaviconUrl(tab.url!),
    }));

    // Try to sync to TMarks
    try {
      const client = createTMarksClient({
        baseUrl: normalizeApiUrl(config.apiUrl),
        apiKey: config.apiKey,
      });

      const collectionMode = options?.mode || 'new';

      if (collectionMode === 'existing' && options?.targetId) {
        // Add to existing group
        await client.tabGroups.addItemsToGroup(options.targetId, { items });

        return {
          success: true,
          groupId: options.targetId,
          message: t('msg_tabs_added_to_group', String(validTabs.length)),
        };
      } else {
        // Create new group (or in folder)
        const tabGroupInput: TabGroupInput = {
          title: options?.title,
          parent_id: collectionMode === 'folder' ? options?.targetId : null,
          items,
        };

        // Save to local database first
        const localGroupId = await saveTabGroupLocally(tabGroupInput);

        const response = await client.tabGroups.createTabGroup(tabGroupInput);

        // Update local record with remote ID
        await db.tabGroups.update(localGroupId, {
          remoteId: response.data.tab_group.id,
        });

        const modeText = collectionMode === 'folder' ? t('msg_to_folder') : '';
        return {
          success: true,
          groupId: response.data.tab_group.id,
          message: t('msg_tabs_collected', [String(validTabs.length), modeText]),
        };
      }
    } catch (error: any) {
      // Log error details
      console.error('[TabCollection] Sync to TMarks failed:', {
        message: error.message,
        code: error.code,
        status: error.status,
      });

      const collectionMode = options?.mode || 'new';
      const errorCode = error?.code || '';
      const errorStatus = error?.status || 0;
      const errorMessage = error?.message || '';

      // 判断是否是认证相关错误
      const isAuthError =
        errorCode === 'INVALID_API_KEY' ||
        errorCode === 'MISSING_API_KEY' ||
        errorCode === 'INSUFFICIENT_PERMISSIONS' ||
        errorStatus === 401 ||
        errorStatus === 403 ||
        errorMessage.includes('auth') ||
        errorMessage.includes('API Key');

      // 判断是否是真正的网络错误
      const isNetworkError =
        (errorCode === 'NETWORK_ERROR' || errorStatus === 0) &&
        !isAuthError &&
        (errorMessage.includes('Network') ||
          errorMessage.includes('network') ||
          errorMessage.includes('connect'));

      if (isNetworkError && collectionMode !== 'existing') {
        // Network error and not adding to existing group mode, return offline save
        // Note: Cannot save offline in add to existing group mode because remote group ID is required
        const tabGroupInput: TabGroupInput = {
          title: options?.title,
          parent_id: collectionMode === 'folder' ? options?.targetId : null,
          items,
        };
        const localGroupId = await saveTabGroupLocally(tabGroupInput);
        
        return {
          success: true,
          groupId: localGroupId.toString(),
          offline: true,
          message: t('msg_tabs_offline_saved', String(validTabs.length)),
        };
      }

      // 认证错误或其他错误，返回失败并显示具体错误信息
      let friendlyMessage: string;
      if (errorStatus === 401 || errorCode === 'INVALID_API_KEY' || errorCode === 'MISSING_API_KEY') {
        friendlyMessage = t('error_auth_failed');
      } else if (errorStatus === 403 || errorCode === 'INSUFFICIENT_PERMISSIONS') {
        friendlyMessage = t('error_permission_denied');
      } else if (errorStatus === 429 || errorCode === 'RATE_LIMIT_EXCEEDED') {
        friendlyMessage = t('error_rate_limit');
      } else if (errorStatus >= 500) {
        friendlyMessage = t('error_server_error');
      } else {
        friendlyMessage = errorMessage || t('error_save_collection_failed');
      }

      return {
        success: false,
        error: friendlyMessage,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : t('error_collect_tabs_failed');
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Save tab group to local database
 */
async function saveTabGroupLocally(input: TabGroupInput): Promise<number> {
  const now = Date.now();

  // Generate default title if not provided
  const title = input.title || new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).replace(/\//g, '-');

  // Insert tab group
  const groupId = await db.tabGroups.add({
    title,
    createdAt: now,
  });

  // Insert tab group items
  const items = input.items.map((item, index) => ({
    groupId: groupId as number,
    title: item.title,
    url: item.url,
    favicon: item.favicon,
    position: index,
    createdAt: now,
  }));

  await db.tabGroupItems.bulkAdd(items);

  return groupId as number;
}

/**
 * Restore tabs from a tab group
 */
export async function restoreTabGroup(groupId: number, inNewWindow: boolean = true): Promise<void> {
  try {
    // Get tab group items from local database
    const items = await db.tabGroupItems
      .where('groupId')
      .equals(groupId)
      .sortBy('position');

    if (items.length === 0) {
      throw new Error(t('error_tab_group_empty'));
    }

    const urls = items.map((item) => item.url);

    if (inNewWindow) {
      // Create new window with all tabs
      chrome.windows.create({
        url: urls,
        focused: true,
      });
    } else {
      // Open tabs in current window
      for (const url of urls) {
        chrome.tabs.create({ url, active: false });
      }
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Sync pending tab groups that were saved offline
 */
export async function syncPendingTabGroups(config: BookmarkSiteConfig): Promise<number> {
  try {
    // Find tab groups without remoteId (not synced)
    const pendingGroups = await db.tabGroups
      .filter((group) => !group.remoteId)
      .toArray();

    if (pendingGroups.length === 0) {
      return 0;
    }

    const client = createTMarksClient({
      baseUrl: normalizeApiUrl(config.apiUrl),
      apiKey: config.apiKey,
    });

    let synced = 0;

    for (const group of pendingGroups) {
      try {
        // Get items for this group
        const items = await db.tabGroupItems
          .where('groupId')
          .equals(group.id!)
          .sortBy('position');

        if (items.length === 0) {
          continue;
        }

        // Create tab group on server
        const response = await client.tabGroups.createTabGroup({
          title: group.title,
          items: items.map((item) => ({
            title: item.title,
            url: item.url,
            favicon: item.favicon,
          })),
        });

        // Update local record with remote ID
        await db.tabGroups.update(group.id!, {
          remoteId: response.data.tab_group.id,
        });

        synced++;
      } catch (error) {
        // Skip this group and continue with others
        console.error('[TabCollection] Failed to sync group:', group.id, error);
      }
    }

    return synced;
  } catch (error) {
    console.error('[TabCollection] syncPendingTabGroups error:', error);
    return 0;
  }
}


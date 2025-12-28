/**
 * 书签收集服务
 */

import { t } from '@/lib/i18n';
import { TMARKS_ROOT_TITLE, ROOT_PATH_PLACEHOLDER } from '../constants';
import { getHostname } from '../utils/json-parser';

export type CollectedBookmark = {
  id: string;
  title: string;
  url: string;
  domain: string;
  path: string;
};

export type DomainBookmarkItem = {
  id: string;
  title: string;
  url: string;
  path: string;
};

/**
 * 收集所有浏览器书签
 */
export async function collectAllBrowserBookmarks(
  skipRootId?: string
): Promise<CollectedBookmark[]> {
  const tree = await chrome.bookmarks.getTree();
  const sourceRoot = tree?.[0];
  const items: CollectedBookmark[] = [];

  if (!sourceRoot) return items;

  const stack: Array<{
    node: chrome.bookmarks.BookmarkTreeNode;
    path: string;
    parentPath: string;
  }> = [{ node: sourceRoot, path: '', parentPath: '' }];

  while (stack.length > 0) {
    const { node, path, parentPath } = stack.pop()!;

    if (skipRootId && node.id === skipRootId) {
      continue;
    }

    if (node.url) {
      const url = node.url || '';
      const folderPath = parentPath || ROOT_PATH_PLACEHOLDER;
      items.push({
        id: node.id,
        title: node.title || url,
        url,
        domain: getHostname(url),
        path: folderPath,
      });
      continue;
    }

    const children = node.children || [];
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      const childTitle = (child.title || '').trim() || t('default_untitled');
      const isFolder = !child.url;
      const childPath = isFolder ? (path ? `${path}/${childTitle}` : childTitle) : path;
      stack.push({
        node: child,
        path: childPath,
        parentPath: path,
      });
    }
  }

  return items;
}

/**
 * 复制书签树到指定文件夹
 */
export async function copyBookmarkTreeToFolder(opts: {
  sourceRoot: chrome.bookmarks.BookmarkTreeNode;
  targetParentId: string;
  skipSourceId?: string;
}) {
  const stack: Array<{
    children: chrome.bookmarks.BookmarkTreeNode[];
    index: number;
    targetParentId: string;
  }> = [];
  const counts = { folders: 0, bookmarks: 0 };

  const pushChildren = (
    children: chrome.bookmarks.BookmarkTreeNode[] | undefined,
    targetParentId: string
  ) => {
    if (!children || children.length === 0) return;
    stack.push({ children, index: 0, targetParentId });
  };

  pushChildren(opts.sourceRoot.children, opts.targetParentId);

  while (stack.length > 0) {
    const frame = stack[stack.length - 1];
    if (frame.index >= frame.children.length) {
      stack.pop();
      continue;
    }

    const node = frame.children[frame.index];
    const nodeIndex = frame.index;
    frame.index += 1;

    if (opts.skipSourceId && node.id === opts.skipSourceId) {
      continue;
    }
    if (!node.url && node.title === TMARKS_ROOT_TITLE) {
      continue;
    }

    if (node.url) {
      await chrome.bookmarks.create({
        parentId: frame.targetParentId,
        index: nodeIndex,
        title: node.title || node.url,
        url: node.url,
      });
      counts.bookmarks += 1;
      continue;
    }

    const createdFolder = await chrome.bookmarks.create({
      parentId: frame.targetParentId,
      index: nodeIndex,
      title: node.title || t('default_folder_name'),
    });
    counts.folders += 1;
    pushChildren(node.children, createdFolder.id);
  }

  return counts;
}

/**
 * 导入所有书签到 NewTab
 */
export async function importAllBookmarksToNewtab(newtabRootId: string) {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const folderTitle = `Imported ${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  const importFolder = await chrome.bookmarks.create({
    parentId: newtabRootId,
    title: folderTitle,
  });

  const tree = await chrome.bookmarks.getTree();
  const sourceRoot = tree?.[0];
  if (!sourceRoot) {
    throw new Error('Bookmarks root not found');
  }

  const counts = await copyBookmarkTreeToFolder({
    sourceRoot,
    targetParentId: importFolder.id,
    skipSourceId: newtabRootId,
  });

  return { importFolderId: importFolder.id, folderTitle, counts };
}

/**
 * 确保文件夹路径存在
 */
export async function ensureFolderPath(
  rootId: string,
  path: string,
  cache: Map<string, string>
): Promise<string> {
  const normalized = (path || '')
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean)
    .join('/');
  if (!normalized) return rootId;
  const existing = cache.get(normalized);
  if (existing) return existing;

  const parts = normalized.split('/');
  let currentId = rootId;
  let currentPath = '';
  for (const part of parts) {
    currentPath = currentPath ? `${currentPath}/${part}` : part;
    const cachedId = cache.get(currentPath);
    if (cachedId) {
      currentId = cachedId;
      continue;
    }

    const children = await chrome.bookmarks.getChildren(currentId);
    const found = children.find((c) => !c.url && c.title === part);
    if (found) {
      cache.set(currentPath, found.id);
      currentId = found.id;
      continue;
    }

    const created = await chrome.bookmarks.create({ parentId: currentId, title: part });
    cache.set(currentPath, created.id);
    currentId = created.id;
  }

  return currentId;
}

/**
 * 清理 AI 整理路径
 */
export function sanitizeAiOrganizePath(path: string): string {
  const parts = (path || '')
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 0) return '';
  return parts.slice(0, 2).join('/');
}

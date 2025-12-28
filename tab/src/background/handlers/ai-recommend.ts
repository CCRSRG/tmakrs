/**
 * AI 推荐处理器
 */

import { t } from '@/lib/i18n';
import type { Message, MessageResponse } from '@/types';
import { StorageService } from '@/lib/utils/storage';
import { callAI } from '@/lib/services/ai-client';
import { NEWTAB_FOLDER_PROMPT_TEMPLATE } from '@/lib/constants/newtabPrompts';
import { safeParseJson } from '../utils/json-parser';
import { handleGetNewtabFolders } from './newtab-folders';

/**
 * 推荐 NewTab 文件夹
 */
export async function handleRecommendNewtabFolder(
  message: Message,
  _sender: chrome.runtime.MessageSender
): Promise<MessageResponse> {
  const page = message.payload as {
    title?: string;
    url?: string;
    description?: string;
  };
  const url = page?.url;
  if (!url) {
    throw new Error('Missing url');
  }

  const config = await StorageService.loadConfig();
  if (config.preferences.enableNewtabAI === false) {
    return { success: true, data: { suggestedFolders: [] } };
  }
  const countRaw = Number(config.preferences.newtabFolderRecommendCount ?? 10);
  const recommendCount = Math.min(20, Math.max(1, Number.isFinite(countRaw) ? countRaw : 10));

  const foldersResp = await handleGetNewtabFolders();
  if (!foldersResp.success) {
    throw new Error(foldersResp.error || 'Failed to load folders');
  }
  const folderData = foldersResp.data as {
    rootId: string;
    folders: Array<{
      id: string;
      title: string;
      parentId: string | null;
      path: string;
    }>;
  };

  const folderPaths = folderData.folders
    .filter((f) => f.id !== folderData.rootId)
    .map((f) => f.path)
    .slice(0, 200);

  const defaultPrompt = NEWTAB_FOLDER_PROMPT_TEMPLATE.split('{{title}}')
    .join(page.title || '')
    .split('{{url}}')
    .join(url)
    .split('{{description}}')
    .join(page.description || t('none'))
    .split('{{recommendCount}}')
    .join(String(recommendCount))
    .split('{{folderPaths}}')
    .join(folderPaths.join('\n'));

  const customTemplate = (config.preferences.newtabFolderPrompt || '').trim();

  const prompt =
    config.preferences.enableNewtabFolderPrompt && customTemplate
      ? customTemplate
          .split('{{title}}')
          .join(page.title || '')
          .split('{{url}}')
          .join(url)
          .split('{{description}}')
          .join(page.description || t('none'))
          .split('{{recommendCount}}')
          .join(String(recommendCount))
          .split('{{folderPaths}}')
          .join(folderPaths.join('\n'))
      : defaultPrompt;

  const apiKey = config.aiConfig.apiKeys[config.aiConfig.provider];
  if (!apiKey) {
    return { success: true, data: { suggestedFolders: [] } };
  }

  const aiResult = await callAI({
    provider: config.aiConfig.provider as any,
    apiKey,
    model: config.aiConfig.model,
    apiUrl: config.aiConfig.apiUrls?.[config.aiConfig.provider],
    prompt,
  });

  const aiContent = aiResult.content || '';
  const parsed = safeParseJson(aiContent) || { suggestedFolders: [] };

  const suggested = Array.isArray(parsed?.suggestedFolders) ? parsed.suggestedFolders : [];
  if (suggested.length === 0 && aiContent.trim()) {
    console.warn(
      '[NewTab Folder Recommend] AI result not parsable or empty suggestedFolders',
      {
        provider: config.aiConfig.provider,
        model: config.aiConfig.model,
        rawPreview: aiContent.trim().slice(0, 1000),
        parsed,
      }
    );
  }
  const pathToId = new Map(folderData.folders.map((f) => [f.path, f.id] as const));
  const normalized = suggested
    .map((s: any) => ({
      path: typeof s?.path === 'string' ? s.path : '',
      confidence: typeof s?.confidence === 'number' ? s.confidence : 0,
    }))
    .filter((s: any) => s.path && pathToId.has(s.path))
    .slice(0, recommendCount)
    .map((s: any) => ({
      id: pathToId.get(s.path)!,
      path: s.path,
      confidence: s.confidence,
    }));

  return {
    success: true,
    data: { suggestedFolders: normalized },
  };
}

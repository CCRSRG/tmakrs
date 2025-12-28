/**
 * 设置面板 - AI 整理标签页
 */

import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { t } from '@/lib/i18n';
import { useNewtabStore } from '../../../hooks/useNewtabStore';
import { NEWTAB_WORKSPACE_ORGANIZE_PROMPT_TEMPLATE } from '@/lib/constants/newtabPrompts';
import { Z_INDEX } from '../../../constants/z-index';
import { SettingSection, ToggleItem } from '../components/SettingItems';

interface LogEntry {
  ts: number;
  level: string;
  step: string;
  message: string;
  detail?: any;
}

export function AITab() {
  const { settings, updateSettings } = useNewtabStore();
  const [aiOrganizeLoading, setAiOrganizeLoading] = useState(false);
  const [aiOrganizeMessage, setAiOrganizeMessage] = useState<string | null>(null);
  const [aiOrganizeError, setAiOrganizeError] = useState<string | null>(null);
  const [aiOrganizeConsoleOpen, setAiOrganizeConsoleOpen] = useState(false);
  const [aiOrganizeSessionId, setAiOrganizeSessionId] = useState<string | null>(null);
  const [aiOrganizeLogs, setAiOrganizeLogs] = useState<LogEntry[]>([]);
  const [aiOrganizeConsoleAutoScroll, setAiOrganizeConsoleAutoScroll] = useState(true);

  useEffect(() => {
    if (!aiOrganizeSessionId) return;

    const handler = (msg: any) => {
      const type = String(msg?.type ?? '').trim().toUpperCase();
      if (type !== 'AI_ORGANIZE_PROGRESS') return;
      const payload = msg?.payload;
      if (!payload || payload.sessionId !== aiOrganizeSessionId) return;

      setAiOrganizeLogs((prev) => {
        const next = [...prev, payload];
        return next.length > 500 ? next.slice(next.length - 500) : next;
      });
    };

    chrome.runtime.onMessage.addListener(handler);
    return () => {
      try {
        chrome.runtime.onMessage.removeListener(handler);
      } catch {
        // ignore
      }
    };
  }, [aiOrganizeSessionId]);

  const handleClearAiOrganizeLogs = useCallback(() => {
    setAiOrganizeLogs([]);
  }, []);

  const handleCloseAiOrganizeConsole = useCallback(() => {
    setAiOrganizeConsoleOpen(false);
    handleClearAiOrganizeLogs();
  }, [handleClearAiOrganizeLogs]);

  const handleStartAiOrganize = async () => {
    try {
      setAiOrganizeMessage(null);
      setAiOrganizeError(null);

      const sessionId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setAiOrganizeSessionId(sessionId);
      setAiOrganizeLogs([
        { ts: Date.now(), level: 'info', step: 'ui', message: t('settings_task_started') },
      ]);
      setAiOrganizeConsoleOpen(true);
      setAiOrganizeLoading(true);

      const resp = (await chrome.runtime.sendMessage({
        type: 'AI_ORGANIZE_NEWTAB_WORKSPACE',
        payload: {
          sessionId,
          rules: settings.workspaceAiOrganizeRules ?? '',
          maxBookmarks: settings.workspaceAiOrganizeMaxBookmarks ?? 300,
          enableHistoryHeat: settings.enableHistoryHeat ?? false,
          historyDays: settings.historyDays ?? 30,
          historyHeatTopN: settings.historyHeatTopN ?? 20,
          strictHierarchy: settings.workspaceAiOrganizeStrictHierarchy ?? false,
          allowNewFolders:
            (settings.workspaceAiOrganizeStrictHierarchy ?? false)
              ? false
              : (settings.workspaceAiOrganizeAllowNewFolders ?? true),
          preferOriginalPaths: settings.workspaceAiOrganizePreferOriginalPaths ?? true,
          verboseLogs: settings.workspaceAiOrganizeVerboseLogs ?? true,
          topLevelCount: settings.workspaceAiOrganizeTopLevelCount ?? 5,
          promptTemplate:
            (settings.enableWorkspaceAiOrganizeCustomPrompt ?? false)
              ? (settings.workspaceAiOrganizePrompt ?? '')
              : undefined,
        },
      })) as { success: boolean; data?: any; error?: string };

      if (!resp?.success) {
        throw new Error(resp?.error || 'AI 整理失败');
      }

      const createdFolders = resp.data?.createdFolders ?? 0;
      const createdBookmarks = resp.data?.createdBookmarks ?? 0;
      const processed = resp.data?.processed ?? resp.data?.total ?? 0;
      const truncated = resp.data?.truncated ? t('settings_truncated') : '';
      setAiOrganizeMessage(t('settings_organize_complete', [processed.toString(), truncated, createdFolders.toString(), createdBookmarks.toString()]));
    } catch (e) {
      setAiOrganizeError(e instanceof Error ? e.message : t('settings_ai_organize_failed'));
    } finally {
      setAiOrganizeLoading(false);
      setAiOrganizeSessionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <SettingSection title={t('settings_ai_organize')}>
        <ToggleItem
          label={t('settings_enable_ai_organize')}
          checked={settings.enableWorkspaceAiOrganize ?? true}
          onChange={(v) => updateSettings({ enableWorkspaceAiOrganize: v })}
        />

        <CustomRulesSection settings={settings} updateSettings={updateSettings} />
        <CustomPromptSection settings={settings} updateSettings={updateSettings} />
        <LimitsSection settings={settings} updateSettings={updateSettings} />
        <HistoryHeatSection settings={settings} updateSettings={updateSettings} />
        <HierarchyStrategySection settings={settings} updateSettings={updateSettings} />

        <button
          data-ai-organize-btn
          onClick={handleStartAiOrganize}
          disabled={aiOrganizeLoading}
          className="w-full px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-white/20 text-white text-sm transition-colors"
        >
          {aiOrganizeLoading ? t('settings_organizing') : t('settings_start_ai_organize')}
        </button>

        <button
          onClick={() => setAiOrganizeConsoleOpen(true)}
          className="w-full px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white/80 text-sm transition-colors"
        >
          {t('settings_view_terminal')}
        </button>

        {aiOrganizeMessage && <div className="text-xs text-green-400">{aiOrganizeMessage}</div>}
        {aiOrganizeError && <div className="text-xs text-red-400">{aiOrganizeError}</div>}

        <div className="text-xs text-white/40 leading-relaxed">
          {t('settings_ai_organize_warning')}
        </div>
      </SettingSection>

      {aiOrganizeConsoleOpen && (
        <AIOrganizeConsole
          logs={aiOrganizeLogs}
          sessionId={aiOrganizeSessionId}
          autoScroll={aiOrganizeConsoleAutoScroll}
          onAutoScrollChange={setAiOrganizeConsoleAutoScroll}
          onClear={handleClearAiOrganizeLogs}
          onClose={handleCloseAiOrganizeConsole}
        />
      )}
    </div>
  );
}

// 自定义规则部分
function CustomRulesSection({ settings, updateSettings }: { settings: any; updateSettings: any }) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-white/80">{t('settings_custom_rules')}</div>
      <textarea
        value={settings.workspaceAiOrganizeRules ?? ''}
        onChange={(e) => updateSettings({ workspaceAiOrganizeRules: e.target.value })}
        rows={6}
        placeholder={t('settings_custom_rules_placeholder')}
        className="w-full bg-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none border border-white/10 font-mono"
      />
      <div className="text-xs text-white/50">
        {t('settings_custom_rules_hint')}
      </div>
    </div>
  );
}

// 自定义提示词部分
function CustomPromptSection({ settings, updateSettings }: { settings: any; updateSettings: any }) {
  const enabled = settings.enableWorkspaceAiOrganizeCustomPrompt ?? false;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm text-white/80">{t('settings_custom_prompt')}</div>
        <button
          type="button"
          onClick={() => updateSettings({ enableWorkspaceAiOrganizeCustomPrompt: !enabled })}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
            enabled ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-white/10 text-white/70 hover:bg-white/15'
          }`}
        >
          {enabled ? t('settings_enabled') : t('settings_disabled')}
        </button>
      </div>

      {enabled && (
        <>
          <textarea
            value={settings.workspaceAiOrganizePrompt ?? ''}
            onChange={(e) => updateSettings({ workspaceAiOrganizePrompt: e.target.value })}
            rows={10}
            placeholder={t('settings_prompt_variables_hint')}
            className="w-full bg-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none border border-white/10 font-mono"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => updateSettings({ workspaceAiOrganizePrompt: NEWTAB_WORKSPACE_ORGANIZE_PROMPT_TEMPLATE })}
              className="text-xs px-2 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            >
              {t('settings_use_default_template')}
            </button>
            <button
              type="button"
              onClick={() => updateSettings({ workspaceAiOrganizePrompt: '' })}
              className="text-xs px-2 py-1 rounded-md bg-white/10 hover:bg-white/15 text-white/80 transition-colors"
            >
              {t('settings_clear')}
            </button>
          </div>
          <div className="text-xs text-white/50">
            {t('settings_prompt_json_hint')}
          </div>
        </>
      )}
    </div>
  );
}

// 限制设置部分
function LimitsSection({ settings, updateSettings }: { settings: any; updateSettings: any }) {
  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-white/80">{t('settings_domain_limit')}</div>
          <input
            type="number"
            min={50}
            max={2000}
            value={settings.workspaceAiOrganizeMaxBookmarks ?? 300}
            onChange={(e) => updateSettings({ workspaceAiOrganizeMaxBookmarks: Number(e.target.value) })}
            className="w-28 bg-white/10 text-white text-sm rounded-lg px-3 py-1.5 outline-none border border-white/10"
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-white/80">{t('settings_top_level_count')}</div>
          <input
            type="number"
            min={2}
            max={7}
            value={settings.workspaceAiOrganizeTopLevelCount ?? 5}
            onChange={(e) => {
              const raw = Number(e.target.value);
              if (Number.isNaN(raw)) return;
              const clamped = Math.max(2, Math.min(7, Math.round(raw)));
              updateSettings({ workspaceAiOrganizeTopLevelCount: clamped });
            }}
            className="w-28 bg-white/10 text-white text-sm rounded-lg px-3 py-1.5 outline-none border border-white/10"
          />
        </div>
      </div>

      <div className="text-xs text-white/50 -mt-1 space-y-1">
        <p>{t('settings_domain_limit_hint')}</p>
        <p>{t('settings_batch_hint')}</p>
        <p>{t('settings_top_level_hint')}</p>
      </div>
    </>
  );
}

// 历史热度部分
function HistoryHeatSection({ settings, updateSettings }: { settings: any; updateSettings: any }) {
  const enabled = settings.enableHistoryHeat ?? false;

  return (
    <>
      <ToggleItem
        label={t('settings_history_heat')}
        checked={enabled}
        onChange={(v) => updateSettings({ enableHistoryHeat: v })}
      />

      {enabled && (
        <>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-white/80">{t('settings_history_days')}</div>
              <input
                type="number"
                min={1}
                max={90}
                value={settings.historyDays ?? 30}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (Number.isNaN(value)) return;
                  updateSettings({ historyDays: value });
                }}
                className="w-28 bg-white/10 text-white text-sm rounded-lg px-3 py-1.5 outline-none border border-white/10"
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-white/80">{t('settings_history_top_n')}</div>
              <input
                type="number"
                min={5}
                max={100}
                value={settings.historyHeatTopN ?? 20}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (Number.isNaN(value)) return;
                  updateSettings({ historyHeatTopN: value });
                }}
                className="w-28 bg-white/10 text-white text-sm rounded-lg px-3 py-1.5 outline-none border border-white/10"
              />
            </div>
          </div>
          <div className="text-xs text-white/50 -mt-1 space-y-1">
            <p>{t('settings_history_heat_hint_1')}</p>
            <p>{t('settings_history_heat_hint_2')}</p>
          </div>
        </>
      )}
    </>
  );
}

// 层级策略部分
function HierarchyStrategySection({ settings, updateSettings }: { settings: any; updateSettings: any }) {
  return (
    <div className="space-y-3 pt-2">
      <div className="text-sm text-white/80">{t('settings_hierarchy_strategy')}</div>
      <div className="space-y-1">
        <ToggleItem
          label={t('settings_strict_hierarchy')}
          checked={settings.workspaceAiOrganizeStrictHierarchy ?? false}
          onChange={(v) => {
            updateSettings({
              workspaceAiOrganizeStrictHierarchy: v,
              ...(v ? { workspaceAiOrganizeAllowNewFolders: false } : {}),
            });
          }}
        />
        <div className="text-xs text-white/50 ml-6 -mt-1">
          {t('settings_strict_hierarchy_hint')}
        </div>
      </div>
      <div className="space-y-1">
        <ToggleItem
          label={t('settings_allow_new_folders')}
          checked={settings.workspaceAiOrganizeAllowNewFolders ?? true}
          onChange={(v) => updateSettings({ workspaceAiOrganizeAllowNewFolders: v })}
          disabled={settings.workspaceAiOrganizeStrictHierarchy ?? false}
        />
        <div className="text-xs text-white/50 ml-6 -mt-1">
          {t('settings_allow_new_folders_hint')}
        </div>
      </div>
      <div className="space-y-1">
        <ToggleItem
          label={t('settings_prefer_original_paths')}
          checked={settings.workspaceAiOrganizePreferOriginalPaths ?? true}
          onChange={(v) => updateSettings({ workspaceAiOrganizePreferOriginalPaths: v })}
        />
        <div className="text-xs text-white/50 ml-6 -mt-1">
          {t('settings_prefer_original_paths_hint')}
        </div>
      </div>
      <div className="space-y-1">
        <ToggleItem
          label={t('settings_verbose_logs')}
          checked={settings.workspaceAiOrganizeVerboseLogs ?? true}
          onChange={(v) => updateSettings({ workspaceAiOrganizeVerboseLogs: v })}
        />
        <div className="text-xs text-white/50 ml-6 -mt-1">
          {t('settings_verbose_logs_hint')}
        </div>
      </div>
    </div>
  );
}

// AI 整理控制台
function AIOrganizeConsole({
  logs,
  sessionId,
  autoScroll,
  onAutoScrollChange,
  onClear,
  onClose,
}: {
  logs: LogEntry[];
  sessionId: string | null;
  autoScroll: boolean;
  onAutoScrollChange: (v: boolean) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const handleCopyLogs = () => {
    try {
      const text = logs
        .map((l) => {
          const ts = typeof l.ts === 'number' ? new Date(l.ts).toISOString() : '';
          const base = `[${ts}] [${String(l.level || '')}] [${String(l.step || '')}] ${String(l.message || '')}`;
          if (typeof l.detail === 'undefined' || l.detail === null) return base;
          try {
            return `${base}\n${JSON.stringify(l.detail, null, 2)}`;
          } catch {
            return `${base}\n${String(l.detail)}`;
          }
        })
        .join('\n');
      navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center"
      style={{ zIndex: Z_INDEX.MODAL_CONTENT + 1 }}
      onClick={onClose}
    >
      <div
        className="w-[900px] max-w-[95%] h-[460px] rounded-2xl bg-black/80 border border-white/10 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="text-sm font-medium text-white/90">{t('settings_ai_terminal')}</div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-white/70 select-none">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => onAutoScrollChange(e.target.checked)}
                className="accent-blue-500"
              />
              {t('settings_auto_scroll')}
            </label>
            <button
              onClick={onClear}
              className="text-xs px-2 py-1 rounded-md bg-white/10 hover:bg-white/15 text-white/80"
            >
              {t('settings_clear')}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/70" />
            </button>
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto px-4 py-3 font-mono text-xs leading-relaxed"
          ref={(el) => {
            if (!el || !autoScroll) return;
            setTimeout(() => {
              try {
                el.scrollTop = el.scrollHeight;
              } catch {
                // ignore
              }
            }, 0);
          }}
        >
          {logs.length === 0 ? (
            <div className="text-white/50">{t('settings_no_logs')}</div>
          ) : (
            <div className="space-y-2">
              {logs.map((l, idx) => {
                const ts = typeof l.ts === 'number' ? new Date(l.ts).toLocaleTimeString() : '';
                const level = String(l.level || 'info');
                const color =
                  level === 'error'
                    ? 'text-red-300'
                    : level === 'warn'
                      ? 'text-yellow-300'
                      : level === 'success'
                        ? 'text-green-300'
                        : 'text-white/80';

                return (
                  <div key={idx} className="whitespace-pre-wrap break-words">
                    <div className={color}>
                      [{ts}] [{level}] [{String(l.step || '')}] {String(l.message || '')}
                    </div>
                    {typeof l.detail !== 'undefined' && l.detail !== null && (
                      <div className="text-white/50 mt-1">
                        {(() => {
                          try {
                            return JSON.stringify(l.detail, null, 2);
                          } catch {
                            return String(l.detail);
                          }
                        })()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between gap-3">
          <div className="text-xs text-white/50 truncate">{t('session_label')}: {sessionId || '-'}</div>
          <button
            onClick={handleCopyLogs}
            className="text-xs px-3 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white"
          >
            {t('settings_copy_logs')}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { db } from '@/lib/db';
import type { AIProvider, AIConnectionInfo } from '@/types';
import { DEFAULT_PROMPT_TEMPLATE } from '@/lib/constants/prompts';
import { canFetchModels, fetchAvailableModels } from '@/lib/services/ai-models';
import { applyTheme, applyThemeStyle, initThemeListener } from '@/lib/utils/themeManager';
import { t } from '@/lib/i18n';

export interface OptionsFormData {
  theme: 'light' | 'dark' | 'auto';
  themeStyle: 'default' | 'bw' | 'tmarks';
  aiProvider: AIProvider;
  apiKey: string;
  apiUrl: string;
  aiModel: string;
  bookmarkApiUrl: string;
  bookmarkApiKey: string;
  enableCustomPrompt: boolean;
  customPrompt: string;
  maxSuggestedTags: number;
  defaultVisibility: 'public' | 'private';
  enableAI: boolean;
  defaultIncludeThumbnail: boolean;
  defaultCreateSnapshot: boolean;
  tagTheme: 'classic' | 'mono' | 'bw';
  newtabFolderRecommendCount: number;
  enableNewtabAI: boolean;
  enableNewtabFolderPrompt: boolean;
  newtabFolderPrompt: string;
}

export function useOptionsForm() {
  const {
    config,
    loadConfig,
    saveConfig,
    syncCache,
    error,
    successMessage,
    isLoading,
    setError,
    setSuccessMessage,
  } = useAppStore();

  const [formData, setFormData] = useState<OptionsFormData>({
    theme: 'auto',
    themeStyle: 'default',
    aiProvider: 'openai',
    apiKey: '',
    apiUrl: '',
    aiModel: '',
    bookmarkApiUrl: '',
    bookmarkApiKey: '',
    enableCustomPrompt: false,
    customPrompt: DEFAULT_PROMPT_TEMPLATE,
    maxSuggestedTags: 5,
    defaultVisibility: 'public',
    enableAI: true,
    defaultIncludeThumbnail: true,
    defaultCreateSnapshot: false,
    tagTheme: 'classic',
    newtabFolderRecommendCount: 10,
    enableNewtabAI: true,
    enableNewtabFolderPrompt: false,
    newtabFolderPrompt: '',
  });

  const [stats, setStats] = useState({
    tags: 0,
    bookmarks: 0,
    lastSync: 0,
  });

  const [isTesting, setIsTesting] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [modelFetchError, setModelFetchError] = useState<string | null>(null);
  const [modelFetchNonce, setModelFetchNonce] = useState(0);
  const lastModelFetchSignature = useRef<string | null>(null);

  const [savedConnections, setSavedConnections] = useState<Partial<Record<AIProvider, AIConnectionInfo[]>>>({});
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [presetLabel, setPresetLabel] = useState('');
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [presetError, setPresetError] = useState<string | null>(null);

  const MAX_SAVED_CONNECTIONS = 10;
  const generateConnectionId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

  const normalizeSavedConnections = (input?: Partial<Record<AIProvider, AIConnectionInfo[]>>) => {
    const normalized: Partial<Record<AIProvider, AIConnectionInfo[]>> = {};

    if (!input) {
      return normalized;
    }

    (Object.keys(input) as AIProvider[]).forEach((provider) => {
      const list = input[provider] || [];
      normalized[provider] = Array.isArray(list)
        ? list.slice(0, MAX_SAVED_CONNECTIONS).map((item) => ({
            ...item,
            provider: item.provider || provider,
            id: item.id || generateConnectionId(),
          }))
        : [];
    });

    return normalized;
  };

  const upsertSavedConnection = (
    existing: Partial<Record<AIProvider, AIConnectionInfo[]>>,
    provider: AIProvider,
    connection: AIConnectionInfo
  ): Partial<Record<AIProvider, AIConnectionInfo[]>> => {
    const list = existing[provider] || [];
    const normalizedUrl = (connection.apiUrl || '').trim();
    const normalizedKey = (connection.apiKey || '').trim();
    const normalizedModel = (connection.model || '').trim();

    const newEntry: AIConnectionInfo = {
      ...connection,
      apiUrl: normalizedUrl || undefined,
      apiKey: normalizedKey || undefined,
      model: normalizedModel || undefined,
      provider,
      label: connection.label?.trim() || connection.label,
      lastUsedAt: Date.now(),
      id: connection.id || generateConnectionId(),
    };

    const hasId = Boolean(connection.id);
    const existingIndex = hasId ? list.findIndex((item) => item.id && item.id === connection.id) : -1;
    let updatedList: AIConnectionInfo[];

    if (hasId && existingIndex >= 0) {
      updatedList = [...list];
      updatedList[existingIndex] = newEntry;
    } else {
      updatedList = [newEntry, ...list].slice(0, MAX_SAVED_CONNECTIONS);
    }

    return {
      ...existing,
      [provider]: updatedList,
    };
  };

  const removeSavedConnection = (
    existing: Partial<Record<AIProvider, AIConnectionInfo[]>>,
    provider: AIProvider,
    target: AIConnectionInfo
  ): Partial<Record<AIProvider, AIConnectionInfo[]>> => {
    const list = existing[provider] || [];
    const normalizedUrl = (target.apiUrl || '').trim();
    const normalizedKey = (target.apiKey || '').trim();
    const normalizedModel = (target.model || '').trim();

    const filtered = list.filter((item) => {
      if (target.id && item.id) {
        return item.id !== target.id;
      }

      return (
        (item.apiUrl || '').trim() !== normalizedUrl ||
        (item.apiKey || '').trim() !== normalizedKey ||
        (item.model || '').trim() !== normalizedModel
      );
    });

    const updated: Partial<Record<AIProvider, AIConnectionInfo[]>> = {
      ...existing,
    };

    if (filtered.length > 0) {
      updated[provider] = filtered;
    } else {
      delete updated[provider];
    }

    return updated;
  };

  useEffect(() => {
    const init = async () => {
      await loadConfig();
      const dbStats = await db.getStats();
      setStats(dbStats);
    };

    init();
  }, []);

  useEffect(() => {
    applyTheme(formData.theme);
    return initThemeListener(() => formData.theme);
  }, [formData.theme]);

  useEffect(() => {
    applyThemeStyle(formData.themeStyle);
  }, [formData.themeStyle]);

  useEffect(() => {
    if (!config) {
      return;
    }

    const currentProvider = config.aiConfig.provider;
    const currentApiKey = config.aiConfig.apiKeys[currentProvider] || '';
    const currentApiUrl = config.aiConfig.apiUrls?.[currentProvider] || '';

    setFormData((prev) => ({
      ...prev,
      theme: config.preferences.theme ?? 'auto',
      themeStyle: config.preferences.themeStyle ?? 'default',
      aiProvider: currentProvider,
      apiKey: currentApiKey,
      apiUrl: currentApiUrl,
      aiModel: config.aiConfig.model || '',
      bookmarkApiUrl: config.bookmarkSite.apiUrl,
      bookmarkApiKey: config.bookmarkSite.apiKey,
      enableCustomPrompt: config.aiConfig.enableCustomPrompt || false,
      customPrompt: config.aiConfig.customPrompt || prev.customPrompt,
      maxSuggestedTags: config.preferences.maxSuggestedTags,
      defaultVisibility: config.preferences.defaultVisibility,
      enableAI: config.preferences.enableAI ?? true,
      defaultIncludeThumbnail: config.preferences.defaultIncludeThumbnail ?? true,
      defaultCreateSnapshot: config.preferences.defaultCreateSnapshot ?? false,
      tagTheme: config.preferences.tagTheme ?? 'classic',
      newtabFolderRecommendCount: Math.min(20, Math.max(1, Number(config.preferences.newtabFolderRecommendCount ?? 10))),
      enableNewtabAI: config.preferences.enableNewtabAI ?? true,
      enableNewtabFolderPrompt: config.preferences.enableNewtabFolderPrompt ?? false,
      newtabFolderPrompt: config.preferences.newtabFolderPrompt ?? '',
    }));

    const normalizedSaved = normalizeSavedConnections(config.aiConfig.savedConnections);
    setSavedConnections(normalizedSaved);
  }, [config]);

  const handleProviderChange = (newProvider: AIProvider) => {
    const newApiKey = config?.aiConfig.apiKeys[newProvider] || '';
    const newApiUrl = config?.aiConfig.apiUrls?.[newProvider] || '';

    setFormData((prev) => ({
      ...prev,
      aiProvider: newProvider,
      apiKey: newApiKey,
      apiUrl: newApiUrl,
    }));

    setAvailableModels([]);
    setModelFetchError(null);
    lastModelFetchSignature.current = null;
  };

  useEffect(() => {
    const supported = canFetchModels(formData.aiProvider, formData.apiUrl);
    const trimmedKey = formData.apiKey.trim();

    if (!supported || !trimmedKey) {
      setAvailableModels([]);
      setModelFetchError(null);
      setIsFetchingModels(false);
      lastModelFetchSignature.current = null;
      return;
    }

    const signature = `${formData.aiProvider}|${(formData.apiUrl || '').trim()}|${trimmedKey}|${modelFetchNonce}`;

    if (lastModelFetchSignature.current === signature) {
      return;
    }

    let cancelled = false;

    const fetchModels = async () => {
      setIsFetchingModels(true);
      setModelFetchError(null);

      try {
        const models = await fetchAvailableModels(formData.aiProvider, trimmedKey, formData.apiUrl);

        if (cancelled) return;

        setAvailableModels(models);
        setIsFetchingModels(false);
        setModelFetchError(null);
        lastModelFetchSignature.current = signature;

        setFormData((prev) => {
          if (prev.aiModel) {
            return prev;
          }
          return {
            ...prev,
            aiModel: models[0] || '',
          };
        });
      } catch (e) {
        if (cancelled) return;

        setAvailableModels([]);
        setModelFetchError(e instanceof Error ? e.message : String(e));
        setIsFetchingModels(false);
        lastModelFetchSignature.current = signature;
      }
    };

    fetchModels();

    return () => {
      cancelled = true;
    };
  }, [formData.aiProvider, formData.apiUrl, formData.apiKey, modelFetchNonce]);

  const refreshModelOptions = () => {
    if (!canFetchModels(formData.aiProvider, formData.apiUrl) || !formData.apiKey.trim()) {
      return;
    }
    lastModelFetchSignature.current = null;
    setModelFetchNonce((prev) => prev + 1);
  };

  const handleSave = async () => {
    try {
      await saveConfig({
        aiConfig: {
          provider: formData.aiProvider,
          apiKeys: {
            ...config?.aiConfig.apiKeys,
            [formData.aiProvider]: formData.apiKey,
          },
          apiUrls: {
            ...config?.aiConfig.apiUrls,
            [formData.aiProvider]: formData.apiUrl,
          },
          model: formData.aiModel,
          enableCustomPrompt: formData.enableCustomPrompt,
          customPrompt: formData.customPrompt,
          savedConnections,
        },
        bookmarkSite: {
          apiUrl: formData.bookmarkApiUrl,
          apiKey: formData.bookmarkApiKey,
        },
        preferences: {
          theme: formData.theme,
          themeStyle: formData.themeStyle,
          autoSync: config?.preferences.autoSync ?? true,
          syncInterval: config?.preferences.syncInterval ?? 24,
          maxSuggestedTags: formData.maxSuggestedTags,
          defaultVisibility: formData.defaultVisibility,
          enableAI: formData.enableAI,
          defaultIncludeThumbnail: formData.defaultIncludeThumbnail,
          defaultCreateSnapshot: formData.defaultCreateSnapshot,
          tagTheme: formData.tagTheme,
          newtabFolderRecommendCount: Math.min(20, Math.max(1, Number(formData.newtabFolderRecommendCount ?? 10))),
          enableNewtabAI: formData.enableNewtabAI,
          enableNewtabFolderPrompt: formData.enableNewtabFolderPrompt,
          newtabFolderPrompt: formData.newtabFolderPrompt,
        },
      });

      setSuccessMessage(t('msg_settings_saved'));
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('error_save_failed'));
    }
  };

  const handleSync = async () => {
    try {
      await syncCache();
      const dbStats = await db.getStats();
      setStats(dbStats);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('error_save_failed'));
    }
  };

  const handleTestAPI = async () => {
    try {
      setIsTesting(true);
      setError(null);

      const { getAIProvider } = await import('@/lib/providers');
      const provider = getAIProvider(formData.aiProvider);

      const testRequest = {
        page: {
          title: 'Claude Code - AI Programming Assistant',
          url: 'https://claude.ai',
          description: 'Claude is a powerful AI programming assistant',
          content: 'Claude Code is an intelligent programming tool by Anthropic, supporting multiple programming languages and frameworks.',
        },
        context: {
          existingTags: ['Dev Tools', 'AI', 'Programming', 'Productivity'],
          recentBookmarks: [],
        },
        options: {
          maxTags: 3,
          preferExisting: true,
        },
      };

      const response = await provider.generateTags(
        testRequest,
        formData.apiKey,
        formData.aiModel || undefined,
        formData.apiUrl || undefined,
        formData.enableCustomPrompt ? formData.customPrompt : undefined
      );

      setSuccessMessage(
        t('api_test_success', [String(response.suggestedTags.length), response.suggestedTags.map((tag: any) => tag.name).join(', ')])
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('api_test_failed'));
    } finally {
      setIsTesting(false);
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return t('never_synced');
    return new Date(timestamp).toLocaleString();
  };

  const handleReset = () => {
    if (confirm(t('confirm_reset'))) {
      setFormData({
        theme: 'auto',
        themeStyle: 'default',
        aiProvider: 'openai',
        apiKey: '',
        apiUrl: '',
        aiModel: '',
        bookmarkApiUrl: '',
        bookmarkApiKey: '',
        enableCustomPrompt: false,
        customPrompt: DEFAULT_PROMPT_TEMPLATE,
        maxSuggestedTags: 5,
        defaultVisibility: 'public',
        enableAI: true,
        defaultIncludeThumbnail: true,
        defaultCreateSnapshot: false,
        tagTheme: 'classic',
        newtabFolderRecommendCount: 10,
        enableNewtabAI: true,
        enableNewtabFolderPrompt: false,
        newtabFolderPrompt: '',
      });
      setSuccessMessage(t('msg_settings_reset'));
      setTimeout(() => setSuccessMessage(null), 2000);
    }
  };

  const allSavedConnections = useMemo(() => {
    return Object.entries(savedConnections).flatMap(([provider, list]) =>
      (list || []).map((connection) => ({
        ...connection,
        provider: connection.provider || (provider as AIProvider),
      }))
    );
  }, [savedConnections]);

  const modelFetchSupported = canFetchModels(formData.aiProvider, formData.apiUrl);

  const handleSaveConnectionPreset = () => {
    const trimmedKey = formData.apiKey.trim();
    if (!trimmedKey) {
      setError(t('error_api_key_required'));
      return;
    }

    const defaultName = t('preset_default_name', String((savedConnections[formData.aiProvider]?.length || 0) + 1));
    setPresetLabel(defaultName);
    setPresetError(null);
    setIsPresetModalOpen(true);
  };

  const handleConfirmSaveConnectionPreset = async () => {
    const trimmedKey = formData.apiKey.trim();
    if (!trimmedKey) {
      setPresetError(t('error_api_key_required'));
      return;
    }

    const trimmedLabel = presetLabel.trim();
    if (!trimmedLabel) {
      setPresetError(t('error_preset_name_required'));
      return;
    }

    if (!config) {
      setError(t('error_config_not_loaded'));
      setIsPresetModalOpen(false);
      return;
    }

    setIsSavingPreset(true);
    setPresetError(null);

    const connection: AIConnectionInfo = {
      apiUrl: formData.apiUrl,
      apiKey: trimmedKey,
      model: formData.aiModel,
      label: trimmedLabel,
      provider: formData.aiProvider,
    };

    const previous = savedConnections;
    const updated = upsertSavedConnection(previous, formData.aiProvider, connection);
    setSavedConnections(updated);

    try {
      await saveConfig({
        aiConfig: {
          ...config.aiConfig,
          savedConnections: updated,
        },
      });
      setSuccessMessage(t('msg_preset_saved', trimmedLabel));
      setTimeout(() => setSuccessMessage(null), 2000);
      setIsPresetModalOpen(false);
    } catch (e) {
      setSavedConnections(previous);
      setPresetError(e instanceof Error ? e.message : t('error_save_preset_failed'));
    } finally {
      setIsSavingPreset(false);
    }
  };

  const handleClosePresetModal = () => {
    if (isSavingPreset) {
      return;
    }
    setIsPresetModalOpen(false);
    setPresetError(null);
  };

  const handleApplySavedConnection = (connection: AIConnectionInfo, providerOverride?: AIProvider) => {
    const targetProvider = providerOverride || connection.provider || formData.aiProvider;

    setFormData((prev) => ({
      ...prev,
      aiProvider: targetProvider,
      apiUrl: connection.apiUrl || '',
      apiKey: connection.apiKey || '',
      aiModel: connection.model || '',
    }));

    if (targetProvider !== formData.aiProvider) {
      setAvailableModels([]);
      setModelFetchError(null);
      lastModelFetchSignature.current = null;
    }
  };

  const handleDeleteSavedConnection = async (connection: AIConnectionInfo, providerOverride?: AIProvider) => {
    const provider = providerOverride || connection.provider || formData.aiProvider;
    if (!provider) {
      setError(t('error_provider_unknown'));
      return;
    }

    const previous = savedConnections;
    const updated = removeSavedConnection(previous, provider, connection);
    setSavedConnections(updated);

    try {
      if (!config) {
        throw new Error(t('error_config_not_loaded'));
      }
      await saveConfig({
        aiConfig: {
          ...config.aiConfig,
          savedConnections: updated,
        },
      });
      setSuccessMessage(t('msg_connection_deleted'));
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (e) {
      setSavedConnections(previous);
      setError(e instanceof Error ? e.message : t('error_delete_connection_failed'));
    }
  };

  return {
    config,
    error,
    successMessage,
    isLoading,
    setError,
    setSuccessMessage,

    formData,
    setFormData,

    stats,
    isTesting,

    availableModels,
    isFetchingModels,
    modelFetchError,
    modelFetchSupported,

    savedConnections,
    allSavedConnections,

    isPresetModalOpen,
    presetLabel,
    isSavingPreset,
    presetError,

    setPresetLabel,

    handleProviderChange,
    refreshModelOptions,
    handleSave,
    handleSync,
    handleTestAPI,
    formatDate,
    handleReset,

    handleSaveConnectionPreset,
    handleConfirmSaveConnectionPreset,
    handleClosePresetModal,
    handleApplySavedConnection,
    handleDeleteSavedConnection,
  };
}

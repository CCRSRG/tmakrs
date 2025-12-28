import { useState, useEffect } from 'react';
import { Folder, Plus, List } from 'lucide-react';
import { t } from '@/lib/i18n';
import type { TMarksTabGroup } from '@/lib/api/tmarks/tab-groups';

export interface CollectionOption {
  mode: 'new' | 'existing' | 'folder';
  targetId?: string;
  title?: string;
}

interface CollectionOptionsDialogProps {
  tabCount: number;
  groups: TMarksTabGroup[];
  onConfirm: (option: CollectionOption) => void;
  onCancel: () => void;
  onCreateFolder?: (title: string) => Promise<TMarksTabGroup>;
}

export function CollectionOptionsDialog({
  tabCount,
  groups,
  onConfirm,
  onCancel,
  onCreateFolder,
}: CollectionOptionsDialogProps) {
  const [mode, setMode] = useState<'new' | 'existing' | 'folder'>('new');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('__new__');
  const [newGroupTitle, setNewGroupTitle] = useState<string>('');
  const [newFolderTitle, setNewFolderTitle] = useState<string>('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const folders = groups.filter(g => g.is_folder === 1);
  const regularGroups = groups.filter(g => g.is_folder === 0);

  useEffect(() => {
    if (mode === 'existing' && regularGroups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(regularGroups[0].id);
    }
    if (mode === 'folder') {
      if (folders.length > 0 && !selectedFolderId) {
        setSelectedFolderId(folders[0].id);
      } else if (folders.length === 0) {
        setSelectedFolderId('__new__');
      }
    }
  }, [mode, regularGroups, folders, selectedGroupId, selectedFolderId]);

  const handleConfirm = async () => {
    const option: CollectionOption = { mode };

    if (mode === 'existing') {
      if (!selectedGroupId) {
        alert(t('alert_select_group'));
        return;
      }
      option.targetId = selectedGroupId;
    } else if (mode === 'folder') {
      if (selectedFolderId === '__new__') {
        const folderTitle = newFolderTitle.trim();
        if (!folderTitle) {
          alert(t('alert_enter_folder_name'));
          return;
        }
        
        if (!onCreateFolder) {
          alert(t('alert_create_folder_unavailable'));
          return;
        }

        try {
          setIsCreatingFolder(true);
          const newFolder = await onCreateFolder(folderTitle);
          option.mode = 'folder';
          option.targetId = newFolder.id;
          option.title = newGroupTitle.trim() || undefined;
        } catch (error) {
          alert(t('alert_create_folder_failed', error instanceof Error ? error.message : t('error_unknown')));
          return;
        } finally {
          setIsCreatingFolder(false);
        }
      } else {
        if (!selectedFolderId) {
          alert(t('alert_select_folder'));
          return;
        }
        option.targetId = selectedFolderId;
        option.title = newGroupTitle.trim() || undefined;
      }
    } else {
      option.title = newGroupTitle.trim() || undefined;
    }

    onConfirm(option);
  };

  return (
    <div className="fixed inset-0 bg-[color:var(--tab-overlay)] flex items-center justify-center z-50 p-4">
      <div className="bg-[color:var(--tab-surface)] rounded-2xl shadow-2xl w-full max-w-[680px] max-h-[520px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[color:var(--tab-border)] bg-[color:var(--tab-message-info-bg)]">
          <h2 className="text-base font-bold text-[var(--tab-text)]">{t('collection_title')}</h2>
          <p className="text-xs text-[var(--tab-text-muted)] mt-0.5">{t('collection_selected', String(tabCount))}</p>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Icon buttons */}
          <div className="w-14 border-r border-[color:var(--tab-border)] bg-[color:var(--tab-surface-muted)] py-3 flex flex-col items-center space-y-2 overflow-y-auto">
            <button
              onClick={() => setMode('new')}
              title={t('collection_create_group')}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                mode === 'new'
                  ? 'bg-[var(--tab-popup-primary-from)] text-[var(--tab-popup-primary-text)] shadow-md'
                  : 'bg-[color:var(--tab-surface)] text-[var(--tab-text-muted)] hover:bg-[color:var(--tab-surface-muted)] hover:text-[var(--tab-text)] border border-[color:var(--tab-border)]'
              }`}
            >
              <Plus className="w-5 h-5" />
            </button>

            <button
              onClick={() => setMode('existing')}
              disabled={regularGroups.length === 0}
              title={regularGroups.length === 0 ? t('collection_no_groups') : t('collection_add_to_existing')}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                mode === 'existing'
                  ? 'bg-[var(--tab-popup-primary-from)] text-[var(--tab-popup-primary-text)] shadow-md'
                  : regularGroups.length === 0
                  ? 'bg-[color:var(--tab-surface)] text-[var(--tab-text-muted)] opacity-50 cursor-not-allowed'
                  : 'bg-[color:var(--tab-surface)] text-[var(--tab-text-muted)] hover:bg-[color:var(--tab-surface-muted)] hover:text-[var(--tab-text)] border border-[color:var(--tab-border)]'
              }`}
            >
              <List className="w-5 h-5" />
            </button>

            <button
              onClick={() => setMode('folder')}
              disabled={folders.length === 0}
              title={folders.length === 0 ? t('collection_no_folders') : t('collection_add_to_folder')}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                mode === 'folder'
                  ? 'bg-[var(--tab-popup-primary-from)] text-[var(--tab-popup-primary-text)] shadow-md'
                  : folders.length === 0
                  ? 'bg-[color:var(--tab-surface)] text-[var(--tab-text-muted)] opacity-50 cursor-not-allowed'
                  : 'bg-[color:var(--tab-surface)] text-[var(--tab-text-muted)] hover:bg-[color:var(--tab-surface-muted)] hover:text-[var(--tab-text)] border border-[color:var(--tab-border)]'
              }`}
            >
              <Folder className="w-5 h-5" />
            </button>
          </div>

          {/* Right: Config area */}
          <div className="flex-1 p-5 overflow-y-auto bg-[color:var(--tab-surface)]">
            {mode === 'new' && (
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--tab-text)] mb-1.5">{t('collection_create_group')}</h3>
                  <p className="text-xs text-[var(--tab-text-muted)] mb-3">{t('collection_create_group_desc')}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--tab-text)] mb-1.5">
                    {t('collection_group_name_optional')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('placeholder_group_name')}
                    value={newGroupTitle}
                    onChange={(e) => setNewGroupTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-[color:var(--tab-border-strong)] rounded-lg text-xs bg-[color:var(--tab-surface)] text-[var(--tab-text)] placeholder:text-[var(--tab-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--tab-message-info-icon)] focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {mode === 'existing' && (
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--tab-text)] mb-1.5">{t('collection_add_to_existing')}</h3>
                  <p className="text-xs text-[var(--tab-text-muted)] mb-3">{t('collection_add_to_existing_desc')}</p>
                </div>
                {regularGroups.length > 0 ? (
                  <div>
                    <label className="block text-xs font-medium text-[var(--tab-text)] mb-1.5">
                      {t('collection_select_target_group')}
                    </label>
                    <select
                      value={selectedGroupId}
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                      className="w-full px-3 py-2 border border-[color:var(--tab-border-strong)] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[var(--tab-message-info-icon)] focus:border-transparent bg-[color:var(--tab-surface)] text-[var(--tab-text)]"
                    >
                      {regularGroups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.title} ({t('group_item_count', String(group.item_count || 0))})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <List className="w-10 h-10 text-[var(--tab-text-muted)] mb-2" />
                    <p className="text-xs text-[var(--tab-text-muted)]">{t('collection_no_groups')}</p>
                    <p className="text-[10px] text-[var(--tab-text-muted)] mt-0.5">{t('collection_no_groups_hint')}</p>
                  </div>
                )}
              </div>
            )}

            {mode === 'folder' && (
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--tab-text)] mb-1.5">{t('collection_add_to_folder')}</h3>
                  <p className="text-xs text-[var(--tab-text-muted)] mb-3">{t('collection_add_to_folder_desc')}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--tab-text)] mb-1.5">
                    {t('collection_select_folder')}
                  </label>
                  <select
                    value={selectedFolderId}
                    onChange={(e) => setSelectedFolderId(e.target.value)}
                    className="w-full px-3 py-2 border border-[color:var(--tab-border-strong)] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[var(--tab-message-info-icon)] focus:border-transparent bg-[color:var(--tab-surface)] text-[var(--tab-text)]"
                  >
                    <option value="__new__">{t('collection_new_folder')}</option>
                    {folders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.title}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedFolderId === '__new__' && (
                  <div>
                    <label className="block text-xs font-medium text-[var(--tab-text)] mb-1.5">
                      {t('collection_folder_name')}
                    </label>
                    <input
                      type="text"
                      placeholder={t('placeholder_folder_name')}
                      value={newFolderTitle}
                      onChange={(e) => setNewFolderTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-[color:var(--tab-border-strong)] rounded-lg text-xs bg-[color:var(--tab-surface)] text-[var(--tab-text)] placeholder:text-[var(--tab-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--tab-message-info-icon)] focus:border-transparent"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[var(--tab-text)] mb-1.5">
                    {t('collection_new_group_name_optional')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('placeholder_group_name')}
                    value={newGroupTitle}
                    onChange={(e) => setNewGroupTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-[color:var(--tab-border-strong)] rounded-lg text-xs bg-[color:var(--tab-surface)] text-[var(--tab-text)] placeholder:text-[var(--tab-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--tab-message-info-icon)] focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[color:var(--tab-border)] bg-[color:var(--tab-surface-muted)] flex justify-end space-x-2.5">
          <button
            onClick={onCancel}
            disabled={isCreatingFolder}
            className="px-4 py-2 text-xs font-medium text-[var(--tab-text)] bg-[color:var(--tab-surface)] border border-[color:var(--tab-border-strong)] rounded-lg hover:bg-[color:var(--tab-surface-muted)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('btn_cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isCreatingFolder}
            className="px-4 py-2 text-xs font-medium text-[var(--tab-popup-primary-text)] bg-[var(--tab-popup-primary-from)] rounded-lg hover:opacity-90 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreatingFolder ? t('btn_creating') : t('btn_confirm_collect')}
          </button>
        </div>
      </div>
    </div>
  );
}

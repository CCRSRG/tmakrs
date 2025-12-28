/**
 * 设置面板组件 - 多标签页版本
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Cloud, User, Palette, Sparkles } from 'lucide-react';
import { t } from '@/lib/i18n';
import { Z_INDEX } from '../../constants/z-index';
import { GeneralTab, AppearanceTab, SyncTab, AITab } from './tabs';

interface SettingsPanelProps {
  onClose: () => void;
}

type SettingsTab = 'general' | 'appearance' | 'sync' | 'ai';

const TABS = [
  { id: 'general' as const, labelKey: 'settings_general', icon: User },
  { id: 'appearance' as const, labelKey: 'settings_appearance', icon: Palette },
  { id: 'sync' as const, labelKey: 'settings_sync', icon: Cloud },
  { id: 'ai' as const, labelKey: 'settings_ai', icon: Sparkles },
];

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 animate-fadeIn"
      style={{ zIndex: Z_INDEX.MODAL_BACKDROP }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl h-[600px] rounded-2xl glass-modal-dark flex flex-col overflow-hidden"
        style={{ zIndex: Z_INDEX.MODAL_CONTENT, animation: 'modalScale 0.2s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-medium text-white">{t('options_title')}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* 底部容器：左侧标签栏 + 右侧内容区 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 左侧标签栏 */}
          <div className="w-48 flex-shrink-0 border-r border-white/10 py-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-white bg-white/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t(tab.labelKey)}
                  {activeTab === tab.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* 右侧内容区 */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'general' && <GeneralTab />}
            {activeTab === 'appearance' && <AppearanceTab />}
            {activeTab === 'sync' && <SyncTab />}
            {activeTab === 'ai' && <AITab />}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

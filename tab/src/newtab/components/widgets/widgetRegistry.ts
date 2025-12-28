/**
 * 组件注册表 - 管理所有可用组件的元数据
 */

import { t } from '@/lib/i18n';
import type { GridItemType, WidgetMeta, WidgetConfig, GridItemSize } from '../../types';

// 获取组件注册表（动态获取以支持 i18n）
export function getWidgetRegistry(): Record<GridItemType, WidgetMeta> {
  return {
    shortcut: {
      type: 'shortcut',
      name: t('widget_shortcut'),
      icon: 'Link',
      description: t('widget_shortcut_desc'),
      sizeConfig: {
        type: 'shortcut',
        defaultSize: '1x1',
        allowedSizes: ['1x1'],
        minWidth: 1,
        minHeight: 1,
      },
    },
    bookmarkFolder: {
      type: 'bookmarkFolder',
      name: t('widget_folder'),
      icon: 'Folder',
      description: t('widget_folder_desc'),
      sizeConfig: {
        type: 'bookmarkFolder',
        defaultSize: '1x1',
        allowedSizes: ['1x1'],
        minWidth: 1,
        minHeight: 1,
      },
    },
    weather: {
      type: 'weather',
      name: t('widget_weather'),
      icon: 'Cloud',
      description: t('widget_weather_desc'),
      sizeConfig: {
        type: 'weather',
        defaultSize: '2x2',
        allowedSizes: ['2x1', '2x2', '2x3'],
        minWidth: 2,
        minHeight: 1,
      },
    },
    clock: {
      type: 'clock',
      name: t('widget_clock'),
      icon: 'Clock',
      description: t('widget_clock_desc'),
      sizeConfig: {
        type: 'clock',
        defaultSize: '2x1',
        allowedSizes: ['2x1', '2x2'],
        minWidth: 2,
        minHeight: 1,
      },
    },
    todo: {
      type: 'todo',
      name: t('widget_todo'),
      icon: 'CheckSquare',
      description: t('widget_todo_desc'),
      sizeConfig: {
        type: 'todo',
        defaultSize: '2x2',
        allowedSizes: ['2x2', '2x3', '2x4'],
        minWidth: 2,
        minHeight: 2,
      },
    },
    notes: {
      type: 'notes',
      name: t('widget_notes'),
      icon: 'StickyNote',
      description: t('widget_notes_desc'),
      sizeConfig: {
        type: 'notes',
        defaultSize: '2x2',
        allowedSizes: ['2x2', '2x3', '2x4'],
        minWidth: 2,
        minHeight: 2,
      },
    },
    hotsearch: {
      type: 'hotsearch',
      name: t('widget_hotsearch'),
      icon: 'TrendingUp',
      description: t('widget_hotsearch_desc'),
      sizeConfig: {
        type: 'hotsearch',
        defaultSize: '2x3',
        allowedSizes: ['2x2', '2x3', '2x4'],
        minWidth: 2,
        minHeight: 2,
      },
    },
    poetry: {
      type: 'poetry',
      name: t('widget_poetry'),
      icon: 'BookOpen',
      description: t('widget_poetry_desc'),
      sizeConfig: {
        type: 'poetry',
        defaultSize: '2x1',
        allowedSizes: ['2x1', '2x2'],
        minWidth: 2,
        minHeight: 1,
      },
    },
  };
}

// 保持向后兼容的静态导出（使用英文作为默认值）
export const WIDGET_REGISTRY: Record<GridItemType, WidgetMeta> = {
  shortcut: {
    type: 'shortcut',
    name: 'Shortcut',
    icon: 'Link',
    description: 'Website shortcut',
    sizeConfig: {
      type: 'shortcut',
      defaultSize: '1x1',
      allowedSizes: ['1x1'],
      minWidth: 1,
      minHeight: 1,
    },
  },
  bookmarkFolder: {
    type: 'bookmarkFolder',
    name: 'Folder',
    icon: 'Folder',
    description: 'Organize bookmarks and shortcuts',
    sizeConfig: {
      type: 'bookmarkFolder',
      defaultSize: '1x1',
      allowedSizes: ['1x1'],
      minWidth: 1,
      minHeight: 1,
    },
  },
  weather: {
    type: 'weather',
    name: 'Weather',
    icon: 'Cloud',
    description: 'Show current weather and forecast',
    sizeConfig: {
      type: 'weather',
      defaultSize: '2x2',
      allowedSizes: ['2x1', '2x2', '2x3'],
      minWidth: 2,
      minHeight: 1,
    },
  },
  clock: {
    type: 'clock',
    name: 'Clock',
    icon: 'Clock',
    description: 'Display current time',
    sizeConfig: {
      type: 'clock',
      defaultSize: '2x1',
      allowedSizes: ['2x1', '2x2'],
      minWidth: 2,
      minHeight: 1,
    },
  },
  todo: {
    type: 'todo',
    name: 'Todo',
    icon: 'CheckSquare',
    description: 'Manage todo tasks',
    sizeConfig: {
      type: 'todo',
      defaultSize: '2x2',
      allowedSizes: ['2x2', '2x3', '2x4'],
      minWidth: 2,
      minHeight: 2,
    },
  },
  notes: {
    type: 'notes',
    name: 'Notes',
    icon: 'StickyNote',
    description: 'Quick notes',
    sizeConfig: {
      type: 'notes',
      defaultSize: '2x2',
      allowedSizes: ['2x2', '2x3', '2x4'],
      minWidth: 2,
      minHeight: 2,
    },
  },
  hotsearch: {
    type: 'hotsearch',
    name: 'Hot Search',
    icon: 'TrendingUp',
    description: 'Show trending searches',
    sizeConfig: {
      type: 'hotsearch',
      defaultSize: '2x3',
      allowedSizes: ['2x2', '2x3', '2x4'],
      minWidth: 2,
      minHeight: 2,
    },
  },
  poetry: {
    type: 'poetry',
    name: 'Daily Poetry',
    icon: 'BookOpen',
    description: 'Show daily poetry',
    sizeConfig: {
      type: 'poetry',
      defaultSize: '2x1',
      allowedSizes: ['2x1', '2x2'],
      minWidth: 2,
      minHeight: 1,
    },
  },
};

// 获取组件元数据
export function getWidgetMeta(type: GridItemType): WidgetMeta {
  return getWidgetRegistry()[type];
}

// 获取组件默认配置
export function getDefaultWidgetConfig(type: GridItemType): WidgetConfig {
  switch (type) {
    case 'weather':
      return { weather: { city: 'Beijing', unit: 'C', showForecast: true, autoLocation: false } };
    case 'clock':
      return { clock: { format: '24h', showDate: true, showSeconds: false, showLunar: false } };
    case 'todo':
      return { todo: { showCompleted: false } };
    case 'notes':
      return { notes: { content: '' } };
    case 'hotsearch':
      return { hotsearch: { type: 'baidu' } };
    case 'poetry':
      return { poetry: { autoRefresh: true } };
    default:
      return {};
  }
}

// 获取尺寸的列数和行数
export function getSizeSpan(size: GridItemSize): { cols: number; rows: number } {
  const [cols, rows] = size.split('x').map(Number);
  return { cols, rows };
}

// 检查尺寸是否允许
export function isValidSize(type: GridItemType, size: GridItemSize): boolean {
  const registry = getWidgetRegistry();
  const meta = registry[type];
  return meta.sizeConfig.allowedSizes.includes(size);
}

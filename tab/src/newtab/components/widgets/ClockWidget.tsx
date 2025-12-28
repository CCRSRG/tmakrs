/**
 * 时钟组件 - 网格版本
 */

import { useState, useEffect, memo, useMemo } from 'react';
import { Lunar } from 'lunar-javascript';
import { t } from '@/lib/i18n';
import type { WidgetRendererProps } from './types';
import { getSizeSpan } from './widgetRegistry';

export const ClockWidget = memo(function ClockWidget({
  item,
  onRemove: _onRemove,
  isEditing: _isEditing,
}: WidgetRendererProps) {
  const [time, setTime] = useState(new Date());
  const { rows } = getSizeSpan(item.size);
  const isLarge = rows >= 2;
  
  const config = item.config?.clock || {
    format: '24h',
    showDate: true,
    showSeconds: false,
    showLunar: false,
  };

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = () => {
    let hours = time.getHours();
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const seconds = time.getSeconds().toString().padStart(2, '0');
    let period = '';

    if (config.format === '12h') {
      period = hours >= 12 ? ' PM' : ' AM';
      hours = hours % 12 || 12;
    }

    const hoursStr = hours.toString().padStart(2, '0');
    let result = `${hoursStr}:${minutes}`;
    if (config.showSeconds) result += `:${seconds}`;
    if (config.format === '12h') result += period;

    return result;
  };

  const formatDate = () => {
    const weekday = t(`weekday_${time.getDay()}`);
    const month = time.getMonth() + 1;
    const date = time.getDate();
    return `${month}/${date} ${weekday}`;
  };

  const lunarInfo = useMemo(() => {
    if (!config.showLunar) return null;
    try {
      const lunar = Lunar.fromDate(time) as any;
      const lunarMonth = lunar.getMonthInChinese();
      const lunarDay = lunar.getDayInChinese();
      const festivals = lunar.getFestivals?.() || [];
      const jieQi = lunar.getJieQi?.() || null;
      return {
        date: `${lunarMonth}月${lunarDay}`,
        festival: festivals.length > 0 ? festivals[0] : jieQi || null,
      };
    } catch {
      return null;
    }
  }, [time.toDateString(), config.showLunar]);

  return (
    <div className="group relative h-full p-3 rounded-xl glass-card flex flex-col items-center justify-center">
      <div className={`text-white font-light tracking-wider ${isLarge ? 'text-5xl' : 'text-3xl'}`}>
        {formatTime()}
      </div>
      
      {config.showDate && (
        <div className={`text-white/70 ${isLarge ? 'text-base mt-2' : 'text-sm mt-1'}`}>
          {formatDate()}
        </div>
      )}
      
      {config.showLunar && lunarInfo && (
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-white/60">{lunarInfo.date}</span>
          {lunarInfo.festival && (
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-white/70">
              {lunarInfo.festival}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

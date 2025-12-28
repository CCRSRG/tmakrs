/**
 * 问候语组件
 */

import { useMemo } from 'react';
import { t } from '@/lib/i18n';

interface GreetingProps {
  userName?: string;
}

export function Greeting({ userName }: GreetingProps) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return { text: t('greeting_morning'), icon: '🌅' };
    } else if (hour >= 12 && hour < 14) {
      return { text: t('greeting_noon'), icon: '☀️' };
    } else if (hour >= 14 && hour < 18) {
      return { text: t('greeting_afternoon'), icon: '🌤️' };
    } else if (hour >= 18 && hour < 22) {
      return { text: t('greeting_evening'), icon: '🌆' };
    } else {
      return { text: t('greeting_night'), icon: '🌙' };
    }
  }, []);

  return (
    <div className="text-center text-white select-none">
      <h2 className="text-2xl font-light text-shadow">
        {greeting.text}
        {userName && <span className="ml-2">{userName}</span>}
      </h2>
    </div>
  );
}

import React, { memo, useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';

interface WeatherData {
  temp: number;
  condition: string;
  icon: LucideIcon;
}

interface ClockWidgetProps {
  locale: string;
  weather: WeatherData;
  onCalendarOpen: () => void;
}

export const ClockWidget = memo(function ClockWidget({
  locale,
  weather,
  onCalendarOpen,
}: ClockWidgetProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // 时钟每秒更新 — 只触发本组件渲染，不会影响父组件
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const WeatherIcon = weather.icon;

  return (
    <div className="mb-8 flex flex-col items-center relative">
      <div className="relative">
        <h1 className="text-[120px] font-bold text-white leading-none tracking-tighter drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] select-none">
          {currentTime.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false })}
        </h1>
        {/* Weather info at the bottom-right of the time */}
        <div className="absolute left-[calc(100%+0.5rem)] bottom-6 flex items-center gap-2 px-3 py-1 bg-black/20 backdrop-blur-md rounded-full border border-white/10 opacity-90 whitespace-nowrap">
          <div className="flex items-center justify-center text-white animate-pulse">
            <WeatherIcon size={14} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white">
              {weather.temp}°C
            </span>
            <span className="text-[10px] text-white/80 font-medium">
              {weather.condition}
            </span>
          </div>
        </div>
      </div>
      <div
        className="flex items-center gap-3 mt-2 px-6 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 shadow-lg cursor-pointer hover:bg-black/30 transition-all active:scale-95"
        onClick={onCalendarOpen}
      >
        <span className="text-lg font-medium text-white/90 tracking-widest uppercase">
          {currentTime.toLocaleDateString(locale, { month: 'long', day: 'numeric', weekday: 'long' })}
        </span>
      </div>
    </div>
  );
});

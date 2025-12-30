import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Holiday {
  date: string;
  name: string;
  isWorkingDay?: boolean;
}

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose, initialDate = new Date() }) => {
  const { t, i18n } = useTranslation();
  const [viewDate, setViewDate] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const today = new Date();

  if (!isOpen) return null;

  const monthNames = t('calendar.months', { returnObjects: true }) as string[];
  const dayNames = t('calendar.days', { returnObjects: true }) as string[];

  // 预设 2024-2025 中国法定节假日数据
  const HOLIDAYS_DATA: Record<string, Holiday> = {
    // 2024
    "2024-01-01": { date: "2024-01-01", name: t('calendar.holidays.newYear') },
    "2024-02-10": { date: "2024-02-10", name: t('calendar.holidays.springFestival') },
    "2024-02-11": { date: "2024-02-11", name: t('calendar.holidays.springFestival') },
    "2024-02-12": { date: "2024-02-12", name: t('calendar.holidays.springFestival') },
    "2024-02-13": { date: "2024-02-13", name: t('calendar.holidays.springFestival') },
    "2024-02-14": { date: "2024-02-14", name: t('calendar.holidays.springFestival') },
    "2024-02-15": { date: "2024-02-15", name: t('calendar.holidays.springFestival') },
    "2024-02-16": { date: "2024-02-16", name: t('calendar.holidays.springFestival') },
    "2024-02-17": { date: "2024-02-17", name: t('calendar.holidays.springFestival') },
    "2024-02-04": { date: "2024-02-04", name: t('calendar.work'), isWorkingDay: true },
    "2024-02-18": { date: "2024-02-18", name: t('calendar.work'), isWorkingDay: true },
    "2024-04-04": { date: "2024-04-04", name: t('calendar.holidays.qingming') },
    "2024-04-05": { date: "2024-04-05", name: t('calendar.holidays.qingming') },
    "2024-04-06": { date: "2024-04-06", name: t('calendar.holidays.qingming') },
    "2024-04-07": { date: "2024-04-07", name: t('calendar.work'), isWorkingDay: true },
    "2024-05-01": { date: "2024-05-01", name: t('calendar.holidays.laborDay') },
    "2024-05-02": { date: "2024-05-02", name: t('calendar.holidays.laborDay') },
    "2024-05-03": { date: "2024-05-03", name: t('calendar.holidays.laborDay') },
    "2024-05-04": { date: "2024-05-04", name: t('calendar.holidays.laborDay') },
    "2024-05-05": { date: "2024-05-05", name: t('calendar.holidays.laborDay') },
    "2024-04-28": { date: "2024-04-28", name: t('calendar.work'), isWorkingDay: true },
    "2024-05-11": { date: "2024-05-11", name: t('calendar.work'), isWorkingDay: true },
    "2024-06-10": { date: "2024-06-10", name: t('calendar.holidays.dragonBoat') },
    "2024-09-15": { date: "2024-09-15", name: t('calendar.holidays.midAutumn') },
    "2024-09-16": { date: "2024-09-16", name: t('calendar.holidays.midAutumn') },
    "2024-09-17": { date: "2024-09-17", name: t('calendar.holidays.midAutumn') },
    "2024-09-14": { date: "2024-09-14", name: t('calendar.work'), isWorkingDay: true },
    "2024-10-01": { date: "2024-10-01", name: t('calendar.holidays.nationalDay') },
    "2024-10-02": { date: "2024-10-02", name: t('calendar.holidays.nationalDay') },
    "2024-10-03": { date: "2024-10-03", name: t('calendar.holidays.nationalDay') },
    "2024-10-04": { date: "2024-10-04", name: t('calendar.holidays.nationalDay') },
    "2024-10-05": { date: "2024-10-05", name: t('calendar.holidays.nationalDay') },
    "2024-10-06": { date: "2024-10-06", name: t('calendar.holidays.nationalDay') },
    "2024-10-07": { date: "2024-10-07", name: t('calendar.holidays.nationalDay') },
    "2024-09-29": { date: "2024-09-29", name: t('calendar.work'), isWorkingDay: true },
    "2024-10-12": { date: "2024-10-12", name: t('calendar.work'), isWorkingDay: true },

    // 2025
    "2025-01-01": { date: "2025-01-01", name: t('calendar.holidays.newYear') },
    "2025-01-28": { date: "2025-01-28", name: t('calendar.holidays.eve') },
    "2025-01-29": { date: "2025-01-29", name: t('calendar.holidays.springFestival') },
    "2025-01-30": { date: "2025-01-30", name: t('calendar.holidays.springFestival') },
    "2025-01-31": { date: "2025-01-31", name: t('calendar.holidays.springFestival') },
    "2025-02-01": { date: "2025-02-01", name: t('calendar.holidays.springFestival') },
    "2025-02-02": { date: "2025-02-02", name: t('calendar.holidays.springFestival') },
    "2025-02-03": { date: "2025-02-03", name: t('calendar.holidays.springFestival') },
    "2025-02-04": { date: "2025-02-04", name: t('calendar.holidays.springFestival') },
    "2025-01-26": { date: "2025-01-26", name: t('calendar.work'), isWorkingDay: true },
    "2025-02-08": { date: "2025-02-08", name: t('calendar.work'), isWorkingDay: true },
    "2025-04-04": { date: "2025-04-04", name: t('calendar.holidays.qingming') },
    "2025-04-05": { date: "2025-04-05", name: t('calendar.holidays.qingming') },
    "2025-04-06": { date: "2025-04-06", name: t('calendar.holidays.qingming') },
    "2025-05-01": { date: "2025-05-01", name: t('calendar.holidays.laborDay') },
    "2025-05-02": { date: "2025-05-02", name: t('calendar.holidays.laborDay') },
    "2025-05-03": { date: "2025-05-03", name: t('calendar.holidays.laborDay') },
    "2025-05-04": { date: "2025-05-04", name: t('calendar.holidays.laborDay') },
    "2025-05-05": { date: "2025-05-05", name: t('calendar.holidays.laborDay') },
    "2025-04-27": { date: "2025-04-27", name: t('calendar.work'), isWorkingDay: true },
    "2025-05-10": { date: "2025-05-10", name: t('calendar.work'), isWorkingDay: true },
    "2025-05-31": { date: "2025-05-31", name: t('calendar.holidays.dragonBoat') },
    "2025-06-01": { date: "2025-06-01", name: t('calendar.holidays.dragonBoat') },
    "2025-06-02": { date: "2025-06-02", name: t('calendar.holidays.dragonBoat') },
    "2025-10-01": { date: "2025-10-01", name: t('calendar.holidays.nationalDay') },
    "2025-10-02": { date: "2025-10-02", name: t('calendar.holidays.nationalDay') },
    "2025-10-03": { date: "2025-10-03", name: t('calendar.holidays.nationalDay') },
    "2025-10-04": { date: "2025-10-04", name: t('calendar.holidays.nationalDay') },
    "2025-10-05": { date: "2025-10-05", name: t('calendar.holidays.nationalDay') },
    "2025-10-06": { date: "2025-10-06", name: t('calendar.holidays.midAutumn') },
    "2025-10-07": { date: "2025-10-07", name: t('calendar.holidays.midAutumn') },
    "2025-10-08": { date: "2025-10-08", name: t('calendar.holidays.midAutumn') },
    "2025-09-28": { date: "2025-09-28", name: t('calendar.work'), isWorkingDay: true },
    "2025-10-11": { date: "2025-10-11", name: t('calendar.work'), isWorkingDay: true },

    // 2025 年末补充
    "2025-12-21": { date: "2025-12-21", name: t('calendar.holidays.winterSolstice') },
    "2025-12-31": { date: "2025-12-31", name: t('calendar.holidays.newYearEve') },

    // 2026
    "2026-01-01": { date: "2026-01-01", name: t('calendar.holidays.newYear') },
    "2026-01-02": { date: "2026-01-02", name: t('calendar.holidays.newYear') },
    "2026-01-03": { date: "2026-01-03", name: t('calendar.holidays.newYear') },
    "2026-01-04": { date: "2026-01-04", name: t('calendar.work'), isWorkingDay: true },
    "2026-02-15": { date: "2026-02-15", name: t('calendar.holidays.springFestival') },
    "2026-02-16": { date: "2026-02-16", name: t('calendar.holidays.springFestival') },
    "2026-02-17": { date: "2026-02-17", name: t('calendar.holidays.springFestival') },
    "2026-02-18": { date: "2026-02-18", name: t('calendar.holidays.springFestival') },
    "2026-02-19": { date: "2026-02-19", name: t('calendar.holidays.springFestival') },
    "2026-02-20": { date: "2026-02-20", name: t('calendar.holidays.springFestival') },
    "2026-02-21": { date: "2026-02-21", name: t('calendar.holidays.springFestival') },
    "2026-02-22": { date: "2026-02-22", name: t('calendar.holidays.springFestival') },
    "2026-02-23": { date: "2026-02-23", name: t('calendar.holidays.springFestival') },
    "2026-02-14": { date: "2026-02-14", name: t('calendar.work'), isWorkingDay: true },
    "2026-02-28": { date: "2026-02-28", name: t('calendar.work'), isWorkingDay: true },
    "2026-04-04": { date: "2026-04-04", name: t('calendar.holidays.qingming') },
    "2026-04-05": { date: "2026-04-05", name: t('calendar.holidays.qingming') },
    "2026-04-06": { date: "2026-04-06", name: t('calendar.holidays.qingming') },
    "2026-05-01": { date: "2026-05-01", name: t('calendar.holidays.laborDay') },
    "2026-05-02": { date: "2026-05-02", name: t('calendar.holidays.laborDay') },
    "2026-05-03": { date: "2026-05-03", name: t('calendar.holidays.laborDay') },
    "2026-05-04": { date: "2026-05-04", name: t('calendar.holidays.laborDay') },
    "2026-05-05": { date: "2026-05-05", name: t('calendar.holidays.laborDay') },
    "2026-05-09": { date: "2026-05-09", name: t('calendar.work'), isWorkingDay: true },
    "2026-06-19": { date: "2026-06-19", name: t('calendar.holidays.dragonBoat') },
    "2026-06-20": { date: "2026-06-20", name: t('calendar.holidays.dragonBoat') },
    "2026-06-21": { date: "2026-06-21", name: t('calendar.holidays.dragonBoat') },
    "2026-09-25": { date: "2026-09-25", name: t('calendar.holidays.midAutumn') },
    "2026-09-26": { date: "2026-09-26", name: t('calendar.holidays.midAutumn') },
    "2026-09-27": { date: "2026-09-27", name: t('calendar.holidays.midAutumn') },
    "2026-10-01": { date: "2026-10-01", name: t('calendar.holidays.nationalDay') },
    "2026-10-02": { date: "2026-10-02", name: t('calendar.holidays.nationalDay') },
    "2026-10-03": { date: "2026-10-03", name: t('calendar.holidays.nationalDay') },
    "2026-10-04": { date: "2026-10-04", name: t('calendar.holidays.nationalDay') },
    "2026-10-05": { date: "2026-10-05", name: t('calendar.holidays.nationalDay') },
    "2026-10-06": { date: "2026-10-06", name: t('calendar.holidays.nationalDay') },
    "2026-10-07": { date: "2026-10-07", name: t('calendar.holidays.nationalDay') },
    "2026-09-20": { date: "2026-09-20", name: t('calendar.work'), isWorkingDay: true },
    "2026-10-10": { date: "2026-10-10", name: t('calendar.work'), isWorkingDay: true },
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDayOfMonth = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  
  const days = [];
  // Add empty slots for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-10 w-10 sm:h-12 sm:w-12" />);
  }

    // Add days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const isToday = today.getDate() === d && 
                      today.getMonth() === viewDate.getMonth() && 
                      today.getFullYear() === viewDate.getFullYear();
      
      const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const holiday = HOLIDAYS_DATA[dateStr];
      
      // 法定节假日或调休日
      const isStatutoryHoliday = holiday && !holiday.isWorkingDay;
      const isStatutoryWorkingDay = holiday && holiday.isWorkingDay;

      days.push(
        <div 
          key={d} 
          data-date={dateStr}
          className={`h-10 w-10 sm:h-12 sm:w-12 flex flex-col items-center justify-center rounded-xl text-sm font-bold transition-all relative group/day
            ${isToday 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
              : isStatutoryWorkingDay 
                ? 'text-gray-700 hover:bg-gray-100' 
                : isStatutoryHoliday || isWeekend
                  ? 'text-red-500 bg-red-50/50 hover:bg-red-50' 
                  : 'text-gray-700 hover:bg-gray-100'}`}
        >
          <span className="relative z-10">{d}</span>
          
          {/* Holiday Badge (仅针对法定节假日或调休日显示 休/班) */}
          {holiday && (
            <div className="absolute top-1 right-1 flex flex-col items-end">
              <span className={`text-[9px] px-1 rounded-sm leading-tight scale-75 origin-top-right font-black
                ${holiday.isWorkingDay 
                  ? 'bg-gray-200 text-gray-600' 
                  : 'bg-red-100 text-red-600'}`}>
                {holiday.isWorkingDay ? t('calendar.work') : t('calendar.rest')}
              </span>
            </div>
          )}

          {/* Holiday Name (节日名称) */}
          {holiday && holiday.name !== t('calendar.work') && (
            <span className={`text-[9px] absolute bottom-1 leading-none font-bold scale-90 truncate max-w-full px-1
              ${isToday ? 'text-white/80' : 'text-red-400'}`}>
              {holiday.name}
            </span>
          )}
        </div>
      );
    }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Calendar Container */}
      <div className="relative bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-[360px] sm:max-w-[400px] overflow-hidden animate-in zoom-in-95 duration-200 border border-white/40">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white relative">
          <div className="flex items-center justify-between mb-2 pr-10">
            <h2 className="text-xl font-bold">
              {t('calendar.header', { year: viewDate.getFullYear(), month: monthNames[viewDate.getMonth()] })}
            </h2>
            <div className="flex gap-1">
              <button 
                onClick={prevMonth}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                title={t('calendar.prevMonth')}
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={nextMonth}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                title={t('calendar.nextMonth')}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="text-blue-100 font-medium">
            {t('calendar.today', { date: today.toLocaleDateString(i18n.language, { month: 'long', day: 'numeric', weekday: 'long' }) })}
          </div>
          <button 
            onClick={onClose}
            className="absolute top-6 right-4 p-2 text-white/60 hover:text-white hover:bg-white/20 rounded-full transition-all"
            title={t('common.close')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Calendar Body */}
        <div className="p-6">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button 
            onClick={() => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
          >
            {t('calendar.backToToday')}
          </button>
        </div>
      </div>
    </div>
  );
};

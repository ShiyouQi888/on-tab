import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getHolidaysData, type HolidayResolved } from '../data/holidays';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose, initialDate = new Date() }) => {
  const { t, i18n } = useTranslation();
  const [viewDate, setViewDate] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));

  // 中国法定节假日数据（从常量文件加载并通过 i18n 解析）
  const holidaysData = useMemo(() => getHolidaysData(t), [t]);

  if (!isOpen) return null;

  const today = new Date();
  const monthNames = t('calendar.months', { returnObjects: true }) as string[];
  const dayNames = t('calendar.days', { returnObjects: true }) as string[];

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
      const holiday = holidaysData[dateStr];
      
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

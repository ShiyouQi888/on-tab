import React, { useState, useEffect } from 'react';
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

// 预设 2024-2025 中国法定节假日数据（为了准确性，通常建议从 API 获取，这里先预设核心数据）
const HOLIDAYS_DATA: Record<string, Holiday> = {
  // 2024
  "2024-01-01": { date: "2024-01-01", name: "元旦" },
  "2024-02-10": { date: "2024-02-10", name: "春节" },
  "2024-02-11": { date: "2024-02-11", name: "春节" },
  "2024-02-12": { date: "2024-02-12", name: "春节" },
  "2024-02-13": { date: "2024-02-13", name: "春节" },
  "2024-02-14": { date: "2024-02-14", name: "春节" },
  "2024-02-15": { date: "2024-02-15", name: "春节" },
  "2024-02-16": { date: "2024-02-16", name: "春节" },
  "2024-02-17": { date: "2024-02-17", name: "春节" },
  "2024-02-04": { date: "2024-02-04", name: "班", isWorkingDay: true },
  "2024-02-18": { date: "2024-02-18", name: "班", isWorkingDay: true },
  "2024-04-04": { date: "2024-04-04", name: "清明" },
  "2024-04-05": { date: "2024-04-05", name: "清明" },
  "2024-04-06": { date: "2024-04-06", name: "清明" },
  "2024-04-07": { date: "2024-04-07", name: "班", isWorkingDay: true },
  "2024-05-01": { date: "2024-05-01", name: "五一" },
  "2024-05-02": { date: "2024-05-02", name: "五一" },
  "2024-05-03": { date: "2024-05-03", name: "五一" },
  "2024-05-04": { date: "2024-05-04", name: "五一" },
  "2024-05-05": { date: "2024-05-05", name: "五一" },
  "2024-04-28": { date: "2024-04-28", name: "班", isWorkingDay: true },
  "2024-05-11": { date: "2024-05-11", name: "班", isWorkingDay: true },
  "2024-06-10": { date: "2024-06-10", name: "端午" },
  "2024-09-15": { date: "2024-09-15", name: "中秋" },
  "2024-09-16": { date: "2024-09-16", name: "中秋" },
  "2024-09-17": { date: "2024-09-17", name: "中秋" },
  "2024-09-14": { date: "2024-09-14", name: "班", isWorkingDay: true },
  "2024-10-01": { date: "2024-10-01", name: "国庆" },
  "2024-10-02": { date: "2024-10-02", name: "国庆" },
  "2024-10-03": { date: "2024-10-03", name: "国庆" },
  "2024-10-04": { date: "2024-10-04", name: "国庆" },
  "2024-10-05": { date: "2024-10-05", name: "国庆" },
  "2024-10-06": { date: "2024-10-06", name: "国庆" },
  "2024-10-07": { date: "2024-10-07", name: "国庆" },
  "2024-09-29": { date: "2024-09-29", name: "班", isWorkingDay: true },
  "2024-10-12": { date: "2024-10-12", name: "班", isWorkingDay: true },

  // 2025
  "2025-01-01": { date: "2025-01-01", name: "元旦" },
  "2025-01-28": { date: "2025-01-28", name: "除夕" },
  "2025-01-29": { date: "2025-01-29", name: "春节" },
  "2025-01-30": { date: "2025-01-30", name: "春节" },
  "2025-01-31": { date: "2025-01-31", name: "春节" },
  "2025-02-01": { date: "2025-02-01", name: "春节" },
  "2025-02-02": { date: "2025-02-02", name: "春节" },
  "2025-02-03": { date: "2025-02-03", name: "春节" },
  "2025-02-04": { date: "2025-02-04", name: "春节" },
  "2025-01-26": { date: "2025-01-26", name: "班", isWorkingDay: true },
  "2025-02-08": { date: "2025-02-08", name: "班", isWorkingDay: true },
  "2025-04-04": { date: "2025-04-04", name: "清明" },
  "2025-04-05": { date: "2025-04-05", name: "清明" },
  "2025-04-06": { date: "2025-04-06", name: "清明" },
  "2025-05-01": { date: "2025-05-01", name: "五一" },
  "2025-05-02": { date: "2025-05-02", name: "五一" },
  "2025-05-03": { date: "2025-05-03", name: "五一" },
  "2025-05-04": { date: "2025-05-04", name: "五一" },
  "2025-05-05": { date: "2025-05-05", name: "五一" },
  "2025-04-27": { date: "2025-04-27", name: "班", isWorkingDay: true },
  "2025-05-10": { date: "2025-05-10", name: "班", isWorkingDay: true },
  "2025-05-31": { date: "2025-05-31", name: "端午" },
  "2025-06-01": { date: "2025-06-01", name: "端午" },
  "2025-06-02": { date: "2025-06-02", name: "端午" },
  "2025-10-01": { date: "2025-10-01", name: "国庆" },
  "2025-10-02": { date: "2025-10-02", name: "国庆" },
  "2025-10-03": { date: "2025-10-03", name: "国庆" },
  "2025-10-04": { date: "2025-10-04", name: "国庆" },
  "2025-10-05": { date: "2025-10-05", name: "国庆" },
  "2025-10-06": { date: "2025-10-06", name: "中秋" },
  "2025-10-07": { date: "2025-10-07", name: "中秋" },
  "2025-10-08": { date: "2025-10-08", name: "中秋" },
  "2025-09-28": { date: "2025-09-28", name: "班", isWorkingDay: true },
  "2025-10-11": { date: "2025-10-11", name: "班", isWorkingDay: true },
};

export const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose, initialDate = new Date() }) => {
  const [viewDate, setViewDate] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const today = new Date();

  if (!isOpen) return null;

  const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
  const dayNames = ["日", "一", "二", "三", "四", "五", "六"];

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
    const isToday = today.getDate() === d && 
                    today.getMonth() === viewDate.getMonth() && 
                    today.getFullYear() === viewDate.getFullYear();
    
    const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const holiday = HOLIDAYS_DATA[dateStr];
    
    days.push(
      <div 
        key={d} 
        className={`h-10 w-10 sm:h-12 sm:w-12 flex flex-col items-center justify-center rounded-xl text-sm font-bold transition-all relative group/day
          ${isToday 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
            : holiday?.isWorkingDay 
              ? 'text-gray-700 hover:bg-gray-100' 
              : holiday 
                ? 'text-red-500 hover:bg-red-50' 
                : 'text-gray-700 hover:bg-gray-100'}`}
      >
        <span>{d}</span>
        {holiday && (
          <span className={`text-[8px] absolute bottom-1 leading-none font-bold ${isToday ? 'text-white/80' : holiday.isWorkingDay ? 'text-gray-400' : 'text-red-400'}`}>
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
              {viewDate.getFullYear()}年 {monthNames[viewDate.getMonth()]}
            </h2>
            <div className="flex gap-1">
              <button 
                onClick={prevMonth}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                title="上个月"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={nextMonth}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                title="下个月"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="text-blue-100 font-medium">
            今天: {today.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
          </div>
          <button 
            onClick={onClose}
            className="absolute top-6 right-4 p-2 text-white/60 hover:text-white hover:bg-white/20 rounded-full transition-all"
            title="关闭"
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
            返回今天
          </button>
        </div>
      </div>
    </div>
  );
};

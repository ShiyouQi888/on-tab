import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
}

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
    days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
  }

  // Add days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = today.getDate() === d && 
                    today.getMonth() === viewDate.getMonth() && 
                    today.getFullYear() === viewDate.getFullYear();
    
    days.push(
      <div 
        key={d} 
        className={`h-10 w-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all
          ${isToday 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
            : 'text-gray-700 hover:bg-gray-100'}`}
      >
        {d}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Calendar Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[360px] overflow-hidden animate-in zoom-in-95 duration-200">
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
              <div key={day} className="h-10 w-10 flex items-center justify-center text-xs font-bold text-gray-400 uppercase tracking-wider">
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

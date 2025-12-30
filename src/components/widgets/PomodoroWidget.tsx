import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, RotateCcw, Coffee, Brain, Timer } from 'lucide-react';
import { pomodoroService, type TimerMode, MODES as SERVICE_MODES } from '../../services/pomodoroService';

const ICON_MAP = {
  work: Brain,
  shortBreak: Coffee,
  longBreak: Timer,
};

export const PomodoroWidget: React.FC = () => {
  const { t } = useTranslation();
  const [state, setState] = useState(pomodoroService.getState());

  useEffect(() => {
    const unsubscribe = pomodoroService.subscribe(setState);
    return () => unsubscribe();
  }, []);

  const { mode, timeLeft, isActive, progress } = state;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const colorClass = mode === 'work' ? 'text-orange-400' : mode === 'shortBreak' ? 'text-green-400' : 'text-blue-400';

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 w-full max-w-sm flex flex-col items-center">
      {/* Mode Selectors */}
      <div className="flex gap-2 mb-8 bg-black/20 p-1 rounded-xl">
        {(Object.keys(SERVICE_MODES) as TimerMode[]).map((m) => {
          const Icon = ICON_MAP[m];
          return (
            <button
              key={m}
              onClick={() => pomodoroService.switchMode(m)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === m 
                  ? 'bg-white/20 text-white shadow-lg' 
                  : 'text-white/40 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              <Icon size={14} />
              {t(`widgets.pomodoro.modes.${m}`)}
            </button>
          );
        })}
      </div>

      {/* Timer Display */}
      <div className="relative flex items-center justify-center w-48 h-48 mb-8">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
          />
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={552.92}
            strokeDashoffset={552.92 - (552.92 * progress) / 100}
            strokeLinecap="round"
            className={`transition-all duration-1000 ${colorClass}`}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-5xl font-black text-white tracking-tighter tabular-nums">
            {formatTime(timeLeft)}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${colorClass}`}>
            {t(`widgets.pomodoro.status.${isActive ? 'running' : 'paused'}`)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => pomodoroService.reset()}
          className="p-3 rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all active:scale-90"
          title={t('common.reset')}
        >
          <RotateCcw size={20} />
        </button>
        
        <button
          onClick={() => pomodoroService.toggle()}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-xl ${
            isActive 
              ? 'bg-white/10 text-white border border-white/20' 
              : 'bg-white text-gray-900'
          }`}
        >
          {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
        </button>

        <div className="w-11" /> {/* Spacer for balance */}
      </div>
    </div>
  );
};

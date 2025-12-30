import i18n from '../i18n/config';

export type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export const MODES: Record<TimerMode, { duration: number; color: string }> = {
  work: { duration: 25 * 60, color: 'text-orange-400' },
  shortBreak: { duration: 5 * 60, color: 'text-green-400' },
  longBreak: { duration: 15 * 60, color: 'text-blue-400' },
};

class PomodoroService {
  private mode: TimerMode = 'work';
  private timeLeft: number = MODES.work.duration;
  private isActive: boolean = false;
  private timer: NodeJS.Timeout | null = null;
  private listeners: Set<(state: PomodoroState) => void> = new Set();

  constructor() {
    // Try to recover state from localStorage if needed, 
    // but for an active timer, it's better to keep it in memory
  }

  getState(): PomodoroState {
    return {
      mode: this.mode,
      timeLeft: this.timeLeft,
      isActive: this.isActive,
      progress: ((MODES[this.mode].duration - this.timeLeft) / MODES[this.mode].duration) * 100
    };
  }

  subscribe(listener: (state: PomodoroState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach(l => l(state));
  }

  toggle() {
    if (!this.isActive && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    if (this.isActive) {
      this.pause();
    } else {
      this.start();
    }
  }

  start() {
    if (this.isActive) return;
    this.isActive = true;
    this.notify();

    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft -= 1;
        this.notify();
      } else {
        this.complete();
      }
    }, 1000);
  }

  pause() {
    this.isActive = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.notify();
  }

  reset() {
    this.pause();
    this.timeLeft = MODES[this.mode].duration;
    this.notify();
  }

  switchMode(newMode: TimerMode) {
    this.mode = newMode;
    this.reset();
  }

  private complete() {
    this.pause();
    
    // Notification
    if (Notification.permission === 'granted') {
      new Notification(i18n.t(`widgets.pomodoro.notifications.${this.mode}.title`), {
        body: i18n.t(`widgets.pomodoro.notifications.${this.mode}.body`),
        icon: '/logo192.png'
      });
    }

    // Sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.error('Audio notification failed', e);
    }

    this.notify();
  }
}

export interface PomodoroState {
  mode: TimerMode;
  timeLeft: number;
  isActive: boolean;
  progress: number;
}

export const pomodoroService = new PomodoroService();

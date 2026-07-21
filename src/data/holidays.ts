import type { TFunction } from 'i18next';

export interface HolidayRaw {
  date: string;
  nameKey: string;
  isWorkingDay?: boolean;
}

export interface HolidayResolved {
  date: string;
  name: string;
  isWorkingDay?: boolean;
}

const WORK_KEY = 'calendar.work';

const HOLIDAYS_RAW: HolidayRaw[] = [
  // === 2024 ===
  { date: '2024-01-01', nameKey: 'calendar.holidays.newYear' },
  { date: '2024-02-10', nameKey: 'calendar.holidays.springFestival' },
  { date: '2024-02-11', nameKey: 'calendar.holidays.springFestival' },
  { date: '2024-02-12', nameKey: 'calendar.holidays.springFestival' },
  { date: '2024-02-13', nameKey: 'calendar.holidays.springFestival' },
  { date: '2024-02-14', nameKey: 'calendar.holidays.springFestival' },
  { date: '2024-02-15', nameKey: 'calendar.holidays.springFestival' },
  { date: '2024-02-16', nameKey: 'calendar.holidays.springFestival' },
  { date: '2024-02-17', nameKey: 'calendar.holidays.springFestival' },
  { date: '2024-02-04', nameKey: WORK_KEY, isWorkingDay: true },
  { date: '2024-02-18', nameKey: WORK_KEY, isWorkingDay: true },
  { date: '2024-04-04', nameKey: 'calendar.holidays.qingming' },
  { date: '2024-04-05', nameKey: 'calendar.holidays.qingming' },
  { date: '2024-04-06', nameKey: 'calendar.holidays.qingming' },
  { date: '2024-04-07', nameKey: WORK_KEY, isWorkingDay: true },
  { date: '2024-05-01', nameKey: 'calendar.holidays.laborDay' },
  { date: '2024-05-02', nameKey: 'calendar.holidays.laborDay' },
  { date: '2024-05-03', nameKey: 'calendar.holidays.laborDay' },
  { date: '2024-05-04', nameKey: 'calendar.holidays.laborDay' },
  { date: '2024-05-05', nameKey: 'calendar.holidays.laborDay' },
  { date: '2024-04-28', nameKey: WORK_KEY, isWorkingDay: true },
  { date: '2024-05-11', nameKey: WORK_KEY, isWorkingDay: true },
  { date: '2024-06-10', nameKey: 'calendar.holidays.dragonBoat' },
  { date: '2024-09-15', nameKey: 'calendar.holidays.midAutumn' },
  { date: '2024-09-16', nameKey: 'calendar.holidays.midAutumn' },
  { date: '2024-09-17', nameKey: 'calendar.holidays.midAutumn' },
  { date: '2024-09-14', nameKey: WORK_KEY, isWorkingDay: true },
  { date: '2024-10-01', nameKey: 'calendar.holidays.nationalDay' },
  { date: '2024-10-02', nameKey: 'calendar.holidays.nationalDay' },
  { date: '2024-10-03', nameKey: 'calendar.holidays.nationalDay' },
  { date: '2024-10-04', nameKey: 'calendar.holidays.nationalDay' },
  { date: '2024-10-05', nameKey: 'calendar.holidays.nationalDay' },
  { date: '2024-10-06', nameKey: 'calendar.holidays.nationalDay' },
  { date: '2024-10-07', nameKey: 'calendar.holidays.nationalDay' },
  { date: '2024-09-29', nameKey: WORK_KEY, isWorkingDay: true },
  { date: '2024-10-12', nameKey: WORK_KEY, isWorkingDay: true },

  // === 2025 ===
  { date: '2025-01-01', nameKey: 'calendar.holidays.newYear' },
  { date: '2025-01-28', nameKey: 'calendar.holidays.eve' },
  { date: '2025-01-29', nameKey: 'calendar.holidays.springFestival' },
  { date: '2025-01-30', nameKey: 'calendar.holidays.springFestival' },
  { date: '2025-01-31', nameKey: 'calendar.holidays.springFestival' },
  { date: '2025-02-01', nameKey: 'calendar.holidays.springFestival' },
  { date: '2025-02-02', nameKey: 'calendar.holidays.springFestival' },
  { date: '2025-02-03', nameKey: 'calendar.holidays.springFestival' },
  { date: '2025-02-04', nameKey: 'calendar.holidays.springFestival' },
  { date: '2025-01-26', nameKey: WORK_KEY, isWorkingDay: true },
  { date: '2025-02-08', nameKey: WORK_KEY, isWorkingDay: true },
  { date: '2025-04-04', nameKey: 'calendar.holidays.qingming' },
  { date: '2025-04-05', nameKey: 'calendar.holidays.qingming' },
  { date: '2025-04-06', nameKey: 'calendar.holidays.qingming' },
  { date: '2025-05-01', nameKey: 'calendar.holidays.laborDay' },
  { date: '2025-05-02', nameKey: 'calendar.holidays.laborDay' },
  { date: '2025-05-03', nameKey: 'calendar.holidays.laborDay' },
  { date: '2025-05-04', nameKey: 'calendar.holidays.laborDay' },
  { date: '2025-05-05', nameKey: 'calendar.holidays.laborDay' },
  { date: '2025-04-27', nameKey: WORK_KEY, isWorkingDay: true },
  { date: '2025-05-10', nameKey: WORK_KEY, isWorkingDay: true },
  { date: '2025-05-31', nameKey: 'calendar.holidays.dragonBoat' },
  { date: '2025-06-01', nameKey: 'calendar.holidays.dragonBoat' },
  { date: '2025-06-02', nameKey: 'calendar.holidays.dragonBoat' },
  { date: '2025-10-01', nameKey: 'calendar.holidays.nationalDay' },
  { date: '2025-10-02', nameKey: 'calendar.holidays.nationalDay' },
  { date: '2025-10-03', nameKey: 'calendar.holidays.nationalDay' },
  { date: '2025-10-04', nameKey: 'calendar.holidays.nationalDay' },
  { date: '2025-10-05', nameKey: 'calendar.holidays.nationalDay' },
  { date: '2025-10-06', nameKey: 'calendar.holidays.midAutumn' },
  { date: '2025-10-07', nameKey: 'calendar.holidays.midAutumn' },
  { date: '2025-10-08', nameKey: 'calendar.holidays.midAutumn' },
  { date: '2025-09-28', nameKey: WORK_KEY, isWorkingDay: true },
  { date: '2025-10-11', nameKey: WORK_KEY, isWorkingDay: true },
  { date: '2025-12-21', nameKey: 'calendar.holidays.winterSolstice' },
  { date: '2025-12-31', nameKey: 'calendar.holidays.newYearEve' },

  // === 2026 ===
  { date: '2026-01-01', nameKey: 'calendar.holidays.newYear' },
  { date: '2026-01-02', nameKey: 'calendar.holidays.newYear' },
  { date: '2026-01-03', nameKey: 'calendar.holidays.newYear' },
  { date: '2026-01-04', nameKey: WORK_KEY, isWorkingDay: true },
  { date: '2026-02-15', nameKey: 'calendar.holidays.springFestival' },
  { date: '2026-02-16', nameKey: 'calendar.holidays.springFestival' },
  { date: '2026-02-17', nameKey: 'calendar.holidays.springFestival' },
  { date: '2026-02-18', nameKey: 'calendar.holidays.springFestival' },
  { date: '2026-02-19', nameKey: 'calendar.holidays.springFestival' },
  { date: '2026-02-20', nameKey: 'calendar.holidays.springFestival' },
  { date: '2026-02-21', nameKey: 'calendar.holidays.springFestival' },
  { date: '2026-02-22', nameKey: 'calendar.holidays.springFestival' },
  { date: '2026-02-23', nameKey: 'calendar.holidays.springFestival' },
  { date: '2026-02-14', nameKey: WORK_KEY, isWorkingDay: true },
  { date: '2026-02-28', nameKey: WORK_KEY, isWorkingDay: true },
  { date: '2026-04-04', nameKey: 'calendar.holidays.qingming' },
  { date: '2026-04-05', nameKey: 'calendar.holidays.qingming' },
  { date: '2026-04-06', nameKey: 'calendar.holidays.qingming' },
  { date: '2026-05-01', nameKey: 'calendar.holidays.laborDay' },
  { date: '2026-05-02', nameKey: 'calendar.holidays.laborDay' },
  { date: '2026-05-03', nameKey: 'calendar.holidays.laborDay' },
  { date: '2026-05-04', nameKey: 'calendar.holidays.laborDay' },
  { date: '2026-05-05', nameKey: 'calendar.holidays.laborDay' },
  { date: '2026-05-09', nameKey: WORK_KEY, isWorkingDay: true },
  { date: '2026-06-19', nameKey: 'calendar.holidays.dragonBoat' },
  { date: '2026-06-20', nameKey: 'calendar.holidays.dragonBoat' },
  { date: '2026-06-21', nameKey: 'calendar.holidays.dragonBoat' },
  { date: '2026-09-25', nameKey: 'calendar.holidays.midAutumn' },
  { date: '2026-09-26', nameKey: 'calendar.holidays.midAutumn' },
  { date: '2026-09-27', nameKey: 'calendar.holidays.midAutumn' },
  { date: '2026-10-01', nameKey: 'calendar.holidays.nationalDay' },
  { date: '2026-10-02', nameKey: 'calendar.holidays.nationalDay' },
  { date: '2026-10-03', nameKey: 'calendar.holidays.nationalDay' },
  { date: '2026-10-04', nameKey: 'calendar.holidays.nationalDay' },
  { date: '2026-10-05', nameKey: 'calendar.holidays.nationalDay' },
  { date: '2026-10-06', nameKey: 'calendar.holidays.nationalDay' },
  { date: '2026-10-07', nameKey: 'calendar.holidays.nationalDay' },
  { date: '2026-09-20', nameKey: WORK_KEY, isWorkingDay: true },
  { date: '2026-10-10', nameKey: WORK_KEY, isWorkingDay: true },
];

/**
 * Resolves raw holiday data with i18n translations.
 * Call this from a component where `t` is available via useTranslation().
 */
export function getHolidaysData(t: TFunction): Record<string, HolidayResolved> {
  const map: Record<string, HolidayResolved> = {};
  for (const h of HOLIDAYS_RAW) {
    map[h.date] = {
      date: h.date,
      name: t(h.nameKey),
      isWorkingDay: h.isWorkingDay,
    };
  }
  return map;
}

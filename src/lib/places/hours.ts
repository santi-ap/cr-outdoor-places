import type { Language } from '@/lib/i18n/dictionary';
import type { HoursRule, Weekday } from '@/lib/validation/schemas';

export const WEEKDAY_ORDER: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
export const ALL_DAYS: Weekday[] = WEEKDAY_ORDER;
export const WEEKDAYS: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri'];
export const WEEKEND: Weekday[] = ['sat', 'sun'];

const weekdayLabelsEn: Record<Weekday, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

const weekdayLabelsEs: Record<Weekday, string> = {
  mon: 'Lun',
  tue: 'Mar',
  wed: 'Mié',
  thu: 'Jue',
  fri: 'Vie',
  sat: 'Sáb',
  sun: 'Dom',
};

// Full day names for the 5a-style weekly schedule table (getWeeklySchedule)
// -- the compact picker/summary elsewhere uses the 3-letter labels above.
const weekdayFullLabelsEn: Record<Weekday, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

const weekdayFullLabelsEs: Record<Weekday, string> = {
  mon: 'Lunes',
  tue: 'Martes',
  wed: 'Miércoles',
  thu: 'Jueves',
  fri: 'Viernes',
  sat: 'Sábado',
  sun: 'Domingo',
};

export function getWeekdayLabels(language: Language): Record<Weekday, string> {
  return language === 'es' ? weekdayLabelsEs : weekdayLabelsEn;
}

// "07:00" -> "7:00", "16:00" -> "16:00" -- the 5a schedule table shows
// plain 24h time (no a.m./p.m., no leading zero), unlike the 12h style
// used elsewhere in this app's free-text hours.
function formatTimeOfDay24(time: string): string {
  const [hourStr, minute] = time.split(':');
  return `${Number(hourStr)}:${minute}`;
}

function sameRule(a: HoursRule | null, b: HoursRule | null): boolean {
  if (a === null || b === null) return a === b;
  return a.opens === b.opens && a.closes === b.closes;
}

export type WeeklyScheduleRow = { label: string; value: string; closed: boolean };

// One row per run of consecutive days that share the same hours (or are
// consecutively closed) -- e.g. Mon 7–16, Tue closed, Wed–Sun 7–16 renders
// as three rows ("Lunes" / "Martes: Cerrado" / "Miércoles – Domingo"),
// matching the 5a design's per-day table instead of 5b's single collapsed
// summary line (Issue #78 follow-up).
export function getWeeklySchedule(hours: HoursRule[], language: Language): WeeklyScheduleRow[] {
  const fullLabels = language === 'es' ? weekdayFullLabelsEs : weekdayFullLabelsEn;
  const closedLabel = language === 'es' ? 'Cerrado' : 'Closed';

  const perDay: (HoursRule | null)[] = WEEKDAY_ORDER.map(
    (day) => hours.find((rule) => rule.days.includes(day)) ?? null,
  );

  const rows: WeeklyScheduleRow[] = [];
  let i = 0;
  while (i < WEEKDAY_ORDER.length) {
    const rule = perDay[i];
    let j = i;
    while (j + 1 < WEEKDAY_ORDER.length && sameRule(perDay[j + 1], rule)) j++;

    const label =
      i === j
        ? fullLabels[WEEKDAY_ORDER[i]]
        : `${fullLabels[WEEKDAY_ORDER[i]]} – ${fullLabels[WEEKDAY_ORDER[j]]}`;
    const value = rule ? `${formatTimeOfDay24(rule.opens)} – ${formatTimeOfDay24(rule.closes)}` : closedLabel;
    rows.push({ label, value, closed: !rule });
    i = j + 1;
  }
  return rows;
}

export type OpenStatus = { open: boolean; changeTime: string | null };

// Costa Rica has a single, fixed UTC-6 offset year-round (no DST), so
// "now" for open/closed purposes is just the current time converted to
// that zone -- no timezone database lookup needed beyond what
// toLocaleString already does.
export function getOpenStatus(hours: HoursRule[], now: Date = new Date()): OpenStatus {
  if (hours.length === 0) return { open: false, changeTime: null };

  const crNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Costa_Rica' }));
  const weekday = WEEKDAY_ORDER[(crNow.getDay() + 6) % 7]; // JS getDay is Sun=0; rotate to Mon-first
  const minutes = crNow.getHours() * 60 + crNow.getMinutes();

  const todayRule = hours.find((rule) => rule.days.includes(weekday));
  if (!todayRule) return { open: false, changeTime: null };

  const [openH, openM] = todayRule.opens.split(':').map(Number);
  const [closeH, closeM] = todayRule.closes.split(':').map(Number);
  const isOpen = minutes >= openH * 60 + openM && minutes < closeH * 60 + closeM;
  return { open: isOpen, changeTime: isOpen ? todayRule.closes : null };
}

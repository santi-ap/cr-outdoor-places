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

export function getWeekdayLabels(language: Language): Record<Weekday, string> {
  return language === 'es' ? weekdayLabelsEs : weekdayLabelsEn;
}

// "08:00" -> "8:00 a.m.", "16:30" -> "4:30 p.m." -- matches the a.m./p.m.
// style already used throughout this app's (free-text) seed hours, kept
// the same for both languages rather than chasing Spanish's "a. m."
// typographic convention.
function formatTimeOfDay(time: string): string {
  const [hourStr, minute] = time.split(':');
  const hour24 = Number(hourStr);
  const period = hour24 < 12 ? 'a.m.' : 'p.m.';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${minute} ${period}`;
}

// Groups a set of days into runs of consecutive weekdays for display, e.g.
// [tue,wed,thu,fri,sat,sun] -> "Tue–Sun", [mon,wed,fri] -> "Mon, Wed, Fri".
function formatDayRange(days: Weekday[], labels: Record<Weekday, string>, every: string): string {
  const ordered = WEEKDAY_ORDER.filter((day) => days.includes(day));
  if (ordered.length === WEEKDAY_ORDER.length) return every;

  const runs: Weekday[][] = [];
  for (const day of ordered) {
    const lastRun = runs[runs.length - 1];
    const lastDay = lastRun?.[lastRun.length - 1];
    const isConsecutive = lastDay && WEEKDAY_ORDER[WEEKDAY_ORDER.indexOf(lastDay) + 1] === day;
    if (isConsecutive) lastRun.push(day);
    else runs.push([day]);
  }

  return runs
    .map((run) =>
      run.length >= 2 ? `${labels[run[0]]}–${labels[run[run.length - 1]]}` : labels[run[0]],
    )
    .join(', ');
}

// One formatted line per day-group, e.g. ["Every day 8:00 a.m.–4:00
// p.m."] or ["Mon–Fri 8:00 a.m.–4:00 p.m.", "Sat–Sun 9:00 a.m.–1:00
// p.m."] -- the caller joins/renders these however fits its layout.
export function formatHours(hours: HoursRule[], language: Language): string[] {
  const labels = getWeekdayLabels(language);
  const every = language === 'es' ? 'Todos los días' : 'Every day';
  return hours.map((rule) => {
    const days = formatDayRange(rule.days, labels, every);
    return `${days} ${formatTimeOfDay(rule.opens)}–${formatTimeOfDay(rule.closes)}`;
  });
}

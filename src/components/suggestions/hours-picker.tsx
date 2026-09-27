'use client';

import { cn } from 'cn';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { XIcon, PlusIcon } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';
import { WEEKDAY_ORDER, ALL_DAYS, WEEKDAYS, WEEKEND, getWeekdayLabels } from '@/lib/places/hours';
import type { HoursRule, Weekday } from '@/lib/validation/schemas';

const DEFAULT_RULE: HoursRule = { days: [], opens: '08:00', closes: '16:00' };

// A place can have more than one day-group with different hours (e.g.
// weekday vs. weekend) -- see Issue #75. Each group gets its own day
// toggles (with quick presets) and a from/to time pair; native
// <input type="time"> needs no extra dependency and its value format is
// already the "HH:MM" this app stores.
export function HoursPicker({
  value,
  onChange,
}: {
  value: HoursRule[];
  onChange: (rules: HoursRule[]) => void;
}) {
  const { t } = useLanguage();

  function updateRule(index: number, patch: Partial<HoursRule>) {
    onChange(value.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)));
  }

  function removeRule(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function addRule() {
    onChange([...value, DEFAULT_RULE]);
  }

  return (
    <div className="flex flex-col gap-3">
      {value.map((rule, index) => (
        <HoursRuleEditor
          key={index}
          rule={rule}
          onChange={(patch) => updateRule(index, patch)}
          onRemove={() => removeRule(index)}
        />
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addRule} className="self-start">
        <PlusIcon className="size-3.5" />
        {t.suggest.hoursAddGroup}
      </Button>
    </div>
  );
}

function HoursRuleEditor({
  rule,
  onChange,
  onRemove,
}: {
  rule: HoursRule;
  onChange: (patch: Partial<HoursRule>) => void;
  onRemove: () => void;
}) {
  const { t, language } = useLanguage();
  const dayLabels = getWeekdayLabels(language);

  function toggleDay(day: Weekday) {
    const days = rule.days.includes(day) ? rule.days.filter((d) => d !== day) : [...rule.days, day];
    onChange({ days });
  }

  function isPreset(preset: Weekday[]) {
    return rule.days.length === preset.length && preset.every((d) => rule.days.includes(d));
  }

  return (
    <div className="border-line flex flex-col gap-2.5 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: t.suggest.hoursPresetDaily, days: ALL_DAYS },
            { label: t.suggest.hoursPresetWeekdays, days: WEEKDAYS },
            { label: t.suggest.hoursPresetWeekend, days: WEEKEND },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onChange({ days: preset.days })}
              className={cn(
                'rounded-control border-[1.5px] px-2.5 py-1 text-[12px] font-medium transition-colors',
                isPreset(preset.days)
                  ? 'border-forest bg-forest text-cream'
                  : 'border-line-strong bg-cream text-bark',
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove}>
          <XIcon className="size-3.5" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-1">
        {WEEKDAY_ORDER.map((day) => {
          const active = rule.days.includes(day);
          return (
            <button
              key={day}
              type="button"
              aria-pressed={active}
              onClick={() => toggleDay(day)}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] text-[11px] font-medium transition-colors',
                active ? 'border-forest bg-forest text-cream' : 'border-line-strong bg-cream text-bark',
              )}
            >
              {dayLabels[day]}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-ink-muted text-[12px]">{t.suggest.hoursOpens}</span>
          <Input type="time" value={rule.opens} onChange={(e) => onChange({ opens: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-ink-muted text-[12px]">{t.suggest.hoursCloses}</span>
          <Input type="time" value={rule.closes} onChange={(e) => onChange({ closes: e.target.value })} />
        </label>
      </div>
    </div>
  );
}

/**
 * WeeklySchedule - 7-day calendar showing bracket rotation with BR highlighting
 */

import { useMemo } from 'react';
import { getCycleInfo } from '../../lib/rotation';
import { cn, formatBR } from '../../lib/utils';
import type { SimBracket } from '../../types/aircraft';
import type { RotationCycleData, RotationConfig } from '../../lib/rotation';

const CYCLE_COLORS: Record<string, string> = {
  A: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  B: 'bg-green-500/20 text-green-400 border-green-500/40',
  C: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
  D: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
};

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface WeeklyScheduleProps {
  cycles: RotationCycleData[];
  rotationConfig: RotationConfig;
  highlightBR: number | null;
  onHighlightBRChange: (br: number | null) => void;
}

interface DaySchedule {
  date: Date;
  dayName: string;
  dateStr: string;
  cycleLetter: string;
  brackets: SimBracket[];
  isToday: boolean;
  isPast: boolean;
}

export function WeeklySchedule({
  cycles,
  rotationConfig,
  highlightBR,
  onHighlightBRChange,
}: WeeklyScheduleProps) {
  // Calculate the week's schedule (Monday to Sunday)
  const weekSchedule = useMemo(() => {
    const today = new Date();
    const todayDateStr = today.toISOString().slice(0, 10);

    // Find Monday of current week
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(12, 0, 0, 0); // Noon to avoid DST edge cases

    const schedule: DaySchedule[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);

      const cycleInfo = getCycleInfo(cycles, rotationConfig, date);
      const dateStr = date.toISOString().slice(0, 10);
      const isToday = dateStr === todayDateStr;
      const isPast = date < today && !isToday;

      schedule.push({
        date,
        dayName: DAY_NAMES[i],
        dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        cycleLetter: cycleInfo.cycleLetter,
        brackets: cycleInfo.brackets,
        isToday,
        isPast,
      });
    }

    return schedule;
  }, [cycles, rotationConfig]);

  // Check if a bracket contains the highlighted BR
  function bracketContainsBR(bracket: SimBracket): boolean {
    if (highlightBR === null) return false;
    return highlightBR >= bracket.min_br && highlightBR <= bracket.max_br;
  }

  return (
    <div className="corner-brackets">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-px bg-aviation-amber/30" aria-hidden="true" />
          <span className="section-label">Weekly Schedule</span>
        </div>

        {/* BR highlight input */}
        <div className="flex items-center gap-2">
          <label htmlFor="highlight-br" className="text-xs text-aviation-text-muted">
            Highlight BR:
          </label>
          <input
            id="highlight-br"
            type="number"
            min="1.0"
            max="14.3"
            step="0.1"
            value={highlightBR ?? ''}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onHighlightBRChange(isNaN(val) ? null : val);
            }}
            placeholder="e.g. 4.0"
            className="w-20 bg-aviation-charcoal/50 border border-aviation-border rounded px-2 py-1 text-xs text-aviation-text font-mono placeholder-aviation-text-muted/50 focus:outline-none focus:ring-2 focus:ring-aviation-amber"
          />
          {highlightBR !== null && (
            <button
              onClick={() => onHighlightBRChange(null)}
              className="text-xs text-aviation-text-muted hover:text-aviation-amber transition-colors"
              aria-label="Clear BR highlight"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Desktop: 7-column grid */}
      <div className="hidden md:grid grid-cols-7 gap-1.5" role="table" aria-label="Weekly bracket schedule">
        {/* Day headers */}
        <div role="row" className="contents">
          {weekSchedule.map((day) => (
            <div
              key={day.dayName}
              role="columnheader"
              className={cn(
                'text-center text-xs font-header font-bold uppercase tracking-wider py-1.5 rounded-t border-b',
                day.isToday
                  ? 'text-aviation-amber border-aviation-amber/40'
                  : 'text-aviation-text-muted border-aviation-border'
              )}
            >
              {day.dayName}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div role="row" className="contents">
          {weekSchedule.map((day) => (
            <div
              key={day.dateStr}
              role="cell"
              className={cn(
                'border rounded-b p-2 min-h-[180px] transition-colors',
                day.isToday
                  ? 'border-aviation-amber/40 bg-aviation-amber/5'
                  : day.isPast
                    ? 'border-aviation-border/50 bg-aviation-surface/20 opacity-60'
                    : 'border-aviation-border bg-aviation-surface/40'
              )}
            >
              {/* Date + cycle badge */}
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  'text-xs',
                  day.isToday ? 'text-aviation-amber font-bold' : 'text-aviation-text-muted'
                )}>
                  {day.dateStr}
                </span>
                <span className={cn(
                  'inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold border',
                  CYCLE_COLORS[day.cycleLetter]
                )}>
                  {day.cycleLetter}
                </span>
              </div>

              {day.isToday && (
                <div className="text-[10px] font-bold text-aviation-amber uppercase tracking-wider mb-1.5">
                  Today
                </div>
              )}

              {/* Bracket list */}
              <div className="space-y-0.5">
                {day.brackets.map((bracket) => {
                  const isHighlighted = bracketContainsBR(bracket);
                  return (
                    <div
                      key={bracket.id}
                      className={cn(
                        'text-[10px] leading-tight rounded px-1 py-0.5 transition-colors',
                        isHighlighted
                          ? 'bg-aviation-amber/20 text-aviation-amber font-medium'
                          : 'text-aviation-text-muted'
                      )}
                    >
                      <span className="font-medium">{bracket.name}</span>
                      <span className="ml-1 font-mono opacity-70">
                        {formatBR(bracket.min_br)}–{formatBR(bracket.max_br)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: Stacked list */}
      <div className="md:hidden space-y-2">
        {weekSchedule.map((day) => (
          <details
            key={day.dateStr}
            open={day.isToday}
            className={cn(
              'border rounded-lg overflow-hidden',
              day.isToday ? 'border-aviation-amber/40' : 'border-aviation-border'
            )}
          >
            <summary
              className={cn(
                'flex items-center justify-between px-3 py-2 cursor-pointer',
                day.isToday ? 'bg-aviation-amber/5' : 'bg-aviation-surface/40',
                day.isPast && 'opacity-60'
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-sm font-medium',
                  day.isToday ? 'text-aviation-amber' : 'text-aviation-text'
                )}>
                  {day.dayName} · {day.dateStr}
                </span>
                {day.isToday && (
                  <span className="text-[10px] font-bold text-aviation-amber uppercase">Today</span>
                )}
              </div>
              <span className={cn(
                'inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold border',
                CYCLE_COLORS[day.cycleLetter]
              )}>
                {day.cycleLetter}
              </span>
            </summary>
            <div className="px-3 py-2 space-y-1 bg-aviation-surface/20">
              {day.brackets.map((bracket) => {
                const isHighlighted = bracketContainsBR(bracket);
                return (
                  <div
                    key={bracket.id}
                    className={cn(
                      'text-xs rounded px-2 py-1',
                      isHighlighted
                        ? 'bg-aviation-amber/15 text-aviation-amber font-medium'
                        : 'text-aviation-text-muted'
                    )}
                  >
                    {bracket.name} · {formatBR(bracket.min_br)}–{formatBR(bracket.max_br)}
                  </div>
                );
              })}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

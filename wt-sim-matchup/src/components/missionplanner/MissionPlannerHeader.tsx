/**
 * MissionPlannerHeader - Shows current rotation status with manual override
 * Displays cycle letter, day indicator, countdown timer, and override buttons
 */

import { useState, useEffect } from 'react';
import type { CycleInfo } from '../../lib/rotation';
import { cn } from '../../lib/utils';

const CYCLE_LETTERS = ['A', 'B', 'C', 'D'];
const CYCLE_COLORS: Record<string, string> = {
  A: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  B: 'bg-green-500/20 text-green-400 border-green-500/40',
  C: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
  D: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
};

interface MissionPlannerHeaderProps {
  cycleInfo: CycleInfo | null;
  cycleOverride: string | null;
  onCycleOverride: (letter: string | null) => void;
}

export function MissionPlannerHeader({
  cycleInfo,
  cycleOverride,
  onCycleOverride,
}: MissionPlannerHeaderProps) {
  const [countdown, setCountdown] = useState('');

  const activeCycle = cycleOverride ?? cycleInfo?.cycleLetter ?? 'A';
  const isOverridden = cycleOverride !== null;

  // Countdown timer - updates every second
  useEffect(() => {
    if (!cycleInfo?.nextRotation) return;

    function updateCountdown() {
      const now = new Date();
      const diff = cycleInfo!.nextRotation.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown('Rotating...');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [cycleInfo]);

  if (!cycleInfo) {
    return (
      <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-4 animate-pulse corner-brackets">
        <div className="h-6 bg-aviation-border/30 rounded w-48" />
      </div>
    );
  }

  return (
    <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-4 backdrop-blur-sm corner-brackets">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: Status info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-px bg-aviation-amber/30" aria-hidden="true" />
            <span className="section-label">Current Rotation</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Cycle badge */}
            <span
              className={cn(
                'inline-flex items-center justify-center w-8 h-8 rounded border font-header font-bold text-sm',
                CYCLE_COLORS[activeCycle] ?? CYCLE_COLORS.A
              )}
            >
              {activeCycle}
            </span>

            {/* Day indicator */}
            {!isOverridden && (
              <span className="text-sm text-aviation-text-muted">
                Day {cycleInfo.dayInCycle} of 2
              </span>
            )}

            {/* Manual badge */}
            {isOverridden && (
              <span className="text-xs font-mono uppercase tracking-wider text-aviation-amber bg-aviation-amber/10 border border-aviation-amber/30 rounded px-2 py-0.5">
                Manual
              </span>
            )}
          </div>

          {/* Countdown */}
          {!isOverridden && (
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-aviation-text-muted">Next rotation:</span>
              <span className="font-mono text-aviation-amber" aria-live="polite">
                {countdown}
              </span>
            </div>
          )}
        </div>

        {/* Right: Cycle override buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-aviation-text-muted mr-1">Cycle:</span>
          <div
            role="radiogroup"
            aria-label="Select rotation cycle"
            onKeyDown={(e) => {
              const currentIndex = CYCLE_LETTERS.indexOf(activeCycle);
              let nextIndex: number | null = null;

              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                nextIndex = (currentIndex + 1) % CYCLE_LETTERS.length;
              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                nextIndex = (currentIndex - 1 + CYCLE_LETTERS.length) % CYCLE_LETTERS.length;
              }

              if (nextIndex !== null) {
                const nextLetter = CYCLE_LETTERS[nextIndex];
                if (nextLetter === cycleInfo.cycleLetter && isOverridden) {
                  onCycleOverride(null);
                } else if (nextLetter !== cycleInfo.cycleLetter) {
                  onCycleOverride(nextLetter);
                }
                // Focus the target button
                const buttons = e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]');
                buttons[nextIndex]?.focus();
              }
            }}
          >
            <div className="flex gap-1">
              {CYCLE_LETTERS.map((letter) => (
                <button
                  key={letter}
                  role="radio"
                  aria-checked={activeCycle === letter}
                  aria-label={`Cycle ${letter}`}
                  tabIndex={activeCycle === letter ? 0 : -1}
                  onClick={() => {
                    if (letter === cycleInfo.cycleLetter && isOverridden) {
                      onCycleOverride(null); // Reset to auto
                    } else if (letter !== cycleInfo.cycleLetter) {
                      onCycleOverride(letter);
                    }
                  }}
                  className={cn(
                    'w-8 h-8 rounded border text-xs font-header font-bold transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-aviation-amber',
                    activeCycle === letter
                      ? CYCLE_COLORS[letter]
                      : 'border-aviation-border text-aviation-text-muted hover:border-aviation-amber/40 hover:text-aviation-text'
                  )}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {isOverridden && (
            <button
              onClick={() => onCycleOverride(null)}
              className="text-xs text-aviation-amber hover:text-aviation-amber/80 transition-colors underline ml-2 focus:outline-none focus:ring-2 focus:ring-aviation-amber rounded"
            >
              Reset to auto
            </button>
          )}
        </div>
      </div>

      {/* Mobile countdown */}
      {!isOverridden && (
        <div className="sm:hidden mt-3 flex items-center gap-2 text-sm">
          <span className="text-aviation-text-muted">Next rotation:</span>
          <span className="font-mono text-aviation-amber">{countdown}</span>
        </div>
      )}
    </div>
  );
}

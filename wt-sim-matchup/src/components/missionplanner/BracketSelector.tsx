/**
 * BracketSelector - Grid of clickable bracket cards for the selected rotation cycle
 * Each card shows bracket name, BR range, and aircraft count
 */

import { useMemo } from 'react';
import type { SimBracket, Aircraft } from '../../types/aircraft';
import { cn, formatBR } from '../../lib/utils';

interface BracketSelectorProps {
  brackets: SimBracket[];
  allAircraft: Aircraft[];
  selectedBracketId: string | null;
  onSelectBracket: (bracketId: string) => void;
}

export function BracketSelector({
  brackets,
  allAircraft,
  selectedBracketId,
  onSelectBracket,
}: BracketSelectorProps) {
  // Count aircraft per bracket
  const aircraftCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const bracket of brackets) {
      counts[bracket.id] = allAircraft.filter(
        (a) => a.simulator_br >= bracket.min_br && a.simulator_br <= bracket.max_br
      ).length;
    }
    return counts;
  }, [brackets, allAircraft]);

  if (brackets.length === 0) {
    return (
      <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-6 text-center corner-brackets">
        <p className="text-aviation-text-muted text-sm">No brackets available for this cycle.</p>
      </div>
    );
  }

  return (
    <div className="corner-brackets">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-4 h-px bg-aviation-amber/30" aria-hidden="true" />
        <span className="section-label">Select Bracket</span>
      </div>

      <div
        role="radiogroup"
        aria-label="Battle rating brackets"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2"
      >
        {brackets.map((bracket) => {
          const isSelected = selectedBracketId === bracket.id;
          const count = aircraftCounts[bracket.id] ?? 0;

          return (
            <button
              key={bracket.id}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${bracket.name}: BR ${formatBR(bracket.min_br)} to ${formatBR(bracket.max_br)}, ${count} aircraft`}
              onClick={() => onSelectBracket(bracket.id)}
              className={cn(
                'relative p-3 rounded-lg border text-left transition-all',
                'focus:outline-none focus:ring-2 focus:ring-aviation-amber',
                isSelected
                  ? 'bg-aviation-amber/10 border-aviation-amber text-aviation-text shadow-[0_0_8px_rgba(212,168,67,0.15)]'
                  : 'bg-aviation-surface/40 border-aviation-border text-aviation-text-muted hover:border-aviation-amber/40 hover:bg-aviation-surface/60'
              )}
            >
              <div className="font-header font-bold text-sm">
                {bracket.name}
              </div>
              <div className="text-xs mt-1 font-mono">
                {formatBR(bracket.min_br)} – {formatBR(bracket.max_br)}
              </div>
              <div className={cn(
                'text-xs mt-1.5',
                isSelected ? 'text-aviation-amber' : 'text-aviation-text-muted'
              )}>
                {count} aircraft
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

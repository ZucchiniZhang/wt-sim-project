/**
 * BracketInfo - Display current BR bracket information with rotation cycle
 */

import { Badge } from '../ui/Badge';
import { formatBR } from '../../lib/utils';
import type { SimBracket } from '../../types/aircraft';
import type { CycleInfo } from '../../lib/rotation';

interface BracketInfoProps {
  bracket: SimBracket;
  playerBR: number;
  cycleInfo?: CycleInfo | null;
  className?: string;
}

export function BracketInfo({ bracket, playerBR, cycleInfo, className }: BracketInfoProps) {
  return (
    <div className={className}>
      <div className="bg-aviation-slate/40 border border-aviation-border rounded-lg backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-4 h-px bg-aviation-amber/30" />
              <span className="section-label">Bracket Info</span>
              {cycleInfo && (
                <span className="text-xs text-aviation-amber/80 uppercase tracking-widest ml-2">
                  Rotation {cycleInfo.cycleLetter} &middot; Day {cycleInfo.dayInCycle}/2
                </span>
              )}
            </div>
            <h3 className="font-header text-lg font-bold text-aviation-amber uppercase tracking-wider">
              {bracket.name}
            </h3>
            {bracket.description && (
              <p className="text-xs text-aviation-text-muted mt-1 uppercase tracking-widest">
                {bracket.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="br">BR {formatBR(playerBR)}</Badge>
            <span className="text-sm font-mono text-aviation-text-muted uppercase tracking-wider">
              {formatBR(bracket.min_br)} - {formatBR(bracket.max_br)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

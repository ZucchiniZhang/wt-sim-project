/**
 * TeamDisplay - Shows team A vs team B nation assignments
 */

import { getNationFlag, getNationName } from '../../lib/utils';
import type { Nation } from '../../types/aircraft';

interface TeamDisplayProps {
  teamA: Nation[];
  teamB: Nation[];
  playerTeam: 'A' | 'B';
  className?: string;
}

export function TeamDisplay({ teamA, teamB, playerTeam, className }: TeamDisplayProps) {
  return (
    <div className={className}>
      <div className="bg-aviation-slate/40 border border-aviation-border rounded-lg backdrop-blur-sm p-4">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
          {/* Team A */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-1.5 h-1.5 rounded-full ${playerTeam === 'A' ? 'bg-aviation-amber' : 'bg-aviation-text-muted/50'}`} />
              <span className="section-label">
                Team A {playerTeam === 'A' && '(You)'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {teamA.map((nation) => (
                <div
                  key={nation}
                  className="flex items-center gap-1.5 px-2 py-1 bg-aviation-charcoal/60 border border-aviation-border rounded text-xs uppercase tracking-wider"
                >
                  <span>{getNationFlag(nation)}</span>
                  <span className="text-aviation-text">{getNationName(nation)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex items-center justify-center pt-6">
            <div className="px-2 py-1 border border-aviation-amber/30 rounded text-aviation-amber font-mono text-xs font-bold uppercase tracking-widest">
              VS
            </div>
          </div>

          {/* Team B */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-1.5 h-1.5 rounded-full ${playerTeam === 'B' ? 'bg-aviation-amber' : 'bg-red-500/50'}`} />
              <span className="section-label">
                Team B {playerTeam === 'B' && '(You)'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {teamB.map((nation) => (
                <div
                  key={nation}
                  className="flex items-center gap-1.5 px-2 py-1 bg-aviation-charcoal/60 border border-red-500/10 rounded text-xs uppercase tracking-wider"
                >
                  <span>{getNationFlag(nation)}</span>
                  <span className="text-aviation-text">{getNationName(nation)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

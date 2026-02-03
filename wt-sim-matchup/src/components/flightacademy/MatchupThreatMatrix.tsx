/**
 * MatchupThreatMatrix - Visual matchup analysis showing strengths and weaknesses
 * Two-column layout: aircraft types countered well vs. those to avoid
 */

import type { TacticalGuide } from '../../types/curated';

interface MatchupThreatMatrixProps {
  guide: TacticalGuide;
}

function MatchupColumn({
  title,
  items,
  accentColor,
  emptyText,
}: {
  title: string;
  items: string[];
  accentColor: 'green' | 'red';
  emptyText: string;
}) {
  const borderClass = accentColor === 'green' ? 'border-green-400' : 'border-red-400';
  const dotClass = accentColor === 'green' ? 'bg-green-400' : 'bg-red-400';
  const labelClass = accentColor === 'green' ? 'text-green-400' : 'text-red-400';

  return (
    <div className={`border-l-4 ${borderClass} bg-aviation-charcoal/30 rounded-r p-4`}>
      <h4 className={`text-xs uppercase tracking-widest font-header font-bold ${labelClass} mb-3`}>
        {title}
      </h4>

      {items.length === 0 ? (
        <p className="text-sm text-aviation-text-muted italic">{emptyText}</p>
      ) : (
        <ul className="space-y-2" aria-label={title}>
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <div className={`w-2 h-2 rounded-full ${dotClass} mt-1.5 shrink-0`} aria-hidden="true" />
              <span className="text-sm text-aviation-text leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MatchupThreatMatrix({ guide }: MatchupThreatMatrixProps) {
  return (
    <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-6 backdrop-blur-sm corner-brackets">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-4 h-px bg-aviation-amber/30" />
        <span className="section-label">MATCHUP ANALYSIS</span>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MatchupColumn
          title="Counters Well"
          items={guide.counters_well}
          accentColor="green"
          emptyText="No specific counter advantages identified."
        />
        <MatchupColumn
          title="Struggles Against"
          items={guide.struggles_against}
          accentColor="red"
          emptyText="No specific vulnerabilities identified."
        />
      </div>
    </div>
  );
}

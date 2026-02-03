/**
 * TacticalOverview - High-level aircraft role and performance envelope
 * Shows primary role, optimal performance zone, and energy management characteristics
 */

import type { TacticalGuide } from '../../types/curated';

interface TacticalOverviewProps {
  guide: TacticalGuide;
}

export function TacticalOverview({ guide }: TacticalOverviewProps) {
  // Determine energy rating color based on retention level
  const getEnergyRatingColor = (retention: string): string => {
    if (retention === 'excellent') return 'text-green-400 border-green-400/30 bg-green-400/10';
    if (retention === 'good') return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
    if (retention === 'average') return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
    return 'text-red-400 border-red-400/30 bg-red-400/10';
  };

  // Extract energy rating text
  const getEnergyRatingText = (retention: string): string => {
    return `${retention.toUpperCase()} ENERGY RETENTION`;
  };

  const energyColorClass = getEnergyRatingColor(guide.energy_management.retention);
  const energyRatingText = getEnergyRatingText(guide.energy_management.retention);

  return (
    <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-6 backdrop-blur-sm corner-brackets">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-4 h-px bg-aviation-amber/30" />
        <span className="section-label">TACTICAL OVERVIEW</span>
      </div>

      {/* Primary Role */}
      <div className="mb-6">
        <div className="text-xs uppercase tracking-widest text-aviation-text-muted mb-2">
          PRIMARY ROLE
        </div>
        <h2 className="text-2xl md:text-3xl font-header font-bold text-aviation-amber uppercase tracking-wider">
          {guide.primary_role}
        </h2>
      </div>

      {/* Performance Envelope Visualization */}
      <div className="mb-6">
        <div className="text-xs uppercase tracking-widest text-aviation-text-muted mb-3">
          PERFORMANCE ENVELOPE
        </div>

        {/* Simple visual representation of optimal zone */}
        <div className="bg-aviation-charcoal/50 border border-aviation-border/30 rounded p-4 relative overflow-hidden">
          {/* Altitude axis (vertical) */}
          <div className="flex gap-4">
            {/* Y-axis labels */}
            <div className="flex flex-col justify-between text-xs font-mono text-aviation-text-muted py-2">
              <div>{(guide.optimal_envelope.altitude_max / 1000).toFixed(1)}km</div>
              <div className="opacity-50">─</div>
              <div className="opacity-50">─</div>
              <div>{(guide.optimal_envelope.altitude_min / 1000).toFixed(1)}km</div>
            </div>

            {/* Chart area */}
            <div className="flex-1 relative" style={{ height: '120px' }}>
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between opacity-20">
                <div className="border-t border-aviation-border" />
                <div className="border-t border-aviation-border" />
                <div className="border-t border-aviation-border" />
                <div className="border-t border-aviation-border" />
              </div>

              {/* Optimal zone (shaded rectangle) */}
              <div
                className="absolute bg-gradient-to-br from-aviation-amber/20 to-green-400/10 border-2 border-dashed border-aviation-amber/40 rounded"
                style={{
                  left: '20%',
                  right: '20%',
                  top: '15%',
                  bottom: '15%',
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-header font-bold text-aviation-amber uppercase tracking-wider">
                    Optimal Zone
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between text-xs font-mono text-aviation-text-muted mt-2 ml-8">
            <div>0</div>
            <div>{guide.optimal_envelope.speed_min}</div>
            <div>{guide.optimal_envelope.speed_max}</div>
            <div className="opacity-50">km/h</div>
          </div>
        </div>
      </div>

      {/* Energy Retention Badge */}
      <div className="mb-6">
        <div
          className={`inline-block px-4 py-2 border rounded-lg font-header font-bold text-sm uppercase tracking-wider ${energyColorClass}`}
        >
          {energyRatingText}
        </div>
      </div>

      {/* Sweet Spot Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-aviation-charcoal/30 border border-aviation-border/50 rounded p-3">
          <div className="text-xs uppercase tracking-widest text-aviation-text-muted mb-1">
            Optimal Altitude
          </div>
          <div className="text-lg font-mono text-aviation-amber">
            {(guide.optimal_envelope.altitude_min / 1000).toFixed(1)} - {(guide.optimal_envelope.altitude_max / 1000).toFixed(1)} km
          </div>
          <div className="text-xs text-aviation-text-muted mt-1">
            ({guide.optimal_envelope.altitude_min.toFixed(0)} - {guide.optimal_envelope.altitude_max.toFixed(0)} m)
          </div>
        </div>

        <div className="bg-aviation-charcoal/30 border border-aviation-border/50 rounded p-3">
          <div className="text-xs uppercase tracking-widest text-aviation-text-muted mb-1">
            Optimal Speed
          </div>
          <div className="text-lg font-mono text-aviation-amber">
            {guide.optimal_envelope.speed_min} - {guide.optimal_envelope.speed_max} km/h
          </div>
          <div className="text-xs text-aviation-text-muted mt-1">
            Combat effectiveness zone
          </div>
        </div>
      </div>

      {/* Energy Guidance */}
      <div className="border-t border-aviation-border/30 pt-4">
        <div className="text-xs uppercase tracking-widest text-aviation-text-muted mb-2">
          ENERGY GUIDANCE
        </div>
        <p className="text-sm text-aviation-text leading-relaxed">
          {guide.energy_management.guidance}
        </p>
      </div>
    </div>
  );
}

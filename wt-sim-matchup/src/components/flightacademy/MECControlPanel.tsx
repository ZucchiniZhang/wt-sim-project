/**
 * MECControlPanel - Visual Manual Engine Controls guidance
 * Shows 5 control cards with labels, guidance text, and visual indicators
 */

import type { MECGuidance } from '../../types/curated';

interface MECControlPanelProps {
  guidance: MECGuidance;
}

interface ControlCardProps {
  icon: string;
  label: string;
  guidance: string;
}

function ControlCard({ icon, label, guidance }: ControlCardProps) {
  return (
    <div className="bg-aviation-charcoal/30 border border-aviation-border/50 rounded p-4">
      {/* Icon and Label */}
      <div className="flex items-center gap-2 mb-3">
        <div className="text-aviation-amber text-lg" aria-hidden="true">{icon}</div>
        <h4 className="text-xs uppercase tracking-widest text-aviation-text-muted">
          {label}
        </h4>
      </div>

      {/* Visual gauge bar */}
      <div className="h-2 bg-aviation-charcoal/60 rounded-full mb-3 overflow-hidden" aria-hidden="true">
        <div className="h-full bg-gradient-to-r from-green-400/60 via-aviation-amber/60 to-red-400/60 rounded-full" />
      </div>

      {/* Guidance text */}
      <p className="text-sm text-aviation-text leading-relaxed">
        {guidance}
      </p>
    </div>
  );
}

export function MECControlPanel({ guidance }: MECControlPanelProps) {
  const controls: ControlCardProps[] = [
    { icon: '🛢️', label: 'Oil Radiator', guidance: guidance.radiator_oil },
    { icon: '💧', label: 'Water Radiator', guidance: guidance.radiator_water },
    { icon: '🔄', label: 'Prop Pitch', guidance: guidance.prop_pitch },
    { icon: '⛽', label: 'Mixture', guidance: guidance.mixture },
    { icon: '⚙️', label: 'Supercharger', guidance: guidance.supercharger },
  ];

  return (
    <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-6 backdrop-blur-sm corner-brackets">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-4 h-px bg-aviation-amber/30" />
        <span className="section-label">MANUAL ENGINE CONTROLS (MEC)</span>
      </div>

      {/* Control Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {controls.map((control) => (
          <ControlCard key={control.label} {...control} />
        ))}
      </div>

      {/* Note */}
      <div className="border-t border-aviation-border/30 pt-4">
        <p className="text-xs text-aviation-text-muted italic">
          MEC settings are aircraft-specific. Adjust based on altitude and situation.
        </p>
      </div>
    </div>
  );
}

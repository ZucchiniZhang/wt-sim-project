/**
 * EnergyManagementDiagram - Visual representation of energy states and tactics
 * Shows three energy zones with recommended maneuvers for each
 */

import type { TacticalGuide } from '../../types/curated';

interface EnergyManagementDiagramProps {
  guide: TacticalGuide;
}

export function EnergyManagementDiagram({ guide }: EnergyManagementDiagramProps) {
  return (
    <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-6 backdrop-blur-sm corner-brackets">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-4 h-px bg-aviation-amber/30" />
        <span className="section-label">ENERGY MANAGEMENT</span>
      </div>

      {/* Energy State Zones */}
      <div className="space-y-4 mb-6" role="list" aria-label="Energy state zones">
        {/* HIGH ENERGY STATE */}
        <div className="border-l-4 border-green-400 bg-green-400/10 rounded-r p-4" role="listitem">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl" aria-hidden="true">↗️</div>
            <div>
              <div className="font-header font-bold text-green-400 uppercase tracking-wider">
                High Energy State
              </div>
              <div className="text-xs text-aviation-text-muted">
                Fast speed, high altitude advantage
              </div>
            </div>
          </div>
          <div className="text-sm text-aviation-text ml-11">
            <span className="font-semibold">Recommended:</span> Boom & Zoom, Zoom Climbs, Vertical Maneuvers
          </div>
        </div>

        {/* MEDIUM ENERGY STATE */}
        <div className="border-l-4 border-yellow-400 bg-yellow-400/10 rounded-r p-4" role="listitem">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl" aria-hidden="true">→</div>
            <div>
              <div className="font-header font-bold text-yellow-400 uppercase tracking-wider">
                Medium Energy State
              </div>
              <div className="text-xs text-aviation-text-muted">
                Moderate speed, co-altitude or slight advantage
              </div>
            </div>
          </div>
          <div className="text-sm text-aviation-text ml-11">
            <span className="font-semibold">Recommended:</span> Boom & Extend, Level Turns, Cautious Engagement
          </div>
        </div>

        {/* LOW ENERGY STATE */}
        <div className="border-l-4 border-red-400 bg-red-400/10 rounded-r p-4" role="listitem">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl" aria-hidden="true">↘️</div>
            <div>
              <div className="font-header font-bold text-red-400 uppercase tracking-wider">
                Low Energy State
              </div>
              <div className="text-xs text-aviation-text-muted">
                Slow speed, altitude disadvantage
              </div>
            </div>
          </div>
          <div className="text-sm text-aviation-text ml-11">
            <span className="font-semibold">Recommended:</span> Defensive Flying, Evasive Maneuvers, Disengage
          </div>
        </div>
      </div>

      {/* Energy Guidance from AI */}
      <div className="border-t border-aviation-border/30 pt-4">
        <div className="text-xs uppercase tracking-widest text-aviation-text-muted mb-2">
          TACTICAL GUIDANCE
        </div>
        <div className="bg-aviation-charcoal/30 border border-aviation-border/50 rounded p-4">
          <p className="text-sm text-aviation-text leading-relaxed">
            {guide.energy_management.guidance}
          </p>
        </div>
      </div>

      {/* Energy Management Tips */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-3xl mb-2" aria-hidden="true">⚡</div>
          <div className="text-xs uppercase tracking-widest text-aviation-text-muted mb-1">
            Speed is Life
          </div>
          <div className="text-xs text-aviation-text-muted">
            Maintain speed for energy options
          </div>
        </div>

        <div className="text-center">
          <div className="text-3xl mb-2" aria-hidden="true">⛰️</div>
          <div className="text-xs uppercase tracking-widest text-aviation-text-muted mb-1">
            Altitude is Insurance
          </div>
          <div className="text-xs text-aviation-text-muted">
            Trade altitude for speed when needed
          </div>
        </div>

        <div className="text-center">
          <div className="text-3xl mb-2" aria-hidden="true">🎯</div>
          <div className="text-xs uppercase tracking-widest text-aviation-text-muted mb-1">
            Position is Power
          </div>
          <div className="text-xs text-aviation-text-muted">
            Fight from energy advantage
          </div>
        </div>
      </div>
    </div>
  );
}

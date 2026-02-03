/**
 * CombatTacticsSection - Main tactical guide text with performance visualization
 * Two-column layout: tactical text (left) + 6-axis radar chart (right)
 */

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { CHART_THEME } from '../charts/chartTheme';
import type { TacticalGuide } from '../../types/curated';
import type { Aircraft } from '../../types/aircraft';

interface CombatTacticsSectionProps {
  guide: TacticalGuide;
  aircraft: Aircraft;
}

// Normalize aircraft stats to 0-100 scale
function normalizeSpeed(speed?: number): number {
  if (!speed) return 0;
  return Math.min((speed / 800) * 100, 100); // 800 km/h is exceptional
}

function normalizeClimb(climb?: number): number {
  if (!climb) return 0;
  return Math.min((climb / 35) * 100, 100); // 35 m/s is exceptional
}

function normalizeTurn(turn?: number): number {
  if (!turn) return 0;
  // Lower is better - 10s is excellent, 30s is poor
  return Math.max(0, Math.min(100, ((30 - turn) / 20) * 100));
}

function normalizeArmament(weapons?: unknown[]): number {
  if (!weapons || weapons.length === 0) return 0;
  // Simple weapon count proxy (6+ weapons is heavily armed)
  return Math.min((weapons.length / 6) * 100, 100);
}

function normalizeAltitude(br?: number): number {
  // Higher BR typically means better altitude performance
  if (!br) return 50;
  return Math.min(((br - 1) / 7) * 100, 100); // BR 1.0-8.0 range
}

function normalizeDive(speed?: number, mass?: number): number {
  // Heavier + faster = better dive characteristics
  if (!speed || !mass) return 50;
  const diveScore = (speed / 800) * 50 + (mass / 15000) * 50;
  return Math.min(diveScore, 100);
}

export function CombatTacticsSection({ guide, aircraft }: CombatTacticsSectionProps) {
  // Prepare radar chart data
  const radarData = useMemo(() => {
    return [
      { subject: 'Speed', value: normalizeSpeed(aircraft.max_speed) },
      { subject: 'Climb', value: normalizeClimb(aircraft.climb_rate) },
      { subject: 'Turn', value: normalizeTurn(aircraft.turn_time) },
      { subject: 'Armament', value: normalizeArmament(aircraft.weapons_summary) },
      { subject: 'Altitude', value: normalizeAltitude(aircraft.simulator_br) },
      { subject: 'Dive', value: normalizeDive(aircraft.max_speed, aircraft.mass) },
    ];
  }, [aircraft]);

  return (
    <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-6 backdrop-blur-sm corner-brackets">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-4 h-px bg-aviation-amber/30" />
        <span className="section-label">COMBAT TACTICS</span>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6">
        {/* Left Column: Tactical Guide Text */}
        <div>
          <div className="text-sm text-aviation-text leading-relaxed whitespace-pre-wrap">
            {guide.combat_tactics}
          </div>
        </div>

        {/* Right Column: Radar Chart */}
        <div aria-label="Performance profile radar chart showing speed, climb, turn, armament, altitude, and dive ratings">
          <div className="text-xs uppercase tracking-widest text-aviation-text-muted mb-3 text-center">
            Performance Profile
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={CHART_THEME.grid.stroke} strokeWidth={0.5} />
              <PolarAngleAxis
                dataKey="subject"
                tick={{
                  fill: '#e2e4e8',
                  fontSize: 11,
                  fontFamily: 'monospace',
                }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: '#6b7280', fontSize: 9 }}
                axisLine={false}
              />
              <Radar
                name="Performance"
                dataKey="value"
                stroke={CHART_THEME.colors.primary}
                fill={CHART_THEME.colors.primary}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Notes Section */}
      {guide.performance_notes && (
        <div className="border-t border-aviation-border/30 pt-4 mt-6">
          <div className="text-xs uppercase tracking-widest text-aviation-text-muted mb-2">
            PERFORMANCE NOTES
          </div>
          <p className="text-sm text-aviation-text-muted leading-relaxed">
            {guide.performance_notes}
          </p>
        </div>
      )}
    </div>
  );
}

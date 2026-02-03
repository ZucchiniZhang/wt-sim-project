/**
 * PreFlightIntel - Shows threat intel for selected bracket + team config
 * Includes summary, aircraft quick-picker, threat overview, and launch button
 */

import { useState, useMemo, useCallback } from 'react';
import { useTeamConfigStore } from '../../stores/teamConfigStore';
import { useSelectionStore } from '../../stores/selectionStore';
import { getEnemyAircraft, getEnemyNations, determineTeam, groupByNation } from '../../lib/matchup-logic';
import { getTopThreats, getThreatColor, getThreatLabel } from '../../lib/threat-analysis';
import { navigate } from '../../lib/router';
import { cn, formatBR, getNationFlag, getNationName, getAircraftDisplayName } from '../../lib/utils';
import type { Aircraft, SimBracket } from '../../types/aircraft';

interface PreFlightIntelProps {
  allAircraft: Aircraft[];
  selectedBracket: SimBracket | null;
  selectedAircraftId: string | null;
  onSelectAircraft: (id: string | null) => void;
}

export function PreFlightIntel({
  allAircraft,
  selectedBracket,
  selectedAircraftId,
  onSelectAircraft,
}: PreFlightIntelProps) {
  const { getActiveConfig } = useTeamConfigStore();
  const { setSelectedAircraft } = useSelectionStore();
  const teamConfig = getActiveConfig();

  const [searchQuery, setSearchQuery] = useState('');

  // All aircraft in the selected bracket
  const bracketAircraft = useMemo(() => {
    if (!selectedBracket) return [];
    return allAircraft.filter(
      (a) =>
        a.simulator_br >= selectedBracket.min_br &&
        a.simulator_br <= selectedBracket.max_br
    );
  }, [allAircraft, selectedBracket]);

  // Your team's aircraft (for the quick-picker)
  const yourAircraft = useMemo(() => {
    const teamANations = new Set(teamConfig.team_a);
    const teamBNations = new Set(teamConfig.team_b);
    return bracketAircraft
      .filter((a) => teamANations.has(a.country) || teamBNations.has(a.country))
      .sort((a, b) => a.simulator_br - b.simulator_br);
  }, [bracketAircraft, teamConfig]);

  // Filtered aircraft for quick-picker search
  const filteredPicker = useMemo(() => {
    if (!searchQuery.trim()) return yourAircraft;
    const q = searchQuery.toLowerCase();
    return yourAircraft.filter(
      (a) =>
        a.identifier.toLowerCase().includes(q) ||
        (a.localized_name?.toLowerCase().includes(q) ?? false)
    );
  }, [yourAircraft, searchQuery]);

  // Selected aircraft object
  const selectedAircraft = useMemo(() => {
    if (!selectedAircraftId) return null;
    return allAircraft.find((a) => a.identifier === selectedAircraftId) ?? null;
  }, [selectedAircraftId, allAircraft]);

  // Enemy calculations (when aircraft selected)
  const enemyData = useMemo(() => {
    if (!selectedAircraft || !selectedBracket) return null;
    const playerTeam = determineTeam(selectedAircraft.country, teamConfig);
    const enemyNations = getEnemyNations(playerTeam, teamConfig);
    const enemies = getEnemyAircraft(allAircraft, enemyNations, selectedBracket);
    const enemyByNation = groupByNation(enemies);
    const topThreats = getTopThreats(selectedAircraft, enemies, 5);

    // Ally count
    const allyNations = playerTeam === 'A' ? teamConfig.team_a : teamConfig.team_b;
    const allies = allAircraft.filter(
      (a) =>
        allyNations.includes(a.country) &&
        a.country !== selectedAircraft.country &&
        a.simulator_br >= selectedBracket.min_br &&
        a.simulator_br <= selectedBracket.max_br
    );

    return {
      enemies,
      enemyNations,
      enemyByNation,
      topThreats,
      allyCount: allies.length,
      playerTeam,
    };
  }, [selectedAircraft, selectedBracket, teamConfig, allAircraft]);

  // Launch matchup analysis
  const handleLaunch = useCallback(() => {
    if (selectedAircraft) {
      setSelectedAircraft(selectedAircraft);
      navigate('#/matchup');
    }
  }, [selectedAircraft, setSelectedAircraft]);

  // No bracket selected
  if (!selectedBracket) {
    return (
      <div className="bg-aviation-surface/60 border border-dashed border-aviation-border rounded-lg p-8 text-center corner-brackets">
        <p className="text-aviation-text-muted text-sm">
          Select a bracket above to see threat intel
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 corner-brackets">
      <div className="flex items-center gap-2">
        <div className="w-4 h-px bg-aviation-amber/30" aria-hidden="true" />
        <span className="section-label">Pre-Flight Intel</span>
        <span className="text-xs text-aviation-text-muted ml-auto">
          {selectedBracket.name} · BR {formatBR(selectedBracket.min_br)}–{formatBR(selectedBracket.max_br)}
        </span>
      </div>

      {/* Summary bar (when aircraft selected) */}
      {enemyData && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-3 text-center">
            <div className="text-xl font-header font-bold text-red-400">{enemyData.enemies.length}</div>
            <div className="text-xs text-aviation-text-muted">Enemies</div>
          </div>
          <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-3 text-center">
            <div className="text-xl font-header font-bold text-blue-400">{enemyData.allyCount}</div>
            <div className="text-xs text-aviation-text-muted">Allies</div>
          </div>
          <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-3 text-center">
            <div className="text-xl font-header font-bold text-aviation-text">{enemyData.enemyNations.length}</div>
            <div className="text-xs text-aviation-text-muted">Enemy Nations</div>
          </div>
        </div>
      )}

      {/* Aircraft quick-picker */}
      <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-header font-bold uppercase tracking-wider text-aviation-text-muted">
            Select Your Aircraft
          </span>
          <span className="text-xs text-aviation-text-muted">{bracketAircraft.length} in bracket</span>
        </div>

        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search aircraft..."
          className="w-full bg-aviation-charcoal/50 border border-aviation-border rounded px-3 py-1.5 text-sm text-aviation-text placeholder-aviation-text-muted/50 focus:outline-none focus:ring-2 focus:ring-aviation-amber focus:border-aviation-amber mb-3"
          aria-label="Search aircraft in bracket"
        />

        {/* Aircraft grid */}
        <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
          {filteredPicker.slice(0, 50).map((aircraft) => {
            const isSelected = selectedAircraftId === aircraft.identifier;
            return (
              <button
                key={aircraft.identifier}
                onClick={() => onSelectAircraft(isSelected ? null : aircraft.identifier)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-1.5 rounded text-sm text-left transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-aviation-amber',
                  isSelected
                    ? 'bg-aviation-amber/15 border border-aviation-amber text-aviation-text'
                    : 'hover:bg-aviation-surface/80 text-aviation-text-muted hover:text-aviation-text border border-transparent'
                )}
              >
                <span className="text-xs" aria-hidden="true">{getNationFlag(aircraft.country)}</span>
                <span className="flex-1 truncate">{getAircraftDisplayName(aircraft)}</span>
                <span className="text-xs font-mono shrink-0">{formatBR(aircraft.simulator_br)}</span>
              </button>
            );
          })}
          {filteredPicker.length > 50 && (
            <p className="text-xs text-aviation-text-muted text-center py-2">
              Showing first 50 of {filteredPicker.length}. Use search to narrow down.
            </p>
          )}
        </div>
      </div>

      {/* Threat overview (when aircraft selected) */}
      {enemyData && selectedAircraft && (
        <div className="space-y-4">
          {/* Top 5 threats */}
          {enemyData.topThreats.length > 0 && (
            <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-4">
              <span className="text-xs font-header font-bold uppercase tracking-wider text-red-400/70 block mb-3">
                Top Threats
              </span>
              <div className="space-y-2">
                {enemyData.topThreats.map(({ aircraft, assessment }, i) => (
                  <div key={aircraft.identifier} className="flex items-center gap-3 text-sm">
                    <span className="text-xs font-mono text-aviation-text-muted w-4">{i + 1}</span>
                    <span aria-hidden="true">{getNationFlag(aircraft.country)}</span>
                    <span className="flex-1 truncate text-aviation-text">
                      {getAircraftDisplayName(aircraft)}
                    </span>
                    <span className="text-xs font-mono text-aviation-text-muted">
                      {formatBR(aircraft.simulator_br)}
                    </span>
                    <span className={cn('text-xs font-bold uppercase', getThreatColor(assessment.threatLevel))}>
                      {getThreatLabel(assessment.threatLevel)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nation breakdown */}
          <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-4">
            <span className="text-xs font-header font-bold uppercase tracking-wider text-aviation-text-muted block mb-3">
              Enemy Nation Breakdown
            </span>
            <div className="space-y-2">
              {Array.from(enemyData.enemyByNation.entries())
                .sort((a, b) => b[1].length - a[1].length)
                .map(([nation, aircraft]) => (
                  <div key={nation} className="flex items-center gap-2">
                    <span aria-hidden="true">{getNationFlag(nation)}</span>
                    <span className="text-sm text-aviation-text w-16">{getNationName(nation)}</span>
                    <div className="flex-1 h-2 bg-aviation-charcoal rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500/60 rounded-full transition-all"
                        style={{ width: `${(aircraft.length / enemyData.enemies.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-aviation-text-muted w-8 text-right">
                      {aircraft.length}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Launch button */}
          <button
            onClick={handleLaunch}
            className="w-full py-3 bg-aviation-amber/15 text-aviation-amber border border-aviation-amber/40 rounded-lg font-header font-bold text-sm uppercase tracking-wider hover:bg-aviation-amber/25 transition-colors focus:outline-none focus:ring-2 focus:ring-aviation-amber"
          >
            Launch Matchup Analysis →
          </button>
        </div>
      )}
    </div>
  );
}

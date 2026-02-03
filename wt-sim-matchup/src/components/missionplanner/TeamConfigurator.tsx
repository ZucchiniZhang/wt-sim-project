/**
 * TeamConfigurator - Full team customization with preset picker and drag-and-drop
 * Uses native HTML Drag and Drop API with mobile tap fallback
 */

import { useState, useCallback } from 'react';
import { useTeamConfigStore } from '../../stores/teamConfigStore';
import { useBrackets } from '../../hooks/useBrackets';
import { cn, getNationFlag, getNationName } from '../../lib/utils';
import type { Nation, Aircraft, SimBracket } from '../../types/aircraft';

const ALL_NATIONS: Nation[] = [
  'usa', 'germany', 'ussr', 'britain', 'japan',
  'italy', 'france', 'china', 'sweden', 'israel',
];

interface TeamConfiguratorProps {
  allAircraft: Aircraft[];
  selectedBracket: SimBracket | null;
}

export function TeamConfigurator({ allAircraft, selectedBracket }: TeamConfiguratorProps) {
  const {
    activePresetId,
    customTeamA,
    customTeamB,
    setActivePreset,
    addNationToTeamA,
    addNationToTeamB,
    loadPresets,
    availablePresets,
  } = useTeamConfigStore();
  const { teamPresets } = useBrackets();

  // Load presets on first render if not loaded
  if (availablePresets.length === 0 && teamPresets.length > 0) {
    loadPresets(teamPresets);
  }

  // Mobile: tap-to-move mode
  const [tappedNation, setTappedNation] = useState<Nation | null>(null);

  // Drag state for visual feedback
  const [dragOverTeam, setDragOverTeam] = useState<'A' | 'B' | null>(null);

  // Count aircraft per nation in selected bracket
  const getAircraftCount = useCallback(
    (nation: Nation) => {
      if (!selectedBracket) return 0;
      return allAircraft.filter(
        (a) =>
          a.country === nation &&
          a.simulator_br >= selectedBracket.min_br &&
          a.simulator_br <= selectedBracket.max_br
      ).length;
    },
    [allAircraft, selectedBracket]
  );

  // Build preset list for display
  const presets = [
    { id: 'default', name: 'Default' },
    ...teamPresets.map((p) => ({ id: p.id, name: p.name })),
    { id: 'custom', name: 'Custom' },
  ];

  // Drag handlers
  function handleDragStart(e: React.DragEvent, nation: Nation) {
    e.dataTransfer.setData('text/plain', nation);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDropOnTeamA(e: React.DragEvent) {
    e.preventDefault();
    const nation = e.dataTransfer.getData('text/plain') as Nation;
    if (nation && ALL_NATIONS.includes(nation)) {
      addNationToTeamA(nation);
    }
    setDragOverTeam(null);
  }

  function handleDropOnTeamB(e: React.DragEvent) {
    e.preventDefault();
    const nation = e.dataTransfer.getData('text/plain') as Nation;
    if (nation && ALL_NATIONS.includes(nation)) {
      addNationToTeamB(nation);
    }
    setDragOverTeam(null);
  }

  // Mobile tap handler
  function handleNationTap(nation: Nation) {
    if (tappedNation === nation) {
      setTappedNation(null); // Deselect
    } else {
      setTappedNation(nation);
    }
  }

  function handleTeamHeaderTap(team: 'A' | 'B') {
    if (!tappedNation) return;
    if (team === 'A') {
      addNationToTeamA(tappedNation);
    } else {
      addNationToTeamB(tappedNation);
    }
    setTappedNation(null);
  }

  function renderNationItem(nation: Nation, team: 'A' | 'B') {
    const count = getAircraftCount(nation);
    const isTapped = tappedNation === nation;

    return (
      <div
        key={nation}
        draggable
        onDragStart={(e) => handleDragStart(e, nation)}
        onClick={() => handleNationTap(nation)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded border text-sm cursor-grab active:cursor-grabbing transition-all',
          'focus:outline-none focus:ring-2 focus:ring-aviation-amber',
          isTapped
            ? 'border-aviation-amber bg-aviation-amber/15 ring-1 ring-aviation-amber'
            : team === 'A'
              ? 'border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40'
              : 'border-red-500/20 bg-red-500/5 hover:border-red-500/40'
        )}
        role="option"
        aria-selected={isTapped}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleNationTap(nation);
          }
        }}
      >
        <span aria-hidden="true">{getNationFlag(nation)}</span>
        <span className="flex-1 text-aviation-text">{getNationName(nation)}</span>
        {selectedBracket && (
          <span className="text-xs font-mono text-aviation-text-muted">{count}</span>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-4 h-px bg-aviation-amber/30" aria-hidden="true" />
        <span className="section-label">Team Configuration</span>
      </div>

      <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-4 backdrop-blur-sm corner-brackets">
        {/* Preset selector */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                if (preset.id !== 'custom') {
                  setActivePreset(preset.id);
                }
              }}
              className={cn(
                'px-2.5 py-1 rounded text-xs font-medium transition-all',
                'focus:outline-none focus:ring-2 focus:ring-aviation-amber',
                activePresetId === preset.id
                  ? 'bg-aviation-amber/15 text-aviation-amber border border-aviation-amber/40'
                  : 'text-aviation-text-muted border border-aviation-border hover:border-aviation-amber/30 hover:text-aviation-text'
              )}
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Tap instruction on mobile */}
        {tappedNation && (
          <div className="mb-3 text-xs text-aviation-amber bg-aviation-amber/10 border border-aviation-amber/20 rounded px-3 py-1.5 lg:hidden">
            Tap a team header to move {getNationName(tappedNation)}
          </div>
        )}

        {/* Two team columns */}
        <div className="grid grid-cols-2 gap-3">
          {/* Team A */}
          <div
            onDragOver={(e) => { handleDragOver(e); setDragOverTeam('A'); }}
            onDragLeave={() => setDragOverTeam(null)}
            onDrop={handleDropOnTeamA}
            className={cn(
              'rounded-lg border p-2 transition-colors min-h-[120px]',
              dragOverTeam === 'A'
                ? 'border-blue-400 bg-blue-500/10'
                : 'border-aviation-border'
            )}
          >
            <button
              onClick={() => handleTeamHeaderTap('A')}
              className={cn(
                'w-full text-xs font-header font-bold uppercase tracking-wider mb-2 px-2 py-1 rounded transition-colors',
                tappedNation && !customTeamA.includes(tappedNation)
                  ? 'text-blue-400 bg-blue-500/15 cursor-pointer hover:bg-blue-500/25'
                  : 'text-blue-400 cursor-default'
              )}
            >
              Team A
            </button>
            <div className="space-y-1" role="listbox" aria-label="Team A nations">
              {customTeamA.map((nation) => renderNationItem(nation, 'A'))}
            </div>
          </div>

          {/* Team B */}
          <div
            onDragOver={(e) => { handleDragOver(e); setDragOverTeam('B'); }}
            onDragLeave={() => setDragOverTeam(null)}
            onDrop={handleDropOnTeamB}
            className={cn(
              'rounded-lg border p-2 transition-colors min-h-[120px]',
              dragOverTeam === 'B'
                ? 'border-red-400 bg-red-500/10'
                : 'border-aviation-border'
            )}
          >
            <button
              onClick={() => handleTeamHeaderTap('B')}
              className={cn(
                'w-full text-xs font-header font-bold uppercase tracking-wider mb-2 px-2 py-1 rounded transition-colors',
                tappedNation && !customTeamB.includes(tappedNation)
                  ? 'text-red-400 bg-red-500/15 cursor-pointer hover:bg-red-500/25'
                  : 'text-red-400 cursor-default'
              )}
            >
              Team B
            </button>
            <div className="space-y-1" role="listbox" aria-label="Team B nations">
              {customTeamB.map((nation) => renderNationItem(nation, 'B'))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

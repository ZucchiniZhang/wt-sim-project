/**
 * MatchupView - Main matchup display layout
 * Combines selected aircraft, bracket info, team display, and enemy list with threat data
 */

import { memo } from 'react';
import { BracketInfo } from './BracketInfo';
import { TeamDisplay } from './TeamDisplay';
import { EnemyList } from './EnemyList';
import { AircraftDetails } from '../aircraft/AircraftDetails';
import type { MatchupResult, Aircraft, ThreatAssessment } from '../../types/aircraft';
import type { CycleInfo } from '../../lib/rotation';

interface MatchupViewProps {
  matchup: MatchupResult;
  onAircraftClick?: (aircraft: Aircraft) => void;
  onAddToComparison?: (aircraft: Aircraft) => void;
  threatMap?: Map<string, ThreatAssessment>;
  cycleInfo?: CycleInfo | null;
  className?: string;
}

export const MatchupView = memo(function MatchupView({
  matchup,
  onAircraftClick,
  onAddToComparison,
  threatMap,
  cycleInfo,
  className,
}: MatchupViewProps) {
  return (
    <div className={className}>
      {/* Selected aircraft details */}
      <div className="mb-5">
        <AircraftDetails
          aircraft={matchup.selectedAircraft}
          onAddToComparison={() => onAddToComparison?.(matchup.selectedAircraft)}
        />
      </div>

      {/* Bracket info */}
      <div className="mb-4">
        <BracketInfo
          bracket={matchup.bracket}
          playerBR={matchup.selectedAircraft.simulator_br}
          cycleInfo={cycleInfo}
        />
      </div>

      {/* Team display */}
      <div className="mb-6">
        <TeamDisplay
          teamA={matchup.playerTeam === 'A' ? [...matchup.allyNations, matchup.selectedAircraft.country] : matchup.enemyNations}
          teamB={matchup.playerTeam === 'B' ? [...matchup.allyNations, matchup.selectedAircraft.country] : matchup.enemyNations}
          playerTeam={matchup.playerTeam}
        />
      </div>

      {/* Enemy aircraft list with threat data */}
      <EnemyList
        enemyAircraft={matchup.enemyAircraft}
        onAircraftClick={onAircraftClick || onAddToComparison}
        threatMap={threatMap}
        playerAircraft={matchup.selectedAircraft}
      />
    </div>
  );
});

/**
 * MatchupPage - Display matchups for selected aircraft
 * Military briefing layout with threat analysis, top threats, quick compare, and team presets
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageContainer } from '../components/layout/PageContainer';
import { MatchupView } from '../components/matchup/MatchupView';
import { TopThreats } from '../components/matchup/TopThreats';
import { QuickCompare } from '../components/matchup/QuickCompare';
import { Button } from '../components/ui/Button';
import { useMatchups } from '../hooks/useMatchups';
import { useAircraft } from '../hooks/useAircraft';
import { useBrackets } from '../hooks/useBrackets';
import { useSelectionStore } from '../stores/selectionStore';
import { useTeamConfigStore } from '../stores/teamConfigStore';
import { navigate, briefingPath } from '../lib/router';
import type { Aircraft } from '../types/aircraft';

export function MatchupPage() {
  const { selectedAircraft, addToComparison, comparisonAircraft } = useSelectionStore();
  const { getActiveConfig } = useTeamConfigStore();
  const activeConfig = getActiveConfig();

  const { allAircraft } = useAircraft();
  const { brackets, cycleInfo } = useBrackets();

  const { matchup, threatMap, topThreats, isLoading, error } = useMatchups({
    selectedAircraft,
    allAircraft,
    brackets,
    teamConfig: activeConfig,
  });

  const [compareTarget, setCompareTarget] = useState<Aircraft | null>(null);

  const handleAddToComparison = useCallback((aircraft: Aircraft) => {
    addToComparison(aircraft);
  }, [addToComparison]);

  const handleEnemyClick = useCallback((aircraft: Aircraft) => {
    if (selectedAircraft) {
      navigate(briefingPath(selectedAircraft.identifier, aircraft.identifier));
    } else {
      setCompareTarget(aircraft);
    }
  }, [selectedAircraft]);

  // Error state
  if (error) {
    return (
      <PageContainer>
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-aviation-slate/60 border border-red-500/30 rounded-lg p-8 max-w-md text-center"
          >
            <div className="text-red-400 font-header text-3xl font-bold mb-4">Error</div>
            <h2 className="text-lg font-header font-bold text-aviation-text mb-3">
              Error Loading Matchups
            </h2>
            <p className="text-sm text-aviation-text-muted mb-6">
              {error}
            </p>
            <Button onClick={() => navigate('#/')} variant="primary">
              Back to Selection
            </Button>
          </motion.div>
        </div>
      </PageContainer>
    );
  }

  // No aircraft selected
  if (!selectedAircraft || !matchup) {
    return (
      <PageContainer>
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-aviation-amber/30 text-6xl mb-6">?</div>
            <h2 className="text-xl font-header font-bold text-aviation-text mb-4">
              No Aircraft Selected
            </h2>
            <p className="text-sm text-aviation-text-muted mb-8">
              Select an aircraft to view its matchups
            </p>
            <Button onClick={() => navigate('#/')} variant="primary" className="px-8 py-3">
              Go to Selection
            </Button>
          </motion.div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header with navigation */}
      <header className="border-b border-aviation-border bg-aviation-charcoal/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-5"
            >
              <Button
                onClick={() => navigate('#/')}
                variant="ghost"
                size="sm"
              >
                Back
              </Button>

              <div className="border-l border-aviation-border pl-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 bg-aviation-amber rounded-full" />
                  <span className="section-label">Matchup Analysis</span>
                </div>
                <h1 className="text-lg font-header font-bold text-aviation-amber">
                  {selectedAircraft.localized_name || selectedAircraft.identifier}
                </h1>
              </div>
            </motion.div>

            <div className="flex items-center gap-4">
              {matchup.activePresetName && (
                <div className="text-xs text-aviation-text-muted">
                  Preset: <span className="text-aviation-amber">{matchup.activePresetName}</span>
                </div>
              )}

              {comparisonAircraft.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Button
                    onClick={() => navigate('#/compare')}
                    variant="primary"
                    className="relative"
                  >
                    Compare ({comparisonAircraft.length})
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-aviation-amber rounded-full" />
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-6 max-w-[1600px]">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-8 h-8 border-2 border-aviation-amber/30 border-t-aviation-amber rounded-full animate-spin mb-6" />
              <div className="text-base font-header font-bold text-aviation-amber mb-2">
                Calculating Matchups
              </div>
              <div className="text-sm text-aviation-text-muted animate-pulse">
                Analyzing enemy aircraft...
              </div>
            </motion.div>
          ) : (
            <>
              {/* Matchup header stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6"
              >
                {/* Enemy count */}
                <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-px bg-aviation-amber/30" />
                    <span className="section-label">Hostile Count</span>
                  </div>
                  <div className="text-2xl font-header font-bold text-aviation-amber">
                    {matchup.enemyAircraft.length}
                  </div>
                  <div className="text-xs text-aviation-text-muted">
                    Enemy Aircraft
                  </div>
                </div>

                {/* Bracket + Rotation */}
                <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-px bg-aviation-amber/30" />
                    <span className="section-label">Bracket</span>
                    {cycleInfo && (
                      <span className="text-xs font-mono text-aviation-text-muted ml-auto">
                        Rot {cycleInfo.cycleLetter}
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-header font-bold text-aviation-text">
                    {matchup.bracket.name}
                  </div>
                  <div className="text-xs text-aviation-text-muted">
                    BR {matchup.bracket.min_br.toFixed(1)} - {matchup.bracket.max_br.toFixed(1)}
                  </div>
                </div>

                {/* Team */}
                <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-px bg-aviation-amber/30" />
                    <span className="section-label">Assignment</span>
                  </div>
                  <div className="text-2xl font-header font-bold text-aviation-text">
                    Team {matchup.playerTeam}
                  </div>
                  <div className="text-xs text-aviation-text-muted">
                    {matchup.activePresetName || 'Your Assignment'}
                  </div>
                </div>

                {/* Top threat summary */}
                <div className="bg-aviation-surface/60 border border-red-500/20 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-px bg-red-500/30" />
                    <span className="text-xs font-mono uppercase tracking-wider text-red-400/70">Threat Level</span>
                  </div>
                  <div className="text-2xl font-header font-bold text-red-400">
                    {topThreats.filter(t => t.assessment.threatLevel === 'critical' || t.assessment.threatLevel === 'high').length}
                  </div>
                  <div className="text-xs text-aviation-text-muted">
                    High+ Threats
                  </div>
                </div>
              </motion.div>

              {/* Top Threats Section */}
              {topThreats.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6"
                >
                  <TopThreats
                    threats={topThreats}
                    playerAircraft={selectedAircraft}
                    onAircraftClick={handleAddToComparison}
                  />
                </motion.div>
              )}

              {/* Quick Compare overlay */}
              <AnimatePresence>
                {compareTarget && selectedAircraft && threatMap.get(compareTarget.identifier) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mb-6"
                  >
                    <QuickCompare
                      player={selectedAircraft}
                      enemy={compareTarget}
                      assessment={threatMap.get(compareTarget.identifier)!}
                      onClose={() => setCompareTarget(null)}
                      onAddToComparison={handleAddToComparison}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Matchup view component */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <MatchupView
                  matchup={matchup}
                  onAddToComparison={handleAddToComparison}
                  onAircraftClick={handleEnemyClick}
                  threatMap={threatMap}
                  cycleInfo={cycleInfo}
                />
              </motion.div>

              {/* Add to comparison hint */}
              {comparisonAircraft.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-10 text-center"
                >
                  <div className="inline-flex items-center gap-3 bg-aviation-surface/50 border border-aviation-border rounded-lg px-5 py-3 backdrop-blur-sm">
                    <div className="w-1.5 h-1.5 bg-aviation-amber/50 rounded-full" />
                    <div className="text-left">
                      <div className="text-xs font-semibold text-aviation-amber">
                        Tip
                      </div>
                      <div className="text-sm text-aviation-text-muted">
                        Click on enemy aircraft cards to add them to your comparison
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>
    </PageContainer>
  );
}

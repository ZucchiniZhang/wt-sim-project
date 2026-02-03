/**
 * BriefingDetailPage - Deep intelligence briefing for a specific matchup
 * Shows side-by-side comparison, threat assessment, performance charts, and tactical guidance
 */

import { useMemo, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { BriefingHeader } from '../components/briefing/BriefingHeader';
import { ThreatBadge } from '../components/briefing/ThreatBadge';
import { MatchupComparisonBars } from '../components/briefing/MatchupComparisonBars';
import { EngagementSummary } from '../components/briefing/EngagementSummary';
import { PerformanceRadar } from '../components/matchup/PerformanceRadar';
import { DualSpeedAltitudeChart } from '../components/charts/DualSpeedAltitudeChart';
import { DualClimbProfileChart } from '../components/charts/DualClimbProfileChart';
import { useAircraft } from '../hooks/useAircraft';
import { useCuratedData } from '../hooks/useCuratedData';
import { assessThreat, generateDetailedBriefing } from '../lib/threat-analysis';
import { getAircraftDisplayName } from '../lib/utils';
import { TacticalPlaybookTab } from '../components/tacticalplaybook';
import { navigate, aircraftPath } from '../lib/router';
import type { Aircraft } from '../types/aircraft';

interface BriefingDetailPageProps {
  myId: string;
  enemyId: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
};

export function BriefingDetailPage({ myId, enemyId }: BriefingDetailPageProps) {
  const { allAircraft, isLoading } = useAircraft();
  const { getCuratedData } = useCuratedData();

  const player: Aircraft | undefined = useMemo(
    () => allAircraft.find((a) => a.identifier === myId),
    [allAircraft, myId]
  );

  const enemy: Aircraft | undefined = useMemo(
    () => allAircraft.find((a) => a.identifier === enemyId),
    [allAircraft, enemyId]
  );

  const playerCurated = useMemo(() => getCuratedData(myId), [getCuratedData, myId]);
  const enemyCurated = useMemo(() => getCuratedData(enemyId), [getCuratedData, enemyId]);

  const assessment = useMemo(() => {
    if (!player || !enemy) return null;
    return assessThreat(player, enemy);
  }, [player, enemy]);

  const detailedBriefing = useMemo(() => {
    if (!player || !enemy) return undefined;
    return generateDetailedBriefing(player, enemy, playerCurated, enemyCurated);
  }, [player, enemy, playerCurated, enemyCurated]);

  const playerName = player ? getAircraftDisplayName(player) : myId;
  const enemyName = enemy ? getAircraftDisplayName(enemy) : enemyId;
  const [activeTab, setActiveTab] = useState<'overview' | 'playbook'>('overview');
  const tabBarRef = useRef<HTMLDivElement>(null);

  /** Switch tab and scroll the tab bar into view so content is visible */
  const handleTabChange = useCallback((tab: 'overview' | 'playbook') => {
    setActiveTab(tab);
    // Scroll the tab bar into view after React re-renders the tab content
    requestAnimationFrame(() => {
      tabBarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <div className="w-8 h-8 border-2 border-aviation-amber/30 border-t-aviation-amber rounded-full animate-spin mx-auto mb-6" />
            <div className="text-base font-header font-bold text-aviation-amber mb-2">
              Preparing Briefing
            </div>
            <div className="text-sm text-aviation-text-muted animate-pulse">
              Analyzing matchup data...
            </div>
          </motion.div>
        </div>
      </PageContainer>
    );
  }

  // Error state — aircraft not found
  if (!player || !enemy || !assessment) {
    return (
      <PageContainer>
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-aviation-slate/60 border border-red-500/30 rounded-lg p-8 max-w-md text-center"
          >
            <div className="text-red-400 font-header text-4xl font-bold mb-4">?</div>
            <h2 className="text-lg font-header font-bold text-aviation-text mb-3">
              Aircraft Not Found
            </h2>
            <p className="text-sm text-aviation-text-muted mb-6">
              Could not locate one or both aircraft for this briefing.
            </p>
            <Button onClick={() => navigate('#/')} variant="primary">
              Back to Selection
            </Button>
          </motion.div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Sticky Header */}
      <header className="border-b border-aviation-border bg-aviation-charcoal/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-5"
            >
              <Button
                onClick={() => navigate('#/matchup')}
                variant="ghost"
                size="sm"
                aria-label="Back to matchup list"
              >
                Back
              </Button>

              <div className="border-l border-aviation-border pl-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                  <span className="section-label">Engagement Briefing</span>
                </div>
                <h1 className="text-sm font-header font-bold text-aviation-text uppercase tracking-wider">
                  <span className="text-aviation-amber">{playerName}</span>
                  <span className="text-aviation-text-muted mx-2">vs</span>
                  <span className="text-red-400">{enemyName}</span>
                </h1>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <ThreatBadge level={assessment.threatLevel} score={assessment.score} />
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <motion.div
          className="container mx-auto px-6 py-6 max-w-[1400px] space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Briefing Header — side by side aircraft */}
          <motion.div variants={itemVariants}>
            <BriefingHeader player={player} enemy={enemy} assessment={assessment} />
          </motion.div>

          {/* Tab Navigation */}
          <motion.div variants={itemVariants} ref={tabBarRef} style={{ scrollMarginTop: '16px' }}>
            <div
              className="flex items-center gap-6 border-b border-aviation-border"
              role="tablist"
              aria-label="Briefing views"
            >
              <button
                role="tab"
                id="tab-briefing-overview"
                aria-selected={activeTab === 'overview'}
                aria-controls="tabpanel-briefing-overview"
                onClick={() => handleTabChange('overview')}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight') {
                    handleTabChange('playbook');
                    (e.currentTarget.nextElementSibling as HTMLElement)?.focus();
                  }
                }}
                className={`px-4 py-3 font-header text-sm uppercase tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-aviation-amber focus:ring-offset-2 focus:ring-offset-aviation-charcoal ${
                  activeTab === 'overview'
                    ? 'text-aviation-amber border-b-2 border-aviation-amber'
                    : 'text-aviation-text-muted hover:text-aviation-text hover:shadow-[0_0_8px_rgba(255,165,0,0.3)]'
                }`}
              >
                Overview
              </button>
              <button
                role="tab"
                id="tab-briefing-playbook"
                aria-selected={activeTab === 'playbook'}
                aria-controls="tabpanel-briefing-playbook"
                onClick={() => handleTabChange('playbook')}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft') {
                    handleTabChange('overview');
                    (e.currentTarget.previousElementSibling as HTMLElement)?.focus();
                  }
                }}
                className={`px-4 py-3 font-header text-sm uppercase tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-aviation-amber focus:ring-offset-2 focus:ring-offset-aviation-charcoal ${
                  activeTab === 'playbook'
                    ? 'text-aviation-amber border-b-2 border-aviation-amber'
                    : 'text-aviation-text-muted hover:text-aviation-text hover:shadow-[0_0_8px_rgba(255,165,0,0.3)]'
                }`}
              >
                Tactical Playbook
              </button>
            </div>
          </motion.div>

          {/* Tab Content */}
          {activeTab === 'overview' ? (
            <div role="tabpanel" id="tabpanel-briefing-overview" aria-labelledby="tab-briefing-overview">
          {/* Two-Column: Comparison Bars + Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stat Comparison Bars */}
            <motion.div variants={itemVariants}>
              <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-4 h-px bg-aviation-amber/30" />
                  <span className="section-label">Stat Comparison</span>
                </div>
                <MatchupComparisonBars player={player} enemy={enemy} />
              </div>
            </motion.div>

            {/* Radar Chart */}
            <motion.div variants={itemVariants}>
              <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-4 h-px bg-aviation-amber/30" />
                  <span className="section-label">Performance Profile</span>
                </div>
                <PerformanceRadar player={player} enemy={enemy} size={280} />
              </div>
            </motion.div>
          </div>

          {/* Engagement Summary */}
          <motion.div variants={itemVariants} className="mt-6">
            <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-5 backdrop-blur-sm">
              <EngagementSummary assessment={assessment} detailedBriefing={detailedBriefing} />
            </div>
          </motion.div>

          {/* Performance Curves — Dual Charts */}
          {(playerCurated || enemyCurated) && (
            <motion.div variants={itemVariants} className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-px bg-aviation-amber/30" />
                <span className="section-label">Performance Curves</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Dual Speed vs Altitude */}
                {(playerCurated?.speed_at_altitude || enemyCurated?.speed_at_altitude) && (
                  <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-5 backdrop-blur-sm">
                    <DualSpeedAltitudeChart
                      playerData={playerCurated?.speed_at_altitude || []}
                      enemyData={enemyCurated?.speed_at_altitude || []}
                      playerName={playerName}
                      enemyName={enemyName}
                    />
                  </div>
                )}

                {/* Dual Climb Profile */}
                {(playerCurated?.climb_profile || enemyCurated?.climb_profile) && (
                  <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-5 backdrop-blur-sm">
                    <DualClimbProfileChart
                      playerData={playerCurated?.climb_profile || []}
                      enemyData={enemyCurated?.climb_profile || []}
                      playerName={playerName}
                      enemyName={enemyName}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Bottom Actions */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 pb-8 mt-6"
          >
            <Button
              onClick={() => navigate('#/matchup')}
              variant="secondary"
              size="lg"
              className="min-w-[200px]"
            >
              Back to Matchups
            </Button>
            <Button
              onClick={() => navigate(aircraftPath(enemyId))}
              variant="ghost"
              size="lg"
              className="min-w-[200px]"
            >
              View Enemy in Encyclopedia
            </Button>
          </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              role="tabpanel"
              id="tabpanel-briefing-playbook"
              aria-labelledby="tab-briefing-playbook"
            >
              <TacticalPlaybookTab player={player} enemy={enemy} />
            </motion.div>
          )}
        </motion.div>
      </main>
    </PageContainer>
  );
}

/**
 * FlightAcademyTab - Main container for AI-powered tactical guidance
 * Manages state via useTacticalGuide hook and renders appropriate content
 */

import { motion, useReducedMotion } from 'framer-motion';
import { useTacticalGuide } from '../../hooks/useAIContent';
import { useCuratedData } from '../../hooks/useCuratedData';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { AIEmptyState } from '../ui/AIEmptyState';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';
import { AIGeneratedBadge } from '../ui/AIGeneratedBadge';
import { TacticalOverview } from './TacticalOverview';
import { PerformanceQuickStats } from './PerformanceQuickStats';
import { CombatTacticsSection } from './CombatTacticsSection';
import { EnergyManagementDiagram } from './EnergyManagementDiagram';
import { PerformanceEnvelope } from './PerformanceEnvelope';
import { MatchupThreatMatrix } from './MatchupThreatMatrix';
import { MECControlPanel } from './MECControlPanel';
import { SpeedAltitudeChart } from '../charts/SpeedAltitudeChart';
import { ClimbProfileChart } from '../charts/ClimbProfileChart';
import {
  containerVariants,
  itemVariants,
  reducedContainerVariants,
  reducedItemVariants,
} from '../../lib/animation-constants';
import type { Aircraft } from '../../types/aircraft';

interface FlightAcademyTabProps {
  aircraft: Aircraft;
}

export function FlightAcademyTab({ aircraft }: FlightAcademyTabProps) {
  const { guide, loading, error, generating, generate, aiEnabled } = useTacticalGuide(aircraft);
  const { getCuratedData } = useCuratedData();
  const curated = getCuratedData(aircraft.identifier);
  const prefersReducedMotion = useReducedMotion();

  const cVariants = prefersReducedMotion ? reducedContainerVariants : containerVariants;
  const iVariants = prefersReducedMotion ? reducedItemVariants : itemVariants;

  // Loading state - checking cache
  if (loading) {
    return <LoadingSkeleton ariaLabel="Loading tactical guide from cache" showExtraContent />;
  }

  // Error state
  if (error) {
    return (
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-aviation-surface/60 border border-red-500/30 rounded-lg p-8 text-center"
        role="alert"
      >
        <div className="text-red-400 font-header text-3xl font-bold mb-4" aria-hidden="true">
          ⚠
        </div>
        <h3 className="text-lg font-header font-bold text-aviation-text mb-2">
          Generation Failed
        </h3>
        <p className="text-sm text-aviation-text-muted mb-4">{error}</p>
        {aiEnabled && (
          <button
            type="button"
            onClick={generate}
            disabled={generating}
            aria-label={generating ? 'Retrying tactical guide generation' : 'Retry tactical guide generation'}
            className="px-4 py-2 bg-aviation-amber/10 border border-aviation-amber text-aviation-amber rounded hover:bg-aviation-amber/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-aviation-amber"
          >
            {generating ? 'Retrying...' : 'Retry Generation'}
          </button>
        )}
      </motion.div>
    );
  }

  // No guide exists - show empty state
  if (!guide) {
    return (
      <AIEmptyState
        icon="📋"
        title="Tactical Guide Available"
        description="Generate AI-powered tactical analysis for this aircraft"
        features={[
          'Combat tactics & energy management',
          'Matchup recommendations',
          'Performance optimization',
          'MEC guidance (if applicable)',
        ]}
        onGenerate={generate}
        generating={generating}
        aiEnabled={aiEnabled}
        loadingText="Generating tactical guide..."
        buttonText="Generate Tactical Guide"
        featureName="Flight Academy"
      />
    );
  }

  // Check if curated performance data is available for charts
  const hasSpeedData = curated?.speed_at_altitude && curated.speed_at_altitude.length > 0;
  const hasClimbData = curated?.climb_profile && curated.climb_profile.length > 0;
  const hasPerformanceCurves = hasSpeedData || hasClimbData;

  // Full tactical guide content
  return (
    <ErrorBoundary
      title="Flight Academy Error"
      defaultMessage="A rendering error occurred in the Flight Academy tab."
    >
      <motion.div
        className="space-y-6"
        variants={cVariants}
        initial="hidden"
        animate="visible"
        role="region"
        aria-label="Flight Academy tactical guide"
      >
        {/* AI Generated badge */}
        <div className="flex justify-end">
          <AIGeneratedBadge generatedAt={guide.generated_at} />
        </div>

        {/* 1. Tactical Overview */}
        <motion.section variants={iVariants} aria-label="Tactical overview">
          <TacticalOverview guide={guide} />
        </motion.section>

        {/* 2. Performance at a Glance */}
        <motion.section variants={iVariants} aria-label="Performance quick stats">
          <PerformanceQuickStats aircraft={aircraft} />
        </motion.section>

        {/* 3. Combat Tactics Section */}
        <motion.section variants={iVariants} aria-label="Combat tactics">
          <CombatTacticsSection guide={guide} aircraft={aircraft} />
        </motion.section>

        {/* 4. Energy Management Diagram */}
        <motion.section variants={iVariants} aria-label="Energy management">
          <EnergyManagementDiagram guide={guide} />
        </motion.section>

        {/* 5. Performance Envelope */}
        <motion.section variants={iVariants} aria-label="Performance envelope">
          <PerformanceEnvelope
            envelope={guide.optimal_envelope}
            speedAtAltitude={curated?.speed_at_altitude}
          />
        </motion.section>

        {/* 6. Performance Curves (if curated data available) */}
        {hasPerformanceCurves && (
          <motion.section variants={iVariants} aria-label="Performance curves">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {hasSpeedData && (
                <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-6 backdrop-blur-sm corner-brackets">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-4 h-px bg-aviation-amber/30" aria-hidden="true" />
                    <span className="section-label">SPEED VS ALTITUDE</span>
                  </div>
                  <SpeedAltitudeChart data={curated!.speed_at_altitude!} />
                </div>
              )}
              {hasClimbData && (
                <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-6 backdrop-blur-sm corner-brackets">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-4 h-px bg-aviation-amber/30" aria-hidden="true" />
                    <span className="section-label">CLIMB PROFILE</span>
                  </div>
                  <ClimbProfileChart data={curated!.climb_profile} />
                </div>
              )}
            </div>
          </motion.section>
        )}

        {/* 7. Matchup Threat Matrix */}
        <motion.section variants={iVariants} aria-label="Matchup analysis">
          <MatchupThreatMatrix guide={guide} />
        </motion.section>

        {/* 8. MEC Control Panel (conditional) */}
        {guide.mec_guidance && (
          <motion.section variants={iVariants} aria-label="Manual engine controls guidance">
            <MECControlPanel guidance={guide.mec_guidance} />
          </motion.section>
        )}
      </motion.div>
    </ErrorBoundary>
  );
}

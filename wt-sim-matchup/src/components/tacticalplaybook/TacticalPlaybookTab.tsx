/**
 * TacticalPlaybookTab - Main container for AI-powered matchup tactical playbook
 * Manages state via useMatchupPlaybook hook and renders appropriate content
 */

import { motion, useReducedMotion } from 'framer-motion';
import { useMatchupPlaybook } from '../../hooks/useAIContent';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { AIEmptyState } from '../ui/AIEmptyState';
import { ThreatAssessmentCard } from './ThreatAssessmentCard';
import { EngagementPrinciplesCard } from './EngagementPrinciplesCard';
import { TacticalScenarioCard } from './TacticalScenarioCard';
import { AltitudeAdvantageChart } from './AltitudeAdvantageChart';
import type { Aircraft } from '../../types/aircraft';
import { getAircraftDisplayName } from '../../lib/utils';

interface TacticalPlaybookTabProps {
  player: Aircraft;
  enemy: Aircraft;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

const reducedContainerVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

const reducedItemVariants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
};

function LoadingSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading tactical playbook from cache">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-6 backdrop-blur-sm animate-pulse scanlines"
        >
          <div className="h-4 w-48 bg-aviation-border/50 rounded mb-4" />
          <div className="space-y-3">
            <div className="h-3 w-full bg-aviation-border/30 rounded" />
            <div className="h-3 w-3/4 bg-aviation-border/30 rounded" />
            <div className="h-3 w-5/6 bg-aviation-border/30 rounded" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading tactical playbook data...</span>
    </div>
  );
}

export function TacticalPlaybookTab({ player, enemy }: TacticalPlaybookTabProps) {
  const { playbook, loading, error, generating, generate, aiEnabled } = useMatchupPlaybook(player, enemy);
  const prefersReducedMotion = useReducedMotion();

  const cVariants = prefersReducedMotion ? reducedContainerVariants : containerVariants;
  const iVariants = prefersReducedMotion ? reducedItemVariants : itemVariants;

  const playerName = getAircraftDisplayName(player);
  const enemyName = getAircraftDisplayName(enemy);

  if (loading) {
    return <LoadingSkeleton />;
  }

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
            aria-label={generating ? 'Retrying playbook generation' : 'Retry playbook generation'}
            className="px-4 py-2 bg-aviation-amber/10 border border-aviation-amber text-aviation-amber rounded hover:bg-aviation-amber/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-aviation-amber"
          >
            {generating ? 'Retrying...' : 'Retry Generation'}
          </button>
        )}
      </motion.div>
    );
  }

  if (!playbook) {
    return (
      <AIEmptyState
        icon="🎯"
        title="Tactical Playbook Available"
        description={
          <>
            Generate AI-powered engagement tactics for{' '}
            <span className="text-aviation-amber">{playerName}</span>
            {' '}vs{' '}
            <span className="text-red-400">{enemyName}</span>
          </>
        }
        features={[
          'Threat assessment & reasoning',
          'Engagement principles & win condition',
          'Tactical scenarios with diagrams',
          'Altitude advantage analysis',
        ]}
        onGenerate={generate}
        generating={generating}
        aiEnabled={aiEnabled}
        loadingText="Generating tactical playbook..."
        buttonText="Generate Tactical Playbook"
        featureName="Tactical Playbook"
      />
    );
  }

  return (
    <ErrorBoundary
      title="Tactical Playbook Error"
      defaultMessage="A rendering error occurred in the Tactical Playbook tab."
    >
      <motion.div
        className="space-y-6"
        variants={cVariants}
        initial="hidden"
        animate="visible"
        role="region"
        aria-label="Tactical playbook"
      >
        {/* AI Generated badge */}
        <div className="flex justify-end">
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-green-400 bg-green-500/10 border border-green-500/30 rounded"
            title={`Generated ${playbook.generated_at}`}
            aria-label="Content generated by AI"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" aria-hidden="true" />
            AI Generated
          </span>
        </div>

        {/* 1. Threat Assessment */}
        <motion.section variants={iVariants} aria-label="Threat assessment">
          <ThreatAssessmentCard assessment={playbook.threat_assessment} />
        </motion.section>

        {/* 2. Engagement Principles */}
        <motion.section variants={iVariants} aria-label="Engagement principles">
          <EngagementPrinciplesCard principles={playbook.engagement_principles} />
        </motion.section>

        {/* 3. Tactical Scenarios */}
        {playbook.tactical_scenarios.length > 0 && (
          <motion.section variants={iVariants} aria-label="Tactical scenarios">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-px bg-aviation-amber/30" aria-hidden="true" />
              <span className="section-label">Tactical Scenarios</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {playbook.tactical_scenarios.map((scenario, i) => (
                <TacticalScenarioCard key={i} scenario={scenario} index={i} />
              ))}
            </div>
          </motion.section>
        )}

        {/* 4. Altitude Advantage */}
        {playbook.altitude_advantage_guide.length > 0 && (
          <motion.section variants={iVariants} aria-label="Altitude advantage analysis">
            <AltitudeAdvantageChart zones={playbook.altitude_advantage_guide} />
          </motion.section>
        )}
      </motion.div>
    </ErrorBoundary>
  );
}

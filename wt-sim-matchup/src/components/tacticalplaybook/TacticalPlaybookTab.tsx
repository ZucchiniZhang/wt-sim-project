/**
 * TacticalPlaybookTab - Main container for AI-powered matchup tactical playbook
 * Manages state via useMatchupPlaybook hook and renders appropriate content
 */

import { motion, useReducedMotion } from 'framer-motion';
import { useMatchupPlaybook } from '../../hooks/useAIContent';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { AIEmptyState } from '../ui/AIEmptyState';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';
import { AIGeneratedBadge } from '../ui/AIGeneratedBadge';
import { ThreatAssessmentCard } from './ThreatAssessmentCard';
import { EngagementPrinciplesCard } from './EngagementPrinciplesCard';
import { TacticalScenarioCard } from './TacticalScenarioCard';
import { AltitudeAdvantageChart } from './AltitudeAdvantageChart';
import {
  containerVariants,
  itemVariants,
  reducedContainerVariants,
  reducedItemVariants,
} from '../../lib/animation-constants';
import type { Aircraft } from '../../types/aircraft';
import { getAircraftDisplayName } from '../../lib/utils';

interface TacticalPlaybookTabProps {
  player: Aircraft;
  enemy: Aircraft;
}

export function TacticalPlaybookTab({ player, enemy }: TacticalPlaybookTabProps) {
  const { playbook, loading, error, generating, generate, aiEnabled } = useMatchupPlaybook(player, enemy);
  const prefersReducedMotion = useReducedMotion();

  const cVariants = prefersReducedMotion ? reducedContainerVariants : containerVariants;
  const iVariants = prefersReducedMotion ? reducedItemVariants : itemVariants;

  const playerName = getAircraftDisplayName(player);
  const enemyName = getAircraftDisplayName(enemy);

  if (loading) {
    return <LoadingSkeleton ariaLabel="Loading tactical playbook from cache" />;
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
          <AIGeneratedBadge generatedAt={playbook.generated_at} />
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

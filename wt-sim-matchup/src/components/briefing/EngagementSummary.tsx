/**
 * EngagementSummary - Tactical guidance panel for a specific matchup
 * Displays engagement approach, things to avoid, energy/altitude guidance, and specific tips
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import type { DetailedBriefing } from '../../lib/threat-analysis';
import type { ThreatAssessment } from '../../types/aircraft';

interface EngagementSummaryProps {
  assessment: ThreatAssessment;
  detailedBriefing?: DetailedBriefing;
  className?: string;
}

/** Staggered fade-in for list items */
const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, delay: i * 0.04 },
  }),
};

function SectionHeader({
  dotColor,
  children,
}: {
  dotColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className={cn('w-2 h-2 rounded-full flex-shrink-0', dotColor)} />
      <span className="section-label text-aviation-text-muted">{children}</span>
    </div>
  );
}

function GuidanceBlock({
  dotColor,
  label,
  content,
}: {
  dotColor: string;
  label: string;
  content: string;
}) {
  return (
    <div className="p-3 rounded-lg bg-aviation-charcoal/40 border border-aviation-border/50">
      <div className="flex items-start gap-2">
        <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5', dotColor)} />
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-aviation-text-muted mb-1">
            {label}
          </div>
          <div className="text-sm font-mono text-aviation-text leading-relaxed">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}

export const EngagementSummary = memo(function EngagementSummary({
  assessment,
  detailedBriefing,
  className,
}: EngagementSummaryProps) {
  // If no detailed briefing, show a simplified view with just the tactical advice
  if (!detailedBriefing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn('space-y-4', className)}
      >
        <SectionHeader dotColor="bg-aviation-amber">
          Tactical Assessment
        </SectionHeader>

        <div className="p-4 rounded-lg bg-aviation-charcoal/40 border border-aviation-border/50">
          <div className="text-sm font-mono text-aviation-amber leading-relaxed">
            {assessment.tacticalAdvice}
          </div>
        </div>

        {/* Advantages */}
        {assessment.advantages.length > 0 && (
          <div>
            <SectionHeader dotColor="bg-red-500">
              Enemy Strengths
            </SectionHeader>
            <div className="space-y-1 pl-4">
              {assessment.advantages.map((adv, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={itemVariants}
                  className="flex items-center gap-2 text-sm font-mono text-red-400/80"
                >
                  <span className="text-red-500/50">+</span>
                  <span>{adv}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Disadvantages */}
        {assessment.disadvantages.length > 0 && (
          <div>
            <SectionHeader dotColor="bg-green-500">
              Enemy Weaknesses
            </SectionHeader>
            <div className="space-y-1 pl-4">
              {assessment.disadvantages.map((dis, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={itemVariants}
                  className="flex items-center gap-2 text-sm font-mono text-green-400/80"
                >
                  <span className="text-green-500/50">-</span>
                  <span>{dis}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  // Full detailed briefing view
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('space-y-5', className)}
    >
      {/* Engagement Approach */}
      <div>
        <SectionHeader dotColor="bg-aviation-amber">
          Engagement Approach
        </SectionHeader>
        <div className="p-4 rounded-lg bg-aviation-charcoal/40 border border-aviation-amber/20">
          <div className="text-sm font-mono text-aviation-amber leading-relaxed">
            {detailedBriefing.engagementApproach}
          </div>
        </div>
      </div>

      {/* Things to Avoid */}
      {detailedBriefing.avoidActions.length > 0 && (
        <div>
          <SectionHeader dotColor="bg-red-500">
            Do Not
          </SectionHeader>
          <div className="space-y-1.5 pl-4">
            {detailedBriefing.avoidActions.map((action, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={itemVariants}
                className="flex items-start gap-2"
              >
                <span className="text-red-500 font-mono text-sm leading-relaxed flex-shrink-0">
                  x
                </span>
                <span className="text-sm font-mono text-red-400/90 leading-relaxed">
                  {action}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Energy & Altitude Guidance (side-by-side on larger screens) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <GuidanceBlock
          dotColor="bg-blue-400"
          label="Energy Management"
          content={detailedBriefing.energyGuidance}
        />
        <GuidanceBlock
          dotColor="bg-cyan-400"
          label="Altitude Guidance"
          content={detailedBriefing.altitudeAdvice}
        />
      </div>

      {/* Enemy Strengths & Weaknesses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {assessment.advantages.length > 0 && (
          <div>
            <SectionHeader dotColor="bg-red-500">
              Enemy Strengths
            </SectionHeader>
            <div className="space-y-1 pl-4">
              {assessment.advantages.map((adv, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={itemVariants}
                  className="flex items-center gap-2 text-sm font-mono text-red-400/80"
                >
                  <span className="text-red-500/50">+</span>
                  <span>{adv}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {assessment.disadvantages.length > 0 && (
          <div>
            <SectionHeader dotColor="bg-green-500">
              Enemy Weaknesses
            </SectionHeader>
            <div className="space-y-1 pl-4">
              {assessment.disadvantages.map((dis, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={itemVariants}
                  className="flex items-center gap-2 text-sm font-mono text-green-400/80"
                >
                  <span className="text-green-500/50">-</span>
                  <span>{dis}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Specific Tips */}
      {detailedBriefing.specificTips.length > 0 && (
        <div>
          <SectionHeader dotColor="bg-aviation-amber">
            Specific Tips
          </SectionHeader>
          <div className="space-y-2 pl-4">
            {detailedBriefing.specificTips.map((tip, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={itemVariants}
                className="flex items-start gap-2"
              >
                <span className="text-aviation-amber/60 font-mono text-xs mt-0.5 flex-shrink-0">
                  {String(i + 1).padStart(2, '0')}.
                </span>
                <span className="text-sm font-mono text-aviation-text/90 leading-relaxed">
                  {tip}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Fallback tactical advice from the assessment */}
      <div className="pt-3 border-t border-aviation-border/50">
        <div className="text-xs font-mono text-aviation-text-muted/60 uppercase tracking-wider mb-1.5">
          Summary
        </div>
        <div className="text-sm font-mono text-aviation-text-muted leading-relaxed italic">
          {assessment.tacticalAdvice}
        </div>
      </div>
    </motion.div>
  );
});

/**
 * ThreatAssessmentCard - Displays AI-generated threat level badge and reasoning
 * Color-coded by threat level: CRITICAL=red, HIGH=orange, MODERATE=yellow, LOW=green
 */

import type { ThreatAssessment, ThreatLevel } from '../../types/curated';

interface ThreatAssessmentCardProps {
  assessment: ThreatAssessment;
}

const THREAT_CONFIG: Record<ThreatLevel, { color: string; bg: string; border: string; label: string }> = {
  CRITICAL: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/40', label: 'CRITICAL THREAT' },
  HIGH:     { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/40', label: 'HIGH THREAT' },
  MODERATE: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/40', label: 'MODERATE THREAT' },
  LOW:      { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/40', label: 'LOW THREAT' },
};

export function ThreatAssessmentCard({ assessment }: ThreatAssessmentCardProps) {
  const config = THREAT_CONFIG[assessment.level] || THREAT_CONFIG.MODERATE;

  return (
    <div className="corner-brackets bg-aviation-surface/60 border border-aviation-border rounded-lg p-6 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-4 h-px bg-aviation-amber/30" aria-hidden="true" />
        <span className="section-label">Threat Assessment</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-5">
        {/* Threat Level Badge */}
        <div className={`flex-shrink-0 px-5 py-3 rounded ${config.bg} border ${config.border}`}>
          <div className={`text-2xl font-header font-bold uppercase tracking-wider ${config.color}`}>
            {assessment.level}
          </div>
          <div className="text-xs text-aviation-text-muted uppercase tracking-widest mt-1">
            {config.label}
          </div>
        </div>

        {/* Reasoning */}
        <div className="flex-1">
          <h4 className="text-xs uppercase tracking-widest text-aviation-text-muted mb-2">
            Assessment
          </h4>
          <p className="text-sm text-aviation-text leading-relaxed">
            {assessment.reasoning}
          </p>
        </div>
      </div>
    </div>
  );
}

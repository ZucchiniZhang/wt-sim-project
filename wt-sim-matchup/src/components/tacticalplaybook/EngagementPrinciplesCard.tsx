/**
 * EngagementPrinciplesCard - Three-column display of advantages, disadvantages, and win condition
 * Green accent for advantages, red for disadvantages, amber for win condition
 */

import type { EngagementPrinciples } from '../../types/curated';

interface EngagementPrinciplesCardProps {
  principles: EngagementPrinciples;
}

export function EngagementPrinciplesCard({ principles }: EngagementPrinciplesCardProps) {
  return (
    <div className="corner-brackets bg-aviation-surface/60 border border-aviation-border rounded-lg p-6 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-4 h-px bg-aviation-amber/30" aria-hidden="true" />
        <span className="section-label">Engagement Principles</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Your Advantages */}
        <div className="border border-green-500/20 rounded-lg p-4 bg-green-500/5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-400" aria-hidden="true" />
            <h4 className="text-xs uppercase tracking-widest text-green-400 font-bold">
              Your Advantages
            </h4>
          </div>
          <ul className="space-y-2" aria-label="Your advantages in this matchup">
            {principles.your_advantages.map((adv, i) => (
              <li key={i} className="text-sm text-aviation-text leading-relaxed flex items-start gap-2">
                <span className="text-green-400/60 mt-1 flex-shrink-0" aria-hidden="true">+</span>
                <span>{adv}</span>
              </li>
            ))}
            {principles.your_advantages.length === 0 && (
              <li className="text-sm text-aviation-text-muted italic">None identified</li>
            )}
          </ul>
        </div>

        {/* Enemy Advantages */}
        <div className="border border-red-500/20 rounded-lg p-4 bg-red-500/5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-400" aria-hidden="true" />
            <h4 className="text-xs uppercase tracking-widest text-red-400 font-bold">
              Enemy Advantages
            </h4>
          </div>
          <ul className="space-y-2" aria-label="Enemy advantages in this matchup">
            {principles.enemy_advantages.map((adv, i) => (
              <li key={i} className="text-sm text-aviation-text leading-relaxed flex items-start gap-2">
                <span className="text-red-400/60 mt-1 flex-shrink-0" aria-hidden="true">-</span>
                <span>{adv}</span>
              </li>
            ))}
            {principles.enemy_advantages.length === 0 && (
              <li className="text-sm text-aviation-text-muted italic">None identified</li>
            )}
          </ul>
        </div>

        {/* Win Condition */}
        <div className="border border-aviation-amber/20 rounded-lg p-4 bg-aviation-amber/5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-aviation-amber" aria-hidden="true" />
            <h4 className="text-xs uppercase tracking-widest text-aviation-amber font-bold">
              Win Condition
            </h4>
          </div>
          <p className="text-sm text-aviation-text leading-relaxed">
            {principles.win_condition}
          </p>
        </div>
      </div>
    </div>
  );
}

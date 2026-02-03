/**
 * ArmamentBreakdown - Table/list display of aircraft weapons
 * Shows weapon name, caliber, and count in a clean military briefing layout
 */

import { memo } from 'react';
import { cn } from '../../lib/utils';
import type { WeaponSummary } from '../../types/aircraft';

interface ArmamentBreakdownProps {
  weapons: WeaponSummary[];
  className?: string;
}

export const ArmamentBreakdown = memo(function ArmamentBreakdown({
  weapons,
  className,
}: ArmamentBreakdownProps) {
  const hasWeapons = weapons.length > 0;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Section header with amber accent line */}
      <div className="flex items-center gap-2">
        <div className="w-4 h-px bg-aviation-amber/30" />
        <span className="section-label">Armament</span>
      </div>

      {hasWeapons ? (
        <div className="rounded-lg border border-aviation-border bg-aviation-charcoal/40 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 px-3 py-2 border-b border-aviation-border bg-aviation-surface/40">
            <span className="text-xs font-bold uppercase tracking-widest text-aviation-text-muted">
              Weapon
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-aviation-text-muted text-right">
              Caliber
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-aviation-text-muted text-right w-10">
              Qty
            </span>
          </div>

          {/* Weapon rows */}
          {weapons.map((weapon, index) => (
            <div
              key={`${weapon.name}-${weapon.caliber}-${index}`}
              className={cn(
                'grid grid-cols-[1fr_auto_auto] gap-3 px-3 py-2 items-center',
                'transition-colors hover:bg-aviation-amber/5',
                index < weapons.length - 1 && 'border-b border-aviation-border/50'
              )}
            >
              {/* Weapon name */}
              <span className="text-sm text-aviation-text font-header truncate">
                {weapon.name}
              </span>

              {/* Caliber */}
              <span className="text-sm font-mono text-aviation-text-muted text-right">
                {weapon.caliber}
              </span>

              {/* Count */}
              <span className="text-sm font-mono font-bold text-aviation-amber text-right w-10">
                {weapon.count > 0 ? `x${weapon.count}` : '-'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="rounded-lg border border-aviation-border/50 bg-aviation-charcoal/20 px-4 py-6 text-center">
          <p className="text-sm text-aviation-text-muted font-mono uppercase tracking-wider">
            No armament data available
          </p>
        </div>
      )}
    </div>
  );
});

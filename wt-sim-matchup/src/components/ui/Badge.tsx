import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import type { Nation } from '../../types/aircraft';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'br' | 'nation' | 'premium';
  nation?: Nation;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', nation, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2 py-0.5 text-xs font-bold uppercase tracking-wider',
          'transition-colors',
          variant === 'default' &&
            'bg-aviation-slate-light/80 text-aviation-text-muted border border-aviation-amber/15',
          variant === 'br' &&
            'bg-aviation-amber/20 text-aviation-amber border border-aviation-amber/50',
          variant === 'premium' &&
            'bg-yellow-600/20 text-yellow-400 border border-yellow-500/40',
          variant === 'nation' && nation && getNationBadgeStyles(nation),
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

function getNationBadgeStyles(nation: Nation): string {
  const styles: Record<Nation, string> = {
    usa: 'bg-nation-usa/20 text-nation-usa border border-nation-usa/40',
    germany: 'bg-nation-germany/20 text-nation-germany border border-nation-germany/40',
    ussr: 'bg-nation-ussr/20 text-nation-ussr border border-nation-ussr/40',
    britain: 'bg-nation-britain/20 text-nation-britain border border-nation-britain/40',
    japan: 'bg-nation-japan/20 text-nation-japan border border-nation-japan/40',
    italy: 'bg-nation-italy/20 text-nation-italy border border-nation-italy/40',
    france: 'bg-nation-france/20 text-nation-france border border-nation-france/40',
    china: 'bg-nation-china/20 text-nation-china border border-nation-china/40',
    sweden: 'bg-nation-sweden/20 text-nation-sweden border border-nation-sweden/40',
    israel: 'bg-nation-israel/20 text-nation-israel border border-nation-israel/40',
  };
  return styles[nation];
}

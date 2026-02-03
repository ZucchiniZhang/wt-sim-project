import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded transition-all',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-aviation-amber',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          variant === 'primary' &&
            'bg-aviation-amber/15 text-aviation-amber border border-aviation-amber/40 hover:bg-aviation-amber/25 hover:shadow-card',
          variant === 'secondary' &&
            'bg-aviation-slate/60 text-aviation-text-muted border border-aviation-border hover:border-aviation-amber/25 hover:text-aviation-text',
          variant === 'ghost' &&
            'text-aviation-text-muted hover:text-aviation-text hover:bg-aviation-slate/40',
          size === 'sm' && 'px-3 py-1 text-xs',
          size === 'md' && 'px-4 py-2 text-sm',
          size === 'lg' && 'px-6 py-2.5 text-base',
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

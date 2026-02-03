import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'flex w-full rounded-md px-3 py-2 text-sm',
          'bg-aviation-charcoal border border-aviation-amber/20',
          'text-aviation-text placeholder:text-aviation-text-muted',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aviation-amber',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

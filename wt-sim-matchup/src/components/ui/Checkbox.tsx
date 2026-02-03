import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string | ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    const checkbox = (
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          'h-3.5 w-3.5 rounded-none border-aviation-amber/30',
          'bg-aviation-charcoal text-aviation-amber accent-[#d4a843]',
          'focus:ring-1 focus:ring-aviation-amber focus:ring-offset-0',
          'cursor-pointer transition-colors',
          'disabled:cursor-not-allowed disabled:opacity-40',
          className
        )}
        {...props}
      />
    );

    if (label) {
      return (
        <label className="flex items-center gap-2.5 cursor-pointer group">
          {checkbox}
          <span className="text-xs text-aviation-text-muted group-hover:text-aviation-text transition-colors select-none">
            {label}
          </span>
        </label>
      );
    }

    return checkbox;
  }
);

Checkbox.displayName = 'Checkbox';

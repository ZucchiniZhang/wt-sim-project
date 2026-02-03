import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        'min-h-screen flex flex-col bg-aviation-charcoal text-aviation-text',
        className
      )}
    >
      {children}
    </div>
  );
}

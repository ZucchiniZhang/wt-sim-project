import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface MainContentProps {
  children: ReactNode;
  className?: string;
}

export function MainContent({ children, className }: MainContentProps) {
  return (
    <main
      id="main-content"
      className={cn(
        'flex-1 overflow-y-auto',
        className
      )}
    >
      <div className="container mx-auto px-4 py-6">{children}</div>
    </main>
  );
}

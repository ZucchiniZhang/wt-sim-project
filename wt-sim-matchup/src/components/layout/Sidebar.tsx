import type { ReactNode } from 'react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

interface SidebarProps {
  children: ReactNode;
  className?: string;
}

export function Sidebar({ children, className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)]',
          'w-80 bg-aviation-charcoal border-r border-aviation-border shadow-card',
          'overflow-y-auto transition-transform duration-300',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        <div className="p-4">
          {/* Close button (mobile only) */}
          <div className="lg:hidden flex justify-end mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </Button>
          </div>

          {children}
        </div>
      </aside>

      {/* Toggle button (mobile only) */}
      {!isOpen && (
        <Button
          className="fixed bottom-4 left-4 z-50 lg:hidden"
          onClick={() => setIsOpen(true)}
          size="lg"
        >
          Filters
        </Button>
      )}
    </>
  );
}

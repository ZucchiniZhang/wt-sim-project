import { cn } from '../../lib/utils';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <>
      {/* Skip navigation for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] px-4 py-2 bg-aviation-amber text-aviation-charcoal font-mono text-sm font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-aviation-amber"
      >
        Skip to main content
      </a>

      <header
        className={cn(
          'sticky top-0 z-50 w-full border-b border-aviation-border',
          'bg-aviation-charcoal/95 backdrop-blur supports-[backdrop-filter]:bg-aviation-charcoal/80',
          className
        )}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#/" className="flex items-center gap-3 no-underline">
            <div className="w-10 h-10 border border-aviation-amber/30 rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-aviation-amber rounded-full" />
            </div>
            <div>
              <div className="text-xl font-header font-bold text-aviation-amber tracking-wide">
                WT SIM
              </div>
              <p className="section-label -mt-1">
                Matchup Intelligence System
              </p>
            </div>
          </a>

          {/* Navigation */}
          <nav aria-label="Main navigation" className="flex items-center gap-4">
            <a
              href="#/"
              className="text-sm text-aviation-text hover:text-aviation-amber transition-colors focus:outline-none focus:ring-2 focus:ring-aviation-amber rounded px-2 py-1"
            >
              Home
            </a>
            <a
              href="#/mission-planner"
              className="text-sm text-aviation-text hover:text-aviation-amber transition-colors focus:outline-none focus:ring-2 focus:ring-aviation-amber rounded px-2 py-1"
            >
              Mission Planner
            </a>
          </nav>
        </div>
      </header>
    </>
  );
}

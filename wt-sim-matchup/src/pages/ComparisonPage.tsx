/**
 * ComparisonPage - Side-by-side aircraft comparison
 * Military briefing layout with detailed stats and performance charts
 */

import { motion, AnimatePresence } from 'framer-motion';
import { PageContainer } from '../components/layout/PageContainer';
import { ComparisonPanel } from '../components/comparison/ComparisonPanel';
import { PerformanceChart } from '../components/comparison/PerformanceChart';
import { Button } from '../components/ui/Button';
import { AircraftCard } from '../components/aircraft/AircraftCard';
import { useSelectionStore } from '../stores/selectionStore';
import { navigate } from '../lib/router';

export function ComparisonPage() {
  const { comparisonAircraft, removeFromComparison, clearComparison } = useSelectionStore();

  const hasAircraft = comparisonAircraft.length > 0;
  const canCompare = comparisonAircraft.length >= 2;

  return (
    <PageContainer>
      {/* Header */}
      <header className="border-b border-aviation-border bg-aviation-charcoal/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-5"
            >
              <Button
                onClick={() => navigate('#/matchup')}
                variant="ghost"
                size="sm"
              >
                Back
              </Button>

              <div className="border-l border-aviation-border pl-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 bg-aviation-amber rounded-full" />
                  <span className="section-label">Comparison Mode</span>
                </div>
                <h1 className="text-lg font-header font-bold text-aviation-amber">
                  Aircraft Comparison
                </h1>
                <p className="text-xs text-aviation-text-muted">
                  {comparisonAircraft.length} of 4 aircraft selected
                </p>
              </div>
            </motion.div>

            {hasAircraft && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Button
                  onClick={clearComparison}
                  variant="ghost"
                  className="text-red-400 hover:text-red-300"
                >
                  Clear All
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-6 max-w-[1800px]">
          {!hasAircraft ? (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="text-aviation-amber/20 text-6xl mb-6">&mdash;</div>
              <h2 className="text-xl font-header font-bold text-aviation-text mb-4">
                No Aircraft to Compare
              </h2>
              <p className="text-sm text-aviation-text-muted mb-8 max-w-md">
                Add aircraft to your comparison list from the matchup view
              </p>

              <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-6 max-w-lg backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-4 h-px bg-aviation-amber/30" />
                  <span className="section-label">How to Compare</span>
                </div>
                <div className="space-y-2 text-left">
                  {[
                    'Select an aircraft to view its matchups',
                    'Click on enemy aircraft cards to add them to comparison (up to 4 total)',
                    'Click "Compare" button to view detailed comparison',
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-sm font-semibold text-aviation-amber">0{i + 1}</span>
                      <span className="text-sm text-aviation-text-muted">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={() => navigate('#/matchup')} variant="primary" className="mt-8 px-8 py-3">
                Back to Matchups
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Selected aircraft cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-px bg-aviation-amber/30" />
                    <span className="section-label">Selected Aircraft</span>
                  </div>
                  <div className="text-xs text-aviation-text-muted">
                    {comparisonAircraft.length === 1
                      ? 'Add at least one more aircraft to compare'
                      : `Comparing ${comparisonAircraft.length} aircraft`}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <AnimatePresence mode="popLayout">
                    {comparisonAircraft.map((aircraft, index) => (
                      <motion.div
                        key={aircraft.identifier}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative"
                      >
                        <button
                          onClick={() => removeFromComparison(aircraft.identifier)}
                          className="absolute -top-1 -right-1 z-10 w-6 h-6 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all hover:scale-110"
                        >
                          X
                        </button>

                        <AircraftCard
                          aircraft={aircraft}
                          isSelected={false}
                        />
                      </motion.div>
                    ))}

                    {comparisonAircraft.length < 4 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border border-dashed border-aviation-border rounded-lg flex flex-col items-center justify-center p-8 bg-aviation-surface/20 min-h-[200px]"
                      >
                        <div className="text-aviation-amber/20 text-2xl mb-2">+</div>
                        <div className="text-xs text-aviation-text-muted text-center">
                          Add {4 - comparisonAircraft.length} more
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Comparison panel */}
              {canCompare && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-4 h-px bg-aviation-amber/30" />
                      <span className="section-label">Performance Statistics</span>
                    </div>
                    <ComparisonPanel aircraft={comparisonAircraft} />
                  </motion.div>

                  {/* Performance chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-4 h-px bg-aviation-amber/30" />
                      <span className="section-label">Speed vs Altitude</span>
                    </div>
                    <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-5 backdrop-blur-sm">
                      <PerformanceChart aircraft={comparisonAircraft} />
                    </div>
                  </motion.div>

                  {/* Analysis hints */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3"
                  >
                    {[
                      { code: 'BnZ', title: 'Energy Fighting', desc: 'Aircraft with better climb rate and high-altitude speed excel in energy tactics (boom & zoom).' },
                      { code: 'TnB', title: 'Turn Fighting', desc: 'Lower turn times indicate better maneuverability. Great for dogfighting and defensive flying.' },
                      { code: 'SPD', title: 'Speed Advantage', desc: 'Higher max speed allows you to dictate engagement terms: attack or disengage at will.' },
                    ].map((item) => (
                      <div key={item.code} className="bg-aviation-surface/50 border border-aviation-border rounded-lg p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-aviation-amber font-mono text-xs font-bold">{item.code}</span>
                          <span className="text-sm font-medium text-aviation-text">
                            {item.title}
                          </span>
                        </div>
                        <p className="text-sm text-aviation-text-muted leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </motion.div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </PageContainer>
  );
}

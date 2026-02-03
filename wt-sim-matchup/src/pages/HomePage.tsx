/**
 * HomePage - Aircraft selection interface
 * Military briefing style with clean typography
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageContainer } from '../components/layout/PageContainer';
import { FilterPanel } from '../components/filters/FilterPanel';
import { NationSelector } from '../components/filters/NationSelector';
import { AircraftGrid } from '../components/aircraft/AircraftGrid';
import { useAircraft } from '../hooks/useAircraft';
import { useSelectionStore } from '../stores/selectionStore';
import { useFilterStore } from '../stores/filterStore';
import { navigate, aircraftPath } from '../lib/router';
import type { Aircraft, Nation } from '../types/aircraft';
import type { AppMode } from '../stores/selectionStore';

export function HomePage() {
  const { selectedNation, setSelectedNation, setSelectedAircraft, currentMode, setCurrentMode } = useSelectionStore();
  const { searchQuery } = useFilterStore();

  const { aircraft, isLoading, filteredCount, totalCount } = useAircraft();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleNationChange = useCallback((nations: Nation[]) => {
    setSelectedNation(nations[0] || null);
  }, [setSelectedNation]);

  const handleAircraftClick = useCallback((aircraft: Aircraft) => {
    if (currentMode === 'encyclopedia') {
      navigate(aircraftPath(aircraft.identifier));
    } else {
      setSelectedAircraft(aircraft);
      navigate('#/matchup');
    }
  }, [setSelectedAircraft, currentMode]);

  return (
    <PageContainer>
      {/* Header bar */}
      <header className="relative border-b border-aviation-border bg-aviation-slate/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              {/* Icon */}
              <div className="w-10 h-10 border border-aviation-amber/30 rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-aviation-amber rounded-full" />
              </div>

              <div>
                <h1 className="text-2xl font-header font-bold text-aviation-amber tracking-wide">
                  WT SIM
                </h1>
                <p className="text-xs text-aviation-text-muted tracking-wide">
                  Matchup Intelligence System
                </p>
              </div>
            </motion.div>

            {/* Mode toggle + status */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden md:flex items-center gap-6"
            >
              {/* Mode toggle */}
              <div className="flex items-center bg-aviation-charcoal/60 border border-aviation-border rounded-lg p-0.5">
                {(['encyclopedia', 'briefing'] as AppMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setCurrentMode(mode)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      currentMode === mode
                        ? 'bg-aviation-amber/15 text-aviation-amber border border-aviation-amber/30'
                        : 'text-aviation-text-muted hover:text-aviation-text border border-transparent'
                    }`}
                  >
                    {mode === 'encyclopedia' ? 'Encyclopedia' : 'Briefing'}
                  </button>
                ))}
              </div>

              <a
                href="#/mission-planner"
                className="text-xs font-medium text-aviation-text-muted hover:text-aviation-amber transition-colors px-2 py-1.5 rounded"
              >
                Mission Planner
              </a>

              <div className="w-px h-8 bg-aviation-border" />

              <div className="text-right">
                <div className="text-xs text-aviation-text-muted">Aircraft DB</div>
                <div className="text-sm font-mono font-semibold text-aviation-amber">{totalCount} loaded</div>
              </div>
            </motion.div>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden px-3 py-1.5 text-sm panel-border text-aviation-amber hover:panel-border-active transition-all rounded"
            >
              {sidebarOpen ? 'Close' : 'Filters'}
            </button>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Filters */}
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-80 border-r border-aviation-border bg-aviation-slate/40 backdrop-blur-sm overflow-y-auto lg:sticky lg:top-[52px] lg:h-[calc(100vh-52px)]"
            >
              <div className="p-5">
                <FilterPanel />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-6 max-w-[1800px]">
            {/* Section header */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-px bg-aviation-amber/40" />
                <span className="section-label">
                  {currentMode === 'encyclopedia' ? 'Aircraft Encyclopedia' : 'Mission Briefing'}
                </span>
              </div>
              <h2 className="text-3xl font-header font-bold text-aviation-text tracking-wide">
                {currentMode === 'encyclopedia' ? 'Browse Aircraft' : 'Select Your Aircraft'}
              </h2>
            </motion.div>

            {/* Nation selector */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-6"
            >
              <NationSelector
                selectedNations={selectedNation ? [selectedNation] : []}
                onChange={handleNationChange}
              />
            </motion.div>

            {/* Results readout */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-5 flex items-center justify-between"
            >
              <div className="text-sm">
                {isLoading ? (
                  <span className="text-aviation-amber animate-pulse">Loading data...</span>
                ) : (
                  <span className="text-aviation-text-muted">
                    Showing{' '}
                    <span className="text-aviation-amber font-semibold">{filteredCount}</span>
                    {' / '}
                    <span className="text-aviation-text">{totalCount}</span>
                    {' aircraft'}
                    {searchQuery && (
                      <span className="ml-3 text-aviation-text-muted">
                        Query: <span className="text-aviation-amber">{searchQuery}</span>
                      </span>
                    )}
                  </span>
                )}
              </div>

              {!selectedNation && !searchQuery && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hidden md:block text-sm text-aviation-text-muted"
                >
                  Select a nation to begin
                </motion.div>
              )}
            </motion.div>

            {/* Aircraft grid */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <AircraftGrid
                aircraft={aircraft}
                onAircraftClick={handleAircraftClick}
                isLoading={isLoading}
              />
            </motion.div>

            {/* Welcome state */}
            {!selectedNation && !searchQuery && !isLoading && aircraft.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 text-center max-w-xl mx-auto"
              >
                <div className="panel-border bg-aviation-surface/50 rounded-lg p-8">
                  <div className="section-label mb-4">Operational Briefing</div>
                  <h3 className="text-xl font-header font-bold text-aviation-text mb-3">
                    Welcome, Pilot
                  </h3>
                  <p className="text-sm text-aviation-text-muted mb-6 leading-relaxed">
                    Identify enemy aircraft you will encounter in War Thunder Simulator Battles.
                    Select your nation, choose your aircraft, and receive tactical matchup intelligence.
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-aviation-charcoal/60 panel-border rounded p-3">
                      <div className="text-aviation-amber font-semibold mb-1">01</div>
                      <div className="text-xs text-aviation-text-muted">Select Nation</div>
                    </div>
                    <div className="bg-aviation-charcoal/60 panel-border rounded p-3">
                      <div className="text-aviation-amber font-semibold mb-1">02</div>
                      <div className="text-xs text-aviation-text-muted">Pick Aircraft</div>
                    </div>
                    <div className="bg-aviation-charcoal/60 panel-border rounded p-3">
                      <div className="text-aviation-amber font-semibold mb-1">03</div>
                      <div className="text-xs text-aviation-text-muted">View Matchup</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </PageContainer>
  );
}

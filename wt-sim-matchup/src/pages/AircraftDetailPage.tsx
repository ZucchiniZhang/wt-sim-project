/**
 * AircraftDetailPage - Full-page dedicated view for a single aircraft
 * Shows hero section, performance stats, armament, curated intel, and performance charts
 * Military briefing themed with stagger animations
 */

import { useMemo, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { AircraftHero } from '../components/aircraft/AircraftHero';
import { AircraftStats } from '../components/aircraft/AircraftStats';
import { ArmamentBreakdown } from '../components/aircraft/ArmamentBreakdown';
import { CuratedIntel } from '../components/aircraft/CuratedIntel';
import { SpeedAltitudeChart } from '../components/charts/SpeedAltitudeChart';
import { ClimbProfileChart } from '../components/charts/ClimbProfileChart';
import { SelfRadarChart } from '../components/charts/SelfRadarChart';
import { FlightAcademyTab } from '../components/flightacademy';
import { containerVariants, itemVariants } from '../lib/animation-constants';
import { useAircraft } from '../hooks/useAircraft';
import { useCuratedData } from '../hooks/useCuratedData';
import { useSelectionStore } from '../stores/selectionStore';
import { navigate } from '../lib/router';
import {
  getAircraftDisplayName,
  getNationFlag,
  getNationName,
  formatBR,
  getAircraftTypeName,
} from '../lib/utils';
import type { Aircraft } from '../types/aircraft';

interface AircraftDetailPageProps {
  aircraftId: string;
}

export function AircraftDetailPage({ aircraftId }: AircraftDetailPageProps) {
  const { allAircraft, isLoading } = useAircraft();
  const { getCuratedData } = useCuratedData();
  const { setSelectedAircraft, addToComparison, isInComparison } = useSelectionStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'academy'>('overview');
  const tabBarRef = useRef<HTMLDivElement>(null);

  /** Switch tab and scroll the tab bar into view so content is visible */
  const handleTabChange = useCallback((tab: 'overview' | 'academy') => {
    setActiveTab(tab);
    // Scroll the tab bar into view after React re-renders the tab content
    requestAnimationFrame(() => {
      tabBarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  // Look up aircraft by ID
  const aircraft: Aircraft | undefined = useMemo(() => {
    return allAircraft.find((a) => a.identifier === aircraftId);
  }, [allAircraft, aircraftId]);

  // Look up curated data
  const curated = useMemo(() => {
    return getCuratedData(aircraftId);
  }, [getCuratedData, aircraftId]);

  const alreadyInComparison = aircraft ? isInComparison(aircraft.identifier) : false;

  // Loading state
  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="w-8 h-8 border-2 border-aviation-amber/30 border-t-aviation-amber rounded-full animate-spin mx-auto mb-6" />
            <div className="text-base font-header font-bold text-aviation-amber mb-2">
              Loading Aircraft Data
            </div>
            <div className="text-sm text-aviation-text-muted animate-pulse">
              Retrieving intel...
            </div>
          </motion.div>
        </div>
      </PageContainer>
    );
  }

  // Error state - aircraft not found
  if (!aircraft) {
    return (
      <PageContainer>
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-aviation-slate/60 border border-red-500/30 rounded-lg p-8 max-w-md text-center"
          >
            <div className="text-red-400 font-header text-4xl font-bold mb-4">?</div>
            <h2 className="text-lg font-header font-bold text-aviation-text mb-3">
              Aircraft Not Found
            </h2>
            <p className="text-sm text-aviation-text-muted mb-2">
              Could not locate aircraft with identifier:
            </p>
            <p className="text-sm font-mono text-aviation-amber mb-6 break-all">
              {aircraftId}
            </p>
            <Button onClick={() => navigate('#/')} variant="primary">
              Back to Selection
            </Button>
          </motion.div>
        </div>
      </PageContainer>
    );
  }

  const displayName = getAircraftDisplayName(aircraft);

  const handleFindMatchups = () => {
    setSelectedAircraft(aircraft);
    navigate('#/matchup');
  };

  const handleAddToComparison = () => {
    addToComparison(aircraft);
  };

  return (
    <PageContainer>
      {/* Sticky Header */}
      <header className="border-b border-aviation-border bg-aviation-charcoal/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-5"
            >
              <Button
                onClick={() => navigate('#/')}
                variant="ghost"
                size="sm"
                aria-label="Back to aircraft selection"
              >
                Back
              </Button>

              <div className="border-l border-aviation-border pl-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 bg-aviation-amber rounded-full" />
                  <span className="section-label">Aircraft Dossier</span>
                </div>
                <h1 className="text-lg font-header font-bold text-aviation-amber uppercase tracking-wider">
                  {displayName}
                </h1>
                <p className="text-xs text-aviation-text-muted uppercase tracking-widest">
                  {getNationFlag(aircraft.country)} {getNationName(aircraft.country)}
                  {' '}&middot; {getAircraftTypeName(aircraft.vehicle_type)}
                  {' '}&middot; BR {formatBR(aircraft.simulator_br)}
                </p>
              </div>
            </motion.div>

            {/* Header action buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <Button
                onClick={handleAddToComparison}
                variant="secondary"
                size="sm"
                disabled={alreadyInComparison}
              >
                {alreadyInComparison ? 'In Comparison' : '+ Compare'}
              </Button>
              <Button
                onClick={handleFindMatchups}
                variant="primary"
                size="sm"
              >
                Find Matchups
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <motion.div
          className="container mx-auto px-6 py-6 max-w-[1400px] space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants}>
            <AircraftHero aircraft={aircraft} />
          </motion.div>

          {/* Tab Navigation */}
          <motion.div variants={itemVariants} ref={tabBarRef} style={{ scrollMarginTop: '16px' }}>
            <div
              className="flex items-center gap-6 border-b border-aviation-border"
              role="tablist"
              aria-label="Aircraft detail views"
            >
              <button
                role="tab"
                id="tab-overview"
                aria-selected={activeTab === 'overview'}
                aria-controls="tabpanel-overview"
                onClick={() => handleTabChange('overview')}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight') {
                    handleTabChange('academy');
                    (e.currentTarget.nextElementSibling as HTMLElement)?.focus();
                  }
                }}
                className={`px-4 py-3 font-header text-sm uppercase tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-aviation-amber focus:ring-offset-2 focus:ring-offset-aviation-charcoal ${
                  activeTab === 'overview'
                    ? 'text-aviation-amber border-b-2 border-aviation-amber'
                    : 'text-aviation-text-muted hover:text-aviation-text hover:shadow-[0_0_8px_rgba(255,165,0,0.3)]'
                }`}
              >
                Overview
              </button>
              <button
                role="tab"
                id="tab-academy"
                aria-selected={activeTab === 'academy'}
                aria-controls="tabpanel-academy"
                onClick={() => handleTabChange('academy')}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft') {
                    handleTabChange('overview');
                    (e.currentTarget.previousElementSibling as HTMLElement)?.focus();
                  }
                }}
                className={`px-4 py-3 font-header text-sm uppercase tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-aviation-amber focus:ring-offset-2 focus:ring-offset-aviation-charcoal ${
                  activeTab === 'academy'
                    ? 'text-aviation-amber border-b-2 border-aviation-amber'
                    : 'text-aviation-text-muted hover:text-aviation-text hover:shadow-[0_0_8px_rgba(255,165,0,0.3)]'
                }`}
              >
                Flight Academy
              </button>
            </div>
          </motion.div>

          {/* Tab Content */}
          {activeTab === 'overview' ? (
            <div role="tabpanel" id="tabpanel-overview" aria-labelledby="tab-overview">
          {/* Two-Column Grid: Stats + Armament/Intel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Performance Stats + Radar */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Performance Stats Card */}
              <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-5 backdrop-blur-sm">
                <AircraftStats aircraft={aircraft} />
              </div>

              {/* Self Radar Chart Card */}
              <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-4 h-px bg-aviation-amber/30" />
                  <span className="section-label">Performance Profile</span>
                </div>
                <SelfRadarChart aircraft={aircraft} />
              </div>
            </motion.div>

            {/* Right Column: Armament + Curated Intel */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Armament Breakdown Card */}
              <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-5 backdrop-blur-sm">
                <ArmamentBreakdown weapons={aircraft.weapons_summary || []} />
              </div>

              {/* Curated Intel Card */}
              {curated && (
                <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-5 backdrop-blur-sm">
                  <CuratedIntel data={curated} />
                </div>
              )}
            </motion.div>
          </div>

          {/* Performance Charts Section */}
          {curated && (curated.speed_at_altitude || curated.climb_profile.length > 0) && (
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-px bg-aviation-amber/30" />
                <span className="section-label">Performance Curves</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Speed vs Altitude Chart */}
                {curated.speed_at_altitude && curated.speed_at_altitude.length > 0 && (
                  <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-5 backdrop-blur-sm">
                    <SpeedAltitudeChart data={curated.speed_at_altitude} />
                  </div>
                )}

                {/* Climb Profile Chart */}
                {curated.climb_profile.length > 0 && (
                  <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-5 backdrop-blur-sm">
                    <ClimbProfileChart data={curated.climb_profile} />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Bottom Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 pb-8"
          >
            <Button
              onClick={handleFindMatchups}
              variant="primary"
              size="lg"
              className="min-w-[200px]"
            >
              Find Matchups
            </Button>
            <Button
              onClick={handleAddToComparison}
              variant="secondary"
              size="lg"
              className="min-w-[200px]"
              disabled={alreadyInComparison}
            >
              {alreadyInComparison ? 'Already in Comparison' : 'Add to Comparison'}
            </Button>
          </motion.div>
            </div>
          ) : (
            /* Flight Academy Tab Content */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              role="tabpanel"
              id="tabpanel-academy"
              aria-labelledby="tab-academy"
            >
              <FlightAcademyTab aircraft={aircraft} />
            </motion.div>
          )}
        </motion.div>
      </main>
    </PageContainer>
  );
}

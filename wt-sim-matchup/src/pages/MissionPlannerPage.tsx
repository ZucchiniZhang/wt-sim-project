/**
 * MissionPlannerPage - Pre-flight mission planning with bracket selection,
 * team configuration, threat intel, and weekly schedule
 */
import { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { PageContainer } from '../components/layout/PageContainer';
import { Header } from '../components/layout/Header';
import {
  MissionPlannerHeader,
  BracketSelector,
  TeamConfigurator,
  PreFlightIntel,
  WeeklySchedule,
  MissionPlannerErrorBoundary,
} from '../components/missionplanner';
import { useBrackets } from '../hooks/useBrackets';
import { useAircraft } from '../hooks/useAircraft';

export function MissionPlannerPage() {
  const [cycleOverride, setCycleOverride] = useState<string | null>(null);
  const [selectedBracketId, setSelectedBracketId] = useState<string | null>(null);
  const [selectedAircraftId, setSelectedAircraftId] = useState<string | null>(null);
  const [highlightBR, setHighlightBR] = useState<number | null>(null);

  const { cycleInfo, getBracketsForCycle, bracketData } = useBrackets();
  const { allAircraft } = useAircraft();

  const prefersReducedMotion = useReducedMotion();

  const containerVariants = prefersReducedMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

  const itemVariants = prefersReducedMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  // Get brackets for the active cycle (auto or override)
  const activeBrackets = useMemo(() => {
    if (cycleOverride) {
      return getBracketsForCycle(cycleOverride);
    }
    return cycleInfo?.brackets ?? [];
  }, [cycleOverride, cycleInfo, getBracketsForCycle]);

  // Get the selected bracket object
  const selectedBracket = useMemo(() => {
    if (!selectedBracketId) return null;
    return activeBrackets.find((b) => b.id === selectedBracketId) ?? null;
  }, [selectedBracketId, activeBrackets]);

  return (
    <PageContainer>
      <Header />
      <main id="main-content" className="flex-1 overflow-y-auto">
        <MissionPlannerErrorBoundary>
          <motion.div
            className="container mx-auto px-4 py-6 max-w-[1600px] space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Page title */}
            <motion.div variants={itemVariants} className="flex items-center gap-3">
              <div className="w-4 h-px bg-aviation-amber/30" aria-hidden="true" />
              <h1 className="text-xl font-header font-bold text-aviation-amber uppercase tracking-wider">
                Mission Planner
              </h1>
            </motion.div>

            {/* Rotation header */}
            <motion.div variants={itemVariants}>
              <MissionPlannerHeader
                cycleInfo={cycleInfo}
                cycleOverride={cycleOverride}
                onCycleOverride={setCycleOverride}
              />
            </motion.div>

            {/* Bracket selector + Team config (side by side on desktop) */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Left: Bracket Selector (3/5 width) */}
              <div className="lg:col-span-3">
                <BracketSelector
                  brackets={activeBrackets}
                  allAircraft={allAircraft}
                  selectedBracketId={selectedBracketId}
                  onSelectBracket={setSelectedBracketId}
                />
              </div>

              {/* Right: Team Configurator (2/5 width) */}
              <div className="lg:col-span-2">
                <TeamConfigurator
                  allAircraft={allAircraft}
                  selectedBracket={selectedBracket}
                />
              </div>
            </motion.div>

            {/* Pre-Flight Intel */}
            <motion.div variants={itemVariants}>
              <PreFlightIntel
                allAircraft={allAircraft}
                selectedBracket={selectedBracket}
                selectedAircraftId={selectedAircraftId}
                onSelectAircraft={setSelectedAircraftId}
              />
            </motion.div>

            {/* Weekly Schedule */}
            {bracketData && (
              <motion.div variants={itemVariants}>
                <WeeklySchedule
                  cycles={bracketData.cycles}
                  rotationConfig={bracketData.rotation}
                  highlightBR={highlightBR}
                  onHighlightBRChange={setHighlightBR}
                />
              </motion.div>
            )}
          </motion.div>
        </MissionPlannerErrorBoundary>
      </main>
    </PageContainer>
  );
}

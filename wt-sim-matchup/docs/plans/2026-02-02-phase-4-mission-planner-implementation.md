# Phase 4: Mission Planner — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Mission Planner page that lets pilots plan sessions from the bracket/schedule perspective — bracket-aware lineup builder + weekly schedule browser.

**Architecture:** New `#/mission-planner` route with 5 components composed in a container page. All data comes from existing hooks (`useBrackets`, `useAircraft`) and stores (`useTeamConfigStore`, `useSelectionStore`). No new infrastructure — pure UI composition. Native HTML drag-and-drop for team configurator.

**Tech Stack:** React 18, TypeScript, TailwindCSS, Framer Motion, Zustand (existing stores), Vitest

**Design doc:** `docs/plans/2026-02-02-phase-4-mission-planner-design.md`

---

## Task 1: Router + Lazy Import + Nav Link

**Files:**
- Modify: `src/lib/router.ts` (lines 9-14 Route type, lines 24-48 parseHash switch, add path helper after line 92)
- Modify: `src/App.tsx` (add lazy import after line 16, add route case after line 106)
- Modify: `src/components/layout/Header.tsx` (add nav link in nav element, lines 40-61)

**Step 1: Add `mission-planner` to Route union in router.ts**

In `src/lib/router.ts`, change the Route type (lines 9-14) to add the new variant:

```typescript
export type Route =
  | { page: 'home' }
  | { page: 'aircraft'; id: string }
  | { page: 'matchup' }
  | { page: 'briefing'; myId: string; enemyId: string }
  | { page: 'compare' }
  | { page: 'mission-planner' };
```

**Step 2: Add parseHash case in router.ts**

In the `parseHash` switch statement (after the `case 'compare':` block at line 44-45), add:

```typescript
    case 'mission-planner':
      return { page: 'mission-planner' };
```

**Step 3: Add path helper in router.ts**

After the `briefingPath` function (after line 92), add:

```typescript
/** Build a hash path for the mission planner page */
export function missionPlannerPath(): string {
  return '#/mission-planner';
}
```

**Step 4: Add lazy import and route case in App.tsx**

After line 16 (BriefingDetailPage lazy import), add:

```typescript
const MissionPlannerPage = lazy(() => import('./pages/MissionPlannerPage').then(m => ({ default: m.MissionPlannerPage })));
```

After line 106 (the compare route block), add:

```tsx
          {route.page === 'mission-planner' && (
            <MissionPlannerPage />
          )}
```

**Step 5: Add nav link in Header.tsx**

Replace the existing nav element contents (lines 40-61) with a Home link and Mission Planner link, replacing the placeholder About/Help buttons:

```tsx
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
```

**Step 6: Create stub MissionPlannerPage**

Create `src/pages/MissionPlannerPage.tsx`:

```tsx
/**
 * MissionPlannerPage - Pre-flight mission planning with bracket selection,
 * team configuration, threat intel, and weekly schedule
 */

import { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Header } from '../components/layout/Header';

export function MissionPlannerPage() {
  const [cycleOverride, setCycleOverride] = useState<string | null>(null);
  const [selectedBracketId, setSelectedBracketId] = useState<string | null>(null);
  const [selectedAircraftId, setSelectedAircraftId] = useState<string | null>(null);
  const [highlightBR, setHighlightBR] = useState<number | null>(null);

  return (
    <PageContainer>
      <Header />
      <main id="main-content" className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-[1600px]">
          <h1 className="text-2xl font-header font-bold text-aviation-amber mb-6">
            Mission Planner
          </h1>
          <p className="text-aviation-text-muted">
            Page shell — components coming in next tasks.
          </p>
        </div>
      </main>
    </PageContainer>
  );
}
```

**Step 7: Verify build + test**

Run: `npm run build && npm test`
Expected: Build passes, 40/40 tests pass, new route accessible at `#/mission-planner`

**Step 8: Commit**

```bash
git add src/lib/router.ts src/App.tsx src/components/layout/Header.tsx src/pages/MissionPlannerPage.tsx
git commit -m "feat(mission-planner): add route, lazy import, nav link, page shell"
```

---

## Task 2: MissionPlannerHeader Component

**Files:**
- Create: `src/components/missionplanner/MissionPlannerHeader.tsx`
- Modify: `src/pages/MissionPlannerPage.tsx` (integrate header)

**Step 1: Create MissionPlannerHeader.tsx**

Create `src/components/missionplanner/MissionPlannerHeader.tsx`:

```tsx
/**
 * MissionPlannerHeader - Shows current rotation status with manual override
 * Displays cycle letter, day indicator, countdown timer, and override buttons
 */

import { useState, useEffect } from 'react';
import type { CycleInfo } from '../../lib/rotation';
import { cn } from '../../lib/utils';

const CYCLE_LETTERS = ['A', 'B', 'C', 'D'];
const CYCLE_COLORS: Record<string, string> = {
  A: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  B: 'bg-green-500/20 text-green-400 border-green-500/40',
  C: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
  D: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
};

interface MissionPlannerHeaderProps {
  cycleInfo: CycleInfo | null;
  cycleOverride: string | null;
  onCycleOverride: (letter: string | null) => void;
}

export function MissionPlannerHeader({
  cycleInfo,
  cycleOverride,
  onCycleOverride,
}: MissionPlannerHeaderProps) {
  const [countdown, setCountdown] = useState('');

  const activeCycle = cycleOverride ?? cycleInfo?.cycleLetter ?? 'A';
  const isOverridden = cycleOverride !== null;

  // Countdown timer - updates every second
  useEffect(() => {
    if (!cycleInfo?.nextRotation) return;

    function updateCountdown() {
      const now = new Date();
      const diff = cycleInfo!.nextRotation.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown('Rotating...');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [cycleInfo]);

  if (!cycleInfo) {
    return (
      <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-4 animate-pulse">
        <div className="h-6 bg-aviation-border/30 rounded w-48" />
      </div>
    );
  }

  return (
    <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-4 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: Status info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-px bg-aviation-amber/30" aria-hidden="true" />
            <span className="section-label">Current Rotation</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Cycle badge */}
            <span
              className={cn(
                'inline-flex items-center justify-center w-8 h-8 rounded border font-header font-bold text-sm',
                CYCLE_COLORS[activeCycle] ?? CYCLE_COLORS.A
              )}
            >
              {activeCycle}
            </span>

            {/* Day indicator */}
            {!isOverridden && (
              <span className="text-sm text-aviation-text-muted">
                Day {cycleInfo.dayInCycle} of 2
              </span>
            )}

            {/* Manual badge */}
            {isOverridden && (
              <span className="text-xs font-mono uppercase tracking-wider text-aviation-amber bg-aviation-amber/10 border border-aviation-amber/30 rounded px-2 py-0.5">
                Manual
              </span>
            )}
          </div>

          {/* Countdown */}
          {!isOverridden && (
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-aviation-text-muted">Next rotation:</span>
              <span className="font-mono text-aviation-amber" aria-live="polite">
                {countdown}
              </span>
            </div>
          )}
        </div>

        {/* Right: Cycle override buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-aviation-text-muted mr-1">Cycle:</span>
          <div role="radiogroup" aria-label="Select rotation cycle">
            <div className="flex gap-1">
              {CYCLE_LETTERS.map((letter) => (
                <button
                  key={letter}
                  role="radio"
                  aria-checked={activeCycle === letter}
                  aria-label={`Cycle ${letter}`}
                  onClick={() => {
                    if (letter === cycleInfo.cycleLetter && isOverridden) {
                      onCycleOverride(null); // Reset to auto
                    } else if (letter !== cycleInfo.cycleLetter) {
                      onCycleOverride(letter);
                    }
                  }}
                  className={cn(
                    'w-8 h-8 rounded border text-xs font-header font-bold transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-aviation-amber',
                    activeCycle === letter
                      ? CYCLE_COLORS[letter]
                      : 'border-aviation-border text-aviation-text-muted hover:border-aviation-amber/40 hover:text-aviation-text'
                  )}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {isOverridden && (
            <button
              onClick={() => onCycleOverride(null)}
              className="text-xs text-aviation-amber hover:text-aviation-amber/80 transition-colors underline ml-2 focus:outline-none focus:ring-2 focus:ring-aviation-amber rounded"
            >
              Reset to auto
            </button>
          )}
        </div>
      </div>

      {/* Mobile countdown */}
      {!isOverridden && (
        <div className="sm:hidden mt-3 flex items-center gap-2 text-sm">
          <span className="text-aviation-text-muted">Next rotation:</span>
          <span className="font-mono text-aviation-amber">{countdown}</span>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Integrate into MissionPlannerPage**

Update `src/pages/MissionPlannerPage.tsx` to import and use the header:

```tsx
import { useState, useMemo } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Header } from '../components/layout/Header';
import { MissionPlannerHeader } from '../components/missionplanner/MissionPlannerHeader';
import { useBrackets } from '../hooks/useBrackets';

export function MissionPlannerPage() {
  const [cycleOverride, setCycleOverride] = useState<string | null>(null);
  const [selectedBracketId, setSelectedBracketId] = useState<string | null>(null);
  const [selectedAircraftId, setSelectedAircraftId] = useState<string | null>(null);
  const [highlightBR, setHighlightBR] = useState<number | null>(null);

  const { cycleInfo, getBracketsForCycle, isLoading } = useBrackets();

  // Get brackets for the active cycle (auto or override)
  const activeBrackets = useMemo(() => {
    if (cycleOverride) {
      return getBracketsForCycle(cycleOverride);
    }
    return cycleInfo?.brackets ?? [];
  }, [cycleOverride, cycleInfo, getBracketsForCycle]);

  return (
    <PageContainer>
      <Header />
      <main id="main-content" className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-[1600px] space-y-6">
          {/* Page title */}
          <div className="flex items-center gap-3">
            <div className="w-4 h-px bg-aviation-amber/30" aria-hidden="true" />
            <h1 className="text-xl font-header font-bold text-aviation-amber uppercase tracking-wider">
              Mission Planner
            </h1>
          </div>

          {/* Rotation header */}
          <MissionPlannerHeader
            cycleInfo={cycleInfo}
            cycleOverride={cycleOverride}
            onCycleOverride={setCycleOverride}
          />

          {/* Placeholder for remaining sections */}
          <p className="text-aviation-text-muted text-sm">
            Bracket selector, team configurator, intel, and schedule coming next.
          </p>
        </div>
      </main>
    </PageContainer>
  );
}
```

**Step 3: Verify build + test**

Run: `npm run build && npm test`
Expected: Build passes, all tests pass. Navigate to `#/mission-planner` and see the rotation header with cycle buttons and countdown.

**Step 4: Commit**

```bash
git add src/components/missionplanner/MissionPlannerHeader.tsx src/pages/MissionPlannerPage.tsx
git commit -m "feat(mission-planner): add rotation header with cycle override and countdown"
```

---

## Task 3: BracketSelector Component

**Files:**
- Create: `src/components/missionplanner/BracketSelector.tsx`
- Modify: `src/pages/MissionPlannerPage.tsx` (integrate)

**Step 1: Create BracketSelector.tsx**

Create `src/components/missionplanner/BracketSelector.tsx`:

```tsx
/**
 * BracketSelector - Grid of clickable bracket cards for the selected rotation cycle
 * Each card shows bracket name, BR range, and aircraft count
 */

import type { SimBracket, Aircraft } from '../../types/aircraft';
import { cn } from '../../lib/utils';
import { formatBR } from '../../lib/utils';
import { useMemo } from 'react';

interface BracketSelectorProps {
  brackets: SimBracket[];
  allAircraft: Aircraft[];
  selectedBracketId: string | null;
  onSelectBracket: (bracketId: string) => void;
}

export function BracketSelector({
  brackets,
  allAircraft,
  selectedBracketId,
  onSelectBracket,
}: BracketSelectorProps) {
  // Count aircraft per bracket
  const aircraftCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const bracket of brackets) {
      counts[bracket.id] = allAircraft.filter(
        (a) => a.simulator_br >= bracket.min_br && a.simulator_br <= bracket.max_br
      ).length;
    }
    return counts;
  }, [brackets, allAircraft]);

  if (brackets.length === 0) {
    return (
      <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-6 text-center">
        <p className="text-aviation-text-muted text-sm">No brackets available for this cycle.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-4 h-px bg-aviation-amber/30" aria-hidden="true" />
        <span className="section-label">Select Bracket</span>
      </div>

      <div
        role="radiogroup"
        aria-label="Battle rating brackets"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2"
      >
        {brackets.map((bracket) => {
          const isSelected = selectedBracketId === bracket.id;
          const count = aircraftCounts[bracket.id] ?? 0;

          return (
            <button
              key={bracket.id}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${bracket.name}: BR ${formatBR(bracket.min_br)} to ${formatBR(bracket.max_br)}, ${count} aircraft`}
              onClick={() => onSelectBracket(bracket.id)}
              className={cn(
                'relative p-3 rounded-lg border text-left transition-all',
                'focus:outline-none focus:ring-2 focus:ring-aviation-amber',
                isSelected
                  ? 'bg-aviation-amber/10 border-aviation-amber text-aviation-text shadow-[0_0_8px_rgba(212,168,67,0.15)]'
                  : 'bg-aviation-surface/40 border-aviation-border text-aviation-text-muted hover:border-aviation-amber/40 hover:bg-aviation-surface/60'
              )}
            >
              <div className="font-header font-bold text-sm">
                {bracket.name}
              </div>
              <div className="text-xs mt-1 font-mono">
                {formatBR(bracket.min_br)} – {formatBR(bracket.max_br)}
              </div>
              <div className={cn(
                'text-xs mt-1.5',
                isSelected ? 'text-aviation-amber' : 'text-aviation-text-muted'
              )}>
                {count} aircraft
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 2: Integrate into MissionPlannerPage**

In `src/pages/MissionPlannerPage.tsx`, add import for `BracketSelector` and `useAircraft`, then add below the header:

Add to imports:
```typescript
import { BracketSelector } from '../components/missionplanner/BracketSelector';
import { useAircraft } from '../hooks/useAircraft';
```

Add hook call inside the component:
```typescript
const { allAircraft } = useAircraft();
```

Replace the placeholder `<p>` tag with:
```tsx
{/* Bracket selector + Team config (side by side on desktop) */}
<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
  {/* Left: Bracket Selector (3/5 width) */}
  <div className="lg:col-span-3">
    <BracketSelector
      brackets={activeBrackets}
      allAircraft={allAircraft}
      selectedBracketId={selectedBracketId}
      onSelectBracket={setSelectedBracketId}
    />
  </div>

  {/* Right: Team Configurator (2/5 width) — placeholder */}
  <div className="lg:col-span-2">
    <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-4 h-px bg-aviation-amber/30" aria-hidden="true" />
        <span className="section-label">Team Configuration</span>
      </div>
      <p className="text-aviation-text-muted text-sm">Coming in Task 4.</p>
    </div>
  </div>
</div>
```

**Step 3: Verify build + test**

Run: `npm run build && npm test`
Expected: Build passes, all tests pass. Bracket cards render in grid, clicking selects with amber border.

**Step 4: Commit**

```bash
git add src/components/missionplanner/BracketSelector.tsx src/pages/MissionPlannerPage.tsx
git commit -m "feat(mission-planner): add bracket selector card grid with aircraft counts"
```

---

## Task 4: TeamConfigurator Component

**Files:**
- Create: `src/components/missionplanner/TeamConfigurator.tsx`
- Modify: `src/pages/MissionPlannerPage.tsx` (replace placeholder)

**Step 1: Create TeamConfigurator.tsx**

Create `src/components/missionplanner/TeamConfigurator.tsx`:

```tsx
/**
 * TeamConfigurator - Full team customization with preset picker and drag-and-drop
 * Uses native HTML Drag and Drop API with mobile tap fallback
 */

import { useState, useCallback } from 'react';
import { useTeamConfigStore } from '../../stores/teamConfigStore';
import { useBrackets } from '../../hooks/useBrackets';
import { cn, getNationFlag, getNationName } from '../../lib/utils';
import type { Nation, Aircraft, SimBracket } from '../../types/aircraft';

const ALL_NATIONS: Nation[] = [
  'usa', 'germany', 'ussr', 'britain', 'japan',
  'italy', 'france', 'china', 'sweden', 'israel',
];

interface TeamConfiguratorProps {
  allAircraft: Aircraft[];
  selectedBracket: SimBracket | null;
}

export function TeamConfigurator({ allAircraft, selectedBracket }: TeamConfiguratorProps) {
  const {
    activePresetId,
    customTeamA,
    customTeamB,
    setActivePreset,
    addNationToTeamA,
    addNationToTeamB,
    loadPresets,
    availablePresets,
  } = useTeamConfigStore();
  const { teamPresets, defaultTeam } = useBrackets();

  // Load presets on first render if not loaded
  if (availablePresets.length === 0 && teamPresets.length > 0) {
    loadPresets(teamPresets);
  }

  // Mobile: tap-to-move mode
  const [tappedNation, setTappedNation] = useState<Nation | null>(null);

  // Drag state for visual feedback
  const [dragOverTeam, setDragOverTeam] = useState<'A' | 'B' | null>(null);

  // Count aircraft per nation in selected bracket
  const getAircraftCount = useCallback(
    (nation: Nation) => {
      if (!selectedBracket) return 0;
      return allAircraft.filter(
        (a) =>
          a.country === nation &&
          a.simulator_br >= selectedBracket.min_br &&
          a.simulator_br <= selectedBracket.max_br
      ).length;
    },
    [allAircraft, selectedBracket]
  );

  // Build preset list for display
  const presets = [
    { id: 'default', name: 'Default' },
    ...teamPresets.map((p) => ({ id: p.id, name: p.name })),
    { id: 'custom', name: 'Custom' },
  ];

  // Drag handlers
  function handleDragStart(e: React.DragEvent, nation: Nation) {
    e.dataTransfer.setData('text/plain', nation);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDropOnTeamA(e: React.DragEvent) {
    e.preventDefault();
    const nation = e.dataTransfer.getData('text/plain') as Nation;
    if (nation && ALL_NATIONS.includes(nation)) {
      addNationToTeamA(nation);
    }
    setDragOverTeam(null);
  }

  function handleDropOnTeamB(e: React.DragEvent) {
    e.preventDefault();
    const nation = e.dataTransfer.getData('text/plain') as Nation;
    if (nation && ALL_NATIONS.includes(nation)) {
      addNationToTeamB(nation);
    }
    setDragOverTeam(null);
  }

  // Mobile tap handler
  function handleNationTap(nation: Nation) {
    if (tappedNation === nation) {
      setTappedNation(null); // Deselect
    } else {
      setTappedNation(nation);
    }
  }

  function handleTeamHeaderTap(team: 'A' | 'B') {
    if (!tappedNation) return;
    if (team === 'A') {
      addNationToTeamA(tappedNation);
    } else {
      addNationToTeamB(tappedNation);
    }
    setTappedNation(null);
  }

  function renderNationItem(nation: Nation, team: 'A' | 'B') {
    const count = getAircraftCount(nation);
    const isTapped = tappedNation === nation;

    return (
      <div
        key={nation}
        draggable
        onDragStart={(e) => handleDragStart(e, nation)}
        onClick={() => handleNationTap(nation)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded border text-sm cursor-grab active:cursor-grabbing transition-all',
          'focus:outline-none focus:ring-2 focus:ring-aviation-amber',
          isTapped
            ? 'border-aviation-amber bg-aviation-amber/15 ring-1 ring-aviation-amber'
            : team === 'A'
              ? 'border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40'
              : 'border-red-500/20 bg-red-500/5 hover:border-red-500/40'
        )}
        role="option"
        aria-selected={isTapped}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleNationTap(nation);
          }
        }}
      >
        <span aria-hidden="true">{getNationFlag(nation)}</span>
        <span className="flex-1 text-aviation-text">{getNationName(nation)}</span>
        {selectedBracket && (
          <span className="text-xs font-mono text-aviation-text-muted">{count}</span>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-4 h-px bg-aviation-amber/30" aria-hidden="true" />
        <span className="section-label">Team Configuration</span>
      </div>

      <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-4 backdrop-blur-sm">
        {/* Preset selector */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                if (preset.id !== 'custom') {
                  setActivePreset(preset.id);
                }
              }}
              className={cn(
                'px-2.5 py-1 rounded text-xs font-medium transition-all',
                'focus:outline-none focus:ring-2 focus:ring-aviation-amber',
                activePresetId === preset.id
                  ? 'bg-aviation-amber/15 text-aviation-amber border border-aviation-amber/40'
                  : 'text-aviation-text-muted border border-aviation-border hover:border-aviation-amber/30 hover:text-aviation-text'
              )}
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Tap instruction on mobile */}
        {tappedNation && (
          <div className="mb-3 text-xs text-aviation-amber bg-aviation-amber/10 border border-aviation-amber/20 rounded px-3 py-1.5 lg:hidden">
            Tap a team header to move {getNationName(tappedNation)}
          </div>
        )}

        {/* Two team columns */}
        <div className="grid grid-cols-2 gap-3">
          {/* Team A */}
          <div
            onDragOver={(e) => { handleDragOver(e); setDragOverTeam('A'); }}
            onDragLeave={() => setDragOverTeam(null)}
            onDrop={handleDropOnTeamA}
            className={cn(
              'rounded-lg border p-2 transition-colors min-h-[120px]',
              dragOverTeam === 'A'
                ? 'border-blue-400 bg-blue-500/10'
                : 'border-aviation-border'
            )}
          >
            <button
              onClick={() => handleTeamHeaderTap('A')}
              className={cn(
                'w-full text-xs font-header font-bold uppercase tracking-wider mb-2 px-2 py-1 rounded transition-colors',
                tappedNation && !customTeamA.includes(tappedNation)
                  ? 'text-blue-400 bg-blue-500/15 cursor-pointer hover:bg-blue-500/25'
                  : 'text-blue-400 cursor-default'
              )}
            >
              Team A
            </button>
            <div className="space-y-1" role="listbox" aria-label="Team A nations">
              {customTeamA.map((nation) => renderNationItem(nation, 'A'))}
            </div>
          </div>

          {/* Team B */}
          <div
            onDragOver={(e) => { handleDragOver(e); setDragOverTeam('B'); }}
            onDragLeave={() => setDragOverTeam(null)}
            onDrop={handleDropOnTeamB}
            className={cn(
              'rounded-lg border p-2 transition-colors min-h-[120px]',
              dragOverTeam === 'B'
                ? 'border-red-400 bg-red-500/10'
                : 'border-aviation-border'
            )}
          >
            <button
              onClick={() => handleTeamHeaderTap('B')}
              className={cn(
                'w-full text-xs font-header font-bold uppercase tracking-wider mb-2 px-2 py-1 rounded transition-colors',
                tappedNation && !customTeamB.includes(tappedNation)
                  ? 'text-red-400 bg-red-500/15 cursor-pointer hover:bg-red-500/25'
                  : 'text-red-400 cursor-default'
              )}
            >
              Team B
            </button>
            <div className="space-y-1" role="listbox" aria-label="Team B nations">
              {customTeamB.map((nation) => renderNationItem(nation, 'B'))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Integrate into MissionPlannerPage**

In `src/pages/MissionPlannerPage.tsx`, replace the team config placeholder:

Add import:
```typescript
import { TeamConfigurator } from '../components/missionplanner/TeamConfigurator';
```

Add memoized selected bracket lookup:
```typescript
const selectedBracket = useMemo(() => {
  if (!selectedBracketId) return null;
  return activeBrackets.find((b) => b.id === selectedBracketId) ?? null;
}, [selectedBracketId, activeBrackets]);
```

Replace the Team Configuration placeholder div with:
```tsx
<div className="lg:col-span-2">
  <TeamConfigurator
    allAircraft={allAircraft}
    selectedBracket={selectedBracket}
  />
</div>
```

**Step 3: Verify build + test**

Run: `npm run build && npm test`
Expected: Build passes, all tests pass. Nations drag between teams, preset buttons work.

**Step 4: Commit**

```bash
git add src/components/missionplanner/TeamConfigurator.tsx src/pages/MissionPlannerPage.tsx
git commit -m "feat(mission-planner): add team configurator with drag-and-drop and presets"
```

---

## Task 5: PreFlightIntel Component

**Files:**
- Create: `src/components/missionplanner/PreFlightIntel.tsx`
- Modify: `src/pages/MissionPlannerPage.tsx` (integrate)

**Step 1: Create PreFlightIntel.tsx**

Create `src/components/missionplanner/PreFlightIntel.tsx`:

```tsx
/**
 * PreFlightIntel - Shows threat intel for selected bracket + team config
 * Includes summary, aircraft quick-picker, threat overview, and launch button
 */

import { useState, useMemo, useCallback } from 'react';
import { useTeamConfigStore } from '../../stores/teamConfigStore';
import { useSelectionStore } from '../../stores/selectionStore';
import { getEnemyAircraft, getEnemyNations, determineTeam, groupByNation } from '../../lib/matchup-logic';
import { getTopThreats, getThreatColor, getThreatLabel } from '../../lib/threat-analysis';
import { navigate } from '../../lib/router';
import { cn, formatBR, getNationFlag, getNationName, getAircraftDisplayName } from '../../lib/utils';
import type { Aircraft, SimBracket, Nation } from '../../types/aircraft';

interface PreFlightIntelProps {
  allAircraft: Aircraft[];
  selectedBracket: SimBracket | null;
  selectedAircraftId: string | null;
  onSelectAircraft: (id: string | null) => void;
}

export function PreFlightIntel({
  allAircraft,
  selectedBracket,
  selectedAircraftId,
  onSelectAircraft,
}: PreFlightIntelProps) {
  const { getActiveConfig } = useTeamConfigStore();
  const { setSelectedAircraft } = useSelectionStore();
  const teamConfig = getActiveConfig();

  const [searchQuery, setSearchQuery] = useState('');

  // All aircraft in the selected bracket
  const bracketAircraft = useMemo(() => {
    if (!selectedBracket) return [];
    return allAircraft.filter(
      (a) =>
        a.simulator_br >= selectedBracket.min_br &&
        a.simulator_br <= selectedBracket.max_br
    );
  }, [allAircraft, selectedBracket]);

  // Your team's aircraft (for the quick-picker)
  const yourAircraft = useMemo(() => {
    const teamANations = new Set(teamConfig.team_a);
    const teamBNations = new Set(teamConfig.team_b);
    // Determine which team's aircraft to show — show both sides for picking
    return bracketAircraft
      .filter((a) => teamANations.has(a.country) || teamBNations.has(a.country))
      .sort((a, b) => a.simulator_br - b.simulator_br);
  }, [bracketAircraft, teamConfig]);

  // Filtered aircraft for quick-picker search
  const filteredPicker = useMemo(() => {
    if (!searchQuery.trim()) return yourAircraft;
    const q = searchQuery.toLowerCase();
    return yourAircraft.filter(
      (a) =>
        a.identifier.toLowerCase().includes(q) ||
        (a.localized_name?.toLowerCase().includes(q) ?? false)
    );
  }, [yourAircraft, searchQuery]);

  // Selected aircraft object
  const selectedAircraft = useMemo(() => {
    if (!selectedAircraftId) return null;
    return allAircraft.find((a) => a.identifier === selectedAircraftId) ?? null;
  }, [selectedAircraftId, allAircraft]);

  // Enemy calculations (when aircraft selected)
  const enemyData = useMemo(() => {
    if (!selectedAircraft || !selectedBracket) return null;
    const playerTeam = determineTeam(selectedAircraft.country, teamConfig);
    const enemyNations = getEnemyNations(playerTeam, teamConfig);
    const enemies = getEnemyAircraft(allAircraft, enemyNations, selectedBracket);
    const enemyByNation = groupByNation(enemies);
    const topThreats = getTopThreats(selectedAircraft, enemies, 5);

    // Ally count
    const allyNations = playerTeam === 'A' ? teamConfig.team_a : teamConfig.team_b;
    const allies = allAircraft.filter(
      (a) =>
        allyNations.includes(a.country) &&
        a.country !== selectedAircraft.country &&
        a.simulator_br >= selectedBracket.min_br &&
        a.simulator_br <= selectedBracket.max_br
    );

    return {
      enemies,
      enemyNations,
      enemyByNation,
      topThreats,
      allyCount: allies.length,
      playerTeam,
    };
  }, [selectedAircraft, selectedBracket, teamConfig, allAircraft]);

  // Launch matchup analysis
  const handleLaunch = useCallback(() => {
    if (selectedAircraft) {
      setSelectedAircraft(selectedAircraft);
      navigate('#/matchup');
    }
  }, [selectedAircraft, setSelectedAircraft]);

  // No bracket selected
  if (!selectedBracket) {
    return (
      <div className="bg-aviation-surface/60 border border-dashed border-aviation-border rounded-lg p-8 text-center">
        <div className="text-aviation-amber/30 text-4xl mb-3" aria-hidden="true">📡</div>
        <p className="text-aviation-text-muted text-sm">
          Select a bracket above to see threat intel
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-4 h-px bg-aviation-amber/30" aria-hidden="true" />
        <span className="section-label">Pre-Flight Intel</span>
        <span className="text-xs text-aviation-text-muted ml-auto">
          {selectedBracket.name} · BR {formatBR(selectedBracket.min_br)}–{formatBR(selectedBracket.max_br)}
        </span>
      </div>

      {/* Summary bar (when aircraft selected) */}
      {enemyData && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-3 text-center">
            <div className="text-xl font-header font-bold text-red-400">{enemyData.enemies.length}</div>
            <div className="text-xs text-aviation-text-muted">Enemies</div>
          </div>
          <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-3 text-center">
            <div className="text-xl font-header font-bold text-blue-400">{enemyData.allyCount}</div>
            <div className="text-xs text-aviation-text-muted">Allies</div>
          </div>
          <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-3 text-center">
            <div className="text-xl font-header font-bold text-aviation-text">{enemyData.enemyNations.length}</div>
            <div className="text-xs text-aviation-text-muted">Enemy Nations</div>
          </div>
        </div>
      )}

      {/* Aircraft quick-picker */}
      <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-header font-bold uppercase tracking-wider text-aviation-text-muted">
            Select Your Aircraft
          </span>
          <span className="text-xs text-aviation-text-muted">{bracketAircraft.length} in bracket</span>
        </div>

        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search aircraft..."
          className="w-full bg-aviation-charcoal/50 border border-aviation-border rounded px-3 py-1.5 text-sm text-aviation-text placeholder-aviation-text-muted/50 focus:outline-none focus:ring-2 focus:ring-aviation-amber focus:border-aviation-amber mb-3"
          aria-label="Search aircraft in bracket"
        />

        {/* Aircraft grid */}
        <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
          {filteredPicker.slice(0, 50).map((aircraft) => {
            const isSelected = selectedAircraftId === aircraft.identifier;
            return (
              <button
                key={aircraft.identifier}
                onClick={() => onSelectAircraft(isSelected ? null : aircraft.identifier)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-1.5 rounded text-sm text-left transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-aviation-amber',
                  isSelected
                    ? 'bg-aviation-amber/15 border border-aviation-amber text-aviation-text'
                    : 'hover:bg-aviation-surface/80 text-aviation-text-muted hover:text-aviation-text border border-transparent'
                )}
              >
                <span className="text-xs" aria-hidden="true">{getNationFlag(aircraft.country)}</span>
                <span className="flex-1 truncate">{getAircraftDisplayName(aircraft)}</span>
                <span className="text-xs font-mono shrink-0">{formatBR(aircraft.simulator_br)}</span>
              </button>
            );
          })}
          {filteredPicker.length > 50 && (
            <p className="text-xs text-aviation-text-muted text-center py-2">
              Showing first 50 of {filteredPicker.length}. Use search to narrow down.
            </p>
          )}
        </div>
      </div>

      {/* Threat overview (when aircraft selected) */}
      {enemyData && selectedAircraft && (
        <div className="space-y-4">
          {/* Top 5 threats */}
          {enemyData.topThreats.length > 0 && (
            <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-4">
              <span className="text-xs font-header font-bold uppercase tracking-wider text-red-400/70 block mb-3">
                Top Threats
              </span>
              <div className="space-y-2">
                {enemyData.topThreats.map(({ aircraft, assessment }, i) => (
                  <div key={aircraft.identifier} className="flex items-center gap-3 text-sm">
                    <span className="text-xs font-mono text-aviation-text-muted w-4">{i + 1}</span>
                    <span aria-hidden="true">{getNationFlag(aircraft.country)}</span>
                    <span className="flex-1 truncate text-aviation-text">
                      {getAircraftDisplayName(aircraft)}
                    </span>
                    <span className="text-xs font-mono text-aviation-text-muted">
                      {formatBR(aircraft.simulator_br)}
                    </span>
                    <span className={cn('text-xs font-bold uppercase', getThreatColor(assessment.threatLevel))}>
                      {getThreatLabel(assessment.threatLevel)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nation breakdown */}
          <div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-4">
            <span className="text-xs font-header font-bold uppercase tracking-wider text-aviation-text-muted block mb-3">
              Enemy Nation Breakdown
            </span>
            <div className="space-y-2">
              {Array.from(enemyData.enemyByNation.entries())
                .sort((a, b) => b[1].length - a[1].length)
                .map(([nation, aircraft]) => (
                  <div key={nation} className="flex items-center gap-2">
                    <span aria-hidden="true">{getNationFlag(nation)}</span>
                    <span className="text-sm text-aviation-text w-16">{getNationName(nation)}</span>
                    <div className="flex-1 h-2 bg-aviation-charcoal rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500/60 rounded-full transition-all"
                        style={{ width: `${(aircraft.length / enemyData.enemies.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-aviation-text-muted w-8 text-right">
                      {aircraft.length}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Launch button */}
          <button
            onClick={handleLaunch}
            className="w-full py-3 bg-aviation-amber/15 text-aviation-amber border border-aviation-amber/40 rounded-lg font-header font-bold text-sm uppercase tracking-wider hover:bg-aviation-amber/25 transition-colors focus:outline-none focus:ring-2 focus:ring-aviation-amber"
          >
            Launch Matchup Analysis →
          </button>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Integrate into MissionPlannerPage**

Add import:
```typescript
import { PreFlightIntel } from '../components/missionplanner/PreFlightIntel';
```

Add after the bracket/team grid `</div>`:
```tsx
{/* Pre-Flight Intel */}
<PreFlightIntel
  allAircraft={allAircraft}
  selectedBracket={selectedBracket}
  selectedAircraftId={selectedAircraftId}
  onSelectAircraft={setSelectedAircraftId}
/>
```

**Step 3: Verify build + test**

Run: `npm run build && npm test`
Expected: Build passes, all tests pass. Select bracket → see aircraft picker → select aircraft → see threats + launch button.

**Step 4: Commit**

```bash
git add src/components/missionplanner/PreFlightIntel.tsx src/pages/MissionPlannerPage.tsx
git commit -m "feat(mission-planner): add pre-flight intel with aircraft picker and threat overview"
```

---

## Task 6: WeeklySchedule Component

**Files:**
- Create: `src/components/missionplanner/WeeklySchedule.tsx`
- Modify: `src/pages/MissionPlannerPage.tsx` (integrate)

**Step 1: Create WeeklySchedule.tsx**

Create `src/components/missionplanner/WeeklySchedule.tsx`:

```tsx
/**
 * WeeklySchedule - 7-day calendar showing bracket rotation with BR highlighting
 */

import { useMemo } from 'react';
import { getCycleInfo } from '../../lib/rotation';
import { cn, formatBR } from '../../lib/utils';
import type { SimBracket } from '../../types/aircraft';
import type { RotationCycleData, RotationConfig } from '../../lib/rotation';

const CYCLE_COLORS: Record<string, string> = {
  A: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  B: 'bg-green-500/20 text-green-400 border-green-500/40',
  C: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
  D: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
};

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface WeeklyScheduleProps {
  cycles: RotationCycleData[];
  rotationConfig: RotationConfig;
  highlightBR: number | null;
  onHighlightBRChange: (br: number | null) => void;
}

interface DaySchedule {
  date: Date;
  dayName: string;
  dateStr: string;
  cycleLetter: string;
  brackets: SimBracket[];
  isToday: boolean;
  isPast: boolean;
}

export function WeeklySchedule({
  cycles,
  rotationConfig,
  highlightBR,
  onHighlightBRChange,
}: WeeklyScheduleProps) {
  // Calculate the week's schedule (Monday to Sunday)
  const weekSchedule = useMemo(() => {
    const today = new Date();
    const todayDateStr = today.toISOString().slice(0, 10);

    // Find Monday of current week
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(12, 0, 0, 0); // Noon to avoid DST edge cases

    const schedule: DaySchedule[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);

      const cycleInfo = getCycleInfo(cycles, rotationConfig, date);
      const dateStr = date.toISOString().slice(0, 10);
      const isToday = dateStr === todayDateStr;
      const isPast = date < today && !isToday;

      schedule.push({
        date,
        dayName: DAY_NAMES[i],
        dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        cycleLetter: cycleInfo.cycleLetter,
        brackets: cycleInfo.brackets,
        isToday,
        isPast,
      });
    }

    return schedule;
  }, [cycles, rotationConfig]);

  // Check if a bracket contains the highlighted BR
  function bracketContainsBR(bracket: SimBracket): boolean {
    if (highlightBR === null) return false;
    return highlightBR >= bracket.min_br && highlightBR <= bracket.max_br;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-px bg-aviation-amber/30" aria-hidden="true" />
          <span className="section-label">Weekly Schedule</span>
        </div>

        {/* BR highlight input */}
        <div className="flex items-center gap-2">
          <label htmlFor="highlight-br" className="text-xs text-aviation-text-muted">
            Highlight BR:
          </label>
          <input
            id="highlight-br"
            type="number"
            min="1.0"
            max="14.3"
            step="0.1"
            value={highlightBR ?? ''}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onHighlightBRChange(isNaN(val) ? null : val);
            }}
            placeholder="e.g. 4.0"
            className="w-20 bg-aviation-charcoal/50 border border-aviation-border rounded px-2 py-1 text-xs text-aviation-text font-mono placeholder-aviation-text-muted/50 focus:outline-none focus:ring-2 focus:ring-aviation-amber"
          />
          {highlightBR !== null && (
            <button
              onClick={() => onHighlightBRChange(null)}
              className="text-xs text-aviation-text-muted hover:text-aviation-amber transition-colors"
              aria-label="Clear BR highlight"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Desktop: 7-column grid */}
      <div className="hidden md:grid grid-cols-7 gap-1.5" role="table" aria-label="Weekly bracket schedule">
        {/* Day headers */}
        <div role="row" className="contents">
          {weekSchedule.map((day) => (
            <div
              key={day.dayName}
              role="columnheader"
              className={cn(
                'text-center text-xs font-header font-bold uppercase tracking-wider py-1.5 rounded-t border-b',
                day.isToday
                  ? 'text-aviation-amber border-aviation-amber/40'
                  : 'text-aviation-text-muted border-aviation-border'
              )}
            >
              {day.dayName}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div role="row" className="contents">
          {weekSchedule.map((day) => (
            <div
              key={day.dateStr}
              role="cell"
              className={cn(
                'border rounded-b p-2 min-h-[180px] transition-colors',
                day.isToday
                  ? 'border-aviation-amber/40 bg-aviation-amber/5'
                  : day.isPast
                    ? 'border-aviation-border/50 bg-aviation-surface/20 opacity-60'
                    : 'border-aviation-border bg-aviation-surface/40'
              )}
            >
              {/* Date + cycle badge */}
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  'text-xs',
                  day.isToday ? 'text-aviation-amber font-bold' : 'text-aviation-text-muted'
                )}>
                  {day.dateStr}
                </span>
                <span className={cn(
                  'inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold border',
                  CYCLE_COLORS[day.cycleLetter]
                )}>
                  {day.cycleLetter}
                </span>
              </div>

              {day.isToday && (
                <div className="text-[10px] font-bold text-aviation-amber uppercase tracking-wider mb-1.5">
                  Today
                </div>
              )}

              {/* Bracket list */}
              <div className="space-y-0.5">
                {day.brackets.map((bracket) => {
                  const isHighlighted = bracketContainsBR(bracket);
                  return (
                    <div
                      key={bracket.id}
                      className={cn(
                        'text-[10px] leading-tight rounded px-1 py-0.5 transition-colors',
                        isHighlighted
                          ? 'bg-aviation-amber/20 text-aviation-amber font-medium'
                          : 'text-aviation-text-muted'
                      )}
                    >
                      <span className="font-medium">{bracket.name}</span>
                      <span className="ml-1 font-mono opacity-70">
                        {formatBR(bracket.min_br)}–{formatBR(bracket.max_br)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: Stacked list */}
      <div className="md:hidden space-y-2">
        {weekSchedule.map((day) => (
          <details
            key={day.dateStr}
            open={day.isToday}
            className={cn(
              'border rounded-lg overflow-hidden',
              day.isToday ? 'border-aviation-amber/40' : 'border-aviation-border'
            )}
          >
            <summary
              className={cn(
                'flex items-center justify-between px-3 py-2 cursor-pointer',
                day.isToday ? 'bg-aviation-amber/5' : 'bg-aviation-surface/40',
                day.isPast && 'opacity-60'
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-sm font-medium',
                  day.isToday ? 'text-aviation-amber' : 'text-aviation-text'
                )}>
                  {day.dayName} · {day.dateStr}
                </span>
                {day.isToday && (
                  <span className="text-[10px] font-bold text-aviation-amber uppercase">Today</span>
                )}
              </div>
              <span className={cn(
                'inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold border',
                CYCLE_COLORS[day.cycleLetter]
              )}>
                {day.cycleLetter}
              </span>
            </summary>
            <div className="px-3 py-2 space-y-1 bg-aviation-surface/20">
              {day.brackets.map((bracket) => {
                const isHighlighted = bracketContainsBR(bracket);
                return (
                  <div
                    key={bracket.id}
                    className={cn(
                      'text-xs rounded px-2 py-1',
                      isHighlighted
                        ? 'bg-aviation-amber/15 text-aviation-amber font-medium'
                        : 'text-aviation-text-muted'
                    )}
                  >
                    {bracket.name} · {formatBR(bracket.min_br)}–{formatBR(bracket.max_br)}
                  </div>
                );
              })}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Integrate into MissionPlannerPage**

Add import:
```typescript
import { WeeklySchedule } from '../components/missionplanner/WeeklySchedule';
```

You need access to `bracketData` (cycles + rotation config). Modify `useBrackets` usage — the hook doesn't currently expose cycles/rotation directly. Two options:

Option A (simpler): Pass cycles through the existing `getBracketsForCycle` pattern. Actually, `WeeklySchedule` needs `getCycleInfo` internally which needs `cycles` and `rotationConfig`. The simplest approach: expose `bracketData` from `useBrackets`.

In `src/hooks/useBrackets.ts`, add `bracketData` to the return object (after line 113):
```typescript
return {
  brackets,
  cycleInfo,
  bracketData, // Add this line
  teamPresets,
  // ... rest stays the same
```

Then in MissionPlannerPage, destructure it:
```typescript
const { cycleInfo, getBracketsForCycle, bracketData, isLoading } = useBrackets();
```

Add the weekly schedule after PreFlightIntel:
```tsx
{/* Weekly Schedule */}
{bracketData && (
  <WeeklySchedule
    cycles={bracketData.cycles}
    rotationConfig={bracketData.rotation}
    highlightBR={highlightBR}
    onHighlightBRChange={setHighlightBR}
  />
)}
```

**Step 3: Verify build + test**

Run: `npm run build && npm test`
Expected: Build passes, all tests pass. 7-day grid renders with cycle badges, BR highlighting works.

**Step 4: Commit**

```bash
git add src/components/missionplanner/WeeklySchedule.tsx src/pages/MissionPlannerPage.tsx src/hooks/useBrackets.ts
git commit -m "feat(mission-planner): add weekly schedule with 7-day grid and BR highlighting"
```

---

## Task 7: Index Re-exports + Error Boundary

**Files:**
- Create: `src/components/missionplanner/index.ts`
- Create: `src/components/missionplanner/MissionPlannerErrorBoundary.tsx`
- Modify: `src/pages/MissionPlannerPage.tsx` (wrap in error boundary)

**Step 1: Create index.ts**

Create `src/components/missionplanner/index.ts`:

```typescript
// Mission Planner - Re-exports
export { MissionPlannerHeader } from './MissionPlannerHeader';
export { BracketSelector } from './BracketSelector';
export { TeamConfigurator } from './TeamConfigurator';
export { PreFlightIntel } from './PreFlightIntel';
export { WeeklySchedule } from './WeeklySchedule';
export { MissionPlannerErrorBoundary } from './MissionPlannerErrorBoundary';
```

**Step 2: Create MissionPlannerErrorBoundary.tsx**

Create `src/components/missionplanner/MissionPlannerErrorBoundary.tsx` (follows Phase 2D pattern from `FlightAcademyErrorBoundary`):

```tsx
/**
 * MissionPlannerErrorBoundary - Local error boundary for Mission Planner
 * Catches rendering errors without crashing the entire page
 */

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class MissionPlannerErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Mission Planner error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="bg-aviation-surface/60 border border-red-500/30 rounded-lg p-6 text-center"
        >
          <div className="text-red-400 font-header text-xl font-bold mb-2">
            Mission Planner Error
          </div>
          <p className="text-sm text-aviation-text-muted mb-4">
            {this.state.error?.message || 'Something went wrong loading the Mission Planner.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-aviation-amber/15 text-aviation-amber border border-aviation-amber/40 rounded text-sm font-medium hover:bg-aviation-amber/25 transition-colors focus:outline-none focus:ring-2 focus:ring-aviation-amber"
            aria-label="Retry loading Mission Planner"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

**Step 3: Wrap MissionPlannerPage content in error boundary**

In `src/pages/MissionPlannerPage.tsx`, import the error boundary and wrap the inner content:

```typescript
import { MissionPlannerErrorBoundary } from '../components/missionplanner/MissionPlannerErrorBoundary';
```

Wrap the `<main>` content inside the error boundary.

**Step 4: Verify build + test**

Run: `npm run build && npm test`
Expected: Build passes, all tests pass.

**Step 5: Commit**

```bash
git add src/components/missionplanner/index.ts src/components/missionplanner/MissionPlannerErrorBoundary.tsx src/pages/MissionPlannerPage.tsx
git commit -m "feat(mission-planner): add error boundary and re-exports"
```

---

## Task 8: Polish — Animations + Accessibility + Responsive

**Files:**
- Modify: `src/pages/MissionPlannerPage.tsx` (add Framer Motion stagger)
- Modify: Various components (minor accessibility fixes)

**Step 1: Add Framer Motion stagger animations to MissionPlannerPage**

Wrap each major section in `motion.div` with stagger animation (same pattern as Phase 2/3):

```tsx
import { motion, useReducedMotion } from 'framer-motion';

// Inside component:
const prefersReducedMotion = useReducedMotion();

const containerVariants = prefersReducedMotion
  ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
  : { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

const itemVariants = prefersReducedMotion
  ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
  : { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
```

Wrap the main content in `<motion.div variants={containerVariants} initial="hidden" animate="visible">` and each section in `<motion.div variants={itemVariants}>`.

**Step 2: Verify responsive layouts**

Check that all grids collapse properly:
- `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` for bracket cards
- `grid-cols-1 lg:grid-cols-5` for bracket+team layout
- `hidden md:grid grid-cols-7` for weekly schedule (mobile uses stacked `<details>`)
- `grid-cols-2` for team columns (stays 2-column even on mobile — nations are small)

**Step 3: Verify accessibility**

Check all ARIA attributes are in place:
- `role="radiogroup"` on bracket selector and cycle override
- `role="radio"` + `aria-checked` on bracket cards and cycle buttons
- `role="listbox"` + `role="option"` on team nation lists
- `role="table"` on weekly schedule grid
- `role="alert"` on error boundary
- `aria-live="polite"` on countdown timer
- `aria-label` on all interactive elements
- `focus:ring-2 focus:ring-aviation-amber` on all focusable elements

**Step 4: Verify build + test**

Run: `npm run build && npm test`
Expected: Build passes, all tests pass. Animations smooth with reduced-motion fallback.

**Step 5: Commit**

```bash
git add src/pages/MissionPlannerPage.tsx
git commit -m "feat(mission-planner): add stagger animations and verify accessibility"
```

---

## Task 9: Update IMPROVEMENTS.md + Final Verification

**Files:**
- Modify: `wt-sim-matchup/IMPROVEMENTS.md` (update Phase 4 section)

**Step 1: Run full build + test suite**

Run: `npm run build && npm test`
Expected: Build passes, all tests pass. No TypeScript errors.

**Step 2: Manually test the full flow**

1. Navigate to `#/mission-planner` via header link
2. Verify rotation header shows correct cycle + countdown
3. Click cycle override buttons, verify "Manual" badge + "Reset to auto"
4. Click bracket cards, verify selection highlighting
5. Verify team preset buttons change nation assignments
6. Drag a nation between teams, verify "Custom" preset activates
7. Select bracket → see aircraft list in PreFlightIntel
8. Select aircraft → see threats + nation breakdown
9. Click "Launch Matchup Analysis" → verify navigation to MatchupPage with aircraft
10. Test BR highlight in weekly schedule
11. Test on narrow viewport (mobile simulation)
12. Test keyboard navigation (Tab through all controls)

**Step 3: Update IMPROVEMENTS.md**

Update the Phase 4 section in `IMPROVEMENTS.md` with completion details (files created/modified, lines added, build status, implementation notes).

**Step 4: Commit**

```bash
git add IMPROVEMENTS.md
git commit -m "docs: update IMPROVEMENTS.md with Phase 4 completion notes"
```

---

## Summary

| Task | Component | Lines (est.) |
|------|-----------|-------------|
| 1 | Router + Page Shell + Nav | ~60 |
| 2 | MissionPlannerHeader | ~130 |
| 3 | BracketSelector | ~80 |
| 4 | TeamConfigurator | ~200 |
| 5 | PreFlightIntel | ~250 |
| 6 | WeeklySchedule | ~200 |
| 7 | Error Boundary + Index | ~80 |
| 8 | Polish (animations, a11y) | ~40 |
| 9 | Docs + verification | ~50 |
| **Total** | | **~1,090 lines** |

**New files (8):**
- `src/pages/MissionPlannerPage.tsx`
- `src/components/missionplanner/MissionPlannerHeader.tsx`
- `src/components/missionplanner/BracketSelector.tsx`
- `src/components/missionplanner/TeamConfigurator.tsx`
- `src/components/missionplanner/PreFlightIntel.tsx`
- `src/components/missionplanner/WeeklySchedule.tsx`
- `src/components/missionplanner/MissionPlannerErrorBoundary.tsx`
- `src/components/missionplanner/index.ts`

**Modified files (4):**
- `src/lib/router.ts` — Add mission-planner route
- `src/App.tsx` — Add lazy import + route case
- `src/components/layout/Header.tsx` — Add nav link
- `src/hooks/useBrackets.ts` — Expose bracketData

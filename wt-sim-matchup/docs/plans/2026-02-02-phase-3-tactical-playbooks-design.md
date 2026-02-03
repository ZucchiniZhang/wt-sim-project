# Phase 3: Tactical Playbooks — Design Document

**Date:** 2026-02-02
**Phase:** 3 of 7
**Model:** OPUS
**Prerequisite:** Phase 2 merged to main

---

## Overview

Add a "Tactical Playbook" tab to BriefingDetailPage, providing AI-generated matchup-specific engagement guides. Mirrors the tab pattern established in Phase 2's AircraftDetailPage Flight Academy tab.

## Integration Approach

**Tab-based** — Add "Overview" / "Tactical Playbook" tab bar to BriefingDetailPage. The sticky header and BriefingHeader (side-by-side aircraft comparison) remain above the tabs since they provide context for both views.

**Generation flow:** Same as Flight Academy — empty state with "Generate Tactical Playbook" button, generate-once-cache-forever via IndexedDB. User controls when API tokens are spent.

## Page Structure

```
BriefingDetailPage
├─ Sticky header (threat badge, back nav) — unchanged
├─ BriefingHeader (side-by-side aircraft) — unchanged
├─ Tab Bar: "Overview" | "Tactical Playbook"
│
├─ [Overview tab] — existing content, unchanged
│   ├─ MatchupComparisonBars
│   ├─ PerformanceRadar
│   ├─ EngagementSummary
│   └─ Performance Curves (DualSpeedAltitude, DualClimbProfile)
│
└─ [Tactical Playbook tab] — NEW
    └─ TacticalPlaybookTab
        ├─ Empty state → PlaybookEmptyState (generate button)
        ├─ Loading state → skeleton shimmer
        ├─ Error state → retry button
        └─ Content state → all sections below
```

## Component Structure

```
src/components/tacticalplaybook/
├── TacticalPlaybookTab.tsx        # Container (useMatchupPlaybook hook, state management)
├── PlaybookEmptyState.tsx         # "Generate Tactical Playbook" button + feature list
├── ThreatAssessmentCard.tsx       # Threat level badge + AI reasoning
├── EngagementPrinciplesCard.tsx   # Advantages / disadvantages / win condition
├── TacticalScenarioCard.tsx       # Scenario text + SVG diagram
├── ScenarioDiagram.tsx            # SVG tactical diagram renderer
├── AltitudeAdvantageChart.tsx     # Altitude zone performance bands
├── PlaybookErrorBoundary.tsx      # Local error boundary (class component)
└── index.ts                       # Re-exports
```

## Content Layout (top to bottom)

### 1. Threat Assessment Card
- Large threat level badge (CRITICAL/HIGH/MODERATE/LOW) with color coding
- AI-generated reasoning text explaining the threat assessment
- Color scheme: red (CRITICAL), orange (HIGH), yellow (MODERATE), green (LOW)

### 2. Engagement Principles Card
- Three-column layout (responsive → stacks on mobile):
  - **Advantages** (green accent) — list of player advantages
  - **Disadvantages** (red accent) — list of player disadvantages
  - **Win Condition** (amber accent) — primary path to victory
- Military briefing card styling with section-label headers

### 3. Tactical Scenarios (3 cards)
- Each card contains:
  - **Title** — scenario name (e.g., "Head-On Merge", "Defensive Break")
  - **Situation** — what's happening (text)
  - **Response** — what to do (text)
  - **SVG Diagram** — top-down tactical view (if diagram_data present)
- Cards laid out in responsive grid: 1 col mobile, 2-3 cols desktop

### 4. Altitude Advantage Chart
- Vertical band chart showing performance advantage by altitude zone
- Each zone: altitude range + advantage level (STRONG/SLIGHT/NEUTRAL/DISADVANTAGE)
- Color-coded bands: green (advantage) → yellow (neutral) → red (disadvantage)
- Labels with altitude ranges in meters

## SVG Tactical Diagram Specification

### Data Schema (DiagramData)

Extend the existing `TacticalScenario` type's optional `diagram_data`:

```typescript
interface DiagramData {
  player: { x: number; y: number; heading: number };
  enemy: { x: number; y: number; heading: number };
  arrows?: { from: 'player' | 'enemy'; to: [number, number]; label?: string }[];
  zones?: { x: number; y: number; radius: number; type: 'danger' | 'safe' | 'engage' }[];
  annotations?: { x: number; y: number; text: string }[];
}
```

- Coordinates: 0-100 grid (percentage-based, scales with container)
- Headings: degrees (0 = north/up, 90 = east/right)
- Zone types map to colors: danger=red, safe=green, engage=amber

### SVG Component (ScenarioDiagram.tsx)
- ViewBox: 0 0 200 200
- Background: subtle grid lines (military map aesthetic)
- Aircraft markers: triangular arrows showing heading direction
  - Player: aviation-amber fill
  - Enemy: red fill
- Movement arrows: dashed lines with arrowheads
- Zones: semi-transparent colored circles
- Annotations: small text labels
- Compass rose in corner

### AI Prompt Update

The matchup playbook prompt in `ai-service.ts` needs updating to:
1. Define the DiagramData JSON schema in the prompt
2. Request diagram_data for each tactical scenario
3. Constrain coordinates to 0-100 range, headings to 0-360

## Data Flow

```
useMatchupPlaybook(playerAircraft, enemyAircraft)
  → Check IndexedDB cache (key: {playerId}_vs_{enemyId}@{version})
  → If miss: call generateMatchupPlaybook() in ai-service.ts
  → GPT-4o-mini returns MatchupPlaybook JSON
  → Store in IndexedDB cache
  → Return to TacticalPlaybookTab

TacticalPlaybookTab
  → Passes playbook.threat_assessment → ThreatAssessmentCard
  → Passes playbook.engagement_principles → EngagementPrinciplesCard
  → Maps playbook.tactical_scenarios → TacticalScenarioCard[]
  → Each scenario.diagram_data → ScenarioDiagram
  → Passes playbook.altitude_advantage_guide → AltitudeAdvantageChart
```

## Styling

Matches established military briefing aesthetic:
- Container: `bg-aviation-surface/60 border border-aviation-border rounded-lg p-6 backdrop-blur-sm`
- Section headers: horizontal line + `section-label` class
- Colors: aviation-amber primary, green/red for positive/negative
- Animations: Framer Motion stagger (100ms), respects prefers-reduced-motion
- Typography: `font-header uppercase tracking-wider` for headers, `font-mono` for data

## Error Handling

- PlaybookErrorBoundary wraps all content (same pattern as FlightAcademyErrorBoundary)
- Missing diagram_data → hide diagram, show text-only card
- AI generation failure → error message with retry button
- AI disabled → configuration instructions (same as Flight Academy)

## Accessibility

- Tab bar: `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`
- Arrow key navigation between tabs
- `role="tabpanel"` on content with `aria-labelledby`
- SVG diagrams: `role="img"` with `aria-label` describing the scenario
- Threat levels: not conveyed by color alone (text labels always present)
- `aria-live="polite"` on generation loading state

## Implementation Phases

### 3A: Tab Integration + Container
- Add tab bar to BriefingDetailPage (same pattern as AircraftDetailPage)
- Create TacticalPlaybookTab container with useMatchupPlaybook
- Create PlaybookEmptyState with generate button
- Create PlaybookErrorBoundary

### 3B: Content Components
- ThreatAssessmentCard
- EngagementPrinciplesCard
- AltitudeAdvantageChart

### 3C: Tactical Scenarios + SVG Diagrams
- TacticalScenarioCard
- ScenarioDiagram (SVG renderer)
- Update DiagramData type in curated.ts
- Update AI prompt in ai-service.ts for diagram data

### 3D: Polish
- Animations (Framer Motion stagger, reduced motion)
- Accessibility pass (ARIA, keyboard nav)
- Responsive verification
- Build + test verification

## Files to Modify

**New files (8):**
- `src/components/tacticalplaybook/TacticalPlaybookTab.tsx`
- `src/components/tacticalplaybook/PlaybookEmptyState.tsx`
- `src/components/tacticalplaybook/ThreatAssessmentCard.tsx`
- `src/components/tacticalplaybook/EngagementPrinciplesCard.tsx`
- `src/components/tacticalplaybook/TacticalScenarioCard.tsx`
- `src/components/tacticalplaybook/ScenarioDiagram.tsx`
- `src/components/tacticalplaybook/AltitudeAdvantageChart.tsx`
- `src/components/tacticalplaybook/PlaybookErrorBoundary.tsx`
- `src/components/tacticalplaybook/index.ts`

**Modified files (3):**
- `src/pages/BriefingDetailPage.tsx` — add tab bar + playbook tab
- `src/types/curated.ts` — add DiagramData type
- `src/lib/ai-service.ts` — update matchup playbook prompt for diagram data

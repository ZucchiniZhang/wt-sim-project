# Phase 4: Mission Planner — Design Document

**Date:** 2026-02-02
**Phase:** 4 of 7
**Status:** Design Complete, Ready for Implementation

---

## Overview

The Mission Planner is a new top-level page (`#/mission-planner`) that lets pilots plan their session from the bracket/schedule perspective. It answers two questions:

1. **"What bracket is active right now, and what will I face?"** — Bracket-aware lineup builder with threat preview
2. **"When should I play this week to fly my favorite plane?"** — Weekly schedule browser with BR highlighting

No new data infrastructure needed — this page composes existing hooks, stores, and logic functions into a new UI.

---

## Page Layout

```
┌─────────────────────────────────────────────┐
│ HEADER  [Home] [Mission Planner]            │
├─────────────────────────────────────────────┤
│ ┌─ MISSION PLANNER HEADER ────────────────┐ │
│ │ Cycle B · Day 1/2 · Next rotation: 14h  │ │
│ │ [A] [B] [C] [D]  ← manual override      │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─ LEFT (60%) ───────┐ ┌─ RIGHT (40%) ───┐ │
│ │ Bracket Selector    │ │ Team Config     │ │
│ │ EC1 EC2 EC3 EC4 .. │ │ Preset: [v]     │ │
│ │ (click to select)   │ │ Team A | Team B │ │
│ │                     │ │ [drag nations]  │ │
│ └─────────────────────┘ └─────────────────┘ │
│                                             │
│ ┌─ PRE-FLIGHT INTEL ─────────────────────┐  │
│ │ Summary: 127 enemies · 4 nations       │  │
│ │ Aircraft Quick-Picker: [your planes]   │  │
│ │ Top 5 Threats + Nation Breakdown        │  │
│ │ [ Launch Matchup Analysis → ]          │  │
│ └────────────────────────────────────────┘  │
│                                             │
│ ┌─ WEEKLY SCHEDULE ──────────────────────┐  │
│ │ Highlight BR: [4.0]                    │  │
│ │ Mon | Tue | Wed | Thu | Fri | Sat | Sun│  │
│ │  B  |  B  |  C  |  C  |  D  |  D  | A │  │
│ │ [brackets per day with BR highlights]  │  │
│ └────────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

Mobile: single column stack (header → brackets → team config → intel → schedule).

---

## Component Specifications

### 1. MissionPlannerHeader

**Purpose:** Shows current rotation status with manual override.

**Content:**
- Current cycle letter (A/B/C/D) with bold badge
- Day indicator ("Day 1 of 2")
- Countdown timer to next rotation (updates every second via `setInterval`)
- Four cycle buttons [A] [B] [C] [D] — active one highlighted
- When manually overridden: amber "Manual" badge + "Reset to auto" link

**Data:** `useBrackets()` → `cycleInfo` for auto-detection. Local state for override.

**Countdown:** Calculate from `cycleInfo.nextRotation` — display `{hours}h {minutes}m {seconds}s`.

### 2. BracketSelector

**Purpose:** Grid of clickable bracket cards for the selected cycle.

**Content per card:**
- Bracket name (e.g., "EC 4")
- BR range (e.g., "3.3 – 5.0")
- Aircraft count badge (how many aircraft exist in this BR range)
- Selected state: bright amber border + filled background

**Layout:** Responsive grid — 2 columns mobile, 3 tablet, 4 desktop.

**Interaction:** Click to select. Only one bracket selected at a time. Selection drives PreFlightIntel.

**Data:** Brackets from the active cycle (auto or override). Aircraft count from `useAircraft()` filtered by BR range.

### 3. TeamConfigurator

**Purpose:** Full team customization with preset picker and drag-and-drop nation assignment.

**Preset Selector (top):**
- Row of compact cards: Default, WW2 Classic, Cold War, NATO vs Warsaw, Custom
- Active preset highlighted with amber border
- Selecting a preset resets nations to that preset's assignment
- "Custom" auto-activates when nations are manually moved

**Team Columns (main):**
- Two columns: "TEAM A" (left) and "TEAM B" (right)
- Each nation shows: flag emoji + name + aircraft count in selected bracket
- Color coding: Team A = blue tint, Team B = red tint

**Drag-and-Drop:**
- Native HTML Drag and Drop API
- `draggable="true"` on nation items
- `onDragOver` / `onDrop` on team columns
- Visual feedback: ghost element while dragging, drop zone highlight
- Mobile fallback: tap nation → tap target column header to move

**Data:** `useTeamConfigStore` — reads presets, calls `setActivePreset()` or `setCustomTeamA()/setCustomTeamB()`.

### 4. PreFlightIntel

**Purpose:** Shows what you'll face in the selected bracket + team configuration, with aircraft selection and matchup launch.

**States:**
1. **No bracket selected:** "Select a bracket above to see threat intel"
2. **Bracket selected, no aircraft:** Summary + aircraft quick-picker
3. **Aircraft selected:** Full threat preview + launch button

**Summary Bar:**
- Enemy aircraft count
- Ally aircraft count
- Number of enemy nations

**Aircraft Quick-Picker:**
- Compact scrollable grid of your team's aircraft in this bracket
- Each item: aircraft name (truncated) + BR badge + nation flag
- Click to select as your planned aircraft
- Search/filter input at top

**Threat Overview (once aircraft selected):**
- Top 5 threats with threat level badges (reuses `assessThreat()`)
- Nation breakdown bar chart (horizontal bars per nation showing aircraft count)
- Prominent "Launch Matchup Analysis →" button

**Launch Action:** Sets `selectedAircraft` in `selectionStore`, then navigates to `#/matchup`.

**Data:** `useAircraft()` filtered by bracket BR + team nations. `assessThreat()` from `threat-analysis.ts`. `matchup-logic.ts` functions for enemy/ally determination.

### 5. WeeklySchedule

**Purpose:** Visual calendar showing the full week's bracket rotation with BR highlighting.

**Layout:** 7-column grid (Monday through Sunday).

**Per Day Cell:**
- Date (e.g., "Feb 3")
- Cycle letter badge (A/B/C/D) with color
- List of bracket names + BR ranges
- "TODAY" badge on current day + amber border
- Past days slightly dimmed

**BR Highlight:**
- Input at top: "Highlight brackets for BR: [___]" (number input, 1.0-14.3)
- When set, brackets containing that BR get an amber glow/highlight
- Answers: "When can I fly my 4.0 Spitfire this week?"

**Data:** Pure calculation — call `getCycleInfo()` for each day of the current week (Mon-Sun). No API needed.

**Mobile:** Horizontal scroll or collapsed accordion (one day per row).

---

## Router Changes

**src/lib/router.ts:**
```typescript
// Add to Route union:
| { page: 'mission-planner' }

// Add path helper:
export const missionPlannerPath = () => '#/mission-planner';

// Add to parseHash():
case 'mission-planner': return { page: 'mission-planner' };
```

**src/App.tsx:**
- Add lazy import: `const MissionPlannerPage = lazy(() => import('./pages/MissionPlannerPage'))`
- Add route case in switch

**src/components/layout/Header.tsx:**
- Add "Mission Planner" nav link (aviation-amber styled)

---

## File Structure

```
src/components/missionplanner/
├── MissionPlannerHeader.tsx      # Cycle status + countdown + override
├── BracketSelector.tsx           # Clickable bracket card grid
├── TeamConfigurator.tsx          # Preset picker + DnD nation columns
├── PreFlightIntel.tsx            # Summary + aircraft picker + threats
├── WeeklySchedule.tsx            # 7-day calendar with BR highlight
└── index.ts                      # Re-exports

src/pages/
└── MissionPlannerPage.tsx        # Container, local state, composition
```

---

## State Management

**No new stores or hooks needed.**

**Local state in MissionPlannerPage:**
```typescript
const [cycleOverride, setCycleOverride] = useState<string | null>(null);
const [selectedBracketId, setSelectedBracketId] = useState<string | null>(null);
const [selectedAircraftId, setSelectedAircraftId] = useState<string | null>(null);
const [highlightBR, setHighlightBR] = useState<number | null>(null);
```

**Existing infrastructure used:**
| Source | Used For |
|--------|----------|
| `useBrackets()` | Bracket data, cycle info, rotation |
| `useAircraft()` | Aircraft database + filtering |
| `useTeamConfigStore` | Team presets + custom teams |
| `useSelectionStore` | Setting selected aircraft for matchup launch |
| `matchup-logic.ts` | Enemy/ally determination |
| `threat-analysis.ts` | Threat scoring for top threats |
| `rotation.ts` | Weekly schedule calculation |

---

## Styling

Follows established military briefing aesthetic:
- Cards: `bg-aviation-surface/60 border border-aviation-border rounded-lg`
- Accents: `aviation-amber` for selected states and highlights
- Countdown timer: `font-mono` for numbers
- Team A: blue tint (`blue-400/10` background)
- Team B: red tint (`red-400/10` background)
- Bracket cards: compact, grid layout, amber border on selection
- Weekly schedule: subtle grid lines, cycle badges color-coded

---

## Accessibility

- Bracket cards: `role="radiogroup"` with `role="radio"` per card
- Team configurator: `aria-label` on drag zones, keyboard reorder with arrow keys
- Countdown: `aria-live="polite"` (updates every 60s for screen readers, visual every 1s)
- Weekly schedule: `role="table"` with proper headers
- All interactive elements: `focus:ring-2 focus:ring-aviation-amber`
- Mobile drag fallback: tap-to-select interaction fully keyboard accessible

---

## Implementation Phases

### Phase 4A: Router + Page Shell + Header
- Add route, lazy import, nav link
- MissionPlannerPage container with local state
- MissionPlannerHeader with cycle display + countdown + override buttons

### Phase 4B: Bracket Selector + Team Configurator
- BracketSelector card grid with selection
- TeamConfigurator with presets + drag-and-drop nation columns

### Phase 4C: Pre-Flight Intel
- Summary bar with enemy/ally counts
- Aircraft quick-picker grid
- Threat overview with top 5 + nation breakdown
- Launch button wiring

### Phase 4D: Weekly Schedule
- 7-day calendar grid
- BR highlight input
- Cycle calculation per day
- Today indicator

### Phase 4E: Polish
- Animations (Framer Motion stagger, reduced-motion support)
- Error boundary
- Mobile responsive verification
- Accessibility pass

# Phase 5: Visual Polish — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add corner bracket decorations, scanline textures, and AI-generated badge to all Flight Academy/Playbook/Mission Planner cards, plus unify navigation and fix rendering bugs.

**Architecture:** Pure CSS utilities (`.corner-brackets`, `.scanlines`) added to `index.css`, applied via className to existing components. AI badge is inline JSX. Header fix adds Mission Planner nav link to HomePage header.

**Tech Stack:** CSS (pseudo-elements, SVG data URIs, repeating-linear-gradient), React/TypeScript, Tailwind

---

### Task 1: Corner Brackets CSS Utility

**Files:**
- Modify: `src/index.css` (after line 101, before the reduced-motion section)

**Step 1: Add the `.corner-brackets` class to index.css**

Add this CSS after the `.section-label` rule (line 101) and before the `@media (prefers-reduced-motion)` block (line 103):

```css
/* Corner bracket decorations — military briefing aesthetic */
.corner-brackets {
  position: relative;
}

.corner-brackets::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  border-radius: inherit;
  /* 4 L-shaped corner marks via SVG overlay */
  background-image:
    /* top-left */
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Cpath d='M0 10V0h10' fill='none' stroke='%23d4a843' stroke-opacity='0.4' stroke-width='1'/%3E%3C/svg%3E"),
    /* top-right */
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Cpath d='M10 10V0H0' fill='none' stroke='%23d4a843' stroke-opacity='0.4' stroke-width='1'/%3E%3C/svg%3E"),
    /* bottom-left */
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Cpath d='M0 0v10h10' fill='none' stroke='%23d4a843' stroke-opacity='0.4' stroke-width='1'/%3E%3C/svg%3E"),
    /* bottom-right */
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Cpath d='M10 0v10H0' fill='none' stroke='%23d4a843' stroke-opacity='0.4' stroke-width='1'/%3E%3C/svg%3E");
  background-position:
    4px 4px,
    calc(100% - 4px) 4px,
    4px calc(100% - 4px),
    calc(100% - 4px) calc(100% - 4px);
  background-size: 10px 10px;
  background-repeat: no-repeat;
}
```

**Step 2: Verify build passes**

Run: `npx tsc --noEmit && npx vite build`
Expected: Build succeeds (CSS-only change)

**Step 3: Commit**

```bash
git add src/index.css
git commit -m "style: add corner-brackets CSS utility class"
```

---

### Task 2: Scanlines CSS Utility

**Files:**
- Modify: `src/index.css` (after the corner-brackets class)

**Step 1: Add the `.scanlines` class to index.css**

Add immediately after the `.corner-brackets::before` rule:

```css
/* Scanline overlay — CRT/military monitor texture for empty/loading states */
.scanlines {
  position: relative;
  overflow: hidden;
}

.scanlines::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 1px,
    rgba(0, 0, 0, 0.06) 1px,
    rgba(0, 0, 0, 0.06) 2px
  );
  pointer-events: none;
  z-index: 1;
  border-radius: inherit;
}
```

**Step 2: Verify build**

Run: `npx tsc --noEmit && npx vite build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/index.css
git commit -m "style: add scanlines CSS utility class"
```

---

### Task 3: Apply Corner Brackets to Flight Academy Components

**Files:**
- Modify: `src/components/flightacademy/TacticalOverview.tsx:30` — outer div
- Modify: `src/components/flightacademy/PerformanceQuickStats.tsx` — outer div of each stat card
- Modify: `src/components/flightacademy/CombatTacticsSection.tsx` — outer div
- Modify: `src/components/flightacademy/EnergyManagementDiagram.tsx` — outer div
- Modify: `src/components/flightacademy/PerformanceEnvelope.tsx` — outer div
- Modify: `src/components/flightacademy/MatchupThreatMatrix.tsx` — outer div
- Modify: `src/components/flightacademy/MECControlPanel.tsx` — outer div
- Modify: `src/components/flightacademy/FlightAcademyTab.tsx:185,194` — performance curve chart wrappers

**Step 1: Apply `corner-brackets` class to each component**

The pattern for every Flight Academy card component is the same. Find the outermost `<div>` that has the card styling:
```
className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-6 backdrop-blur-sm"
```

Add `corner-brackets` to that className string:
```
className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-6 backdrop-blur-sm corner-brackets"
```

Apply this to ALL 9 locations listed above.

For `FlightAcademyTab.tsx`, the performance curve chart wrappers at lines 185 and 194 also have this card pattern — add `corner-brackets` to both.

**Step 2: Verify build**

Run: `npx tsc --noEmit && npx vite build`
Expected: Build succeeds

**Step 3: Visual verification**

Open `http://localhost:5177/#/aircraft/p-51d-5`, click Flight Academy tab. If AI content has been generated, all section cards should show small amber L-shaped corner marks 4px inside each corner. If not generated, only the empty state card will be visible (handled in Task 5).

**Step 4: Commit**

```bash
git add src/components/flightacademy/
git commit -m "style: apply corner brackets to Flight Academy cards"
```

---

### Task 4: Apply Corner Brackets + Scanlines to Empty States & Loading

**Files:**
- Modify: `src/components/flightacademy/EmptyStateCard.tsx:21,89` — both card divs (disabled + enabled)
- Modify: `src/components/flightacademy/FlightAcademyTab.tsx:65` — LoadingSkeleton cards
- Modify: `src/components/tacticalplaybook/PlaybookEmptyState.tsx:28,86` — both card divs
- Modify: `src/components/tacticalplaybook/TacticalPlaybookTab.tsx:58` — LoadingSkeleton cards
- Modify: `src/components/flightacademy/FlightAcademyErrorBoundary.tsx` — error panel
- Modify: `src/components/tacticalplaybook/PlaybookErrorBoundary.tsx` — error panel

**Step 1: Add `corner-brackets scanlines` to empty state cards**

In `EmptyStateCard.tsx`, both the `!aiEnabled` branch (line 21) and the `aiEnabled` branch (line 89) have a `<motion.div>` with:
```
className="bg-aviation-surface/60 border border-dashed border-aviation-border rounded-lg p-8 max-w-2xl mx-auto"
```

Add `corner-brackets scanlines` to both:
```
className="bg-aviation-surface/60 border border-dashed border-aviation-border rounded-lg p-8 max-w-2xl mx-auto corner-brackets scanlines"
```

Apply the same to `PlaybookEmptyState.tsx` at the equivalent locations.

**Step 2: Add `scanlines` to loading skeletons**

In `FlightAcademyTab.tsx` `LoadingSkeleton` function (line 61-83), the outer `<div>` with `className="space-y-6"` — add `scanlines` to each skeleton card div (the ones with `animate-pulse`):

```
className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-6 backdrop-blur-sm animate-pulse scanlines"
```

Same for `TacticalPlaybookTab.tsx` `LoadingSkeleton`.

**Step 3: Add `corner-brackets` to error boundaries**

In both `FlightAcademyErrorBoundary.tsx` and `PlaybookErrorBoundary.tsx`, add `corner-brackets` to the error display div.

**Step 4: Verify build**

Run: `npx tsc --noEmit && npx vite build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/components/flightacademy/ src/components/tacticalplaybook/
git commit -m "style: apply corner brackets and scanlines to empty/loading/error states"
```

---

### Task 5: Apply Corner Brackets to Tactical Playbook Components

**Files:**
- Modify: `src/components/tacticalplaybook/ThreatAssessmentCard.tsx` — outer div
- Modify: `src/components/tacticalplaybook/EngagementPrinciplesCard.tsx` — outer div
- Modify: `src/components/tacticalplaybook/TacticalScenarioCard.tsx` — outer div
- Modify: `src/components/tacticalplaybook/AltitudeAdvantageChart.tsx` — outer div

**Step 1: Apply `corner-brackets` class**

Same pattern as Task 3. Find each component's outermost card div with the standard card styling and add `corner-brackets`.

**Step 2: Verify build**

Run: `npx tsc --noEmit && npx vite build`

**Step 3: Commit**

```bash
git add src/components/tacticalplaybook/
git commit -m "style: apply corner brackets to Tactical Playbook cards"
```

---

### Task 6: Apply Corner Brackets to Mission Planner Components

**Files:**
- Modify: `src/components/missionplanner/MissionPlannerHeader.tsx` — outer card div
- Modify: `src/components/missionplanner/BracketSelector.tsx` — outer card div (the container, not individual bracket cards)
- Modify: `src/components/missionplanner/TeamConfigurator.tsx` — outer card div
- Modify: `src/components/missionplanner/PreFlightIntel.tsx` — outer card div
- Modify: `src/components/missionplanner/WeeklySchedule.tsx` — outer card div

**Step 1: Apply `corner-brackets` class**

Same pattern. Read each file, find the outermost card-style div, add `corner-brackets`.

**Step 2: Verify build**

Run: `npx tsc --noEmit && npx vite build`

**Step 3: Commit**

```bash
git add src/components/missionplanner/
git commit -m "style: apply corner brackets to Mission Planner cards"
```

---

### Task 7: AI-Generated Badge

**Files:**
- Modify: `src/components/flightacademy/FlightAcademyTab.tsx:142-151` — add badge above content
- Modify: `src/components/tacticalplaybook/TacticalPlaybookTab.tsx:129-138` — add badge above content

**Step 1: Add AI badge to FlightAcademyTab**

In `FlightAcademyTab.tsx`, inside the content `<motion.div>` (line 144), add as the first child BEFORE the TacticalOverview section:

```tsx
{/* AI Generated badge */}
<div className="flex justify-end">
  <span
    className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-green-400 bg-green-500/10 border border-green-500/30 rounded"
    title={`Generated ${guide.generated_at}`}
    aria-label="Content generated by AI"
  >
    <span className="w-1.5 h-1.5 rounded-full bg-green-400" aria-hidden="true" />
    AI Generated
  </span>
</div>
```

**Step 2: Add AI badge to TacticalPlaybookTab**

Same pattern in `TacticalPlaybookTab.tsx`, inside the content `<motion.div>` (line 131), as first child:

```tsx
{/* AI Generated badge */}
<div className="flex justify-end">
  <span
    className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-green-400 bg-green-500/10 border border-green-500/30 rounded"
    title={`Generated ${playbook.generated_at}`}
    aria-label="Content generated by AI"
  >
    <span className="w-1.5 h-1.5 rounded-full bg-green-400" aria-hidden="true" />
    AI Generated
  </span>
</div>
```

**Step 3: Verify build**

Run: `npx tsc --noEmit && npx vite build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/flightacademy/FlightAcademyTab.tsx src/components/tacticalplaybook/TacticalPlaybookTab.tsx
git commit -m "feat: add AI Generated badge to Flight Academy and Tactical Playbook"
```

---

### Task 8: Header Unification

**Files:**
- Modify: `src/pages/HomePage.tsx:43-96` — add Mission Planner nav link
- Modify: `src/pages/MissionPlannerPage.tsx:55` — replace `<Header />` with matching inline header that includes Home link

**Step 1: Investigate header approach**

The HomePage has a custom inline header (lines 43-96) with "WT SIM" branding, mode toggle (Encyclopedia/Briefing), and aircraft count. The MissionPlannerPage uses `<Header />` from `layout/Header.tsx` which has "WAR THUNDER" branding and Home/Mission Planner nav links.

**Best approach:** Add a "Mission Planner" link to the HomePage header, and update the `<Header />` component to show "WT SIM" branding instead of "WAR THUNDER" to match the main app identity. Also add a "Home" link back.

**Step 2: Update Header.tsx to match app branding**

In `src/components/layout/Header.tsx`, change the logo section to match HomePage's "WT SIM / Matchup Intelligence System" branding:

Replace the logo div (lines 27-36):
```tsx
<div className="flex items-center gap-3">
  <div className="w-10 h-10 border border-aviation-amber/30 rounded-full flex items-center justify-center">
    <div className="w-2.5 h-2.5 bg-aviation-amber rounded-full" />
  </div>
  <div>
    <h1 className="text-xl font-header font-bold text-aviation-amber tracking-wide">
      WT SIM
    </h1>
    <p className="section-label -mt-1">
      Matchup Intelligence System
    </p>
  </div>
</div>
```

**Step 3: Add Mission Planner link to HomePage header**

In `src/pages/HomePage.tsx`, add a "Mission Planner" link in the header nav area. After the mode toggle buttons and before the aircraft count:

```tsx
<a
  href="#/mission-planner"
  className="text-xs text-aviation-text-muted hover:text-aviation-amber transition-colors px-2 py-1"
>
  Mission Planner
</a>
```

**Step 4: Verify build and navigation**

Run: `npx tsc --noEmit && npx vite build`
Test: Navigate between Home and Mission Planner. Both headers should look consistent.

**Step 5: Commit**

```bash
git add src/components/layout/Header.tsx src/pages/HomePage.tsx
git commit -m "style: unify header branding between Home and Mission Planner"
```

---

### Task 9: Bug Fix — Flight Academy Empty State Visibility

**Files:**
- Investigate: `src/components/flightacademy/EmptyStateCard.tsx`
- Investigate: `src/pages/AircraftDetailPage.tsx` — tab panel rendering

**Step 1: Investigate the issue**

Navigate to `http://localhost:5177/#/aircraft/p-51d-5` and click Flight Academy tab. The screenshot showed the tab content area was empty — the EmptyStateCard instructions weren't visible.

Check:
1. Is the `FlightAcademyTab` component rendering? (Snapshot showed config instructions in DOM but they weren't visible in screenshot)
2. Is there an overflow or height issue on the tab panel?
3. Is the card rendering below the fold?

**Step 2: Fix based on investigation**

Most likely the card IS rendering but is below the aircraft image hero section. The user needs to scroll down. If that's the case, consider adding a visual indicator or adjusting the tab panel height.

If it's actually not rendering, debug the `useTacticalGuide` hook state flow.

**Step 3: Verify and commit**

```bash
git add [affected files]
git commit -m "fix: ensure Flight Academy empty state is visible"
```

---

### Task 10: Build Verification and Visual QA

**Step 1: Full build check**

Run: `npx tsc --noEmit && npx vite build`
Expected: Zero errors, no size regression > 1KB

**Step 2: Test check**

Run: `npm test`
Expected: All existing tests pass

**Step 3: Visual QA checklist**

Open dev server and verify:
- [ ] `/#/aircraft/p-51d-5` → Flight Academy tab → corner brackets visible on empty state card
- [ ] `/#/aircraft/p-51d-5` → Flight Academy tab → scanlines visible on empty state card
- [ ] `/#/mission-planner` → corner brackets on all section cards
- [ ] `/#/mission-planner` → header shows "WT SIM" branding
- [ ] `/#/` → "Mission Planner" link visible in header
- [ ] Navigation between Home ↔ Mission Planner works

**Step 4: Final commit (if any cleanup needed)**

```bash
git add -A
git commit -m "chore: Phase 5 visual polish complete"
```

---

### Task 11: Update IMPROVEMENTS.md

**Files:**
- Modify: `wt-sim-matchup/IMPROVEMENTS.md` — Phase 5 section

**Step 1: Update Phase 5 status**

Replace the Phase 5 section (lines 937-951) with detailed completion notes following the pattern of Phases 1-4.

**Step 2: Update overall progress**

Change Phase 5 line from `⬜ Phase 5: Visual Polish (🟣 OPUS)` to `✅ Phase 5: Visual Polish (🟣 OPUS)` and update the phases complete count from 4/7 to 5/7.

**Step 3: Commit**

```bash
git add IMPROVEMENTS.md
git commit -m "docs: update IMPROVEMENTS.md with Phase 5 completion notes"
```

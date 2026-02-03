# Flight Academy Tab - Visual Design Specification

**Date:** 2026-02-02
**Phase:** Phase 2 - Flight Academy Tab Implementation
**Status:** Design Complete - Ready for Implementation

---

## Overview

Transform the Aircraft Detail Page into a comprehensive flight academy by adding a new "Flight Academy" tab with AI-generated tactical guides and rich visual performance data. This will be the ultimate one-stop resource for pilots to master any airframe in War Thunder Simulator Battles.

**Design Principles:**
- **Visual-first approach** - Charts, graphs, and diagrams over text walls
- **Comprehensive data** - Combine AI tactical advice + curated performance data + raw stats
- **Military briefing aesthetic** - Phosphor green, scanlines, corner brackets, dashed borders
- **Progressive enhancement** - Core features work without AI, enhanced with AI
- **Persistent caching** - Generate once, cached forever via IndexedDB

---

## 1. Architecture & Tab Structure

### High-Level Page Modification

Modify `AircraftDetailPage.tsx` to add tab navigation below the hero section:

```
<AircraftDetailPage>
  <Header /> {/* Existing sticky header */}
  <AircraftHero /> {/* Existing hero */}

  <TabBar activeTab={tab} onTabChange={setTab} /> {/* NEW */}

  {tab === 'overview' ? (
    <OverviewContent /> {/* Existing content: stats, armament, curated intel, charts */}
  ) : (
    <FlightAcademyTab aircraft={aircraft} /> {/* NEW: AI tactical guide */}
  )}
</AircraftDetailPage>
```

### Tab Bar Component

Create simple tab bar with two tabs:
- **"Overview"** - Default view (existing content)
- **"Flight Academy"** - New AI tactical guide

**Visual Design:**
- Inline buttons with active state
- Active tab: aviation-amber bottom border (2px)
- Hover: slight amber glow
- Click: smooth transition between views
- State: `useState<'overview' | 'academy'>('overview')`

### New Component Structure

```
src/components/flightacademy/
├── FlightAcademyTab.tsx           # Main container (uses useTacticalGuide hook)
├── EmptyStateCard.tsx             # "Generate Guide" prompt when no cache
├── TacticalOverview.tsx           # Role, envelope chart, energy badge
├── PerformanceQuickStats.tsx      # 3-card mini-chart grid (speed/climb/turn)
├── CombatTacticsSection.tsx       # Tactics text + performance radar chart
├── EnergyManagementDiagram.tsx    # Visual energy state diagram
├── PerformanceEnvelope.tsx        # Optimal altitude/speed zone chart
├── MatchupThreatMatrix.tsx        # Visual matchup grid with threat levels
├── MECControlPanel.tsx            # Visual MEC settings (conditional)
└── index.ts                       # Re-exports
```

---

## 2. Empty State & Generation Flow

### User Flow

1. **First Visit (No Cache):**
   - Tab shows `EmptyStateCard` with "Generate Tactical Guide" button
   - Clear messaging about what will be generated
   - Hint: "Generated once, cached forever"

2. **User Clicks Generate:**
   - Loading overlay appears
   - "Generating tactical guide..." with spinner
   - "This may take 10-15 seconds" subtext
   - Button disabled during generation

3. **Generation Complete:**
   - Data saved to IndexedDB cache
   - Full tactical guide content appears
   - Smooth fade-in animation

4. **Future Visits:**
   - Instant load from cache (even after browser restart)
   - No API call needed
   - 99% cache hit rate after initial generation

### EmptyStateCard Design

**Visual Layout:**
```
┌─────────────────────────────────────────┐
│         [Icon: Tactical Document]       │
│                                         │
│     TACTICAL GUIDE AVAILABLE            │
│                                         │
│  Generate AI-powered tactical analysis  │
│  for this aircraft                      │
│                                         │
│  ✓ Combat tactics & energy management   │
│  ✓ Matchup recommendations              │
│  ✓ Performance optimization             │
│  ✓ MEC guidance (if applicable)         │
│                                         │
│     [Generate Tactical Guide] button    │
│                                         │
│  💡 Generated once, cached forever      │
└─────────────────────────────────────────┘
```

**Styling:**
- Dashed border (`border-dashed border-aviation-border`)
- Centered content with padding
- aviation-amber icon and button
- Muted text for description
- Military briefing aesthetic

### State Management

`FlightAcademyTab.tsx` handles all states via `useTacticalGuide` hook:

```tsx
const { guide, loading, error, generating, generate, aiEnabled } = useTacticalGuide(aircraft);

// States:
// 1. loading=true → Skeleton loader (checking cache)
// 2. guide=null && aiEnabled=true → EmptyStateCard
// 3. guide exists → Full tactical content
// 4. aiEnabled=false → Configuration prompt
// 5. error exists → Error card with retry
// 6. generating=true → Loading overlay on empty state
```

---

## 3. Visual Content Layout (Full Hierarchy)

### Overall Layout Structure

```
FlightAcademyTab
├─ 1. Tactical Overview Card
│   └─ Role, performance envelope chart, energy badge
│
├─ 2. Performance at a Glance (3-column grid)
│   ├─ Speed mini-chart
│   ├─ Climb mini-chart
│   └─ Turn mini-chart
│
├─ 3. Combat Tactics Section (2-column)
│   ├─ Tactical guide text (200-300 words)
│   └─ Performance radar chart (6-axis)
│
├─ 4. Energy Management Diagram
│   └─ Visual energy state diagram
│
├─ 5. Matchup Threat Matrix
│   └─ Visual grid with threat bars
│
├─ 6. Performance Curves (2-column)
│   ├─ Speed vs Altitude (full chart)
│   └─ Climb Profile (full chart)
│
└─ 7. MEC Control Panel (conditional)
    └─ Visual gauge controls for engine management
```

**Mobile Responsiveness:**
- Desktop: Full multi-column layouts
- Tablet: 2-column for most sections
- Mobile: Single column stack

---

## 4. Component Specifications

### 4.1 TacticalOverview.tsx

**Purpose:** High-level aircraft role and performance envelope

**Data Sources:**
- `TacticalGuide.primary_role`
- `TacticalGuide.optimal_envelope`
- `TacticalGuide.energy_management`

**Visual Layout:**
```
┌─────────────────────────────────────────────┐
│ ──── TACTICAL OVERVIEW                      │
│                                             │
│ [Large] PRIMARY ROLE                        │
│ High-altitude escort fighter                │
│                                             │
│ PERFORMANCE ENVELOPE (Visual Chart)         │
│     Altitude                                │
│   6km ┤     ╔════════╗  [Optimal Zone]     │
│   5km ┤     ║████████║  (shaded green)     │
│   4km ┤     ╚════════╝                      │
│   3km ┤                                     │
│       └──────────────────                   │
│         300  400  500 km/h                  │
│                                             │
│ [Badge: EXCELLENT ENERGY RETENTION]         │
│                                             │
│ SWEET SPOT STATS                            │
│ Optimal Altitude:  4.0 - 6.0 km            │
│ Optimal Speed:     350 - 450 km/h          │
│ Energy Rating:     ████████░░ (8/10)       │
│                                             │
│ Energy Guidance:                            │
│ "Maintains speed well in vertical..."      │
└─────────────────────────────────────────────┘
```

**Key Features:**
- Primary role prominent at top (large text, aviation-amber)
- Visual envelope chart (altitude vs speed with shaded optimal zone)
- Energy retention badge (color-coded: excellent=green, good=blue, average=yellow, poor=red)
- Stats grid with key performance numbers
- Energy guidance text from AI

### 4.2 PerformanceQuickStats.tsx

**Purpose:** At-a-glance performance metrics with mini visualizations

**Data Sources:**
- `Aircraft.max_speed`
- `Aircraft.climb_rate`
- `Aircraft.turn_time`

**Visual Layout:**
```
┌─────────────────────────────────────────────┐
│ ──── PERFORMANCE AT A GLANCE               │
│                                             │
│  ┌────────┐  ┌────────┐  ┌────────┐       │
│  │ SPEED  │  │ CLIMB  │  │ TURN   │       │
│  │        │  │        │  │        │       │
│  │  ▲ ▲   │  │  ↑↑    │  │   ⟲    │       │
│  │ ▲   ▲  │  │   ↑    │  │  ⟲ ⟲   │       │
│  │▲     ▲ │  │    ↑   │  │ ⟲   ⟲  │       │
│  │        │  │        │  │        │       │
│  │ 650    │  │ 18.2   │  │ 22.3   │       │
│  │ km/h   │  │ m/s    │  │ sec    │       │
│  └────────┘  └────────┘  └────────┘       │
└─────────────────────────────────────────────┘
```

**Key Features:**
- Three equal-width cards
- Mini chart visualization in each (sparkline-style)
- Large number display with units
- Icon representation of metric type
- Color: aviation-amber for highlights

### 4.3 CombatTacticsSection.tsx

**Purpose:** Main tactical guide text with performance visualization

**Data Sources:**
- `TacticalGuide.combat_tactics` (200-300 words)
- `TacticalGuide.performance_notes`
- `Aircraft` stats for radar chart

**Visual Layout:**
```
┌─────────────────────────────────────────────┐
│ ──── COMBAT TACTICS                         │
│                                             │
│ [Left Column - 60%]    [Right Column - 40%] │
│                                             │
│ Tactical Guide Text    ┌────────────┐      │
│ 200-300 words with     │            │      │
│ proper paragraphs      │  6-Axis    │      │
│ and line breaks.       │  Radar     │      │
│                        │  Chart     │      │
│ Multiple paragraphs    │            │      │
│ covering:              │  Speed     │      │
│ - Opening moves        │  Climb     │      │
│ - Energy tactics       │  Turn      │      │
│ - Engagement style     │  Armament  │      │
│ - Defensive options    │  Altitude  │      │
│                        │  Dive      │      │
│                        └────────────┘      │
│                                             │
│ ──────────────────────────────              │
│ PERFORMANCE NOTES                           │
│ Key characteristics summary text            │
└─────────────────────────────────────────────┘
```

**Key Features:**
- Two-column layout (text left, chart right)
- Tactical text with excellent readability (`leading-relaxed`, line-height 1.7)
- 6-axis radar chart showing relative performance
- Performance notes section at bottom (slightly muted)
- Mobile: Stacks into single column

### 4.4 EnergyManagementDiagram.tsx

**Purpose:** Visual representation of energy states and tactics

**Data Sources:**
- `TacticalGuide.energy_management`

**Visual Concept:**
```
┌─────────────────────────────────────────────┐
│ ──── ENERGY MANAGEMENT                      │
│                                             │
│  HIGH ENERGY STATE                          │
│  ↗️ ↗️ ↗️  Boom & Zoom, Zoom Climbs        │
│  [Green zone indicator]                     │
│                                             │
│  MEDIUM ENERGY STATE                        │
│  → →  Boom & Extend, Level Turns           │
│  [Yellow zone indicator]                    │
│                                             │
│  LOW ENERGY STATE                           │
│  ↘️ ↘️  Defensive, Evasive Only            │
│  [Red zone indicator]                       │
│                                             │
│  ENERGY GUIDANCE:                           │
│  "Bleeds energy quickly in sustained        │
│   turns; prioritize vertical maneuvers"     │
└─────────────────────────────────────────────┘
```

**Key Features:**
- Three energy state zones (high/medium/low)
- Arrows indicating recommended maneuvers
- Color-coded zones (green/yellow/red)
- Text guidance from AI
- Simple, scannable visual hierarchy

### 4.5 PerformanceEnvelope.tsx

**Purpose:** Interactive chart showing optimal performance zone

**Data Sources:**
- `TacticalGuide.optimal_envelope`

**Visual Concept:**
```
┌─────────────────────────────────────────────┐
│ ──── OPTIMAL PERFORMANCE ENVELOPE           │
│                                             │
│  Altitude (km)                              │
│  8 ┤                                        │
│  7 ┤                                        │
│  6 ┤      ┏━━━━━━━━━━━━━┓  ← Max Effective │
│  5 ┤      ┃  OPTIMAL    ┃                  │
│  4 ┤      ┃   ZONE      ┃                  │
│  3 ┤      ┗━━━━━━━━━━━━━┛  ← Min Effective │
│  2 ┤                                        │
│  1 ┤                                        │
│  0 ┼────────────────────────────            │
│     0   200  400  600  800  Speed (km/h)   │
│         ↑         ↑                         │
│         Min       Max                       │
│       Combat    Combat                      │
└─────────────────────────────────────────────┘
```

**Key Features:**
- 2D chart with altitude (Y-axis) and speed (X-axis)
- Shaded optimal zone (aviation-amber/green gradient)
- Labeled min/max boundaries
- Interactive hover showing exact values
- Annotations for corner velocity, never exceed speed
- Grid lines for reference

### 4.6 MatchupThreatMatrix.tsx

**Purpose:** Visual matchup analysis with threat levels

**Data Sources:**
- `TacticalGuide.counters_well` (array of aircraft types)
- `TacticalGuide.struggles_against` (array of aircraft types)

**Visual Layout:**
```
┌─────────────────────────────────────────────┐
│ ──── MATCHUP ANALYSIS                       │
│                                             │
│ COUNTERS WELL              STRUGGLES AGAINST│
│ (Green Theme)              (Red Theme)      │
│                                             │
│ ✓ Turn fighters   ████     ✗ BnZ fighters  │
│   Confidence: 85%          Threat: HIGH     │
│                                             │
│ ✓ Heavy fighters  ███      ✗ Interceptors  │
│   Confidence: 75%          Threat: CRITICAL │
│                                             │
│ ✓ Bombers         █████    ✗ Jets          │
│   Confidence: 95%          Threat: MODERATE │
│                                             │
│ [Hover for detailed tactics]                │
└─────────────────────────────────────────────┘
```

**Key Features:**
- Two-column grid (favorable left, unfavorable right)
- Bar charts showing confidence/threat levels
- Color-coded: green for favorable, red for unfavorable
- Threat level badges (CRITICAL/HIGH/MODERATE/LOW)
- Hover tooltips with detailed matchup tactics
- Visual hierarchy with icons (✓ and ✗)

### 4.7 Performance Curves (Reuse Existing Charts)

**Purpose:** Detailed performance data from curated intel

**Data Sources:**
- `CuratedAircraftData.speed_at_altitude`
- `CuratedAircraftData.climb_profile`

**Component Reuse:**
- Use existing `SpeedAltitudeChart.tsx`
- Use existing `ClimbProfileChart.tsx`

**Layout:**
- Two-column grid (desktop)
- Full-width stacked (mobile)
- Same card styling as rest of Flight Academy

### 4.8 MECControlPanel.tsx

**Purpose:** Visual MEC (Manual Engine Controls) guidance

**Data Sources:**
- `TacticalGuide.mec_guidance` (optional, may be undefined)

**Conditional Render:**
- Only show if `mec_guidance` exists
- Check if aircraft has relevant engine controls

**Visual Layout:**
```
┌─────────────────────────────────────────────┐
│ ──── MANUAL ENGINE CONTROLS (MEC)           │
│                                             │
│ RADIATOR (Oil)                              │
│ └─░░░░░█████░░░─┘  Keep at 20-30%         │
│   0%        50%       100%                  │
│                                             │
│ RADIATOR (Water)                            │
│ └─░░░░░░░████░─┘  Open to 40% in climbs   │
│   0%        50%       100%                  │
│                                             │
│ PROPELLER PITCH                             │
│ └─░░░░░░░░░███─┘  100% climb, 85-90% cruise│
│   0%        50%       100%                  │
│                                             │
│ MIXTURE                                     │
│ └─░░░░░░░░███░─┘  90% below 3km, decrease  │
│   0%        50%       100%     with altitude│
│                                             │
│ SUPERCHARGER GEAR                           │
│ [GEAR 1] below 3km  |  [GEAR 2] above 3km  │
└─────────────────────────────────────────────┘
```

**Key Features:**
- Visual slider representations (not interactive, just visual guide)
- Optimal zones shaded in green
- Text guidance for each control
- Color-coded zones (optimal=green, caution=yellow, danger=red)
- Altitude-specific recommendations for mixture/supercharger

---

## 5. Error Handling & Edge Cases

### Error States

**1. AI Disabled (No API Key Configured):**
```
┌─────────────────────────────────────┐
│  ⚙️  AI GENERATION NOT CONFIGURED   │
│                                      │
│  To enable Flight Academy features: │
│                                      │
│  1. Get OpenAI API key from:        │
│     platform.openai.com/api-keys    │
│                                      │
│  2. Add to .env.local:               │
│     VITE_AI_API_KEY=sk-...          │
│                                      │
│  3. Enable generation:               │
│     VITE_AI_ENABLE_GENERATION=true  │
│                                      │
│  4. Restart dev server               │
│                                      │
│  [View Setup Instructions] button    │
└─────────────────────────────────────┘
```

**2. Generation Failed:**
- Display error message with specific reason
- Show retry button
- Log error details for debugging
- Preserve any partial data if available
- Common errors:
  - Rate limit exceeded (suggest waiting)
  - Network error (suggest checking connection)
  - Invalid API key (suggest reconfiguration)

**3. Missing Performance Data:**
- Performance curves: Show "No data available" if curated data missing
- Charts gracefully hide if no data
- AI tactical guide still displays (doesn't depend on curated data)
- MEC section hidden if not applicable

**4. Cache Load Failed:**
- Fall back to empty state
- Allow regeneration
- Don't block UI

### Loading States

**Initial Cache Check:**
- Show skeleton loaders for each section
- Pulse animation on placeholders
- "Loading from cache..." text

**During Generation:**
- Overlay on EmptyStateCard
- Animated spinner (military aesthetic)
- Progress text: "Generating tactical guide..."
- Subtext: "This may take 10-15 seconds"
- Disable generate button

**Data Transitions:**
- Smooth fade-in when data loads
- Stagger animation for sections (like existing page)
- No jarring layout shifts

---

## 6. Styling & Visual Design

### Military Briefing Aesthetic

**Color Palette:**
- Primary accent: `aviation-amber` (#FFA500)
- Tactical data: `text-green-400` (phosphor green)
- Backgrounds: `aviation-surface`, `aviation-charcoal`
- Borders: `aviation-border` with dashed option
- Success: `green-500/400` (favorable matchups)
- Warning: `red-500/400` (unfavorable matchups)

**Visual Effects:**
- Scanline overlay (subtle CSS animation on cards)
- Corner brackets (CSS pseudo-elements `::before`/`::after`)
- Dashed borders for "classified" aesthetic
- Glow effects on hover (aviation-amber shadow)

**Typography:**
- Headers: `font-header font-bold uppercase tracking-wider`
- Section labels: `text-xs uppercase tracking-widest`
- Stats/numbers: `font-mono`
- Body text: `text-aviation-text leading-relaxed` (line-height: 1.7)
- Tactical guide: `text-sm` with generous spacing

**Card Styling:**
```css
/* Standard card pattern */
bg-aviation-surface/60
border border-aviation-border
rounded-lg
p-5
backdrop-blur-sm
```

**Spacing:**
- Consistent `space-y-6` between major sections
- `space-y-4` within sections
- `gap-6` for grids

### Animations

**Page Transitions:**
- Tab switch: Fade out old content, fade in new (200ms)
- Smooth, no jarring shifts

**Data Loading:**
- Stagger children (like existing page)
- Each section animates in: `opacity 0→1`, `translateY 20px→0`
- Duration: 400ms with easeOut
- Stagger delay: 100ms between children

**Chart Animations:**
- Line charts: Draw from left to right (500ms)
- Bar charts: Grow from zero to value (400ms)
- Radar charts: Fade in with scale (300ms)
- Delay start until in viewport (intersection observer)

**Interactive Elements:**
- Hover: Subtle scale (1.02) and glow on buttons
- Click: Brief scale down (0.98) feedback
- Transitions: 200ms for hover, 100ms for click

**Respect User Preferences:**
```css
@media (prefers-reduced-motion: reduce) {
  /* Disable animations */
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Responsive Design

**Breakpoints:**
- Mobile: `< 640px` - Single column stack
- Tablet: `640px - 1024px` - 2-column layouts
- Desktop: `> 1024px` - Full 3-column layouts

**Mobile Optimizations:**
- Stack all grids to single column
- Reduce chart sizes
- Larger touch targets (min 44px)
- Collapse MEC sliders to list view
- Hide non-essential visual elements

**Touch Interactions:**
- Tap targets minimum 44x44px
- No hover-only interactions
- Swipe between tabs (stretch goal)

---

## 7. Data Flow & Integration

### Data Sources

**AI-Generated Data (Primary):**
- Source: `useTacticalGuide(aircraft)` hook
- Provides: `TacticalGuide` object
- Cache: IndexedDB (persistent)
- Used by: Most Flight Academy components

**Curated Performance Data (Secondary):**
- Source: `useCuratedData()` hook (existing)
- Provides: `CuratedAircraftData` object
- Used by: Performance curves, climb profile
- Static data, no generation needed

**Raw Aircraft Stats (Tertiary):**
- Source: `Aircraft` type passed from parent
- Provides: Basic stats (speed, climb, turn, BR, etc.)
- Used by: Quick stats cards, radar chart

### Component Integration

```tsx
// FlightAcademyTab.tsx
export function FlightAcademyTab({ aircraft }: { aircraft: Aircraft }) {
  const { guide, loading, error, generating, generate, aiEnabled } = useTacticalGuide(aircraft);
  const { getCuratedData } = useCuratedData();

  const curated = getCuratedData(aircraft.identifier);

  // Handle states...

  return (
    <div className="space-y-6">
      {guide ? (
        <>
          <TacticalOverview guide={guide} />
          <PerformanceQuickStats aircraft={aircraft} />
          <CombatTacticsSection guide={guide} aircraft={aircraft} />
          <EnergyManagementDiagram guide={guide} />
          <PerformanceEnvelope envelope={guide.optimal_envelope} />
          <MatchupThreatMatrix guide={guide} />
          {curated && (
            <PerformanceCurves
              speedAltitude={curated.speed_at_altitude}
              climbProfile={curated.climb_profile}
            />
          )}
          {guide.mec_guidance && (
            <MECControlPanel guidance={guide.mec_guidance} />
          )}
        </>
      ) : (
        <EmptyStateCard
          onGenerate={generate}
          generating={generating}
          aiEnabled={aiEnabled}
        />
      )}
    </div>
  );
}
```

---

## 8. Implementation Checklist

### Phase 2A: Core Structure (Day 1-2)
- [ ] Create `flightacademy/` component directory
- [ ] Implement TabBar component in AircraftDetailPage
- [ ] Create FlightAcademyTab container
- [ ] Implement EmptyStateCard with generation flow
- [ ] Test cache loading and generation states
- [ ] Verify tab switching works smoothly

### Phase 2B: Visual Components (Day 3-4)
- [ ] TacticalOverview.tsx (role, envelope chart, energy badge)
- [ ] PerformanceQuickStats.tsx (speed/climb/turn mini-charts)
- [ ] CombatTacticsSection.tsx (text + radar chart)
- [ ] EnergyManagementDiagram.tsx (energy states visual)

### Phase 2C: Advanced Visuals (Day 5-6)
- [ ] PerformanceEnvelope.tsx (altitude/speed optimal zone chart)
- [ ] MatchupThreatMatrix.tsx (visual matchup grid)
- [ ] MECControlPanel.tsx (visual MEC guidance)
- [ ] Integrate existing performance curve charts

### Phase 2D: Polish & Testing (Day 7)
- [ ] Error state handling
- [ ] Loading state refinement
- [ ] Animation implementation
- [ ] Responsive design testing (mobile/tablet/desktop)
- [ ] Accessibility pass (keyboard nav, ARIA labels)
- [ ] Cross-browser testing

### Phase 2E: Documentation (Day 8)
- [ ] Update IMPROVEMENTS.md with completion notes
- [ ] Component documentation
- [ ] Usage examples
- [ ] Known limitations

---

## 9. Success Criteria

**Functional Requirements:**
- ✅ Tab navigation works smoothly
- ✅ Generate button creates AI tactical guide
- ✅ Content caches persistently (survives browser restart)
- ✅ All visual components render correctly
- ✅ Charts animate smoothly and responsively
- ✅ Error states handled gracefully
- ✅ Mobile/tablet layouts work correctly

**User Experience:**
- ✅ Visual-first approach (more charts than text)
- ✅ Military briefing aesthetic matches existing design
- ✅ Content is comprehensive and actionable
- ✅ Loading states are clear and informative
- ✅ No jarring layout shifts or animation stutters

**Performance:**
- ✅ Initial cache load < 100ms
- ✅ AI generation completes in < 20 seconds
- ✅ Tab switching feels instant (< 200ms)
- ✅ Chart animations smooth (60fps)
- ✅ Bundle size increase < 50KB gzipped

**Quality:**
- ✅ No TypeScript errors
- ✅ No console warnings/errors
- ✅ Passes accessibility audit (keyboard nav, screen reader)
- ✅ Works in Chrome, Firefox, Safari
- ✅ Code follows existing patterns and conventions

---

## 10. Future Enhancements (Post-Phase 2)

**Phase 3 Integration:**
- Tactical scenario diagrams (visual engagement diagrams)
- Animated aircraft silhouettes
- Interactive 3D performance envelope

**Additional Features:**
- Export tactical guide as PDF
- Share tactical guide (URL with cached data)
- Compare multiple aircraft tactical guides side-by-side
- Community-contributed tactical tips integration
- Video tutorial links for complex maneuvers

**Performance Optimizations:**
- Lazy load chart libraries
- Virtual scrolling for long tactical guides
- WebGL for advanced visualizations
- Code splitting by tab (load academy code only when needed)

---

**Design Status:** ✅ COMPLETE - Ready for Implementation
**Next Step:** Begin Phase 2A implementation

# CLAUDE.md - Project Instructions for Claude Code

## Project Overview
War Thunder Sim Battle Matchup Tool - A React web app that helps pilots understand what enemies they'll face based on aircraft selection and BR brackets.

**Tech Stack:** React 18 + TypeScript + Vite + TailwindCSS + Zustand + Framer Motion

---

## 🚨 Critical Rules

### Security - NEVER Commit Secrets
- **NO API keys** in code - use `.env` files only
- **NO hardcoded credentials** of any kind
- **NO tokens, passwords, or sensitive data** in commits
- Always add `.env*` to `.gitignore` FIRST before creating env files
- If you accidentally stage a secret, stop and remove it from git history

### Before ANY Commit
```bash
# Check for secrets
git diff --staged | grep -iE "(api_key|secret|password|token|credential)"
# If anything shows up, DO NOT COMMIT
```

---

## 🔄 Subagent Processing Workflow

**MANDATORY for all significant code changes.** Use this multi-pass review workflow:

### Phase 1: Write
- Implement the feature/fix
- Write working code that compiles
- Don't worry about perfection yet

### Phase 2: Review vs Spec
Ask yourself (or spawn a review task):
- [ ] Does this match what SPEC.md describes?
- [ ] Does this fulfill the task requirements in TASKLIST.md?
- [ ] Are there any missing features or edge cases?
- [ ] Does the data flow match the architecture diagram?

### Phase 3: Review Code Quality
- [ ] TypeScript types are correct and complete
- [ ] No `any` types unless absolutely necessary
- [ ] Error handling is present
- [ ] No console.log statements left in (except intentional debug modes)
- [ ] Code is DRY - no unnecessary duplication
- [ ] Functions are focused and single-purpose
- [ ] Naming is clear and consistent

### Phase 4: Iterate/Fix
- Address all issues found in reviews
- Re-run reviews if changes were significant
- Only mark task complete when all checks pass

### Workflow Command Pattern
```
When completing a task, follow this pattern:

1. [WRITE] Implement the code
2. [SPEC-CHECK] "Does this implementation match SPEC.md section X?"
3. [QUALITY-CHECK] "Review this code for: types, errors, DRY, naming"
4. [FIX] Address any issues found
5. [VERIFY] Run the code/tests to confirm it works
6. [COMMIT] Only after all checks pass
```

---

## 📋 Task Complexity & Model Selection

Tasks in TASKLIST.md are tagged with recommended models:

### 🟢 SONNET Tasks (Fast, routine work)
- File/folder creation and scaffolding
- Installing dependencies
- Creating basic TypeScript interfaces
- Writing utility functions
- Implementing straightforward components
- Configuration files (tailwind, vite, etc.)
- Running scripts and commands
- Basic CRUD operations

### 🟣 OPUS Tasks (Complex reasoning required)
- Architecture decisions
- Complex state management logic
- Performance optimization
- Debugging tricky issues
- Writing the matchup calculation algorithm
- UI/UX design implementation
- Integration between multiple systems
- Code review and refactoring
- Writing comprehensive tests

### Model Selection Heuristic
```
IF task involves:
  - Simple file operations → SONNET
  - Following a clear pattern → SONNET
  - Complex logic or algorithms → OPUS
  - Debugging unclear issues → OPUS
  - Design/architecture decisions → OPUS
  - Multi-file refactoring → OPUS
```

---

## 🏗️ Project Structure Conventions

```
wt-sim-matchup/
├── .env.local              # Local env vars (NEVER COMMIT)
├── .env.example            # Template for env vars (OK to commit)
├── src/
│   ├── components/
│   │   ├── flightacademy/  # Phase 2: AI tactical guides (AircraftDetailPage)
│   │   ├── tacticalplaybook/ # Phase 3: AI matchup playbooks (BriefingDetailPage)
│   │   ├── missionplanner/ # Phase 4: Mission planning (MissionPlannerPage)
│   │   ├── briefing/       # Briefing page components
│   │   ├── matchup/        # Matchup page components
│   │   ├── aircraft/       # Aircraft detail components
│   │   ├── charts/         # Recharts-based visualizations
│   │   ├── layout/         # PageContainer, Header, etc.
│   │   └── ui/             # Button, Badge, etc.
│   ├── hooks/
│   │   ├── useAIContent.ts # useTacticalGuide + useMatchupPlaybook hooks
│   │   ├── useAircraft.ts  # Aircraft data loading
│   │   └── useCuratedData.ts # Curated aircraft data
│   ├── lib/
│   │   ├── ai-service.ts   # OpenAI integration (GPT-4o-mini)
│   │   ├── ai-cache.ts     # IndexedDB caching layer
│   │   └── router.ts       # Hash-based routing
│   ├── stores/
│   │   └── selectionStore.ts
│   ├── types/
│   │   ├── aircraft.ts     # Aircraft type definitions
│   │   └── curated.ts      # AI content types (TacticalGuide, MatchupPlaybook, DiagramData)
│   ├── pages/
│   │   ├── AircraftDetailPage.tsx  # Has Flight Academy tab
│   │   ├── BriefingDetailPage.tsx  # Has Tactical Playbook tab
│   │   └── MissionPlannerPage.tsx  # Mission Planner page (#/mission-planner)
│   └── data/
│       └── *.json          # Static data files
├── scripts/
│   └── script-name.ts      # Build-time scripts
├── docs/plans/             # Design documents for each phase
└── public/
    └── aircraft-images/    # Cached images
```

### Naming Conventions
- **Components:** PascalCase (`AircraftCard.tsx`)
- **Hooks:** camelCase with `use` prefix (`useAircraft.ts`)
- **Utilities:** camelCase (`matchupLogic.ts`)
- **Types:** PascalCase for interfaces (`Aircraft`, `SimBracket`)
- **Stores:** camelCase with `Store` suffix (`selectionStore.ts`)
- **Constants:** SCREAMING_SNAKE_CASE (`MAX_BR_RANGE`)

---

## 🧪 Testing Strategy

### What to Test
- **Matchup logic** - Core algorithm MUST have tests
- **Utility functions** - Pure functions are easy to test
- **Data transformations** - Ensure API data maps correctly

### What to Skip (for MVP)
- UI component rendering tests
- E2E tests
- Integration tests

### Running Tests
```bash
npm run test           # Run all tests
npm run test:watch     # Watch mode
```

---

## 🚀 Development Workflow

### Starting a New Task
```bash
# 1. Read the task from TASKLIST.md
# 2. Check SPEC.md for relevant details
# 3. Create a mental plan before coding
# 4. Implement using the subagent workflow
# 5. **ALWAYS** update TASKLIST.md with completion status and notes
```

### Completing a Task - REQUIRED DOCUMENTATION
**After completing ANY task, you MUST:**

1. **Update TASKLIST.md** with detailed completion notes:
   ```markdown
   ### Task X.X: Task Name ✅ MODEL
   **Status: COMPLETE** - Brief summary (YYYY-MM-DD)

   **Completed work:**
   - ✅ What was implemented
   - ✅ Key features added
   - ✅ Files modified/created

   **Notes:**
   - Important decisions made
   - Testing performed
   - Known limitations or future improvements needed

   **Acceptance:** ✅ Criteria met with any caveats noted
   ```

2. **Create documentation files** for significant features:
   - Accessibility work → `ACCESSIBILITY.md`
   - Performance optimizations → `PERFORMANCE.md`
   - API changes → Update `API_REFERENCE.md`
   - Architecture changes → Update `SPEC.md`

3. **Update progress tracking** at bottom of TASKLIST.md:
   ```
   Phase X: ✅✅✅⚠️⬜⬜ (X/Y) ~Z% COMPLETE
   ```

**Example of proper task completion:**
```markdown
### Task 5.5: Accessibility Pass ✅ 🟢 SONNET
**Status: COMPLETE** - Core WCAG AA compliance (2026-02-01)

**Completed improvements:**
- ✅ AircraftCard keyboard accessible (role="button", Enter/Space)
- ✅ Skip navigation link added
- ✅ ARIA labels on all interactive elements
- ✅ Color contrast verified (>4.5:1 ratios)

**Documentation created:**
- `ACCESSIBILITY.md` - Complete compliance report

**Manual testing needed:**
- Screen reader testing (VoiceOver, NVDA)
- Mobile touch target verification

**Acceptance:** ✅ Core implementation complete, manual testing recommended
```

**Why this is critical:**
- Future agents understand what was done and why
- Progress is visible without re-reading code
- Decisions and rationale are preserved
- Testing requirements are documented
- Handoff between sessions is seamless

### Commit Message Format
```
type(scope): brief description

- Detail 1
- Detail 2

Types: feat, fix, refactor, style, docs, test, chore
Scope: component name, feature area, or "general"
```

Examples:
```
feat(aircraft): add AircraftCard component with hover states
fix(matchup): correct BR range filtering logic
refactor(stores): simplify selection store actions
```

### Branch Strategy (if using git)
```
main          # Production-ready code
└── dev       # Development branch
    └── feature/task-name  # Individual features
```

---

## 📡 API & Data Management

### Self-Hosted API (Recommended)
We're self-hosting the WT Vehicles API to avoid rate limits.

**Local Development:**
```bash
# Terminal 1: Run the API
cd wt-vehicles-api
npm start  # Runs on http://localhost:3000

# Terminal 2: Run the frontend
cd wt-sim-matchup
npm run dev  # Runs on http://localhost:5173
```

**Environment Variables:**
```env
# .env.local
VITE_API_URL=http://localhost:3000/api
```

```env
# .env.production
VITE_API_URL=https://your-deployed-api.com/api
```

### Data Caching Strategy
1. **Build time:** Fetch all aircraft data → save to `src/data/aircraft.json`
2. **Runtime:** Load from local JSON, no API calls
3. **Updates:** Re-run fetch script when game updates

---

## 🎨 UI Implementation Guidelines

### Component Patterns
```tsx
// Always use this structure for components
interface ComponentNameProps {
  // Props with clear types
}

export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // Hooks at the top
  // Derived state
  // Handlers
  // Render
}
```

### Styling with Tailwind
- Use CSS variables for theme colors (defined in `tailwind.config.js`)
- Prefer Tailwind classes over custom CSS
- Use `cn()` utility for conditional classes
- Keep component-specific styles in the component file

### Animation Guidelines
- Use Framer Motion for complex animations
- Use CSS transitions for simple hover/focus states
- Keep animations subtle and performant
- Always respect `prefers-reduced-motion`

---

## 🐛 Debugging Tips

### Common Issues

**"Cannot find module"**
```bash
# Check if dependency is installed
npm ls <package-name>
# If not, install it
npm install <package-name>
```

**TypeScript errors with JSON imports**
```json
// tsconfig.json - ensure these are set
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "esModuleInterop": true
  }
}
```

**Vite not picking up env vars**
- Env vars must start with `VITE_`
- Restart dev server after changing `.env`

**Images not loading**
- Check path is relative to `public/` folder
- Ensure images were downloaded by the script

---

## 📊 Progress Tracking

### Updating TASKLIST.md
When completing tasks, update the status:
```markdown
### Task 1.1: Create TypeScript Types ✅ SONNET
→ Completed: 2024-XX-XX

### Task 1.2: Create Data Fetching Script 🔄 OPUS
→ In progress
```

Status markers:
- `⬜` - Not started
- `🔄` - In progress
- `✅` - Complete
- `❌` - Blocked
- `⏭️` - Skipped (with reason)

---

## 🔗 Key Files Reference

| File | Purpose | When to Reference |
|------|---------|-------------------|
| `SPEC.md` | Full technical specification | Architecture decisions, data schemas, UI designs |
| `TASKLIST.md` | Step-by-step implementation tasks | What to work on next |
| `API_REFERENCE.md` | Data source documentation | API endpoints, response formats |
| `CLAUDE.md` | This file - workflow instructions | How to work on this project |

---

## 🎯 Definition of Done (Per Task)

A task is DONE when:
- [ ] Code compiles with no TypeScript errors
- [ ] Implementation matches SPEC.md requirements
- [ ] Code quality review passed
- [ ] No hardcoded secrets or sensitive data
- [ ] Works in browser without console errors
- [ ] **TASKLIST.md updated with detailed completion notes** ⚠️ MANDATORY
- [ ] Relevant documentation files created or updated
- [ ] Progress tracking updated at bottom of TASKLIST.md

**If TASKLIST.md is not updated, the task is NOT complete, even if the code works.**

---

## 🛫 Flight Academy Project — Established Patterns

**IMPORTANT:** Phases 1-5 are complete. When implementing Phases 6-7, follow these patterns established in earlier phases.

### Worktree Workflow
- Feature branches use `.worktrees/` directory (gitignored)
- Branch naming: `feature/phase-N-short-name`
- Always `npm install` and verify tests after creating worktree
- Merge to main with `--no-ff`, then remove worktree + delete branch

### Tab Integration Pattern (Used in Phase 2 + 3)
When adding AI content to an existing page:
```tsx
const [activeTab, setActiveTab] = useState<'overview' | 'newTab'>('overview');
// Tab bar with role="tablist", role="tab", aria-selected, arrow key nav
// Wrap existing content in tabpanel, add new content in second tabpanel
```

### AI Content Component Pattern
Each AI feature follows: **Empty State → Loading → Error → Content**
```
Container (uses useXxx hook from useAIContent.ts)
├── LoadingSkeleton (animate-pulse shimmer)
├── Error state (role="alert", retry button)
├── EmptyState (generate button if AI enabled, config instructions if not)
└── Content sections (Framer Motion stagger)
```

### Card Styling (Military Briefing Aesthetic)
```tsx
// Standard card wrapper (with corner brackets for AI feature cards):
<div className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-6 backdrop-blur-sm corner-brackets">
  <div className="flex items-center gap-2 mb-5">
    <div className="w-4 h-px bg-aviation-amber/30" aria-hidden="true" />
    <span className="section-label">SECTION TITLE</span>
  </div>
  {/* Content */}
</div>
```

### Visual Polish CSS Classes (Phase 5)
Two CSS utility classes in `src/index.css` for the military briefing aesthetic:

**`.corner-brackets`** — Adds amber L-shaped corner marks to any card
- Uses `::before` pseudo-element with 4 SVG data URI background images
- Zero extra DOM elements needed, just add the class
- Applied to ALL cards in flightacademy/, tacticalplaybook/, missionplanner/
- Color: aviation-amber at 40% opacity, 10px line length, 1px stroke

**`.scanlines`** — Adds CRT/military monitor texture overlay
- Uses `::after` pseudo-element with repeating-linear-gradient
- Only apply to empty states, loading skeletons, and error boundaries
- NOT for content-rich cards (too distracting over data)
- Static texture, no animation, inherits border-radius

**CRITICAL z-index rule:** Both pseudo-elements MUST use `z-index: 0`, not `z-index: 1`. Using z-index 1 creates stacking contexts that cover normal-flow content (which sits at z-index auto/0), making card text invisible.

**AI Generated badge** — Green accent indicator for AI content:
```tsx
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-green-400 bg-green-500/10 border border-green-500/30 rounded"
  title={`Generated ${guide.generated_at}`}
  aria-label="Content generated by AI">
  <span className="w-1.5 h-1.5 rounded-full bg-green-400" aria-hidden="true" />
  AI Generated
</span>
```
- Green is ONLY used for the AI badge — aviation-amber remains the dominant accent everywhere else

### Color Palette
- **Primary accent:** `aviation-amber` (#d4a843)
- **Positive/advantage:** `green-400`
- **Negative/danger:** `red-400`
- **Secondary info:** `blue-400`, `cyan-400`
- **Threat levels:** CRITICAL=red, HIGH=orange, MODERATE=yellow, LOW=green
- **Backgrounds:** `aviation-surface`, `aviation-charcoal`, `aviation-slate`
- **Text:** `aviation-text`, `aviation-text-muted`
- **Borders:** `aviation-border`

### Animation Pattern
```tsx
// Full motion variants:
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
// Reduced-motion variants (instant):
const reducedContainerVariants = { hidden: { opacity: 1 }, visible: { opacity: 1 } };
const reducedItemVariants = { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } };
// Usage: const prefersReducedMotion = useReducedMotion();
```

**PITFALL — Framer Motion variants + conditional rendering (tabs):**
When a `motion.div` with `variants={itemVariants}` is inside a parent `containerVariants` animation, and that child is conditionally rendered (e.g., tab switching), newly mounted children will NOT receive the `visible` trigger because the parent's stagger animation already completed. The child stays at `opacity: 0` forever.

**Fix:** For conditionally rendered tab content, use explicit `initial`/`animate` props instead of relying on parent variant propagation:
```tsx
// WRONG — stays at opacity:0 when mounted after parent animation completes:
<motion.div variants={itemVariants} role="tabpanel">

// CORRECT — animates independently on mount:
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: 'easeOut' }}
  role="tabpanel"
>
```
This was discovered and fixed in Phase 5 for both AircraftDetailPage (Flight Academy tab) and BriefingDetailPage (Tactical Playbook tab).

### Accessibility Checklist (Built Into Every Phase)
- Tab bars: `role="tablist"` + `role="tab"` + `aria-selected` + `aria-controls` + arrow key nav
- Tab panels: `role="tabpanel"` + `aria-labelledby`
- Loading: `role="status"` + `sr-only` text
- Errors: `role="alert"`
- Decorative elements: `aria-hidden="true"`
- SVG diagrams: `role="img"` + `aria-label`
- Lists: `role="list"` + `role="listitem"` where semantic
- Focus rings: `focus:ring-2 focus:ring-aviation-amber`

### Header & Navigation
- App branding: "WT SIM" / "Matchup Intelligence System" in `src/components/layout/Header.tsx`
- Routes: `#/` (home), `#/aircraft/{id}` (detail), `#/briefing/{id}/vs/{id}` (briefing), `#/matchup` (matchup), `#/mission-planner` (mission planner)
- Header nav links: Encyclopedia mode toggle, Briefing mode toggle, Mission Planner link
- Mission Planner page uses the shared Header component (unified in Phase 5)

### Tab Switching + scrollIntoView Pattern
When switching tabs on a page with a large hero image above, the tab content may appear below the fold. Use `scrollIntoView` to bring the tab bar into view after switching:
```tsx
const tabBarRef = useRef<HTMLDivElement>(null);
const handleTabChange = useCallback((tab: 'overview' | 'academy') => {
  setActiveTab(tab);
  requestAnimationFrame(() => {
    tabBarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}, []);
// On the tab bar container:
<div ref={tabBarRef} style={{ scrollMarginTop: '16px' }}>
```
The `requestAnimationFrame` ensures React has rendered the new tab content before scrolling. `scrollMarginTop` prevents the tab bar from being hidden under sticky headers.

### Key Files for AI Features
| File | Purpose |
|------|---------|
| `src/types/curated.ts` | All AI content type definitions |
| `src/lib/ai-service.ts` | OpenAI API calls + prompts |
| `src/lib/ai-cache.ts` | IndexedDB caching |
| `src/hooks/useAIContent.ts` | React hooks (useTacticalGuide, useMatchupPlaybook) |
| `IMPROVEMENTS.md` | Phase progress tracking — **update after each phase** |

### Phase Implementation Speed Tips
- Start with stubs that compile, then flesh out — validates types early
- Commit after each sub-phase (3A, 3B, etc.) for clean rollback points
- Phase 3 reused Phase 2 patterns and was significantly faster — always check prior phases for patterns before designing from scratch
- Build + test after every significant change, not just at the end
- CSS pseudo-element overlays (`::before`/`::after`) must use `z-index: 0` — using 1 will cover card content
- Always visually verify with Playwright after adding CSS pseudo-element overlays — DOM presence doesn't guarantee visual rendering
- When applying a CSS class to many files (~20+), batch them in parallel subagents grouped by directory for speed

---

## 💡 Tips for Effective Agentic Work

1. **Read before writing** - Always check SPEC.md for context
2. **Small commits** - Commit after each completed task
3. **Test incrementally** - Run the app frequently to catch issues early
4. **Ask when unclear** - If a requirement is ambiguous, ask for clarification
5. **Document decisions** - Add comments for non-obvious code
6. **Fail fast** - If something isn't working, debug it immediately
7. **Keep state simple** - Don't over-engineer state management
8. **Performance later** - Get it working first, optimize second

# Codebase Cleanup Report

## Summary
Comprehensive cleanup of WT Sim Matchup codebase to remove dead code and consolidate duplicate patterns.

---

## Phase A: Dead Code Removal — 🟢 SONNET (COMPLETE)

Pure deletion tasks with exact line numbers given.

### Removed from `src/types/aircraft.ts`
| Type | Lines | Reason |
|------|-------|--------|
| `AircraftCardData` | 9 | Never imported or used |
| `AircraftFilters` | 7 | Never imported or used |
| `ComparisonData` | 4 | Never imported or used |
| `ComparisonMetrics` | 7 | Never imported or used |
| `SearchResult` | 4 | Never imported or used |

### Removed from `src/lib/utils.ts`
| Function | Lines | Reason |
|----------|-------|--------|
| `getNationColor()` | 15 | Never imported (nation colors handled via CSS) |
| `formatNumber()` | 3 | Never imported or used |
| `clamp()` | 3 | Never imported (SelfRadarChart has local copy) |

### Removed from `src/lib/api.ts`
| Function | Lines | Reason |
|----------|-------|--------|
| `fetchAircraftByNation()` | 11 | Never used (app uses local JSON data) |
| `fetchAircraftByIdentifier()` | 9 | Never used (app uses local JSON data) |
| `Nation` import | 1 | No longer needed after function removal |

### Removed from `src/lib/matchup-logic.test.ts`
| Item | Lines | Reason |
|------|-------|--------|
| Commented `const brs = ...` | 1 | Dead commented code |

**Total lines removed in Phase A: ~78 lines**

---

## Phase B: Pattern Consolidation

### B.1: ErrorBoundary Component — 🟣 OPUS (COMPLETE)

Complex class component with props API design requiring architectural decisions.

**Consolidates:**
- `src/components/flightacademy/FlightAcademyErrorBoundary.tsx`
- `src/components/tacticalplaybook/PlaybookErrorBoundary.tsx`
- `src/components/missionplanner/MissionPlannerErrorBoundary.tsx`

**New file:** `src/components/ui/ErrorBoundary.tsx`

**Props API:**
```typescript
interface ErrorBoundaryProps {
  children: ReactNode;
  title: string;
  defaultMessage?: string;
  onRetry?: () => void;
  withCornerBrackets?: boolean;
}
```

### B.2: AIEmptyState Component — 🟣 OPUS (COMPLETE)

Complex state machine with multiple UI branches requiring careful props API design.

**Consolidates:**
- `src/components/flightacademy/EmptyStateCard.tsx`
- `src/components/tacticalplaybook/PlaybookEmptyState.tsx`

**New file:** `src/components/ui/AIEmptyState.tsx`

### B.3: LoadingSkeleton Component — 🟢 SONNET (Pending)

Simple extraction with clear pattern, no logic changes.

**Extracts inline loading skeletons from:**
- `FlightAcademyTab.tsx`
- `TacticalPlaybookTab.tsx`

**New file:** `src/components/ui/LoadingSkeleton.tsx`

### B.4: Animation Constants — 🟢 SONNET (Pending)

Copy-paste extraction, no logic changes.

**Consolidates duplicate Framer Motion variants from 6 files**

**New file:** `src/lib/animation-constants.ts`

### B.5: AIGeneratedBadge Component — 🟢 SONNET (Pending)

Trivial 15-line component extraction.

**Consolidates identical badge markup from multiple files**

**New file:** `src/components/ui/AIGeneratedBadge.tsx`

---

## Files Deleted

1. ~~`src/components/flightacademy/FlightAcademyErrorBoundary.tsx`~~ ✅
2. ~~`src/components/flightacademy/EmptyStateCard.tsx`~~ ✅
3. ~~`src/components/tacticalplaybook/PlaybookErrorBoundary.tsx`~~ ✅
4. ~~`src/components/tacticalplaybook/PlaybookEmptyState.tsx`~~ ✅
5. ~~`src/components/missionplanner/MissionPlannerErrorBoundary.tsx`~~ ✅

---

## Migration Guide

### Using the new ErrorBoundary
```tsx
// Before (feature-specific)
import { FlightAcademyErrorBoundary } from '../flightacademy';
<FlightAcademyErrorBoundary onRetry={refetch}>
  {children}
</FlightAcademyErrorBoundary>

// After (generic)
import { ErrorBoundary } from '../ui';
<ErrorBoundary
  title="Flight Academy Error"
  onRetry={refetch}
  withCornerBrackets
>
  {children}
</ErrorBoundary>
```

### Using the new AIEmptyState
```tsx
// Before
import { EmptyStateCard } from '../flightacademy';

// After
import { AIEmptyState } from '../ui';
<AIEmptyState
  icon="🎓"
  title="Flight Academy"
  description="AI-powered tactical guide"
  features={['Combat tactics', 'Energy management']}
  onGenerate={handleGenerate}
  generating={isGenerating}
  aiEnabled={isAIEnabled}
/>
```

### Using animation constants
```tsx
// Before (duplicated in each file)
const containerVariants = { hidden: { opacity: 0 }, visible: { ... } };

// After
import { containerVariants, itemVariants } from '../../lib/animation-constants';
```

---

## Verification Checklist

After each phase:
- [x] `npm run build` passes
- [x] `npm run test` passes
- [ ] Home page loads
- [ ] Aircraft detail → Flight Academy tab works
- [ ] Briefing page → Tactical Playbook tab works
- [ ] Mission Planner page loads
- [ ] Error states render correctly
- [ ] Empty states display and generate button works

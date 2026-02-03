# War Thunder Sim Battle Matchup Tool

## Project Overview

A comprehensive web application that helps War Thunder Simulator Battle pilots understand what enemies they'll face based on their aircraft selection, BR bracket, and nation matchups.

### Target Users
- War Thunder Sim EC pilots (primarily prop-era WW2 aircraft BR 2.0-5.0)
- Players who want to understand matchups before queuing
- Streamers who want a reference tool on-stream

### Core Value Proposition
Select your plane → See what enemies you'll fight → Compare performance stats at different speeds/altitudes

---

## Data Architecture

### Primary Data Source

**WT Vehicles API** by Sgambe33
- Endpoint: `https://www.wtvehiclesapi.sgambe.serv00.net/`
- Documentation: `https://www.wtvehiclesapi.sgambe.serv00.net/docs/`
- GitHub: `https://github.com/Sgambe33/WarThunder-Vehicles-API`

**Rate Limits:** 10,000 requests per 72-hour window (separate for assets and JSON)

**Strategy:** 
1. Fetch ALL aircraft data on initial build/deploy
2. Cache locally in JSON files
3. Serve from local cache
4. Manual refresh mechanism for game updates

### Data Schema (from API)

Each aircraft includes:
```typescript
interface Aircraft {
  identifier: string;           // e.g., "p-51d-30"
  country: string;              // e.g., "usa"
  vehicle_type: string;         // "fighter", "bomber", "strike_aircraft"
  arcade_br: number;
  realistic_br: number;
  simulator_br: number;         // THIS IS WHAT WE CARE ABOUT
  is_premium: boolean;
  is_hidden: boolean;
  images: {
    image: string;              // Garage image URL
  };
  // Performance data
  engine_params: {
    max_speed_at_altitude: number;
    max_altitude: number;
    climb_rate: number;
    // etc.
  };
  // Armament
  weapons: {
    // Cannons, MGs, etc.
  };
  // Economy
  repair_cost_arcade: number;
  repair_cost_realistic: number;
  repair_cost_simulator: number;
  // Localized names
  localized_name: string;
}
```

### Secondary Data Source

**Sim Bracket Rotation**
- Source: `https://warthunder.highwaymen.space/SimCal/`
- This is a community-maintained calendar showing daily bracket rotations
- We'll scrape or manually maintain bracket definitions

**Bracket Structure (example):**
```typescript
interface SimBracket {
  id: string;                   // e.g., "ec2"
  name: string;                 // e.g., "EC2 (2.0-3.0)"
  min_br: number;
  max_br: number;
  team_a: string[];             // ["usa", "britain", "ussr", "china", "france"]
  team_b: string[];             // ["germany", "japan", "italy"]
  rotation_day: number;         // Day of the week (0-6) or day of month
}
```

### Typical EC Brackets (as of 2024/2025)

| Bracket | BR Range | Typical Team A | Typical Team B |
|---------|----------|----------------|----------------|
| EC1 | 1.0-2.0 | USA/UK/USSR/France | GER/JAP/ITA |
| EC2 | 2.0-3.0 | USA/UK/USSR/France | GER/JAP/ITA |
| EC3 | 3.0-4.3 | USA/UK/USSR/France | GER/JAP/ITA |
| EC4 | 4.0-5.3 | USA/UK/USSR/France | GER/JAP/ITA |
| EC5 | 5.0-6.3 | USA/UK/USSR/France | GER/JAP/ITA |
| EC6 | 6.0-7.0 | Mixed/varies | Mixed/varies |

**Note:** USSR sometimes swaps sides. Israel, Sweden, China have varied assignments.

---

## Feature Specification

### Phase 1: Core Functionality

#### 1.1 Aircraft Database
- Fetch and cache all aircraft from WT Vehicles API
- Filter to aircraft with `vehicle_type` in ["fighter", "strike_aircraft", "bomber"]
- Index by nation and simulator_br
- Store aircraft images locally

#### 1.2 Plane Selection Interface
- Dropdown or searchable select for nation
- Visual grid of aircraft cards for that nation
- Filter by BR range (sliders: 2.0-5.0)
- Filter by type (fighters, bombers, strike aircraft)
- Show: thumbnail, name, BR, key stats preview

#### 1.3 Matchup Display
- Given selected aircraft:
  1. Determine which BR brackets it fits into
  2. Determine which team it's on
  3. Show ALL enemy aircraft within that BR bracket
  4. Sort by: BR (closest to yours first), then by type

#### 1.4 Aircraft Comparison View
- Side-by-side stats comparison
- Key metrics:
  - **Speed**: Max speed at sea level, at altitude
  - **Climb**: Climb rate (m/s)
  - **Turn**: Turn time (seconds)
  - **Armament**: Gun caliber, gun count, ammo count
  - **Durability**: Wing rip speed, repair cost

### Phase 2: Enhanced Features

#### 2.1 Performance at Different Speeds/Altitudes
- Chart showing speed vs altitude curves
- Compare multiple aircraft on same chart
- Energy retention visualization (if data available)

#### 2.2 Custom Team Configuration
- Let user define their own team assignments
- Save presets
- "What if USSR was on Axis side?" scenarios

#### 2.3 Bracket Calendar Integration
- Show which brackets are active today
- Link to SimCal for full schedule
- Notifications for favorite brackets (stretch)

#### 2.4 Threat Assessment
- Highlight "meta" aircraft at each BR
- Show aircraft that counter yours
- Community-driven threat ratings (future)

### Phase 3: Polish & Stream Features

#### 3.1 Stream Overlay Mode
- Compact, transparent-background view
- Shows current matchup info
- OBS-friendly dimensions (e.g., 400x800)

#### 3.2 Quick Reference Cards
- Printable/saveable infographics
- "P-51D-30 Matchup Cheatsheet"

#### 3.3 Search & Bookmarks
- Fuzzy search for aircraft by name
- Bookmark favorite aircraft
- Recent searches

---

## Technical Architecture

### Frontend Stack
```
React 18+ (Vite)
├── TypeScript
├── TailwindCSS (custom theme)
├── Framer Motion (animations)
├── React Query (data fetching/caching)
├── Zustand (state management)
└── Recharts (performance graphs)
```

### Project Structure
```
wt-sim-matchup-tool/
├── public/
│   └── aircraft-images/       # Cached aircraft thumbnails
├── src/
│   ├── components/
│   │   ├── ui/               # Base components (Button, Card, etc.)
│   │   ├── aircraft/         # Aircraft-specific components
│   │   │   ├── AircraftCard.tsx
│   │   │   ├── AircraftGrid.tsx
│   │   │   ├── AircraftComparison.tsx
│   │   │   └── AircraftStats.tsx
│   │   ├── matchup/          # Matchup display components
│   │   │   ├── MatchupView.tsx
│   │   │   ├── EnemyList.tsx
│   │   │   └── BracketSelector.tsx
│   │   ├── filters/          # Filter components
│   │   │   ├── NationFilter.tsx
│   │   │   ├── BRSlider.tsx
│   │   │   └── TypeFilter.tsx
│   │   └── layout/           # Layout components
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── Footer.tsx
│   ├── data/
│   │   ├── aircraft.json     # Cached aircraft data
│   │   ├── brackets.json     # Sim bracket definitions
│   │   └── teams.json        # Team configurations
│   ├── hooks/
│   │   ├── useAircraft.ts
│   │   ├── useMatchups.ts
│   │   └── useBrackets.ts
│   ├── lib/
│   │   ├── api.ts            # API client for WT Vehicles API
│   │   ├── matchup-logic.ts  # Core matchup calculation
│   │   └── utils.ts
│   ├── stores/
│   │   ├── selection-store.ts
│   │   └── filter-store.ts
│   ├── types/
│   │   └── aircraft.ts       # TypeScript interfaces
│   ├── App.tsx
│   └── main.tsx
├── scripts/
│   ├── fetch-aircraft-data.ts    # One-time data fetch script
│   ├── download-images.ts        # Image caching script
│   └── parse-brackets.ts         # Bracket config generator
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

### Data Flow
```
┌──────────────────────────────────────────────────────────────┐
│                    BUILD TIME (npm run fetch-data)           │
├──────────────────────────────────────────────────────────────┤
│  WT Vehicles API  ──►  fetch-aircraft-data.ts  ──►  JSON    │
│  SimCal/Config    ──►  parse-brackets.ts       ──►  JSON    │
│  API Images       ──►  download-images.ts      ──►  /public │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    RUNTIME (React App)                       │
├──────────────────────────────────────────────────────────────┤
│  User selects nation  ──►  Filter aircraft by nation         │
│  User selects aircraft ──►  Calculate matchups               │
│  Display enemy aircraft ──► Show comparison stats            │
└──────────────────────────────────────────────────────────────┘
```

---

## UI/UX Design Direction

### Aesthetic: Military Aviation Meets Modern Dashboard

**Theme:** Dark mode with aviation-inspired accents
- Primary background: Deep charcoal (#1a1a1f)
- Secondary: Slate gray (#2d2d35)
- Accent: Aviation amber/yellow (#fbbf24) - like cockpit lighting
- Text: Off-white (#f5f5f5)
- Nation colors:
  - USA: Navy blue
  - Germany: Field gray
  - USSR: Deep red
  - Britain: RAF blue
  - Japan: Rising sun red
  - Italy: Green

**Typography:**
- Headers: "Bebas Neue" or "Oswald" (military stencil feel)
- Body: "IBM Plex Sans" (clean, technical)
- Stats/Numbers: "JetBrains Mono" (monospace for alignment)

**Visual Elements:**
- Subtle grid pattern background (runway/technical drawing feel)
- Aircraft silhouettes as decorative elements
- Thin borders with amber accent
- Subtle animations on hover (tilt, glow)
- Nation flag icons/colors as visual anchors

### Key Screens

#### 1. Home / Selection Screen
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  WAR THUNDER SIM MATCHUPS           [Settings] [?]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   SELECT YOUR AIRCRAFT                                      │
│   ─────────────────────                                     │
│                                                             │
│   [🇺🇸] [🇩🇪] [🇷🇺] [🇬🇧] [🇯🇵] [🇮🇹] [🇫🇷] [🇨🇳] [🇸🇪]  │
│                                                             │
│   BR Range: [====2.0=========5.0====]                       │
│   Type: [✓ Fighters] [✓ Bombers] [✓ Strike]                │
│                                                             │
│   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐         │
│   │     │ │     │ │     │ │     │ │     │ │     │         │
│   │ P-51│ │P-47D│ │F4U-1│ │P-38J│ │P-63A│ │F6F-5│         │
│   │ 4.0 │ │ 4.3 │ │ 3.7 │ │ 4.0 │ │ 4.0 │ │ 3.7 │         │
│   └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘         │
│   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐         │
│   │     │ │     │ │     │ │     │ │     │ │     │         │
│   │P-51C│ │ ... │ │     │ │     │ │     │ │     │         │
│   └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 2. Matchup View
```
┌─────────────────────────────────────────────────────────────┐
│  ← Back    P-51D-30 MATCHUPS                   [Compare]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   YOUR AIRCRAFT                    BRACKET: EC4 (4.0-5.3)   │
│   ┌────────────────────────┐                                │
│   │      [P-51D IMAGE]     │       Team: USA/UK/USSR        │
│   │                        │       vs: GER/JAP/ITA          │
│   │   P-51D-30 Mustang     │                                │
│   │   BR: 4.0 (Sim)        │                                │
│   │   🇺🇸 USA Fighter       │                                │
│   └────────────────────────┘                                │
│                                                             │
│   ═══════════════════════════════════════════════════════   │
│                                                             │
│   ENEMIES YOU'LL FACE (32 aircraft)        [Sort: BR ▼]    │
│                                                             │
│   🇩🇪 GERMANY                                               │
│   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                 │
│   │Bf109│ │Fw190│ │Ta152│ │Bf109│ │Do335│                 │
│   │G-6  │ │D-9  │ │H-1  │ │K-4  │ │A-0  │                 │
│   │ 4.3 │ │ 5.0 │ │ 5.3 │ │ 5.3 │ │ 4.7 │                 │
│   └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                 │
│                                                             │
│   🇯🇵 JAPAN                                                 │
│   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                          │
│   │A6M5 │ │Ki-84│ │N1K2 │ │J2M3 │                          │
│   │Zero │ │Hayat│ │Shid.│ │Raid.│                          │
│   │ 4.7 │ │ 5.0 │ │ 5.3 │ │ 4.7 │                          │
│   └─────┘ └─────┘ └─────┘ └─────┘                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 3. Comparison View
```
┌─────────────────────────────────────────────────────────────┐
│  AIRCRAFT COMPARISON                        [Add +] [Clear] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│          P-51D-30        vs       Bf 109 K-4                │
│          ─────────────────────────────────────              │
│                                                             │
│  Speed (sea level)                                          │
│  ████████████████░░   703 km/h   ██████████████████  725    │
│                                                             │
│  Speed (6000m)                                              │
│  ██████████████████   698 km/h   ████████████████░░  680    │
│                                                             │
│  Climb Rate                                                 │
│  ██████████████░░░░   18.3 m/s   ██████████████████  24.5   │
│                                                             │
│  Turn Time                                                  │
│  ██████████████████   20.0 sec   ██████████████░░░░  21.5   │
│                                                             │
│  Armament                                                   │
│  6x .50 cal (1880)               1x30mm + 2x13mm            │
│                                                             │
│  [Speed vs Altitude Chart]                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │     ╱─────────────P-51D                              │  │
│  │    ╱   ╱───────────Bf109K                            │  │
│  │   ╱   ╱                                              │  │
│  │  ╱   ╱                                               │  │
│  │ ╱   ╱                                                │  │
│  └──────────────────────────────────────────────────────┘  │
│    0m    2000m    4000m    6000m    8000m                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Notes

### API Fetching Strategy

```typescript
// scripts/fetch-aircraft-data.ts
async function fetchAllAircraft() {
  const countries = ['usa', 'germany', 'ussr', 'britain', 'japan', 'italy', 'france', 'china', 'sweden', 'israel'];
  const allAircraft = [];
  
  for (const country of countries) {
    // Fetch aircraft for each country
    const response = await fetch(
      `https://www.wtvehiclesapi.sgambe.serv00.net/api/vehicles?country=${country}&vehicleType=aircraft`
    );
    const aircraft = await response.json();
    
    // Filter to relevant aircraft (has sim BR, not hidden unless premium)
    const filtered = aircraft.filter(a => 
      a.simulator_br && 
      (!a.is_hidden || a.is_premium)
    );
    
    allAircraft.push(...filtered);
    
    // Rate limit: wait 100ms between requests
    await sleep(100);
  }
  
  // Save to local JSON
  fs.writeFileSync('src/data/aircraft.json', JSON.stringify(allAircraft, null, 2));
}
```

### Matchup Logic

```typescript
// src/lib/matchup-logic.ts
export function getMatchups(
  selectedAircraft: Aircraft,
  allAircraft: Aircraft[],
  brackets: SimBracket[],
  teamConfig: TeamConfig
): MatchupResult {
  // 1. Find applicable brackets
  const applicableBrackets = brackets.filter(
    b => selectedAircraft.simulator_br >= b.min_br && 
         selectedAircraft.simulator_br <= b.max_br
  );
  
  // 2. Determine player's team
  const playerTeam = teamConfig.getTeam(selectedAircraft.country);
  
  // 3. Get enemy nations
  const enemyNations = playerTeam === 'A' 
    ? teamConfig.team_b 
    : teamConfig.team_a;
  
  // 4. Filter enemy aircraft
  const enemies = allAircraft.filter(a => 
    enemyNations.includes(a.country) &&
    a.simulator_br >= applicableBrackets[0].min_br &&
    a.simulator_br <= applicableBrackets[0].max_br
  );
  
  return {
    bracket: applicableBrackets[0],
    playerTeam,
    enemies: enemies.sort((a, b) => 
      Math.abs(a.simulator_br - selectedAircraft.simulator_br) - 
      Math.abs(b.simulator_br - selectedAircraft.simulator_br)
    )
  };
}
```

### Bracket Configuration

```json
// src/data/brackets.json
{
  "brackets": [
    {
      "id": "ec1",
      "name": "EC1",
      "min_br": 1.0,
      "max_br": 2.0
    },
    {
      "id": "ec2", 
      "name": "EC2",
      "min_br": 2.0,
      "max_br": 3.0
    },
    {
      "id": "ec3",
      "name": "EC3",
      "min_br": 3.0,
      "max_br": 4.3
    },
    {
      "id": "ec4",
      "name": "EC4",
      "min_br": 4.0,
      "max_br": 5.3
    },
    {
      "id": "ec5",
      "name": "EC5",
      "min_br": 5.0,
      "max_br": 6.3
    }
  ],
  "default_teams": {
    "team_a": ["usa", "britain", "ussr", "france", "china"],
    "team_b": ["germany", "japan", "italy"]
  },
  "presets": [
    {
      "name": "Classic Allies vs Axis",
      "team_a": ["usa", "britain", "ussr", "france", "china"],
      "team_b": ["germany", "japan", "italy"]
    },
    {
      "name": "Cold War Split",
      "team_a": ["usa", "britain", "france", "japan", "italy"],
      "team_b": ["ussr", "china", "germany"]
    }
  ]
}
```

---

## Performance Considerations

1. **Data Caching**: All aircraft data fetched at build time, not runtime
2. **Image Optimization**: Use WebP format, lazy loading, placeholder blur
3. **Search**: Use Fuse.js for fuzzy search (client-side, fast)
4. **Virtualization**: Use react-window for large aircraft lists
5. **Code Splitting**: Lazy load comparison charts

---

## Future Enhancements (Post-MVP)

1. **Mobile PWA**: Installable app for phone reference
2. **Sim Calendar Sync**: Real-time bracket availability
3. **Community Ratings**: User-submitted threat assessments
4. **Loadout Comparison**: Compare with different ordnance
5. **Historical Mode**: "What if" with historical BR values
6. **Crew Skills Impact**: Factor in expert/ace crew stats

---

## Success Metrics

- [ ] Can select any WW2 prop plane and see matchups in <2 seconds
- [ ] All aircraft images load and display correctly
- [ ] BR filtering works accurately
- [ ] Side-by-side comparison shows meaningful stats
- [ ] Works on mobile (responsive)
- [ ] Looks sick 🔥

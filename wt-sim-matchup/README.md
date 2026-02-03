# War Thunder Sim Battle Matchup Tool

A web app that helps War Thunder Simulator Battle pilots understand what enemies they'll face based on aircraft selection, BR brackets, and nation matchups.

Select your plane. See what enemies you'll fight. Compare performance stats.

## Features

- **Aircraft Browser** — Search, filter, and explore all sim-eligible aircraft by nation, type, and BR
- **Matchup Viewer** — Select an aircraft and instantly see which enemies fall in your BR bracket and team composition
- **Performance Comparison** — Compare speed, climb rate, turn time, armament, and other stats side-by-side
- **Bracket Awareness** — Understands EC bracket structure (EC1 through EC6) and team assignments
- **Offline-First** — Aircraft data is bundled at build time from a local SQLite database; no API calls at runtime

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **TailwindCSS 4** for styling
- **Zustand** for state management
- **Framer Motion** for animations
- **Recharts** for performance charts
- **Fuse.js** for fuzzy search
- **better-sqlite3** for build-time data extraction

## Prerequisites

- Node.js 18+
- npm 9+

## Getting Started

```bash
# Clone the repository
git clone https://github.com/ZucchiniZhang/wt-sim-matchup.git
cd wt-sim-matchup

# Install dependencies
npm install

# Download the vehicle database (~30 MB SQLite file)
npm run download-db

# Generate aircraft data from the database
npm run fetch-data

# (Optional) Download aircraft images for local caching
npm run download-images

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

## Self-Hosted API (Optional)

For development with the WT Vehicles API backend:

```bash
# Copy the example env file
cp .env.example .env.local

# Edit .env.local to point to your API instance
# Default: VITE_API_URL=http://localhost:3000/api
```

## Build for Production

```bash
npm run build    # TypeScript check + Vite build
npm run preview  # Preview the production build locally
```

## Project Structure

```
src/
├── components/      # React components (aircraft, matchup, comparison, filters, UI)
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and matchup logic
├── stores/          # Zustand state stores
├── types/           # TypeScript type definitions
├── data/            # Generated aircraft JSON data
└── pages/           # Page-level components
scripts/             # Build-time data fetching and image download scripts
data/                # SQLite database (downloaded, gitignored)
public/              # Static assets and cached aircraft images
```

## Data Source

Aircraft data is sourced from the [WT Vehicles API](https://github.com/Sgambe33/WarThunder-Vehicles-API) by Sgambe33, extracted via a local SQLite database at build time.

## License

[MIT](LICENSE)

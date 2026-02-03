# Data Source Reference

## Recommended: Self-Hosted API

To avoid the 10K requests/72h rate limit (and potential IP ban), we self-host the WT Vehicles API.

### Quick Setup

```bash
# Clone the API repo (in project parent directory)
git clone https://github.com/Sgambe33/WarThunder-Vehicles-API.git wt-vehicles-api
cd wt-vehicles-api

# Install dependencies
npm install

# Start the server
npm start
# or
node app.js
```

The API will run on `http://localhost:3000` by default.

### Database Setup

The API uses SQLite. You need to either:

**Option A: Use the data extraction tool to build the database**
```bash
# Clone the data extraction tool
git clone https://github.com/Sgambe33/WT-Vehicle-Data-Extract.git
cd WT-Vehicle-Data-Extract

# Clone the datamine
git clone https://github.com/gszabi99/War-Thunder-Datamine.git datamine

# Create .env file
echo 'DATAMINE_LOCATION="./datamine"' > utils/.env

# Install Python deps and run
pip install -r requirements.txt
python main.py
```
This generates `vehicles.db` - copy it to your API directory.

**Option B: Download a pre-built database**
Check the releases on https://github.com/Sgambe33/WT-Vehicle-Data-Extract/releases for recent database dumps.

### Environment Configuration

**Frontend `.env.local`:**
```env
# Development - use local API
VITE_API_URL=http://localhost:3000/api

# Or use the public API (rate limited)
# VITE_API_URL=https://www.wtvehiclesapi.sgambe.serv00.net/api
```

### Running Both Services

**Terminal 1 - API:**
```bash
cd wt-vehicles-api
npm start
# Running on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd wt-sim-matchup
npm run dev
# Running on http://localhost:5173
```

---

## API Endpoints

### Base URL
- **Self-hosted:** `http://localhost:3000/api`
- **Public (rate limited):** `https://www.wtvehiclesapi.sgambe.serv00.net/api`

### Documentation
- **Swagger UI:** `/docs` (e.g., `http://localhost:3000/docs`)

### Public API Rate Limits
- **10,000 requests** per 72-hour window
- Separate limits for assets (images) and JSON data
- **IP ban** for attempting to bypass limits

---

## Endpoints Reference

### Get All Vehicles
```
GET /vehicles
```

Query Parameters:
| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `country` | string | `usa` | Filter by nation |
| `vehicleType` | string | `aircraft` | Filter by type |
| `isPremium` | boolean | `false` | Filter premiums |
| `isHidden` | boolean | `false` | Include hidden vehicles |
| `limit` | number | `100` | Limit results |
| `offset` | number | `0` | Pagination offset |

**Countries:**
- `usa`, `germany`, `ussr`, `britain`, `japan`, `italy`, `france`, `china`, `sweden`, `israel`

**Vehicle Types (for aircraft):**
- `type_fighter` - Fighters
- `type_bomber` - Bombers  
- `type_assault` - Strike aircraft/Attackers
- `type_light_fighter` - Light fighters
- `type_interceptor` - Interceptors

### Example Requests

```bash
# Get all USA aircraft
curl "http://localhost:3000/api/vehicles?country=usa&vehicleType=aircraft"

# Get all German fighters
curl "http://localhost:3000/api/vehicles?country=germany&vehicleType=type_fighter"

# Get specific aircraft by identifier
curl "http://localhost:3000/api/vehicles/p-51d-30_usa"
```

### Get Single Vehicle
```
GET /vehicles/{identifier}
```

Example:
```bash
curl "http://localhost:3000/api/vehicles/p-51d-30_usa"
```

### Get Vehicle Images
```
GET /assets/images/{identifier}.png
```

Example:
```bash
curl "http://localhost:3000/assets/images/p-51d-30_usa.png" --output p51.png
```

---

## Response Schema

### Aircraft Object
```typescript
interface APIAircraft {
  identifier: string;              // "p-51d-30_usa"
  country: string;                 // "usa"
  vehicle_type: string;            // "type_fighter"
  vehicle_sub_types: string[];     // ["type_fighter", "type_longrange_fighter"]
  
  // Battle Ratings
  arcade_br: number;               // 4.7
  realistic_br: number;            // 4.3
  simulator_br: number;            // 4.0  ← USE THIS ONE
  
  // Classification
  is_premium: boolean;
  is_hidden: boolean;
  is_gift: boolean;
  is_marketplace: boolean;
  
  // Display
  localized_name?: string;         // "P-51D-30" (may need locale lookup)
  
  // Images
  images?: {
    image: string;                 // URL to garage image
  };
  
  // Performance
  max_speed?: number;              // km/h at sea level
  max_speed_at_altitude?: number;  // km/h at optimal altitude
  optimal_altitude?: number;       // meters
  climb_rate?: number;             // m/s
  turn_time?: number;              // seconds for 360° turn
  roll_rate?: number;              // degrees/second
  
  // Wing specs
  wing_loading?: number;           // kg/m²
  wing_area?: number;              // m²
  
  // Engine
  engine_params?: {
    max_rpm: number;
    horse_power: number;
    // Additional engine data
  };
  
  // Armament (structure varies by aircraft)
  weapons?: {
    // Guns, cannons, rockets, bombs
  };
  
  // Economy
  repair_cost_arcade: number;
  repair_cost_realistic: number;
  repair_cost_simulator: number;
  purchase_cost_silver: number;
  purchase_cost_gold?: number;     // For premiums
  
  // Research
  research_cost: number;
  rank: number;                    // Tier (1-8)
  required_vehicle?: string;       // Tech tree prerequisite
  
  // Modifications
  modifications?: object[];
}
```

---

## Data Fetching Script

### Build-Time Fetcher
```typescript
// scripts/fetch-aircraft-data.ts
import fs from 'fs';
import path from 'path';

const API_BASE = process.env.API_URL || 'http://localhost:3000/api';
const NATIONS = ['usa', 'germany', 'ussr', 'britain', 'japan', 'italy', 'france', 'china', 'sweden', 'israel'];

interface Aircraft {
  identifier: string;
  country: string;
  vehicle_type: string;
  simulator_br: number;
  // ... other fields
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`  Attempt ${i + 1} failed:`, error);
      if (i < retries - 1) {
        await sleep(1000 * (i + 1)); // Exponential backoff
      } else {
        throw error;
      }
    }
  }
}

async function fetchNationAircraft(nation: string): Promise<Aircraft[]> {
  const url = `${API_BASE}/vehicles?country=${nation}&vehicleType=aircraft`;
  return await fetchWithRetry(url);
}

async function main() {
  console.log('Fetching aircraft data...\n');
  console.log(`API: ${API_BASE}\n`);
  
  const allAircraft: Aircraft[] = [];
  
  for (const nation of NATIONS) {
    process.stdout.write(`Fetching ${nation}...`);
    
    try {
      const aircraft = await fetchNationAircraft(nation);
      
      // Filter to valid aircraft with sim BR
      const valid = aircraft.filter((a: Aircraft) => 
        a.simulator_br && 
        a.simulator_br > 0 &&
        (!a.is_hidden || a.is_premium) // Include premiums even if hidden
      );
      
      console.log(` found ${valid.length} aircraft`);
      allAircraft.push(...valid);
      
      // Small delay to be nice to the server
      await sleep(100);
      
    } catch (error) {
      console.error(` ERROR: ${error}`);
    }
  }
  
  // Sort by nation, then by BR
  allAircraft.sort((a, b) => {
    if (a.country !== b.country) {
      return a.country.localeCompare(b.country);
    }
    return a.simulator_br - b.simulator_br;
  });
  
  // Ensure output directory exists
  const outputDir = path.join(__dirname, '../src/data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write to file
  const outputPath = path.join(outputDir, 'aircraft.json');
  fs.writeFileSync(outputPath, JSON.stringify(allAircraft, null, 2));
  
  console.log(`\n✓ Saved ${allAircraft.length} aircraft to ${outputPath}`);
  
  // Print summary
  console.log('\nSummary by nation:');
  const byNation = allAircraft.reduce((acc, a) => {
    acc[a.country] = (acc[a.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  Object.entries(byNation).forEach(([nation, count]) => {
    console.log(`  ${nation}: ${count}`);
  });
}

main().catch(console.error);
```

### Run the Script
```bash
# With self-hosted API
npx tsx scripts/fetch-aircraft-data.ts

# With public API (use sparingly!)
API_URL=https://www.wtvehiclesapi.sgambe.serv00.net/api npx tsx scripts/fetch-aircraft-data.ts
```

---

## Image Handling

### Download Images Script
```typescript
// scripts/download-images.ts
import fs from 'fs';
import path from 'path';

const API_BASE = process.env.API_URL || 'http://localhost:3000';

interface Aircraft {
  identifier: string;
  images?: {
    image: string;
  };
}

async function downloadImage(url: string, filepath: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    if (!response.ok) return false;
    
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filepath, Buffer.from(buffer));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  // Load aircraft data
  const aircraftPath = path.join(__dirname, '../src/data/aircraft.json');
  const aircraft: Aircraft[] = JSON.parse(fs.readFileSync(aircraftPath, 'utf-8'));
  
  // Create output directory
  const imageDir = path.join(__dirname, '../public/aircraft-images');
  fs.mkdirSync(imageDir, { recursive: true });
  
  console.log(`Downloading images for ${aircraft.length} aircraft...\n`);
  
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  
  for (const plane of aircraft) {
    const filename = `${plane.identifier}.png`;
    const filepath = path.join(imageDir, filename);
    
    // Skip if already exists
    if (fs.existsSync(filepath)) {
      skipped++;
      continue;
    }
    
    // Construct image URL
    const imageUrl = plane.images?.image || `${API_BASE}/assets/images/${plane.identifier}.png`;
    
    process.stdout.write(`Downloading ${plane.identifier}...`);
    
    const success = await downloadImage(imageUrl, filepath);
    
    if (success) {
      console.log(' ✓');
      downloaded++;
    } else {
      console.log(' ✗');
      failed++;
    }
    
    // Rate limit
    await new Promise(r => setTimeout(r, 50));
  }
  
  console.log(`\nDone!`);
  console.log(`  Downloaded: ${downloaded}`);
  console.log(`  Skipped (exists): ${skipped}`);
  console.log(`  Failed: ${failed}`);
}

main().catch(console.error);
```

---

## Sim Bracket Configuration

Create `src/data/brackets.json`:

```json
{
  "brackets": [
    {
      "id": "ec1",
      "name": "EC1 - Reserve",
      "min_br": 1.0,
      "max_br": 2.0,
      "description": "Biplanes and early monoplanes"
    },
    {
      "id": "ec2",
      "name": "EC2 - Early War",
      "min_br": 2.0,
      "max_br": 3.0,
      "description": "Early WW2 fighters"
    },
    {
      "id": "ec3",
      "name": "EC3 - Mid War",
      "min_br": 3.0,
      "max_br": 4.3,
      "description": "Mid WW2 fighters"
    },
    {
      "id": "ec4",
      "name": "EC4 - Late War",
      "min_br": 4.0,
      "max_br": 5.3,
      "description": "Late WW2 fighters, superprops"
    },
    {
      "id": "ec5",
      "name": "EC5 - Superprops",
      "min_br": 5.0,
      "max_br": 6.3,
      "description": "Late props, early jets"
    },
    {
      "id": "ec6",
      "name": "EC6 - Early Jets",
      "min_br": 6.0,
      "max_br": 7.3,
      "description": "Korean War era jets"
    },
    {
      "id": "ec7",
      "name": "EC7 - Cold War",
      "min_br": 7.0,
      "max_br": 8.7,
      "description": "Sabres, MiGs, Hunters"
    },
    {
      "id": "ec8",
      "name": "EC8 - Vietnam Era",
      "min_br": 8.3,
      "max_br": 10.3,
      "description": "Phantoms, MiG-21s"
    },
    {
      "id": "ec9",
      "name": "EC9 - Modern",
      "min_br": 10.0,
      "max_br": 14.0,
      "description": "4th gen and beyond"
    }
  ],
  "teams": {
    "default": {
      "name": "Default (Allies vs Axis)",
      "team_a": ["usa", "britain", "ussr", "france", "china", "israel"],
      "team_b": ["germany", "japan", "italy", "sweden"]
    },
    "presets": [
      {
        "id": "ww2_classic",
        "name": "WW2 Classic",
        "team_a": ["usa", "britain", "ussr", "france", "china"],
        "team_b": ["germany", "japan", "italy"]
      },
      {
        "id": "ussr_axis",
        "name": "USSR with Axis",
        "team_a": ["usa", "britain", "france", "china"],
        "team_b": ["germany", "japan", "italy", "ussr"]
      },
      {
        "id": "cold_war",
        "name": "Cold War",
        "team_a": ["usa", "britain", "france", "japan", "italy", "israel"],
        "team_b": ["ussr", "china", "germany"]
      }
    ]
  }
}
```

---

## Troubleshooting

### "Connection refused" to localhost:3000
- Make sure the API is running: `cd wt-vehicles-api && npm start`
- Check if port 3000 is in use: `lsof -i :3000`

### Empty responses from API
- Database might be empty - run the data extraction tool
- Check the database file exists in the API directory

### Rate limited on public API
- Switch to self-hosted API
- Wait 72 hours for limit reset
- Implement local caching

### Missing aircraft images
- Some aircraft may not have images in the API
- Create a fallback/placeholder image
- Check the image URL format matches the API

### TypeScript import errors for JSON
Ensure `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "esModuleInterop": true
  }
}
```

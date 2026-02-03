import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../data/vehiclesdb.sqlite3');
const IMAGE_BASE = 'https://www.wtvehiclesapi.sgambe.serv00.net/assets/images';

interface WeaponSummary {
  name: string;
  caliber: string;
  count: number;
}

interface RawWeapon {
  name?: string;
  weapon_type?: string;
  count?: number;
  ammos?: Array<{
    caliber?: number;
    [key: string]: unknown;
  }>;
}

function extractWeaponsSummary(weaponsJson: string | null): WeaponSummary[] {
  if (!weaponsJson) return [];
  let weapons: RawWeapon[];
  try {
    weapons = JSON.parse(weaponsJson);
  } catch {
    return [];
  }
  if (!Array.isArray(weapons)) return [];

  const summary: WeaponSummary[] = [];
  for (const weapon of weapons) {
    if (!weapon || typeof weapon !== 'object') continue;

    let caliber = 'unknown';
    if (Array.isArray(weapon.ammos) && weapon.ammos.length > 0) {
      const rawCaliber = weapon.ammos[0].caliber;
      if (rawCaliber != null && rawCaliber > 0) {
        // Caliber is stored in meters (e.g., 0.0127 = 12.7mm)
        const mm = rawCaliber * 1000;
        // Use one decimal place for sub-integer values (12.7mm), round for whole numbers (20mm, 30mm)
        const formatted = mm % 1 >= 0.05 ? mm.toFixed(1) : Math.round(mm).toString();
        caliber = mm >= 1 ? `${formatted}mm` : String(rawCaliber);
      }
    }

    summary.push({
      name: weapon.name || 'unknown',
      caliber,
      count: typeof weapon.count === 'number' ? weapon.count : 1,
    });
  }
  return summary;
}

function extractPresetNames(presetsJson: string | null): string[] {
  if (!presetsJson) return [];
  let presets: Array<{ name?: string; identifier?: string }>;
  try {
    presets = JSON.parse(presetsJson);
  } catch {
    return [];
  }
  if (!Array.isArray(presets)) return [];
  return presets
    .map(p => p?.name || p?.identifier || null)
    .filter((n): n is string => n !== null);
}

interface EngineData {
  horse_power_ab?: number;
  horse_power_rb_sb?: number;
  max_rpm?: number;
  max_speed_ab?: number;
  max_speed_rb_sb?: number;
}

interface AeroData {
  turn_time?: number;
  wing_area?: number;
  wingspan?: number;
  length?: number;
  empty_weight?: number;
  max_takeoff_weight?: number;
  max_altitude?: number;
  max_speed_at_altitude?: number;
  runway_length_required?: number;
}

function parseJson<T>(json: string | null): T | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     War Thunder Aircraft Data (SQLite Source)           ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // Verify database exists
  if (!fs.existsSync(DB_PATH)) {
    console.error(`✗ Database not found at ${DB_PATH}`);
    console.error('  Run "npm run download-db" first to download it.');
    process.exit(1);
  }

  const db = new Database(DB_PATH, { readonly: true });

  // Query all aircraft with sim BR > 0
  const rows = db.prepare(`
    SELECT * FROM vehicle
    WHERE vehicle_type IN ('fighter', 'bomber', 'assault')
      AND simulator_br > 0
    ORDER BY country, simulator_br
  `).all() as Record<string, unknown>[];

  console.log(`Found ${rows.length} aircraft in database\n`);

  const allAircraft: Record<string, unknown>[] = [];

  for (const row of rows) {
    const engine = parseJson<EngineData>(row.engine as string | null);
    const aero = parseJson<AeroData>(row.aerodynamics as string | null);

    // Build the aircraft object matching our Aircraft type
    const aircraft: Record<string, unknown> = {
      identifier: row.identifier,
      country: row.country,
      vehicle_type: row.vehicle_type,
      vehicle_sub_types: parseJson(row.vehicle_sub_types as string | null) || [],
      era: row.era,
      arcade_br: row.arcade_br,
      realistic_br: row.realistic_br,
      realistic_ground_br: row.realistic_ground_br,
      simulator_br: row.simulator_br,
      simulator_ground_br: row.simulator_ground_br,
      event: row.event || null,
      release_date: row.release_date || null,
      is_premium: row.is_premium === 1,
      is_pack: row.is_pack === 1,
      on_marketplace: row.on_marketplace === 1,
      squadron_vehicle: row.squadron_vehicle === 1,
      value: row.value,
      req_exp: row.req_exp,
      ge_cost: row.ge_cost,
      sl_mul_arcade: row.sl_mul_arcade,
      sl_mul_realistic: row.sl_mul_realistic,
      sl_mul_simulator: row.sl_mul_simulator,
      exp_mul: row.exp_mul,
      crew_total_count: row.crew_total_count,
      visibility: row.visibility,
      hull_armor: parseJson(row.hull_armor as string | null) || [],
      turret_armor: parseJson(row.turret_armor as string | null) || [],
      images: {
        image: `${IMAGE_BASE}/${row.identifier}.png`,
      },
    };

    // Speed - from engine
    if (engine) {
      if (engine.max_speed_rb_sb != null && engine.max_speed_rb_sb > 0) {
        aircraft.max_speed = engine.max_speed_rb_sb;
      } else if (engine.max_speed_ab != null && engine.max_speed_ab > 0) {
        aircraft.max_speed = engine.max_speed_ab;
      }

      const hp = engine.horse_power_rb_sb || engine.horse_power_ab || 0;
      aircraft.engine = {
        horse_power: hp,
        max_rpm: engine.max_rpm || 0,
      };
    }

    // Aerodynamics
    if (aero) {
      if (aero.turn_time != null && aero.turn_time > 0) {
        aircraft.turn_time = aero.turn_time;
      }
      if (aero.wing_area != null && aero.wing_area > 0) aircraft.wing_area = aero.wing_area;
      if (aero.wingspan != null && aero.wingspan > 0) aircraft.wingspan = aero.wingspan;
      if (aero.length != null && aero.length > 0) aircraft.length = aero.length;
      if (aero.empty_weight != null && aero.empty_weight > 0) aircraft.empty_weight = aero.empty_weight;
      if (aero.max_takeoff_weight != null && aero.max_takeoff_weight > 0) aircraft.max_takeoff_weight = aero.max_takeoff_weight;
      if (aero.max_altitude != null && aero.max_altitude > 0) aircraft.max_altitude = aero.max_altitude;
      if (aero.max_speed_at_altitude != null && aero.max_speed_at_altitude > 0) aircraft.max_speed_at_altitude = aero.max_speed_at_altitude;
    }

    // Mass - top-level
    if (row.mass != null && (row.mass as number) > 0) aircraft.mass = row.mass;

    // Estimate climb rate from power-to-weight
    const hp = (aircraft.engine as { horse_power?: number } | undefined)?.horse_power;
    const mass = (aircraft.mass as number) || (aircraft.empty_weight as number);
    if (hp && hp > 0 && mass && mass > 0) {
      const pwRatio = (hp * 745.7) / (mass * 9.81);
      aircraft.climb_rate = Math.round(pwRatio * 3.5 * 10) / 10;
    }

    // Repair costs
    if (row.repair_cost_simulator != null) aircraft.repair_cost_simulator = row.repair_cost_simulator;
    if (row.repair_cost_full_upgraded_simulator != null) aircraft.repair_cost_simulator_upgraded = row.repair_cost_full_upgraded_simulator;

    // Weapons summary
    aircraft.weapons_summary = extractWeaponsSummary(row.weapons as string | null);

    // Weapon presets
    aircraft.weapon_presets = extractPresetNames(row.presets as string | null);

    allAircraft.push(aircraft);
  }

  db.close();

  // Ensure output directory exists
  const outputDir = path.join(__dirname, '../src/data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write to file
  const outputPath = path.join(outputDir, 'aircraft.json');
  fs.writeFileSync(outputPath, JSON.stringify(allAircraft, null, 2));

  console.log(`✓ Saved ${allAircraft.length} aircraft to ${outputPath}\n`);

  // Print summary by nation
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                    Summary by Nation                    ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const byNation = allAircraft.reduce<Record<string, number>>((acc, a) => {
    const country = a.country as string;
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {});

  Object.entries(byNation)
    .sort(([, a], [, b]) => b - a)
    .forEach(([nation, count]) => {
      console.log(`  ${nation.toUpperCase().padEnd(10)} ${count.toString().padStart(4)} aircraft`);
    });

  // BR range
  const brs = allAircraft.map(a => a.simulator_br as number);
  const minBR = Math.min(...brs);
  const maxBR = Math.max(...brs);

  console.log(`\n  BR Range: ${minBR.toFixed(1)} - ${maxBR.toFixed(1)}`);
  console.log(`  Premium: ${allAircraft.filter(a => a.is_premium === true).length}`);
  console.log(`  Regular: ${allAircraft.filter(a => a.is_premium !== true).length}`);

  // Performance data coverage
  const withSpeed = allAircraft.filter(a => (a.max_speed as number) > 0).length;
  const withTurn = allAircraft.filter(a => (a.turn_time as number) > 0).length;
  const withAlt = allAircraft.filter(a => (a.max_altitude as number) > 0).length;
  const withClimb = allAircraft.filter(a => (a.climb_rate as number) > 0).length;
  const withWeapons = allAircraft.filter(a => (a.weapons_summary as unknown[])?.length > 0).length;
  const withWingArea = allAircraft.filter(a => (a.wing_area as number) > 0).length;
  const withEmptyWeight = allAircraft.filter(a => (a.empty_weight as number) > 0).length;

  console.log(`\n  With max_speed:     ${withSpeed}`);
  console.log(`  With turn_time:     ${withTurn}`);
  console.log(`  With max_altitude:  ${withAlt}`);
  console.log(`  With climb_rate:    ${withClimb}`);
  console.log(`  With weapons:       ${withWeapons}`);
  console.log(`  With wing_area:     ${withWingArea}`);
  console.log(`  With empty_weight:  ${withEmptyWeight}`);

  console.log('\n✓ Data generation complete!\n');
}

main();

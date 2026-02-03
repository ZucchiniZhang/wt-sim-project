import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    if (!response.ok) {
      return false;
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filepath, Buffer.from(buffer));
    return true;
  } catch {
    return false;
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║        War Thunder Aircraft Image Downloader            ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // Load aircraft data
  const aircraftPath = path.join(__dirname, '../src/data/aircraft.json');

  if (!fs.existsSync(aircraftPath)) {
    console.error('✗ Error: aircraft.json not found!');
    console.error('  Run fetch-aircraft-data.ts first.\n');
    process.exit(1);
  }

  const aircraft: Aircraft[] = JSON.parse(fs.readFileSync(aircraftPath, 'utf-8'));

  // Create output directory
  const imageDir = path.join(__dirname, '../public/aircraft-images');
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }

  console.log(`Downloading images for ${aircraft.length} aircraft...\n`);
  console.log(`API: ${API_BASE}`);
  console.log(`Output: ${imageDir}\n`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  // Progress bar width
  const barWidth = 50;

  for (let i = 0; i < aircraft.length; i++) {
    const plane = aircraft[i];
    const filename = `${plane.identifier}.png`;
    const filepath = path.join(imageDir, filename);

    // Skip if already exists
    if (fs.existsSync(filepath)) {
      skipped++;
      continue;
    }

    // Construct image URL
    const imageUrl = plane.images?.image || `${API_BASE}/assets/images/${plane.identifier}.png`;

    // Download image
    const success = await downloadImage(imageUrl, filepath);

    if (success) {
      downloaded++;
    } else {
      failed++;
    }

    // Progress bar
    const progress = ((i + 1) / aircraft.length) * 100;
    const filled = Math.round((barWidth * (i + 1)) / aircraft.length);
    const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);

    process.stdout.write(`\r  [${bar}] ${progress.toFixed(1)}% | ✓ ${downloaded} | ⊙ ${skipped} | ✗ ${failed}`);

    // Rate limit (20ms between requests = 50 req/sec)
    await sleep(20);
  }

  console.log('\n\n╔══════════════════════════════════════════════════════════╗');
  console.log('║                         Summary                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  console.log(`  Downloaded: ${downloaded}`);
  console.log(`  Skipped (already exists): ${skipped}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total: ${aircraft.length}`);

  if (failed > 0) {
    console.log('\n⚠ Some images failed to download.');
    console.log('  This is normal - not all aircraft have images in the API.');
    console.log('  The app will use fallback placeholders for missing images.\n');
  } else {
    console.log('\n✓ All images downloaded successfully!\n');
  }
}

main().catch((error) => {
  console.error('\n✗ Fatal error:', error);
  process.exit(1);
});

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Nation, Aircraft } from '../types/aircraft';

/**
 * Utility function to merge Tailwind CSS classes with clsx
 * Combines clsx for conditional classes and tailwind-merge for proper Tailwind class merging
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format BR value to one decimal place
 * @example formatBR(4.0) => "4.0"
 * @example formatBR(3.7) => "3.7"
 */
export function formatBR(br: number): string {
  return br.toFixed(1);
}

/**
 * Get emoji flag for a nation
 */
export function getNationFlag(nation: Nation): string {
  const flags: Record<Nation, string> = {
    usa: '🇺🇸',
    germany: '🇩🇪',
    ussr: '🇷🇺',
    britain: '🇬🇧',
    japan: '🇯🇵',
    italy: '🇮🇹',
    france: '🇫🇷',
    china: '🇨🇳',
    sweden: '🇸🇪',
    israel: '🇮🇱',
  };
  return flags[nation] || '🏳️';
}

/**
 * Get full display name for a nation
 */
export function getNationName(nation: Nation): string {
  const names: Record<Nation, string> = {
    usa: 'USA',
    germany: 'Germany',
    ussr: 'USSR',
    britain: 'Britain',
    japan: 'Japan',
    italy: 'Italy',
    france: 'France',
    china: 'China',
    sweden: 'Sweden',
    israel: 'Israel',
  };
  return names[nation] || nation.toUpperCase();
}

/**
 * Get Tailwind color class for a nation
 */
export function getNationColor(nation: Nation): string {
  const colors: Record<Nation, string> = {
    usa: 'nation-usa',
    germany: 'nation-germany',
    ussr: 'nation-ussr',
    britain: 'nation-britain',
    japan: 'nation-japan',
    italy: 'nation-italy',
    france: 'nation-france',
    china: 'nation-china',
    sweden: 'nation-sweden',
    israel: 'nation-israel',
  };
  return colors[nation] || 'gray-500';
}

/**
 * Get icon/emoji for aircraft type
 */
export function getAircraftTypeIcon(type: string): string {
  if (type.includes('fighter')) return '✈️';
  if (type.includes('bomber')) return '🛩️';
  if (type.includes('assault') || type.includes('strike')) return '⚔️';
  if (type.includes('interceptor')) return '🚀';
  return '✈️';
}

/**
 * Get human-readable aircraft type name
 */
export function getAircraftTypeName(type: string): string {
  const typeNames: Record<string, string> = {
    fighter: 'Fighter',
    bomber: 'Bomber',
    assault: 'Attacker',
  };
  return typeNames[type] || type.replace(/_/g, ' ');
}

/**
 * Get display name for aircraft (localized name or cleaned identifier)
 */
export function getAircraftDisplayName(aircraft: Aircraft): string {
  if (aircraft.localized_name) {
    return aircraft.localized_name;
  }

  // Clean up identifier: "p-51d-30_usa" => "P-51D-30"
  const withoutCountry = aircraft.identifier.split('_')[0];
  return withoutCountry
    .split('-')
    .map(part => part.toUpperCase())
    .join('-');
}

/**
 * Get aircraft image URL (local or fallback)
 */
export function getAircraftImageUrl(identifier: string): string {
  return `/aircraft-images/${identifier}.png`;
}

/**
 * Format large numbers with thousands separator
 * @example formatNumber(10000) => "10,000"
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * All valid War Thunder battle rating values (x.0, x.3, x.7 pattern)
 * Ranges from 1.0 to 14.3
 */
export const VALID_BR_VALUES: number[] = (() => {
  const values: number[] = [];
  for (let i = 1; i <= 14; i++) {
    values.push(i);
    values.push(i + 0.3);
    values.push(i + 0.7);
  }
  // Round to avoid floating point issues
  return values
    .map(v => Math.round(v * 10) / 10)
    .filter(v => v <= 14.3);
})();

/**
 * Snap a number to the nearest valid BR value
 */
export function snapToValidBR(value: number): number {
  let closest = VALID_BR_VALUES[0];
  let minDist = Math.abs(value - closest);
  for (const br of VALID_BR_VALUES) {
    const dist = Math.abs(value - br);
    if (dist < minDist) {
      minDist = dist;
      closest = br;
    }
  }
  return closest;
}

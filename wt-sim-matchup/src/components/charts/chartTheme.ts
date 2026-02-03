/**
 * Centralized Recharts theme constants
 * Amber/gold on dark background palette for War Thunder matchup tool
 */

export const CHART_THEME = {
  colors: {
    primary: '#d4a843',     // amber gold
    secondary: '#3ea5dd',   // cold blue
    danger: '#e04444',      // hostile red
    success: '#4ade80',     // green
    player: 'rgba(74, 222, 128, 0.8)',   // green for player
    enemy: 'rgba(248, 113, 113, 0.8)',   // red for enemy
  },
  grid: {
    stroke: 'rgba(42, 47, 54, 0.8)',
    strokeDasharray: '3 3',
  },
  axis: {
    stroke: '#6b7280',
    tick: { fill: '#6b7280', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' },
    label: { fill: '#6b7280', fontSize: 12, fontFamily: 'Inter, sans-serif' },
  },
  tooltip: {
    contentStyle: {
      backgroundColor: '#171b20',
      border: '1px solid #2a2f36',
      borderRadius: '8px',
      fontFamily: 'Inter, sans-serif',
      fontSize: '13px',
    },
    labelStyle: { color: '#d4a843', fontWeight: 'bold' },
    itemStyle: { color: '#e2e4e8' },
  },
  legend: {
    wrapperStyle: { paddingTop: '20px', fontFamily: 'Inter, sans-serif', fontSize: '12px' },
  },
} as const;

export const CHART_COLORS = ['#d4a843', '#3ea5dd', '#e04444', '#4ade80'] as const;

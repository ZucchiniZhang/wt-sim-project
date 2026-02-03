/**
 * ScenarioDiagram - SVG tactical diagram renderer
 * Renders a top-down tactical view with aircraft markers, movement arrows,
 * colored zones, and text annotations. Military map aesthetic.
 */

import type { DiagramData } from '../../types/curated';

interface ScenarioDiagramProps {
  data: DiagramData;
  title: string;
}

/** Scale 0-100 coordinates to SVG viewBox (0-200) */
function s(v: number): number {
  return (v / 100) * 200;
}

/** Aircraft triangle marker pointing in heading direction */
function AircraftMarker({
  x,
  y,
  heading,
  fill,
  label,
}: {
  x: number;
  y: number;
  heading: number;
  fill: string;
  label: string;
}) {
  const cx = s(x);
  const cy = s(y);
  // Triangle pointing up (heading 0), rotated by heading degrees
  return (
    <g transform={`translate(${cx}, ${cy}) rotate(${heading})`}>
      <polygon
        points="0,-8 5,6 -5,6"
        fill={fill}
        stroke={fill}
        strokeWidth="1"
        opacity="0.9"
      />
      {/* Direction indicator line */}
      <line x1="0" y1="-8" x2="0" y2="-14" stroke={fill} strokeWidth="1.5" opacity="0.6" />
      {/* Label positioned below marker, counter-rotated so text stays readable */}
      <g transform={`rotate(${-heading})`}>
        <text
          y="16"
          textAnchor="middle"
          fill={fill}
          fontSize="7"
          fontFamily="monospace"
          fontWeight="bold"
        >
          {label}
        </text>
      </g>
    </g>
  );
}

/** Dashed movement arrow from source to target */
function MovementArrow({
  fromX,
  fromY,
  toX,
  toY,
  color,
  label,
}: {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  label?: string;
}) {
  const x1 = s(fromX);
  const y1 = s(fromY);
  const x2 = s(toX);
  const y2 = s(toY);

  // Calculate midpoint for label
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  // Calculate angle for arrowhead
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = 6;
  const ax1 = x2 - headLen * Math.cos(angle - Math.PI / 6);
  const ay1 = y2 - headLen * Math.sin(angle - Math.PI / 6);
  const ax2 = x2 - headLen * Math.cos(angle + Math.PI / 6);
  const ay2 = y2 - headLen * Math.sin(angle + Math.PI / 6);

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="4 3"
        opacity="0.7"
      />
      {/* Arrowhead */}
      <polygon
        points={`${x2},${y2} ${ax1},${ay1} ${ax2},${ay2}`}
        fill={color}
        opacity="0.7"
      />
      {/* Label at midpoint */}
      {label && (
        <text
          x={mx}
          y={my - 4}
          textAnchor="middle"
          fill={color}
          fontSize="6"
          fontFamily="monospace"
          opacity="0.8"
        >
          {label}
        </text>
      )}
    </g>
  );
}

/** Zone circle overlay */
function ZoneCircle({
  x,
  y,
  radius,
  type,
}: {
  x: number;
  y: number;
  radius: number;
  type: 'danger' | 'safe' | 'engage';
}) {
  const colors = {
    danger: { fill: 'rgba(239, 68, 68, 0.12)', stroke: 'rgba(239, 68, 68, 0.4)' },
    safe: { fill: 'rgba(34, 197, 94, 0.12)', stroke: 'rgba(34, 197, 94, 0.4)' },
    engage: { fill: 'rgba(212, 168, 67, 0.12)', stroke: 'rgba(212, 168, 67, 0.4)' },
  };
  const c = colors[type];

  return (
    <circle
      cx={s(x)}
      cy={s(y)}
      r={s(radius)}
      fill={c.fill}
      stroke={c.stroke}
      strokeWidth="1"
      strokeDasharray="3 2"
    />
  );
}

export function ScenarioDiagram({ data, title }: ScenarioDiagramProps) {
  const playerColor = '#d4a843'; // aviation-amber
  const enemyColor = '#ef4444';  // red-400

  return (
    <div className="mt-3">
      <svg
        viewBox="0 0 200 200"
        className="w-full max-w-[280px] mx-auto"
        role="img"
        aria-label={`Tactical diagram for scenario: ${title}`}
      >
        {/* Background */}
        <rect width="200" height="200" fill="rgba(13, 15, 17, 0.6)" rx="4" />

        {/* Grid lines */}
        {[25, 50, 75, 100, 125, 150, 175].map((v) => (
          <g key={v}>
            <line x1={v} y1="0" x2={v} y2="200" stroke="rgba(42, 47, 54, 0.5)" strokeWidth="0.5" />
            <line x1="0" y1={v} x2="200" y2={v} stroke="rgba(42, 47, 54, 0.5)" strokeWidth="0.5" />
          </g>
        ))}

        {/* Center crosshair */}
        <line x1="98" y1="100" x2="102" y2="100" stroke="rgba(107, 114, 128, 0.4)" strokeWidth="0.5" />
        <line x1="100" y1="98" x2="100" y2="102" stroke="rgba(107, 114, 128, 0.4)" strokeWidth="0.5" />

        {/* Compass rose (top-right corner) */}
        <g transform="translate(184, 16)">
          <text textAnchor="middle" fill="rgba(107, 114, 128, 0.5)" fontSize="6" fontFamily="monospace">
            N
          </text>
          <line x1="0" y1="3" x2="0" y2="8" stroke="rgba(107, 114, 128, 0.3)" strokeWidth="0.5" />
        </g>

        {/* Zones (render first, behind everything) */}
        {data.zones?.map((zone, i) => (
          <ZoneCircle key={`zone-${i}`} x={zone.x} y={zone.y} radius={zone.radius} type={zone.type} />
        ))}

        {/* Movement arrows */}
        {data.arrows?.map((arrow, i) => {
          const from = arrow.from === 'player' ? data.player : data.enemy;
          const color = arrow.from === 'player' ? playerColor : enemyColor;
          return (
            <MovementArrow
              key={`arrow-${i}`}
              fromX={from.x}
              fromY={from.y}
              toX={arrow.to[0]}
              toY={arrow.to[1]}
              color={color}
              label={arrow.label}
            />
          );
        })}

        {/* Aircraft markers */}
        <AircraftMarker
          x={data.player.x}
          y={data.player.y}
          heading={data.player.heading}
          fill={playerColor}
          label="YOU"
        />
        <AircraftMarker
          x={data.enemy.x}
          y={data.enemy.y}
          heading={data.enemy.heading}
          fill={enemyColor}
          label="ENEMY"
        />

        {/* Annotations */}
        {data.annotations?.map((ann, i) => (
          <text
            key={`ann-${i}`}
            x={s(ann.x)}
            y={s(ann.y)}
            textAnchor="middle"
            fill="rgba(226, 228, 232, 0.7)"
            fontSize="6"
            fontFamily="monospace"
          >
            {ann.text}
          </text>
        ))}
      </svg>
    </div>
  );
}

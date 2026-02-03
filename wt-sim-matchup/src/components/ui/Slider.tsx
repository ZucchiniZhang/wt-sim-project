/**
 * Dual-handle range slider for BR filtering
 * Supports snapping to discrete valid values (e.g., WT BR x.0/x.3/x.7)
 * Accessible keyboard controls included
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

export interface SliderProps {
  min: number;
  max: number;
  /** Discrete valid values to snap to. When provided, overrides min/max/step. */
  validValues?: number[];
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  className?: string;
  showLabels?: boolean;
}

export function Slider({
  min,
  max,
  validValues,
  step = 0.3,
  value,
  onChange,
  className,
  showLabels = true,
}: SliderProps) {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // When using validValues, derive min/max from the array
  const effectiveMin = validValues ? validValues[0] : min;
  const effectiveMax = validValues ? validValues[validValues.length - 1] : max;

  // Find the nearest valid value
  const snapToNearest = useCallback(
    (val: number): number => {
      if (validValues) {
        let closest = validValues[0];
        let minDist = Math.abs(val - closest);
        for (const v of validValues) {
          const dist = Math.abs(val - v);
          if (dist < minDist) {
            minDist = dist;
            closest = v;
          }
        }
        return closest;
      }
      // Fallback to step-based rounding
      return Math.round(val / step) * step;
    },
    [validValues, step]
  );

  // Get the next valid value up or down from current
  const getAdjacentValue = useCallback(
    (current: number, direction: 'up' | 'down'): number => {
      if (validValues) {
        const idx = validValues.indexOf(current);
        if (idx === -1) {
          // Current value not in array, snap first
          return snapToNearest(current);
        }
        if (direction === 'up') {
          return idx < validValues.length - 1 ? validValues[idx + 1] : current;
        }
        return idx > 0 ? validValues[idx - 1] : current;
      }
      return direction === 'up' ? current + step : current - step;
    },
    [validValues, step, snapToNearest]
  );

  // Calculate percentage position
  const getPercentage = useCallback(
    (val: number) => {
      return ((val - effectiveMin) / (effectiveMax - effectiveMin)) * 100;
    },
    [effectiveMin, effectiveMax]
  );

  // Calculate value from pixel position
  const getValueFromPosition = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return effectiveMin;

      const rect = sliderRef.current.getBoundingClientRect();
      const percentage = (clientX - rect.left) / rect.width;
      const rawValue = effectiveMin + percentage * (effectiveMax - effectiveMin);
      const snapped = snapToNearest(rawValue);

      return Math.max(effectiveMin, Math.min(effectiveMax, snapped));
    },
    [effectiveMin, effectiveMax, snapToNearest]
  );

  // Handle mouse/touch move
  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging) return;

      const newValue = getValueFromPosition(clientX);

      if (isDragging === 'min') {
        if (newValue < value[1]) {
          onChange([newValue, value[1]]);
        }
      } else {
        if (newValue > value[0]) {
          onChange([value[0], newValue]);
        }
      }
    },
    [isDragging, getValueFromPosition, value, onChange]
  );

  // Mouse move handler
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleMove(e.clientX);
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMove]);

  // Touch move handler
  useEffect(() => {
    if (!isDragging) return;

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleMove(touch.clientX);
    };

    const handleTouchEnd = () => {
      setIsDragging(null);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMove]);

  // Keyboard navigation
  const handleKeyDown = (
    e: React.KeyboardEvent,
    handle: 'min' | 'max'
  ) => {
    let newValue = [...value] as [number, number];

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        if (handle === 'min') {
          const prev = getAdjacentValue(value[0], 'down');
          newValue[0] = Math.max(effectiveMin, prev);
        } else {
          const prev = getAdjacentValue(value[1], 'down');
          if (prev > value[0]) {
            newValue[1] = prev;
          }
        }
        onChange(newValue);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        if (handle === 'min') {
          const next = getAdjacentValue(value[0], 'up');
          if (next < value[1]) {
            newValue[0] = next;
          }
        } else {
          const next = getAdjacentValue(value[1], 'up');
          newValue[1] = Math.min(effectiveMax, next);
        }
        onChange(newValue);
        break;
      case 'Home':
        e.preventDefault();
        if (handle === 'min') {
          newValue[0] = effectiveMin;
        } else {
          newValue[1] = getAdjacentValue(value[0], 'up');
        }
        onChange(newValue);
        break;
      case 'End':
        e.preventDefault();
        if (handle === 'min') {
          newValue[0] = getAdjacentValue(value[1], 'down');
        } else {
          newValue[1] = effectiveMax;
        }
        onChange(newValue);
        break;
    }
  };

  const minPercentage = getPercentage(value[0]);
  const maxPercentage = getPercentage(value[1]);

  return (
    <div className={cn('w-full', className)}>
      {/* Labels */}
      {showLabels && (
        <div className="flex justify-between mb-2">
          <span className="text-sm font-mono text-aviation-amber font-semibold tabular-nums">
            {value[0].toFixed(1)}
          </span>
          <span className="text-xs text-aviation-text-muted">BR Range</span>
          <span className="text-sm font-mono text-aviation-amber font-semibold tabular-nums">
            {value[1].toFixed(1)}
          </span>
        </div>
      )}

      {/* Slider track */}
      <div
        ref={sliderRef}
        className="relative h-2 bg-aviation-charcoal rounded-full cursor-pointer"
        onClick={(e) => {
          const newValue = getValueFromPosition(e.clientX);
          const distToMin = Math.abs(newValue - value[0]);
          const distToMax = Math.abs(newValue - value[1]);

          if (distToMin < distToMax) {
            if (newValue < value[1]) {
              onChange([newValue, value[1]]);
            }
          } else {
            if (newValue > value[0]) {
              onChange([value[0], newValue]);
            }
          }
        }}
      >
        {/* Active range */}
        <div
          className="absolute h-full bg-aviation-amber rounded-full transition-all"
          style={{
            left: `${minPercentage}%`,
            width: `${maxPercentage - minPercentage}%`,
          }}
        />

        {/* Min handle */}
        <button
          type="button"
          className={cn(
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2',
            'w-5 h-5 rounded-full bg-aviation-amber',
            'border-2 border-aviation-charcoal',
            'shadow-lg shadow-aviation-amber/30',
            'cursor-grab active:cursor-grabbing',
            'focus:outline-none focus:ring-2 focus:ring-aviation-amber focus:ring-offset-2 focus:ring-offset-aviation-charcoal',
            'transition-transform hover:scale-110',
            isDragging === 'min' && 'scale-110'
          )}
          style={{ left: `${minPercentage}%` }}
          onMouseDown={() => setIsDragging('min')}
          onTouchStart={() => setIsDragging('min')}
          onKeyDown={(e) => handleKeyDown(e, 'min')}
          aria-label="Minimum BR"
          aria-valuemin={effectiveMin}
          aria-valuemax={value[1]}
          aria-valuenow={value[0]}
          role="slider"
          tabIndex={0}
        />

        {/* Max handle */}
        <button
          type="button"
          className={cn(
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2',
            'w-5 h-5 rounded-full bg-aviation-amber',
            'border-2 border-aviation-charcoal',
            'shadow-lg shadow-aviation-amber/30',
            'cursor-grab active:cursor-grabbing',
            'focus:outline-none focus:ring-2 focus:ring-aviation-amber focus:ring-offset-2 focus:ring-offset-aviation-charcoal',
            'transition-transform hover:scale-110',
            isDragging === 'max' && 'scale-110'
          )}
          style={{ left: `${maxPercentage}%` }}
          onMouseDown={() => setIsDragging('max')}
          onTouchStart={() => setIsDragging('max')}
          onKeyDown={(e) => handleKeyDown(e, 'max')}
          aria-label="Maximum BR"
          aria-valuemin={value[0]}
          aria-valuemax={effectiveMax}
          aria-valuenow={value[1]}
          role="slider"
          tabIndex={0}
        />
      </div>

      {/* Min/Max labels */}
      {showLabels && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-aviation-text-muted">{effectiveMin.toFixed(1)}</span>
          <span className="text-xs text-aviation-text-muted">{effectiveMax.toFixed(1)}</span>
        </div>
      )}
    </div>
  );
}

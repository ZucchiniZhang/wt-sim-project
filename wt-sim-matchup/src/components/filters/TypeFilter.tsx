import { Checkbox } from '../ui/Checkbox';
import { getAircraftTypeName, getAircraftTypeIcon } from '../../lib/utils';
import type { VehicleType } from '../../types/aircraft';

const AIRCRAFT_TYPES: VehicleType[] = [
  'fighter',
  'bomber',
  'assault',
];

interface TypeFilterProps {
  selectedTypes: VehicleType[];
  onChange: (types: VehicleType[]) => void;
  className?: string;
}

export function TypeFilter({ selectedTypes, onChange, className }: TypeFilterProps) {
  const handleToggle = (type: VehicleType) => {
    if (selectedTypes.includes(type)) {
      onChange(selectedTypes.filter((t) => t !== type));
    } else {
      onChange([...selectedTypes, type]);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-px bg-aviation-amber/30" />
          <span className="section-label">Aircraft Type</span>
        </div>
        {selectedTypes.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            aria-label="Clear all selected aircraft types"
            className="font-body text-sm uppercase tracking-wider text-aviation-text-muted hover:text-aviation-amber transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="space-y-2">
        {AIRCRAFT_TYPES.map((type) => (
          <Checkbox
            key={type}
            id={`type-${type}`}
            checked={selectedTypes.includes(type)}
            onChange={() => handleToggle(type)}
            label={
              <span className="flex items-center gap-2">
                <span>{getAircraftTypeIcon(type)}</span>
                <span>{getAircraftTypeName(type)}</span>
              </span>
            }
          />
        ))}
      </div>
    </div>
  );
}

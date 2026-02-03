import { Slider } from '../ui/Slider';
import { VALID_BR_VALUES } from '../../lib/utils';

interface BRRangeSliderProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  className?: string;
}

export function BRRangeSlider({ value, onChange, className }: BRRangeSliderProps) {
  return (
    <div className={className}>
      <h3 className="text-sm font-semibold text-aviation-text uppercase tracking-wide mb-4">
        Battle Rating
      </h3>

      <Slider
        min={1.0}
        max={14.3}
        validValues={VALID_BR_VALUES}
        value={value}
        onChange={onChange}
        showLabels
      />
    </div>
  );
}

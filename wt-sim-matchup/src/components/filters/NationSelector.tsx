import { cn, getNationFlag, getNationName } from '../../lib/utils';
import type { Nation } from '../../types/aircraft';

const NATIONS: Nation[] = [
  'usa',
  'germany',
  'ussr',
  'britain',
  'japan',
  'italy',
  'france',
  'china',
  'sweden',
  'israel',
];

interface NationSelectorProps {
  selectedNations: Nation[];
  onChange: (nations: Nation[]) => void;
  multiSelect?: boolean;
  className?: string;
}

export function NationSelector({
  selectedNations,
  onChange,
  multiSelect = true,
  className,
}: NationSelectorProps) {
  const handleNationClick = (nation: Nation) => {
    if (multiSelect) {
      if (selectedNations.includes(nation)) {
        onChange(selectedNations.filter((n) => n !== nation));
      } else {
        onChange([...selectedNations, nation]);
      }
    } else {
      onChange([nation]);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-px bg-aviation-amber/30" />
          <span className="section-label">Nation Select</span>
        </div>
        {multiSelect && selectedNations.length > 0 && (
          <button
            onClick={() => onChange([])}
            aria-label="Clear all selected nations"
            className="font-body text-sm uppercase tracking-wider text-aviation-text-muted hover:text-aviation-amber transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {NATIONS.map((nation) => {
          const isSelected = selectedNations.includes(nation);

          return (
            <button
              key={nation}
              onClick={() => handleNationClick(nation)}
              aria-label={`${getNationName(nation)}${isSelected ? ', selected' : ''}`}
              aria-pressed={multiSelect ? isSelected : undefined}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 font-body text-sm uppercase tracking-wider',
                'border transition-all duration-150',
                'hover:scale-[1.03]',
                isSelected
                  ? 'bg-aviation-amber/10 border-aviation-amber/40 text-aviation-amber'
                  : 'bg-aviation-slate/40 border-aviation-amber/10 text-aviation-text-muted hover:border-aviation-amber/25 hover:text-aviation-text'
              )}
            >
              <span className="text-sm" aria-hidden="true">{getNationFlag(nation)}</span>
              <span>{getNationName(nation)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

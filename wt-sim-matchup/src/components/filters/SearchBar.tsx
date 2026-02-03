import { Button } from '../ui/Button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search aircraft...',
  className,
}: SearchBarProps) {
  const handleClear = () => {
    onChange('');
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-4 h-px bg-aviation-amber/30" />
        <span className="section-label">Search</span>
      </div>

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Search aircraft by name or designation"
          className="w-full bg-aviation-charcoal/80 border border-aviation-amber/15 px-3 py-2 font-mono text-xs text-aviation-text placeholder:text-aviation-text-muted/50 focus:outline-none focus:border-aviation-amber/40 transition-colors"
        />

        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-aviation-text-muted hover:text-aviation-amber"
          >
            X
          </Button>
        )}
      </div>

      {value && (
        <p className="font-body text-sm text-aviation-text-muted mt-1.5 uppercase tracking-wider">
          Query: <span className="text-aviation-amber">{value}</span>
        </p>
      )}
    </div>
  );
}

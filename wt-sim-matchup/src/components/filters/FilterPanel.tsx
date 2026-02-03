/**
 * FilterPanel - Military briefing themed filter controls
 */

import { useFilterStore } from '../../stores/filterStore';
import { BRRangeSlider } from './BRRangeSlider';
import { TypeFilter } from './TypeFilter';
import { SearchBar } from './SearchBar';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/Button';

export function FilterPanel() {
  const {
    brRange,
    aircraftTypes,
    showPremiums,
    searchQuery,
    setBRRange,
    setAircraftTypes,
    setShowPremiums,
    setSearchQuery,
    resetFilters,
  } = useFilterStore();

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="border-b border-aviation-amber/15 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-aviation-amber rounded-full" />
          <h2 className="text-sm font-header font-bold text-aviation-amber uppercase tracking-[0.15em]">
            Filters
          </h2>
        </div>
      </div>

      {/* Search */}
      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      {/* BR Range */}
      <BRRangeSlider value={brRange} onChange={setBRRange} />

      {/* Aircraft Types */}
      <TypeFilter
        selectedTypes={aircraftTypes}
        onChange={setAircraftTypes}
      />

      {/* Show Premiums */}
      <div>
        <Checkbox
          id="show-premiums"
          checked={showPremiums}
          onChange={(e) => setShowPremiums(e.target.checked)}
          label="Show Premium Aircraft"
        />
      </div>

      {/* Reset button */}
      <Button
        variant="secondary"
        className="w-full"
        onClick={resetFilters}
      >
        Reset All Filters
      </Button>
    </div>
  );
}

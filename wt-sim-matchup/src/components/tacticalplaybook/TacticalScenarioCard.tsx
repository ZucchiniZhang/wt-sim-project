/**
 * TacticalScenarioCard - Displays a tactical scenario with text guidance
 * and an optional SVG tactical diagram
 */

import { ScenarioDiagram } from './ScenarioDiagram';
import type { TacticalScenario } from '../../types/curated';

interface TacticalScenarioCardProps {
  scenario: TacticalScenario;
  index: number;
}

export function TacticalScenarioCard({ scenario, index }: TacticalScenarioCardProps) {
  return (
    <div className="corner-brackets bg-aviation-surface/60 border border-aviation-border rounded-lg p-5 backdrop-blur-sm flex flex-col">
      {/* Scenario Number + Title */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-aviation-amber/15 border border-aviation-amber/30 flex items-center justify-center">
          <span className="text-xs font-mono font-bold text-aviation-amber">{index + 1}</span>
        </div>
        <h4 className="text-sm font-header font-bold text-aviation-text uppercase tracking-wider">
          {scenario.title}
        </h4>
      </div>

      {/* Situation */}
      <div className="mb-3">
        <div className="text-[10px] uppercase tracking-widest text-aviation-text-muted mb-1">
          Situation
        </div>
        <p className="text-sm text-aviation-text leading-relaxed">
          {scenario.situation}
        </p>
      </div>

      {/* Recommended Response */}
      <div className="mb-3">
        <div className="text-[10px] uppercase tracking-widest text-aviation-text-muted mb-1">
          Response
        </div>
        <p className="text-sm text-aviation-text leading-relaxed">
          {scenario.recommended_response}
        </p>
      </div>

      {/* SVG Tactical Diagram */}
      {scenario.diagram_data && (
        <div className="mt-auto pt-3 border-t border-aviation-border/30">
          <ScenarioDiagram data={scenario.diagram_data} title={scenario.title} />
        </div>
      )}
    </div>
  );
}

/**
 * MissionPlannerErrorBoundary - Local error boundary for Mission Planner
 * Catches rendering errors without crashing the entire page
 */

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class MissionPlannerErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Mission Planner error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="bg-aviation-surface/60 border border-red-500/30 rounded-lg p-6 text-center"
        >
          <div className="text-red-400 font-header text-xl font-bold mb-2">
            Mission Planner Error
          </div>
          <p className="text-sm text-aviation-text-muted mb-4">
            {this.state.error?.message || 'Something went wrong loading the Mission Planner.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-aviation-amber/15 text-aviation-amber border border-aviation-amber/40 rounded text-sm font-medium hover:bg-aviation-amber/25 transition-colors focus:outline-none focus:ring-2 focus:ring-aviation-amber"
            aria-label="Retry loading Mission Planner"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

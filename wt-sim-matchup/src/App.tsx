/**
 * App - Main application component
 * Hash-based routing between pages
 */

import { Component, useEffect, lazy, Suspense } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { HomePage } from './pages/HomePage';
import { useRoute, navigate } from './lib/router';
import { useSelectionStore } from './stores/selectionStore';

// Lazy-loaded pages for code splitting
const MatchupPage = lazy(() => import('./pages/MatchupPage').then(m => ({ default: m.MatchupPage })));
const ComparisonPage = lazy(() => import('./pages/ComparisonPage').then(m => ({ default: m.ComparisonPage })));
const AircraftDetailPage = lazy(() => import('./pages/AircraftDetailPage').then(m => ({ default: m.AircraftDetailPage })));
const BriefingDetailPage = lazy(() => import('./pages/BriefingDetailPage').then(m => ({ default: m.BriefingDetailPage })));
const MissionPlannerPage = lazy(() => import('./pages/MissionPlannerPage').then(m => ({ default: m.MissionPlannerPage })));

// Error boundary to catch rendering errors
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-aviation-charcoal flex items-center justify-center p-8" role="alert" aria-live="assertive">
          <div className="bg-aviation-slate/60 border border-red-500/30 rounded-lg p-8 max-w-lg text-center">
            <div className="text-red-400 font-header text-3xl font-bold mb-4">Error</div>
            <h1 className="text-lg font-header font-bold text-aviation-text mb-3">
              Something Went Wrong
            </h1>
            <p className="text-sm text-aviation-text-muted mb-6">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              aria-label="Reload application"
              className="px-6 py-2 bg-aviation-amber/15 text-aviation-amber border border-aviation-amber/40 rounded font-medium text-sm hover:bg-aviation-amber/25 transition-colors focus:outline-none focus:ring-2 focus:ring-aviation-amber"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const { route } = useRoute();
  const { selectedAircraft } = useSelectionStore();

  // Auto-navigate to home if no aircraft selected on matchup page
  useEffect(() => {
    if (route.page === 'matchup' && !selectedAircraft) {
      navigate('#/');
    }
  }, [selectedAircraft, route.page]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-aviation-charcoal">
        <Suspense fallback={
          <div className="min-h-screen bg-aviation-charcoal flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-aviation-amber/30 border-t-aviation-amber rounded-full animate-spin mx-auto mb-4" />
              <div className="text-sm font-medium text-aviation-amber">Loading...</div>
            </div>
          </div>
        }>
          {route.page === 'home' && (
            <HomePage />
          )}

          {route.page === 'matchup' && (
            <MatchupPage />
          )}

          {route.page === 'aircraft' && (
            <AircraftDetailPage aircraftId={route.id} />
          )}

          {route.page === 'briefing' && (
            <BriefingDetailPage myId={route.myId} enemyId={route.enemyId} />
          )}

          {route.page === 'compare' && (
            <ComparisonPage />
          )}

          {route.page === 'mission-planner' && (
            <MissionPlannerPage />
          )}
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

export default App;

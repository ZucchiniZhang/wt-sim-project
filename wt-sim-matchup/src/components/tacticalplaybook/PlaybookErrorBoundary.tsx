/**
 * PlaybookErrorBoundary - Local error boundary for Tactical Playbook tab
 * Catches rendering errors in child components without crashing the entire page
 */

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface PlaybookErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
}

export class PlaybookErrorBoundary extends Component<
  PlaybookErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Tactical Playbook rendering error:', error, info);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="bg-aviation-surface/60 border border-red-500/30 rounded-lg p-8 text-center corner-brackets"
          role="alert"
        >
          <div className="text-red-400 font-header text-3xl font-bold mb-4">
            ⚠
          </div>
          <h3 className="text-lg font-header font-bold text-aviation-text mb-2">
            Tactical Playbook Error
          </h3>
          <p className="text-sm text-aviation-text-muted mb-4">
            {this.state.error?.message || 'A rendering error occurred in the Tactical Playbook tab.'}
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="px-4 py-2 bg-aviation-amber/10 border border-aviation-amber text-aviation-amber rounded hover:bg-aviation-amber/20 transition-colors focus:outline-none focus:ring-2 focus:ring-aviation-amber"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

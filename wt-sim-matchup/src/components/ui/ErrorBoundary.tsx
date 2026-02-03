/**
 * ErrorBoundary - Generic error boundary component
 * Catches rendering errors in child components without crashing the entire page
 *
 * Consolidates:
 * - FlightAcademyErrorBoundary
 * - PlaybookErrorBoundary
 * - MissionPlannerErrorBoundary
 */

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Title shown in the error UI (e.g., "Flight Academy Error") */
  title: string;
  /** Default message if error has no message */
  defaultMessage?: string;
  /** Callback when retry button is clicked */
  onRetry?: () => void;
  /** Whether to show corner brackets styling */
  withCornerBrackets?: boolean;
  /** Optional custom className */
  className?: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`${this.props.title}:`, error, info);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render() {
    const {
      children,
      title,
      defaultMessage = 'A rendering error occurred.',
      withCornerBrackets = true,
      className,
    } = this.props;

    if (this.state.hasError) {
      return (
        <div
          className={cn(
            'bg-aviation-surface/60 border border-red-500/30 rounded-lg p-8 text-center',
            withCornerBrackets && 'corner-brackets',
            className
          )}
          role="alert"
        >
          <div className="text-red-400 font-header text-3xl font-bold mb-4" aria-hidden="true">
            ⚠
          </div>
          <h3 className="text-lg font-header font-bold text-aviation-text mb-2">
            {title}
          </h3>
          <p className="text-sm text-aviation-text-muted mb-4">
            {this.state.error?.message || defaultMessage}
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="px-4 py-2 bg-aviation-amber/10 border border-aviation-amber text-aviation-amber rounded hover:bg-aviation-amber/20 transition-colors focus:outline-none focus:ring-2 focus:ring-aviation-amber"
            aria-label={`Retry loading ${title.replace(' Error', '')}`}
          >
            Retry
          </button>
        </div>
      );
    }

    return children;
  }
}

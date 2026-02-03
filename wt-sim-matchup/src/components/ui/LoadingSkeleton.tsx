/**
 * LoadingSkeleton - Reusable loading skeleton for AI content tabs
 * Shows shimmer animation with military briefing aesthetic
 */

interface LoadingSkeletonProps {
  /** Custom aria-label for the loading state (defaults to "Loading content from cache") */
  ariaLabel?: string;
  /** Number of skeleton cards to show (defaults to 3) */
  count?: number;
  /** Whether to show extra content in the first skeleton (defaults to false) */
  showExtraContent?: boolean;
}

export function LoadingSkeleton({
  ariaLabel = 'Loading content from cache',
  count = 3,
  showExtraContent = false,
}: LoadingSkeletonProps) {
  return (
    <div className="space-y-6" role="status" aria-label={ariaLabel}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="bg-aviation-surface/60 border border-aviation-border rounded-lg p-6 backdrop-blur-sm animate-pulse scanlines"
        >
          <div className="h-4 w-48 bg-aviation-border/50 rounded mb-4" />
          <div className="space-y-3">
            <div className="h-3 w-full bg-aviation-border/30 rounded" />
            <div className="h-3 w-3/4 bg-aviation-border/30 rounded" />
            <div className="h-3 w-5/6 bg-aviation-border/30 rounded" />
          </div>
          {i === 0 && showExtraContent && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="h-16 bg-aviation-border/20 rounded" />
              <div className="h-16 bg-aviation-border/20 rounded" />
            </div>
          )}
        </div>
      ))}
      <span className="sr-only">Loading data...</span>
    </div>
  );
}

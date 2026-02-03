/**
 * AIEmptyState - Prompt to generate AI content when no cache exists
 * Shows configuration instructions if AI is disabled
 *
 * Consolidates:
 * - EmptyStateCard (flightacademy)
 * - PlaybookEmptyState (tacticalplaybook)
 */

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface AIEmptyStateProps {
  /** Icon shown at the top (emoji) */
  icon: string;
  /** Title of the empty state */
  title: string;
  /** Description text or ReactNode for custom formatting */
  description: ReactNode;
  /** List of features to display as checkmarks */
  features: string[];
  /** Callback when generate button is clicked */
  onGenerate: () => Promise<void>;
  /** Whether generation is in progress */
  generating: boolean;
  /** Whether AI is enabled in config */
  aiEnabled: boolean;
  /** Text shown during loading (e.g., "Generating tactical guide...") */
  loadingText?: string;
  /** Button text (e.g., "Generate Tactical Guide") */
  buttonText?: string;
  /** Feature name for config instructions (e.g., "Flight Academy", "Tactical Playbook") */
  featureName?: string;
}

export function AIEmptyState({
  icon,
  title,
  description,
  features,
  onGenerate,
  generating,
  aiEnabled,
  loadingText = 'Generating content...',
  buttonText = 'Generate',
  featureName = 'AI',
}: AIEmptyStateProps) {
  // AI Disabled - show configuration instructions
  if (!aiEnabled) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-aviation-surface/60 border border-dashed border-aviation-border rounded-lg p-8 max-w-2xl mx-auto corner-brackets scanlines"
      >
        <div className="text-center">
          <div className="text-aviation-amber text-4xl mb-4" aria-hidden="true">
            ⚙️
          </div>
          <h3 className="text-xl font-header font-bold text-aviation-text mb-4 uppercase tracking-wider">
            AI Generation Not Configured
          </h3>
          <p className="text-sm text-aviation-text-muted mb-6">
            To enable {featureName} features:
          </p>

          <div className="text-left bg-aviation-charcoal/50 border border-aviation-border/30 rounded p-4 mb-6 space-y-3">
            <div className="flex items-start gap-3">
              <div className="text-aviation-amber font-bold">1.</div>
              <div className="text-sm text-aviation-text">
                Get OpenAI API key from:{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-aviation-amber hover:underline"
                >
                  platform.openai.com/api-keys
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-aviation-amber font-bold">2.</div>
              <div className="text-sm text-aviation-text">
                Add to{' '}
                <code className="font-mono text-xs bg-aviation-slate/50 px-1 py-0.5 rounded">
                  .env.local
                </code>
                :
                <pre className="font-mono text-xs bg-aviation-slate/80 p-2 rounded mt-2 overflow-x-auto">
                  VITE_AI_API_KEY=sk-...
                </pre>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-aviation-amber font-bold">3.</div>
              <div className="text-sm text-aviation-text">
                Enable generation:
                <pre className="font-mono text-xs bg-aviation-slate/80 p-2 rounded mt-2 overflow-x-auto">
                  VITE_AI_ENABLE_GENERATION=true
                </pre>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-aviation-amber font-bold">4.</div>
              <div className="text-sm text-aviation-text">Restart dev server</div>
            </div>
          </div>

          <p className="text-xs text-aviation-text-muted">
            See{' '}
            <code className="font-mono bg-aviation-slate/50 px-1 py-0.5 rounded">
              .env.example
            </code>{' '}
            for full configuration options
          </p>
        </div>
      </motion.div>
    );
  }

  // AI Enabled - show generate prompt
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-aviation-surface/60 border border-dashed border-aviation-border rounded-lg p-8 max-w-2xl mx-auto relative corner-brackets scanlines"
    >
      {/* Loading overlay */}
      {generating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-aviation-charcoal/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10"
          role="status"
          aria-live="polite"
        >
          <div className="text-center">
            <div
              className="w-12 h-12 border-2 border-aviation-amber/30 border-t-aviation-amber rounded-full animate-spin mx-auto mb-4"
              aria-hidden="true"
            />
            <div className="text-lg font-header font-bold text-aviation-amber mb-2 animate-pulse">
              {loadingText}
            </div>
            <div className="text-sm text-aviation-text-muted">
              This may take 10-15 seconds
            </div>
          </div>
        </motion.div>
      )}

      <div className="text-center">
        {/* Icon */}
        <div className="text-aviation-amber text-5xl mb-4" aria-hidden="true">
          {icon}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-header font-bold text-aviation-text mb-3 uppercase tracking-wider">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-aviation-text-muted mb-6">{description}</p>

        {/* Feature List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left max-w-lg mx-auto">
          {features.map((feature) => (
            <div key={feature} className="flex items-start gap-2">
              <div className="text-green-400 mt-0.5" aria-hidden="true">
                ✓
              </div>
              <div className="text-sm text-aviation-text">{feature}</div>
            </div>
          ))}
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={onGenerate}
          disabled={generating}
          aria-label={generating ? `${loadingText} Please wait.` : buttonText}
          className="px-6 py-3 bg-aviation-amber text-aviation-charcoal font-header font-bold uppercase tracking-wider rounded hover:bg-aviation-amber/90 hover:shadow-[0_0_20px_rgba(255,165,0,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none focus:outline-none focus:ring-2 focus:ring-aviation-amber focus:ring-offset-2 focus:ring-offset-aviation-charcoal"
        >
          {generating ? 'Generating...' : buttonText}
        </button>

        {/* Cache hint */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-aviation-text-muted">
          <div className="text-aviation-amber" aria-hidden="true">
            💡
          </div>
          <span>Generated once, cached forever</span>
        </div>
      </div>
    </motion.div>
  );
}

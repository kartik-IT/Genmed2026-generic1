import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary that catches render errors and displays a retry-able error state.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

/**
 * Inline error fallback UI — also usable standalone for API error states.
 */
export const ErrorFallback: React.FC<{
  error: Error | null;
  onRetry?: () => void;
  compact?: boolean;
}> = ({ error, onRetry, compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
        <span className="material-symbols-outlined text-red-400 text-xl">error</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-red-300 truncate">
            {error?.message || 'Something went wrong'}
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs font-medium text-red-300 hover:text-red-200 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-6">
        {/* Error icon */}
        <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-red-400 text-4xl">
            cloud_off
          </span>
        </div>

        {/* Error text */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-on-surface">
            Something went wrong
          </h2>
          <p className="text-sm text-secondary leading-relaxed">
            {error?.message || 'An unexpected error occurred. Please try again.'}
          </p>
        </div>

        {/* Retry button */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/15 text-emerald-400 font-medium text-sm hover:bg-emerald-500/25 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
            Try Again
          </button>
        )}

        {/* Debug info */}
        {error && (
          <details className="text-left mt-4">
            <summary className="text-xs text-secondary/60 cursor-pointer hover:text-secondary">
              Technical details
            </summary>
            <pre className="mt-2 text-xs text-secondary/40 bg-white/5 rounded-lg p-3 overflow-x-auto">
              {error.stack || error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

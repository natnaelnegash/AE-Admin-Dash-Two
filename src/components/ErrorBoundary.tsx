import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to external monitoring service here (e.g., Sentry)
    console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-center px-6">
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-2">
            <span className="text-red-400 text-3xl font-black">✕</span>
          </div>
          <h3 className="text-white text-xl font-black">Page Crashed</h3>
          <p className="text-gray-500 text-sm max-w-sm font-medium">
            This section encountered an unexpected error. The rest of the dashboard is unaffected.
          </p>
          {this.state.error && (
            <pre className="mt-2 text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 max-w-lg overflow-x-auto text-left">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            className="mt-4 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-2xl transition-all active:scale-95"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

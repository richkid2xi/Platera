import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // We can log the error to Sentry or another reporting service here
    console.error('Uncaught error in React component tree:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background-50 dark:bg-foreground-950 p-6">
          <div className="max-w-md w-full bg-white dark:bg-foreground-900 rounded-2xl p-8 text-center shadow-2xl border border-foreground-200 dark:border-foreground-800 animate-slide-up">
            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-6">
              <i className="ri-error-warning-fill text-3xl text-red-500"></i>
            </div>
            <h1 className="text-2xl font-heading font-bold text-foreground-900 dark:text-white mb-2">
              Oops! Something went wrong.
            </h1>
            <p className="text-foreground-500 dark:text-foreground-400 mb-8 font-body">
              An unexpected error occurred while loading this page. We've been notified and are looking into it.
            </p>
            <button
              onClick={() => window.location.replace('/')}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors font-body"
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

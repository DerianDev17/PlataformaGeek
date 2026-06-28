import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="rounded-lg border border-geek-border bg-geek-dark-secondary p-8 text-center" role="alert">
          <p className="text-sm text-geek-text-secondary">Algo salio mal al cargar este componente.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { BrandLogo } from './components/BrandLogo';
import './index.css';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    console.error('RootErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('istafa_cart_v1');
    } catch {
      // ignore storage errors in restricted iframes
    }
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF9F6] text-[#141413] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-neutral-200 rounded-2xl p-6 shadow-xl text-center space-y-4">
            <div className="flex justify-center">
              <BrandLogo theme="light" size="md" />
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Maaf, halaman sedang mengalami kendala. Silakan coba kembali.
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="ds-btn-primary w-full"
            >
              Coba Kembali
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  );
}

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { APP_NAME } from '../lib/constants';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#EFEAE2] shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#FF5A36] mx-auto flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="eyebrow text-[#FF5A36]">Unexpected Error</span>
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#1C1917]">
                Something Went Wrong
              </h1>
              <p className="text-stone-600 text-xs sm:text-sm font-sans leading-relaxed">
                An unexpected hiccup occurred while rendering this page on {APP_NAME}. Your saved offline vault and preferences remain completely safe.
              </p>
            </div>

            {this.state.error && (
              <details className="text-left text-xs bg-stone-50 p-3 rounded-xl border border-stone-200/60 text-stone-500 font-mono overflow-auto max-h-32">
                <summary className="cursor-pointer font-bold font-sans text-stone-600 hover:text-stone-900 select-none">
                  Technical details
                </summary>
                <p className="mt-2 text-[11px] whitespace-pre-wrap break-words">
                  {this.state.error.message}
                </p>
              </details>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto btn bg-[#FF5A36] hover:bg-[#D8350F] text-white text-xs font-bold px-6 py-3 rounded-full flex items-center justify-center gap-2 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto btn bg-stone-100 hover:bg-stone-200 text-[#1C1917] text-xs font-bold px-6 py-3 rounded-full flex items-center justify-center gap-2"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

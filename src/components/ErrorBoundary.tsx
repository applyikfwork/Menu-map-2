import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Sparkles } from 'lucide-react';
import { APP_NAME } from '../lib/constants';
import { isChunkLoadError, reloadForNewVersion } from '../lib/lazyWithRetry';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isChunkError: boolean;
  isAutoRefreshing: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  private autoRefreshTimer: number | null = null;

  public state: State = {
    hasError: false,
    error: null,
    isChunkError: false,
    isAutoRefreshing: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    const isChunk = isChunkLoadError(error);
    return {
      hasError: true,
      error,
      isChunkError: isChunk,
      isAutoRefreshing: isChunk,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    if (isChunkLoadError(error)) {
      // Check if we should auto-refresh to load the newly deployed assets
      const storageKey = 'menumaps_eb_last_reload';
      const lastReload = parseInt(sessionStorage.getItem(storageKey) || '0', 10);
      const now = Date.now();

      if (now - lastReload > 12000) {
        sessionStorage.setItem(storageKey, String(now));
        this.setState({ isAutoRefreshing: true });
        this.autoRefreshTimer = window.setTimeout(() => {
          reloadForNewVersion('error_boundary_chunk_error');
        }, 500);
      } else {
        this.setState({ isAutoRefreshing: false });
      }
    }
  }

  public componentWillUnmount() {
    if (this.autoRefreshTimer) {
      window.clearTimeout(this.autoRefreshTimer);
    }
  }

  private handleManualUpdate = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('_upd', String(Date.now()));
      window.location.replace(url.toString());
    } catch {
      window.location.reload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      // 1. Sleek auto-updating view when a new version was deployed
      if (this.state.isChunkError && this.state.isAutoRefreshing) {
        return (
          <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#EFEAE2] shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#FF5A36] mx-auto flex items-center justify-center shadow-inner">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-2">
                <span className="eyebrow text-[#FF5A36]">New Version Available</span>
                <h1 className="font-heading font-black text-2xl text-[#1C1917]">
                  Updating {APP_NAME}…
                </h1>
                <p className="text-stone-600 text-xs sm:text-sm font-sans leading-relaxed">
                  A fresh update was just published with speed enhancements and new cafe menus. Loading the latest version for you right now…
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={this.handleManualUpdate}
                  className="btn bg-[#FF5A36] hover:bg-[#D8350F] text-white text-xs font-bold px-6 py-3 rounded-full inline-flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Tap to update immediately</span>
                </button>
              </div>
            </div>
          </div>
        );
      }

      // 2. Clear "New Version Ready" prompt if auto-refresh cooldown is active or offline
      if (this.state.isChunkError) {
        return (
          <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#EFEAE2] shadow-xl text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="eyebrow text-amber-600">Fresh Update Ready</span>
                <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#1C1917]">
                  New Version Available
                </h1>
                <p className="text-stone-600 text-xs sm:text-sm font-sans leading-relaxed">
                  {APP_NAME} has just been updated with new verified menus, faster discovery, and fresh food guides. Click below to load the newest version.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={this.handleManualUpdate}
                  className="w-full sm:w-auto btn bg-[#FF5A36] hover:bg-[#D8350F] text-white text-xs font-bold px-6 py-3 rounded-full flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Update to Latest Version</span>
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="w-full sm:w-auto btn bg-stone-100 hover:bg-stone-200 text-[#1C1917] text-xs font-bold px-6 py-3 rounded-full flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Return Home</span>
                </button>
              </div>
            </div>
          </div>
        );
      }

      // 3. Fallback for unexpected non-chunk runtime issues
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
                className="w-full sm:w-auto btn bg-[#FF5A36] hover:bg-[#D8350F] text-white text-xs font-bold px-6 py-3 rounded-full flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto btn bg-stone-100 hover:bg-stone-200 text-[#1C1917] text-xs font-bold px-6 py-3 rounded-full flex items-center justify-center gap-2 cursor-pointer"
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

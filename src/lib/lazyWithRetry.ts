import React, { ComponentType, LazyExoticComponent } from 'react';

/**
 * Checks whether an error is caused by a missing chunk / dynamically imported module.
 * This occurs when:
 * 1. A new version of Menu Maps was deployed and older chunk hashes no longer exist on the server.
 * 2. Mobile signal momentarily dropped while fetching the chunk file.
 * 3. Browser cache served stale index.html.
 */
export function isChunkLoadError(error: unknown): boolean {
  if (!error) return false;
  const msg = (
    typeof error === 'string'
      ? error
      : (error as any)?.message || (error as any)?.toString?.() || ''
  ).toLowerCase();

  return (
    msg.includes('failed to fetch dynamically imported module') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('loading chunk') ||
    msg.includes('chunkloaderror') ||
    msg.includes('importing a module script failed') ||
    msg.includes('unable to preload css') ||
    msg.includes('failed to fetch') ||
    msg.includes('network error')
  );
}

const RELOAD_THROTTLE_MS = 15000; // 15 seconds cooldown to prevent reload loops

/**
 * Perform a cache-busted, clean page refresh to pull the newly deployed app bundle.
 */
export function reloadForNewVersion(reason = 'new_deployment'): void {
  if (typeof window === 'undefined') return;

  const storageKey = 'menumaps_last_version_reload';
  const now = Date.now();
  const lastReload = parseInt(sessionStorage.getItem(storageKey) || '0', 10);

  if (now - lastReload > RELOAD_THROTTLE_MS) {
    sessionStorage.setItem(storageKey, String(now));
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('_v', String(now));
      window.location.replace(url.toString());
    } catch {
      window.location.reload();
    }
  }
}

/**
 * Production-ready wrapper around React.lazy() that:
 * 1. Automatically retries failed chunk downloads twice (recovering from cellular/Wi-Fi blips).
 * 2. Automatically refreshes the page when a new deployment invalidates chunk hashes.
 * 3. Never crashes React or presents scary "Unexpected Error" screens during deployments.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T } | any>,
  componentName: string = 'Component',
  exportKey: string = 'default'
): LazyExoticComponent<T> {
  return React.lazy(async () => {
    const storageKey = `menumaps_chunk_${componentName}`;
    const now = Date.now();
    const lastReload = parseInt(sessionStorage.getItem(storageKey) || '0', 10);
    const hasReloadedRecently = now - lastReload < RELOAD_THROTTLE_MS;

    const executeImport = async (retries = 2, delay = 400): Promise<any> => {
      try {
        const mod = await factory();
        // Clear reload flag upon successful load
        try {
          sessionStorage.removeItem(storageKey);
        } catch {}
        return mod;
      } catch (err: any) {
        if (retries > 0 && isChunkLoadError(err)) {
          await new Promise((res) => setTimeout(res, delay));
          return executeImport(retries - 1, delay * 2);
        }
        throw err;
      }
    };

    try {
      const mod = await executeImport();
      const resolved = (mod && mod[exportKey]) || mod?.default || mod;
      return { default: resolved };
    } catch (err: any) {
      if (isChunkLoadError(err) && !hasReloadedRecently && typeof window !== 'undefined') {
        console.warn(`[MenuMaps] Dynamic chunk load failed for "${componentName}". Refreshing page to fetch latest deployment bundle...`, err);
        try {
          sessionStorage.setItem(storageKey, String(now));
        } catch {}

        reloadForNewVersion(componentName);

        // Keep Promise pending so React Suspense displays skeleton/fallback while the browser reloads
        return new Promise(() => {});
      }

      // If already reloaded recently or fatal, throw so ErrorBoundary can present graceful recovery UI
      throw err;
    }
  });
}

/**
 * Dynamic import helper for regular async functions (e.g. data seeds, helper libraries)
 */
export async function safeDynamicImport<T = any>(
  importFn: () => Promise<T>,
  retries = 2,
  delay = 400
): Promise<T> {
  try {
    return await importFn();
  } catch (err: any) {
    if (retries > 0 && isChunkLoadError(err)) {
      await new Promise((res) => setTimeout(res, delay));
      return safeDynamicImport(importFn, retries - 1, delay * 2);
    }
    throw err;
  }
}

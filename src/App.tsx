/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Home } from './pages/Home';

// Lazy-loaded routes for optimal bundle splitting and fast mobile FCP
const Search = React.lazy(() => import('./pages/Search').then((m) => ({ default: m.Search })));
const RestaurantsList = React.lazy(() => import('./pages/RestaurantsList').then((m) => ({ default: m.RestaurantsList })));
const RestaurantDetail = React.lazy(() => import('./pages/RestaurantDetail').then((m) => ({ default: m.RestaurantDetail })));
const FoodDetail = React.lazy(() => import('./pages/FoodDetail').then((m) => ({ default: m.FoodDetail })));
const CollectionsList = React.lazy(() => import('./pages/CollectionsList').then((m) => ({ default: m.CollectionsList })));
const CollectionDetail = React.lazy(() => import('./pages/CollectionDetail').then((m) => ({ default: m.CollectionDetail })));
const Bookmarks = React.lazy(() => import('./pages/Bookmarks').then((m) => ({ default: m.Bookmarks })));
const StaticPage = React.lazy(() => import('./pages/StaticPages').then((m) => ({ default: m.StaticPage })));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel').then((m) => ({ default: m.AdminPanel })));
const OwnerLogin = React.lazy(() => import('./pages/OwnerLogin').then((m) => ({ default: m.OwnerLogin })));
const OwnerDashboard = React.lazy(() => import('./pages/OwnerDashboard').then((m) => ({ default: m.OwnerDashboard })));
const NotFound = React.lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));

import { ADMIN_EMAIL, getCurrentAdminSession, api } from './lib/supabase';
import { getCachedUserCoordinates, detectAreaContext, GeoCoordinates } from './lib/location';

// Local stub for platform analytics
const Analytics = () => null;

function AppContent() {
  const { showToast } = useToast();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [searchParams, setSearchParams] = useState<URLSearchParams>(() => {
    return new URLSearchParams(window.location.search);
  });
  const [detectedCity, setDetectedCity] = useState<string>('Delhi NCR');

  // Dynamic Neighborhood sync from cached or live GPS
  useEffect(() => {
    const updateLocationContext = async (coords?: GeoCoordinates) => {
      try {
        const active = coords || getCachedUserCoordinates();
        if (!active) return;
        const rests = await api.getRestaurants(true);
        const ctx = detectAreaContext(active, rests);
        if (ctx?.areaName) {
          setDetectedCity(ctx.areaName);
        }
      } catch (err) {
        // Fallback to Delhi NCR
      }
    };

    updateLocationContext();

    const handleLocUpdate = (e: any) => {
      if (e.detail) {
        updateLocationContext(e.detail);
      }
    };
    window.addEventListener('menumap_location_updated', handleLocUpdate);
    return () => window.removeEventListener('menumap_location_updated', handleLocUpdate);
  }, []);

  // Client-side router navigation
  const navigate = (pathWithQuery: string) => {
    const url = new URL(pathWithQuery, window.location.origin);
    window.history.pushState({}, '', pathWithQuery);
    setCurrentPath(url.pathname);
    setSearchParams(new URLSearchParams(url.search));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Strict Admin route guard check
  useEffect(() => {
    if (currentPath === '/admin-secure-panel2010') {
      const session = getCurrentAdminSession();
      // If session exists but email is not xyzapplywork@gmail.com, force kick
      if (session && session.email !== ADMIN_EMAIL) {
        showToast('Unauthorized: Restricted administrator access only.', 'error');
        navigate('/');
      }
    }
  }, [currentPath]);

  // Route Dispatcher
  const renderRoute = () => {
    // 1. Admin panel
    if (currentPath === '/admin-secure-panel2010') {
      return <AdminPanel navigate={navigate} />;
    }

    // 1b. Restaurant Owner Portal & Login
    if (currentPath === '/owner/login') {
      return <OwnerLogin navigate={navigate} />;
    }
    if (currentPath === '/owner/dashboard') {
      return <OwnerDashboard navigate={navigate} />;
    }

    // 2. Home
    if (currentPath === '/' || currentPath === '') {
      return <Home navigate={navigate} />;
    }

    // 3. Search
    if (currentPath === '/search') {
      return (
        <Search
          navigate={navigate}
          initialQuery={searchParams.get('q') || ''}
          initialCuisine={searchParams.get('cuisine') || ''}
        />
      );
    }

    // 4. Restaurants Directory & Unified Explore
    if (currentPath === '/restaurants') {
      return <RestaurantsList navigate={navigate} initialMode="explore" />;
    }

    // 5. Restaurant Detail: /restaurant/[slug] (Full backward compatibility for all previously shared links)
    if (currentPath.startsWith('/restaurant/')) {
      const cleanPart = currentPath.slice('/restaurant/'.length).split('/')[0].split('?')[0].split('#')[0];
      const slug = decodeURIComponent(cleanPart.trim());
      if (slug) {
        return <RestaurantDetail slug={slug} navigate={navigate} />;
      }
    }

    // 6. Food Detail: /food/[itemSlug]
    if (currentPath.startsWith('/food/')) {
      const cleanPart = currentPath.slice('/food/'.length).split('/')[0].split('?')[0].split('#')[0];
      const slug = decodeURIComponent(cleanPart.trim());
      return <FoodDetail slug={slug} navigate={navigate} />;
    }

    // 7. Iconic Area Food Guides (/iconic-area, /iconic-areas & legacy /collections)
    if (currentPath === '/iconic-area' || currentPath === '/iconic-areas' || currentPath === '/collections') {
      return <CollectionsList navigate={navigate} />;
    }

    // 8. Iconic Area Detail: /iconic-area/[slug], /iconic-areas/[slug], /collection/[slug]
    if (currentPath.startsWith('/iconic-area/')) {
      const cleanPart = currentPath.slice('/iconic-area/'.length).split('/')[0].split('?')[0].split('#')[0];
      const slug = decodeURIComponent(cleanPart.trim());
      return <CollectionDetail slug={slug} navigate={navigate} />;
    }
    if (currentPath.startsWith('/iconic-areas/')) {
      const cleanPart = currentPath.slice('/iconic-areas/'.length).split('/')[0].split('?')[0].split('#')[0];
      const slug = decodeURIComponent(cleanPart.trim());
      return <CollectionDetail slug={slug} navigate={navigate} />;
    }
    if (currentPath.startsWith('/collection/')) {
      const cleanPart = currentPath.slice('/collection/'.length).split('/')[0].split('?')[0].split('#')[0];
      const slug = decodeURIComponent(cleanPart.trim());
      return <CollectionDetail slug={slug} navigate={navigate} />;
    }

    // 9. Nearby (Unified with Explore Discovery)
    if (currentPath === '/nearby') {
      return <RestaurantsList navigate={navigate} initialMode="near_me" />;
    }

    // 10. Bookmarks
    if (currentPath === '/bookmarks') {
      return <Bookmarks navigate={navigate} />;
    }

    // 11. Static Pages
    if (currentPath === '/about') {
      return <StaticPage type="about" navigate={navigate} />;
    }
    if (currentPath === '/contact') {
      return <StaticPage type="contact" navigate={navigate} />;
    }
    if (currentPath === '/terms') {
      return <StaticPage type="terms" navigate={navigate} />;
    }
    if (currentPath === '/privacy') {
      return <StaticPage type="privacy" navigate={navigate} />;
    }

    // 12. Direct Clean Restaurant Slug Route: /:slug (e.g. /the-pizza-family)
    const directSlugRaw = currentPath.replace(/^\/+/, '').split('/')[0].split('?')[0].split('#')[0];
    const directSlug = decodeURIComponent(directSlugRaw.trim());
    if (directSlug && directSlug.length > 0) {
      return <RestaurantDetail slug={directSlug} navigate={navigate} />;
    }

    // Fallback: 404
    return <NotFound navigate={navigate} />;
  };

  const isAdminPage = currentPath === '/admin-secure-panel2010';

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917]">
      {!isAdminPage && (
        <Navbar
          currentPath={currentPath}
          navigate={navigate}
          city={detectedCity}
        />
      )}
      
      <main className="flex-1 pb-28 md:pb-0">
        <React.Suspense
          fallback={
            <div className="min-h-[50vh] flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-[#FF5A36] border-t-transparent animate-spin" />
            </div>
          }
        >
          {renderRoute()}
        </React.Suspense>
      </main>

      {!isAdminPage && <Footer navigate={navigate} />}
      {!isAdminPage && <MobileBottomNav currentPath={currentPath} navigate={navigate} />}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppContent />
        <Analytics />
      </ToastProvider>
    </ErrorBoundary>
  );
}

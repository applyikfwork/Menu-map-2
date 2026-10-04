/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './components/Toast';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { RestaurantsList } from './pages/RestaurantsList';
import { RestaurantDetail } from './pages/RestaurantDetail';
import { FoodDetail } from './pages/FoodDetail';
import { CollectionsList } from './pages/CollectionsList';
import { CollectionDetail } from './pages/CollectionDetail';
import { Nearby } from './pages/Nearby';
import { Bookmarks } from './pages/Bookmarks';
import { StaticPage } from './pages/StaticPages';
import { AdminPanel } from './pages/AdminPanel';
import { OwnerLogin } from './pages/OwnerLogin';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { ADMIN_EMAIL, getCurrentAdminSession, api } from './lib/supabase';
import { applyBrowserFavicon } from './lib/favicon';

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

  // Dynamic Browser Tab Favicon Sync
  useEffect(() => {
    api.getSettings().then((settings) => {
      if (settings.custom_favicon_url) {
        applyBrowserFavicon(settings.custom_favicon_url);
      }
    });
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

    // Fallback: 404 or redirect home
    return <Home navigate={navigate} />;
  };

  const isAdminPage = currentPath === '/admin-secure-panel2010';

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/70 text-slate-800">
      {!isAdminPage && (
        <Navbar
          currentPath={currentPath}
          navigate={navigate}
          city="Delhi NCR"
        />
      )}
      
      <main className="flex-1">
        {renderRoute()}
      </main>

      {!isAdminPage && <Footer navigate={navigate} />}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
      <Analytics />
    </ToastProvider>
  );
}

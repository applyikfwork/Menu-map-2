/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DiscoveryProvider } from './context/DiscoveryContext';
import { LocationProvider } from './context/LocationContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Home } from './pages/Home';
import { lazyWithRetry } from './lib/lazyWithRetry';

// Lazy-loaded routes with auto-retry and smooth deployment self-healing
const Search = lazyWithRetry(() => import('./pages/Search'), 'Search', 'Search');
const RestaurantsList = lazyWithRetry(() => import('./pages/RestaurantsList'), 'RestaurantsList', 'RestaurantsList');
const RestaurantDetail = lazyWithRetry(() => import('./pages/RestaurantDetail'), 'RestaurantDetail', 'RestaurantDetail');
const FoodDetail = lazyWithRetry(() => import('./pages/FoodDetail'), 'FoodDetail', 'FoodDetail');
const DishRadar = lazyWithRetry(() => import('./pages/DishRadar'), 'DishRadar', 'DishRadar');
const Bookmarks = lazyWithRetry(() => import('./pages/Bookmarks'), 'Bookmarks', 'Bookmarks');
const StaticPage = lazyWithRetry(() => import('./pages/StaticPages'), 'StaticPage', 'StaticPage');
const AdminPanel = lazyWithRetry(() => import('./pages/AdminPanel'), 'AdminPanel', 'AdminPanel');
const OwnerLogin = lazyWithRetry(() => import('./pages/OwnerLogin'), 'OwnerLogin', 'OwnerLogin');
const OwnerDashboard = lazyWithRetry(() => import('./pages/OwnerDashboard'), 'OwnerDashboard', 'OwnerDashboard');
const ListCafe = lazyWithRetry(() => import('./pages/ListCafe'), 'ListCafe', 'ListCafe');
const ClaimVerify = lazyWithRetry(() => import('./pages/ClaimVerify'), 'ClaimVerify', 'ClaimVerify');
const NotFound = lazyWithRetry(() => import('./pages/NotFound'), 'NotFound', 'NotFound');

// Discovery Ecosystem Lazy Routes
const DiscoveryHome = lazyWithRetry(() => import('./discovery/pages/DiscoveryHome'), 'DiscoveryHome', 'DiscoveryHome');
const CompetitionsList = lazyWithRetry(() => import('./discovery/pages/CompetitionsList'), 'CompetitionsList', 'CompetitionsList');
const DiscoveryLeagueSeries = lazyWithRetry(() => import('./discovery/pages/DiscoveryLeagueSeries'), 'DiscoveryLeagueSeries', 'DiscoveryLeagueSeries');
const CompetitionDetail = lazyWithRetry(() => import('./discovery/pages/CompetitionDetail'), 'CompetitionDetail', 'CompetitionDetail');
const StudentCreations = lazyWithRetry(() => import('./discovery/pages/StudentCreations'), 'StudentCreations', 'StudentCreations');
const ProjectDetail = lazyWithRetry(() => import('./discovery/pages/ProjectDetail'), 'ProjectDetail', 'ProjectDetail');
const FoodTrailsList = lazyWithRetry(() => import('./discovery/pages/FoodTrailsList'), 'FoodTrailsList', 'FoodTrailsList');
const FoodDiscoveriesList = lazyWithRetry(() => import('./discovery/pages/FoodDiscoveriesList'), 'FoodDiscoveriesList', 'FoodDiscoveriesList');
const ContributorsList = lazyWithRetry(() => import('./discovery/pages/ContributorsList'), 'ContributorsList', 'ContributorsList');
const ContributorProfile = lazyWithRetry(() => import('./discovery/pages/ContributorProfile'), 'ContributorProfile', 'ContributorProfile');
const HallOfFame = lazyWithRetry(() => import('./discovery/pages/HallOfFame'), 'HallOfFame', 'HallOfFame');
const CertificateVerification = lazyWithRetry(() => import('./discovery/pages/CertificateVerification'), 'CertificateVerification', 'CertificateVerification');
const StudentAuth = lazyWithRetry(() => import('./discovery/pages/StudentAuth'), 'StudentAuth', 'StudentAuth');
const StudentDashboard = lazyWithRetry(() => import('./discovery/pages/StudentDashboard'), 'StudentDashboard', 'StudentDashboard');
const DiscoveryAdminPanel = lazyWithRetry(() => import('./discovery/pages/DiscoveryAdminPanel'), 'DiscoveryAdminPanel', 'DiscoveryAdminPanel');

import { StudentAuthProvider } from './discovery/context/StudentAuthContext';

import { ADMIN_EMAIL, getCurrentAdminSession } from './lib/supabase';

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

  // Route Dispatcher with normalized path matching (handles trailing slashes & case-insensitivity)
  const renderRoute = () => {
    const normPath = (currentPath.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/').toLowerCase();

    // 1. Admin panel
    if (normPath === '/admin-secure-panel2010') {
      return <AdminPanel navigate={navigate} />;
    }

    // 1b. Restaurant Owner Portal & Login
    if (normPath === '/owner/login') {
      return <OwnerLogin navigate={navigate} />;
    }
    if (normPath === '/owner/dashboard') {
      return <OwnerDashboard navigate={navigate} />;
    }
    if (normPath === '/list-cafe' || normPath === '/create-cafe') {
      return <ListCafe navigate={navigate} />;
    }

    // 2. Home
    if (normPath === '/' || normPath === '') {
      return <Home navigate={navigate} />;
    }

    // 3. Search
    if (normPath === '/search') {
      return (
        <Search
          navigate={navigate}
          initialQuery={searchParams.get('q') || ''}
          initialCuisine={searchParams.get('cuisine') || ''}
        />
      );
    }

    // 4. Restaurants Directory & Unified Explore
    if (normPath === '/restaurants') {
      return <RestaurantsList navigate={navigate} initialMode="explore" />;
    }

    // 5. Restaurant Detail: /restaurant/[slug] (Full backward compatibility for all previously shared links)
    if (normPath.startsWith('/restaurant/')) {
      const slug = normPath.slice('/restaurant/'.length).split('/')[0].trim();
      if (slug) {
        return <RestaurantDetail slug={slug} navigate={navigate} />;
      }
    }

    // 6. Food Detail: /food/[itemSlug] or /dish/[itemSlug]
    if (normPath.startsWith('/food/')) {
      const slug = normPath.slice('/food/'.length).split('/')[0].trim();
      return <FoodDetail slug={slug} navigate={navigate} />;
    }
    if (normPath.startsWith('/dish/')) {
      const slug = normPath.slice('/dish/'.length).split('/')[0].trim();
      return <FoodDetail slug={slug} navigate={navigate} />;
    }

    // 6.1. Dish Intelligence & Craving Radar Hub
    if (
      normPath === '/dishes' ||
      normPath === '/dish-radar' ||
      normPath === '/cravings' ||
      normPath.startsWith('/dishes/') ||
      normPath.startsWith('/dish-radar/') ||
      normPath.startsWith('/cravings/')
    ) {
      return <DishRadar navigate={navigate} />;
    }

    // 7. Legacy Iconic Area URL Redirect to /restaurants
    if (
      normPath === '/iconic-area' ||
      normPath === '/iconic-areas' ||
      normPath === '/collections' ||
      normPath.startsWith('/iconic-area/') ||
      normPath.startsWith('/iconic-areas/') ||
      normPath.startsWith('/collection/')
    ) {
      navigate('/restaurants');
      return null;
    }

    // 9. Nearby (Unified with Explore Discovery)
    if (normPath === '/nearby') {
      return <RestaurantsList navigate={navigate} initialMode="near_me" />;
    }

    // 10. Bookmarks
    if (normPath === '/bookmarks') {
      return <Bookmarks navigate={navigate} />;
    }

    // 11. Static Pages
    if (normPath === '/about') {
      return <StaticPage type="about" navigate={navigate} />;
    }
    if (normPath === '/contact') {
      return <StaticPage type="contact" navigate={navigate} />;
    }
    if (normPath === '/terms') {
      return <StaticPage type="terms" navigate={navigate} />;
    }
    if (normPath === '/privacy') {
      return <StaticPage type="privacy" navigate={navigate} />;
    }

    // 11.5. Exclusive Cafe Ownership Activation Route: /claim-verify
    if (normPath === '/claim-verify') {
      return <ClaimVerify navigate={navigate} searchParams={searchParams} />;
    }

    // 11.6. Menu Maps Discovery Ecosystem
    if (normPath === '/discovery') {
      return <DiscoveryHome navigate={navigate} />;
    }
    if (normPath === '/discovery/competitions') {
      return <CompetitionsList navigate={navigate} />;
    }
    if (normPath === '/discovery/competitions/discovery-league') {
      return <DiscoveryLeagueSeries navigate={navigate} />;
    }
    if (normPath.startsWith('/discovery/competitions/')) {
      const slug = normPath.slice('/discovery/competitions/'.length).split('/')[0].trim();
      return <CompetitionDetail slug={slug} navigate={navigate} />;
    }
    if (normPath === '/discovery/creations') {
      return <StudentCreations navigate={navigate} />;
    }
    if (normPath.startsWith('/discovery/creations/')) {
      const slug = normPath.slice('/discovery/creations/'.length).split('/')[0].trim();
      return <ProjectDetail slug={slug} navigate={navigate} />;
    }
    if (normPath === '/discovery/trails') {
      return <FoodTrailsList navigate={navigate} />;
    }
    if (normPath === '/discovery/food-discoveries') {
      return <FoodDiscoveriesList navigate={navigate} />;
    }
    if (normPath === '/discovery/contributors') {
      return <ContributorsList navigate={navigate} />;
    }
    if (normPath.startsWith('/discovery/contributors/')) {
      const slug = normPath.slice('/discovery/contributors/'.length).split('/')[0].trim();
      return <ContributorProfile slug={slug} navigate={navigate} />;
    }
    if (normPath === '/discovery/hall-of-fame') {
      return <HallOfFame navigate={navigate} />;
    }
    if (normPath === '/discovery/certificates' || normPath.startsWith('/discovery/certificates/')) {
      const certId = normPath.startsWith('/discovery/certificates/')
        ? normPath.slice('/discovery/certificates/'.length).split('/')[0].trim()
        : (searchParams.get('id') || '');
      return <CertificateVerification certificateId={certId} navigate={navigate} />;
    }
    if (normPath === '/discovery/login') {
      return <StudentAuth initialMode="login" navigate={navigate} />;
    }
    if (normPath === '/discovery/register') {
      return <StudentAuth initialMode="register" navigate={navigate} />;
    }
    if (normPath === '/discovery/dashboard') {
      return (
        <StudentDashboard
          navigate={navigate}
          initialTab={searchParams.get('tab') || 'overview'}
        />
      );
    }
    if (normPath === '/discovery/admin') {
      return <DiscoveryAdminPanel navigate={navigate} />;
    }

    // 12. Direct Clean Restaurant Slug Route: /:slug (e.g. /the-pizza-family)
    const directSlug = normPath.replace(/^\/+/, '').split('/')[0].trim();
    const RESERVED_ROUTES = new Set([
      'admin-secure-panel2010', 'owner', 'list-cafe', 'create-cafe', 'search',
      'restaurants', 'restaurant', 'food', 'dish', 'dishes', 'dish-radar', 'cravings', 'nearby', 'bookmarks', 'about', 'contact',
      'terms', 'privacy', 'claim-verify', 'discovery', 'api', 'assets', 'favicon.ico',
      'manifest.json', 'robots.txt', 'sitemap.xml', 'index.html'
    ]);

    if (directSlug && !RESERVED_ROUTES.has(directSlug)) {
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
        />
      )}
      
      <main className="flex-1 pb-32 md:pb-0">
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
        <LocationProvider>
          <StudentAuthProvider>
          <DiscoveryProvider>
            <AppContent />
            <Analytics />
          </DiscoveryProvider>
          </StudentAuthProvider>
        </LocationProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

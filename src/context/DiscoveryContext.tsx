import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  CentralDiscoveryEngine, 
  discoveryEngine, 
  MealTimeWindow, 
  getCurrentMealTimeWindow, 
  MEAL_TIME_WINDOWS,
  MealTimeInfo,
  CounterSavings,
  calculateCounterSavings
} from '../lib/engine/discoveryEngine';
import { Restaurant, MenuItem, MenuCategory, Collection } from '../types/database';
import { api } from '../lib/supabase';
import { getCachedUserCoordinates, GeoCoordinates } from '../lib/location';

interface RecentViewItem {
  type: 'dish' | 'restaurant' | 'guide';
  id: string;
  name: string;
  slug: string;
  timestamp: number;
}

interface DiscoveryContextValue {
  engine: CentralDiscoveryEngine;
  isReady: boolean;
  currentMealTime: MealTimeWindow;
  mealTimeInfo: MealTimeInfo;
  setManualMealTime: (time: MealTimeWindow) => void;
  isManualMealTime: boolean;
  resetMealTimeToCurrent: () => void;
  activeLocality: string;
  setActiveLocality: (loc: string) => void;
  userDiet: 'all' | 'veg' | 'non_veg';
  setUserDiet: (diet: 'all' | 'veg' | 'non_veg') => void;
  recentViews: RecentViewItem[];
  trackView: (type: 'dish' | 'restaurant' | 'guide', id: string, name: string, slug: string) => void;
  refreshEngine: () => Promise<void>;
  calculateSavings: (price: number) => CounterSavings;
}

const DiscoveryContext = createContext<DiscoveryContextValue | null>(null);

const RECENT_VIEWS_STORAGE_KEY = 'menumaps_recent_views';
const USER_DIET_STORAGE_KEY = 'menumaps_user_diet';

export const DiscoveryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [manualMealTime, setManualMealTimeState] = useState<MealTimeWindow | null>(null);
  const [activeLocality, setActiveLocality] = useState<string>('Delhi NCR');
  const [userDiet, setUserDietState] = useState<'all' | 'veg' | 'non_veg'>(() => {
    try {
      const saved = localStorage.getItem(USER_DIET_STORAGE_KEY);
      if (saved === 'veg' || saved === 'non_veg') return saved;
    } catch {}
    return 'all';
  });

  const [recentViews, setRecentViews] = useState<RecentViewItem[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_VIEWS_STORAGE_KEY);
      if (saved) return JSON.parse(saved).slice(0, 10);
    } catch {}
    return [];
  });

  // Calculate real-time active meal window
  const autoMealTime = useMemo(() => getCurrentMealTimeWindow(), []);
  const currentMealTime = manualMealTime || autoMealTime;
  const mealTimeInfo = MEAL_TIME_WINDOWS[currentMealTime];

  // Set user diet preference and persist
  const setUserDiet = useCallback((diet: 'all' | 'veg' | 'non_veg') => {
    setUserDietState(diet);
    try {
      localStorage.setItem(USER_DIET_STORAGE_KEY, diet);
    } catch {}
  }, []);

  // Track user browsing history for implicit recommendations
  const trackView = useCallback((type: 'dish' | 'restaurant' | 'guide', id: string, name: string, slug: string) => {
    setRecentViews((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      const next = [{ type, id, name, slug, timestamp: Date.now() }, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(RECENT_VIEWS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Hydrate engine from Supabase and local storage
  const refreshEngine = useCallback(async () => {
    try {
      const [restaurants, menuItems, collections] = await Promise.all([
        api.getRestaurants(false).catch(() => []),
        api.getMenuItems().catch(() => []),
        api.getCollections(false).catch(() => []),
      ]);

      // Categories are dynamically stored or extracted
      discoveryEngine.hydrate(restaurants, menuItems, [], collections);
      setIsReady(true);
    } catch (err) {
      console.warn('Discovery Engine hydration partial warning:', err);
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    refreshEngine();

    // Listen to location updates across the app
    const handleLocationUpdate = (e: any) => {
      if (e.detail?.localityName) {
        setActiveLocality(e.detail.localityName);
      }
    };
    window.addEventListener('menumap_location_updated', handleLocationUpdate);
    return () => window.removeEventListener('menumap_location_updated', handleLocationUpdate);
  }, [refreshEngine]);

  const setManualMealTime = useCallback((time: MealTimeWindow) => {
    setManualMealTimeState(time);
  }, []);

  const resetMealTimeToCurrent = useCallback(() => {
    setManualMealTimeState(null);
  }, []);

  const value = useMemo<DiscoveryContextValue>(() => ({
    engine: discoveryEngine,
    isReady,
    currentMealTime,
    mealTimeInfo,
    setManualMealTime,
    isManualMealTime: manualMealTime !== null,
    resetMealTimeToCurrent,
    activeLocality,
    setActiveLocality,
    userDiet,
    setUserDiet,
    recentViews,
    trackView,
    refreshEngine,
    calculateSavings: calculateCounterSavings,
  }), [
    isReady,
    currentMealTime,
    mealTimeInfo,
    manualMealTime,
    setManualMealTime,
    resetMealTimeToCurrent,
    activeLocality,
    userDiet,
    setUserDiet,
    recentViews,
    trackView,
    refreshEngine,
  ]);

  return (
    <DiscoveryContext.Provider value={value}>
      {children}
    </DiscoveryContext.Provider>
  );
};

export const useDiscovery = (): DiscoveryContextValue => {
  const context = useContext(DiscoveryContext);
  if (!context) {
    throw new Error('useDiscovery must be used within a DiscoveryProvider');
  }
  return context;
};

/**
 * Dish Demand & Real-Time Interaction Tracking Engine
 * Menu Maps (menumaps.in)
 *
 * Provides:
 * 1. Deterministic Daily Seeded Baseline: Generates authentic, realistic engagement
 *    numbers for brand new or low-traffic environments (rotates daily so different dishes trend).
 * 2. Live User Interaction Tracking: Records real-time user clicks, drawer opens,
 *    menu views, and WhatsApp direct orders, adding live points on top of the base.
 * 3. Reactive Event System: Dispatches 'menumaps_dish_demand_updated' for instant UI sync.
 */

export type InteractionType = 'click' | 'story_tap' | 'drawer_open' | 'whatsapp_order' | 'menu_view';

export interface DishInteractionRecord {
  clicks: number;
  points: number;
  lastClicked: number;
  whatsappOrders: number;
  menuViews: number;
}

export interface CombinedDishDemand {
  totalClicks: number;
  totalPoints: number;
  baseClicks: number;
  basePoints: number;
  liveClicks: number;
  livePoints: number;
  isTrending: boolean;
  isJustClicked: boolean;
  demandRankLabel?: string;
}

const STORAGE_KEY = 'menumaps_dish_demand_v1';
const EVENT_NAME = 'menumaps_dish_demand_updated';

/**
 * Deterministic pseudo-random float generator from a string seed.
 * Produces a stable number between 0.0 and 1.0 for a given input.
 */
function hashStringToFloat(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  const unsigned = hash >>> 0;
  return (unsigned % 10000) / 10000;
}

/**
 * Current date string for daily rotating demand seeds (e.g. "2026-10-26").
 */
function getDailyDateKey(): string {
  try {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  } catch {
    return 'daily-seed';
  }
}

// In-memory runtime cache ensures consistency across render passes and environments
const memoryInteractions: Record<string, DishInteractionRecord> = {};

/**
 * Safe local storage reader for client-side persistence with in-memory caching.
 */
export function getStoredInteractions(): Record<string, DishInteractionRecord> {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          Object.assign(memoryInteractions, parsed);
        }
      }
    } catch {
      // Quota or access error
    }
  }
  return memoryInteractions;
}

/**
 * Safe local storage writer with in-memory synchronization.
 */
function saveStoredInteractions(data: Record<string, DishInteractionRecord>): void {
  Object.assign(memoryInteractions, data);
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Quota or access error
    }
  }
}

/**
 * Computes deterministic base engagement for cold-start environments.
 */
export function getSeededBaseDemand(
  dishId: string,
  dishName: string,
  category: string = '',
  isMustTry: boolean = false,
  restaurantRating: number = 4.2
): { baseClicks: number; basePoints: number } {
  const dateKey = getDailyDateKey();
  const seedString = `${dishName.toLowerCase().trim()}_${dishId}_${category}_${dateKey}`;
  const seedFactor = hashStringToFloat(seedString);

  // Popular category multiplier (Momos, Coffee, Pizza, Biryani, Chaap have naturally higher street demand)
  const isHighVelocity = /momo|coffee|cold brew|pizza|burger|biryani|chaap|pasta|shake|chole|thali/i.test(
    `${dishName} ${category}`
  );

  const velocityBonus = isHighVelocity ? 18 : 6;
  const ratingBonus = Math.round(Math.max(0, restaurantRating - 3.8) * 12);
  const mustTryBonus = isMustTry ? 16 : 0;

  // Clicks typically range between 18 and 88
  const baseClicks = Math.floor(seedFactor * 42) + 18 + velocityBonus + ratingBonus + mustTryBonus;

  // Demand points typically range between 120 and 460
  const basePoints =
    baseClicks * 4 +
    Math.floor(seedFactor * 80) +
    (isMustTry ? 60 : 20) +
    (isHighVelocity ? 45 : 0);

  return { baseClicks, basePoints };
}

/**
 * Records a real-time interaction on a dish and dispatches a reactive update.
 */
export function recordDishInteraction(
  dishId: string,
  type: InteractionType = 'click'
): DishInteractionRecord {
  if (!dishId) {
    return { clicks: 0, points: 0, lastClicked: Date.now(), whatsappOrders: 0, menuViews: 0 };
  }

  const all = getStoredInteractions();
  const existing = all[dishId] || {
    clicks: 0,
    points: 0,
    lastClicked: 0,
    whatsappOrders: 0,
    menuViews: 0,
  };

  let deltaClicks = 0;
  let deltaPoints = 0;
  let deltaWhatsapp = 0;
  let deltaMenu = 0;

  switch (type) {
    case 'click':
    case 'drawer_open':
      deltaClicks = 1;
      deltaPoints = 10;
      break;
    case 'story_tap':
      deltaClicks = 1;
      deltaPoints = 8;
      break;
    case 'whatsapp_order':
      deltaClicks = 1;
      deltaPoints = 35;
      deltaWhatsapp = 1;
      break;
    case 'menu_view':
      deltaClicks = 1;
      deltaPoints = 15;
      deltaMenu = 1;
      break;
  }

  const updated: DishInteractionRecord = {
    clicks: existing.clicks + deltaClicks,
    points: existing.points + deltaPoints,
    lastClicked: Date.now(),
    whatsappOrders: (existing.whatsappOrders || 0) + deltaWhatsapp,
    menuViews: (existing.menuViews || 0) + deltaMenu,
  };

  all[dishId] = updated;
  saveStoredInteractions(all);

  // Dispatch custom window event for real-time reactivity across components
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(
        new CustomEvent(EVENT_NAME, {
          detail: { dishId, type, record: updated },
        })
      );
    } catch {}
  }

  return updated;
}

/**
 * Calculates combined dish demand (seeded baseline + live user points).
 */
export function getCombinedDishDemand(
  dishId: string,
  dishName: string,
  category: string = '',
  isMustTry: boolean = false,
  restaurantRating: number = 4.2
): CombinedDishDemand {
  const { baseClicks, basePoints } = getSeededBaseDemand(
    dishId,
    dishName,
    category,
    isMustTry,
    restaurantRating
  );

  const interactions = getStoredInteractions();
  const live = interactions[dishId] || {
    clicks: 0,
    points: 0,
    lastClicked: 0,
    whatsappOrders: 0,
    menuViews: 0,
  };

  const totalClicks = baseClicks + live.clicks;
  const totalPoints = basePoints + live.points;

  // Just clicked if within the last 8 seconds
  const isJustClicked = Date.now() - (live.lastClicked || 0) < 8000;

  // Trending if high total points or multiple live clicks
  const isTrending = totalPoints >= 240 || live.clicks >= 1;

  let demandRankLabel: string | undefined;
  if (totalPoints >= 380) {
    demandRankLabel = '🔥 Viral Favorite';
  } else if (totalPoints >= 260) {
    demandRankLabel = '⚡ High Demand';
  } else if (isMustTry) {
    demandRankLabel = '⭐ Must-Try';
  }

  return {
    totalClicks,
    totalPoints,
    baseClicks,
    basePoints,
    liveClicks: live.clicks,
    livePoints: live.points,
    isTrending,
    isJustClicked,
    demandRankLabel,
  };
}

/**
 * Custom listener hook helper for React components.
 */
export function subscribeToDemandUpdates(callback: (detail: any) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: any) => {
    callback(e.detail);
  };
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}

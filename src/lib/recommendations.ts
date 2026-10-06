import { MenuItem, Restaurant } from '../types/database';
import { calculateDistanceKm, GeoCoordinates, formatDistance } from './location';

/**
 * Multi-Factor Real-Time Recommendation Engine
 * Computes live scores for venues and dishes based on:
 * 1. Proximity Decay (Haversine formula exponential decay)
 * 2. Time-of-Day Meal Match (Breakfast, Lunch, Evening Snacks, Dinner, Late Night)
 * 3. Bayesian Weighted Rating (prevents single-review bias)
 * 4. Price Transparency & Savings Margin (boosts high savings vs food delivery apps)
 * 5. Menu Freshness / Must-Try status
 */

export interface MealContext {
  period: 'breakfast' | 'lunch' | 'evening' | 'dinner' | 'late_night';
  label: string;
  badge: string;
  description: string;
  keywords: string[];
}

/**
 * Detect current real-time meal context based on local time
 */
export function getDynamicMealContext(date: Date = new Date()): MealContext {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const timeVal = hour + minute / 60;

  if (timeVal >= 6.5 && timeVal < 11.5) {
    return {
      period: 'breakfast',
      label: 'Morning Brew & Breakfast',
      badge: '🌅 Breakfast Time',
      description: 'Hot chai, artisan coffees, stuffed parathas, dosas & freshly baked goods.',
      keywords: ['chai', 'tea', 'coffee', 'paratha', 'dosa', 'idli', 'bakery', 'croissant', 'sandwich', 'breakfast', 'poha', 'kachori', 'omelette'],
    };
  }

  if (timeVal >= 11.5 && timeVal < 16.0) {
    return {
      period: 'lunch',
      label: 'Hearty Lunch Hour',
      badge: '🍛 Lunch Specials',
      description: 'Counter thalis, fragrant biryanis, meal bowls, kathi rolls & curries.',
      keywords: ['thali', 'biryani', 'kathi roll', 'roll', 'bowl', 'meal', 'lunch', 'paneer', 'dal', 'makhani', 'curry', 'rogan', 'rice', 'roti'],
    };
  }

  if (timeVal >= 16.0 && timeVal < 19.5) {
    return {
      period: 'evening',
      label: 'Evening Cravings & Chai',
      badge: '🥟 Evening Adda',
      description: 'Crispy momos, loaded peri-peri fries, monster shakes, waffles & street bites.',
      keywords: ['momo', 'momos', 'shake', 'fries', 'chaat', 'waffle', 'snack', 'burger', 'pizza', 'samosa', 'tea', 'cafe', 'kurkure', 'beverage'],
    };
  }

  if (timeVal >= 19.5 && timeVal < 23.5) {
    return {
      period: 'dinner',
      label: 'Dinner & Rooftop Dining',
      badge: '🍷 Dinner Favorites',
      description: 'Wood-fired pizzas, creamy pastas, sizzling tandoori platters & mocktails.',
      keywords: ['pizza', 'pasta', 'tandoori', 'curry', 'platter', 'rooftop', 'dinner', 'chinese', 'noodles', 'paneer tikka', 'naan', 'gravy', 'butter chicken'],
    };
  }

  // Late Night: 23:30 to 06:30
  return {
    period: 'late_night',
    label: 'Late Night Adda',
    badge: '🌙 Midnight Munchies',
    description: 'Midnight burgers, hot Maggi, comforting rolls, ice creams & thick shakes.',
    keywords: ['burger', 'roll', 'late night', 'maggi', 'dessert', 'ice cream', 'beverage', 'shake', 'fries', 'wrap', 'night', 'coffee'],
  };
}

/**
 * Exponential Proximity Decay: S_dist = e^(-lambda * distanceKm)
 * At 0.5 km -> ~0.87
 * At 2 km -> ~0.57
 * At 5 km -> ~0.25
 * At 10 km -> ~0.06
 */
export function computeProximityScore(distanceKm?: number): number {
  if (typeof distanceKm !== 'number' || isNaN(distanceKm)) {
    return 0.5; // neutral fallback when GPS unavailable
  }
  const lambda = 0.28;
  return Math.exp(-lambda * distanceKm);
}

/**
 * Bayesian Weighted Rating
 * Prevents 1-review 5.0 venues from outranking 500-review 4.7 venues
 */
export function computeBayesianRating(
  ratingAvg: number = 4.2,
  reviewsCount: number = 10,
  minThreshold: number = 10,
  cityAvg: number = 4.2
): number {
  const weighted = (reviewsCount * ratingAvg + minThreshold * cityAvg) / (reviewsCount + minThreshold);
  // Normalize between 0 and 1 (from 3.0 to 5.0 range)
  return Math.max(0, Math.min(1, (weighted - 3.0) / 2.0));
}

/**
 * Compute counter savings margin
 */
export function computeSavingsScore(counterPrice: number, appPriceEstimate?: number): {
  score: number;
  appPrice: number;
  savingsAmt: number;
  savingsPct: number;
} {
  const appPrice = appPriceEstimate || Math.round(counterPrice * 1.32 + 35);
  const savingsAmt = Math.max(0, appPrice - counterPrice);
  const savingsPct = appPrice > 0 ? Math.round((savingsAmt / appPrice) * 100) : 0;

  // Higher percentage savings gives higher score boost
  const score = Math.min(1, Math.max(0.3, savingsPct / 40));
  return { score, appPrice, savingsAmt, savingsPct };
}

export interface ScoredRestaurant extends Restaurant {
  recommendationScore: number;
  distanceKm?: number;
  distanceLabel?: string;
  matchedKeywords: string[];
}

/**
 * Multi-Factor Scoring for Restaurants
 */
export function getRecommendedVenues(
  restaurants: Restaurant[],
  userCoords?: GeoCoordinates | null,
  limit: number = 6
): ScoredRestaurant[] {
  if (!restaurants || restaurants.length === 0) return [];

  const mealCtx = getDynamicMealContext();
  const mealRegex = new RegExp(mealCtx.keywords.join('|'), 'i');

  const scored = restaurants.map((r) => {
    // 1. Proximity score
    let distKm: number | undefined = undefined;
    if (userCoords && r.latitude && r.longitude) {
      distKm = calculateDistanceKm(userCoords.latitude, userCoords.longitude, r.latitude, r.longitude);
    }
    const sDist = computeProximityScore(distKm);

    // 2. Meal context match
    const haystack = [
      r.name,
      r.short_description || r.long_description || '',
      ...(r.cuisine_types || []),
      ...(r.known_for_dishes || []),
      ...(r.ambience_tags || []),
    ].join(' ');

    const matchesMeal = mealRegex.test(haystack);
    const sMeal = matchesMeal ? 1.0 : 0.45;

    // 3. Bayesian rating score
    const sRating = computeBayesianRating(r.rating_avg || 4.2, r.rating_count || 12);

    // 4. Feature & Verification boosts
    const sVerified = (r.map_profile_done || r.is_active) ? 0.2 : 0.0;
    const sFeatured = r.is_featured ? 0.15 : 0.0;

    // Weights: Proximity 0.35, Meal Match 0.25, Rating 0.25, Verified/Featured 0.15
    const finalScore =
      0.35 * sDist +
      0.25 * sMeal +
      0.25 * sRating +
      sVerified +
      sFeatured;

    const matchedKeywords = mealCtx.keywords.filter((kw) =>
      haystack.toLowerCase().includes(kw)
    );

    return {
      ...r,
      recommendationScore: Number(finalScore.toFixed(3)),
      distanceKm: distKm,
      distanceLabel: distKm !== undefined ? formatDistance(distKm) : r.landmark || r.city || 'Delhi NCR',
      matchedKeywords,
    };
  });

  return scored.sort((a, b) => b.recommendationScore - a.recommendationScore).slice(0, limit);
}

export interface ScoredDish extends MenuItem {
  restaurantName: string;
  restaurantSlug: string;
  restaurantArea: string;
  recommendationScore: number;
  appPrice: number;
  savingsAmt: number;
  savingsPct: number;
  distanceKm?: number;
}

/**
 * Multi-Factor Scoring for Menu Items (Dishes)
 */
export function getRecommendedDishes(
  menuItems: MenuItem[],
  restaurants: Restaurant[],
  userCoords?: GeoCoordinates | null,
  limit: number = 6
): ScoredDish[] {
  if (!menuItems || menuItems.length === 0) return [];

  const restMap = new Map<string, Restaurant>();
  for (const r of restaurants) {
    restMap.set(r.id, r);
  }

  const mealCtx = getDynamicMealContext();
  const mealRegex = new RegExp(mealCtx.keywords.join('|'), 'i');

  const scored: ScoredDish[] = menuItems
    .filter((item) => item.is_available !== false)
    .map((item) => {
      const rest = restMap.get(item.restaurant_id);

      // Distance
      let distKm: number | undefined = undefined;
      if (userCoords && rest?.latitude && rest?.longitude) {
        distKm = calculateDistanceKm(userCoords.latitude, userCoords.longitude, rest.latitude, rest.longitude);
      }
      const sDist = computeProximityScore(distKm);

      // Meal relevance
      const haystack = `${item.name} ${item.description || ''} ${item.dietary_tags?.join(' ') || ''}`;
      const matchesMeal = mealRegex.test(haystack);
      const sMeal = matchesMeal ? 1.0 : 0.45;

      // Savings margin
      const { score: sSavings, appPrice, savingsAmt, savingsPct } = computeSavingsScore(item.price);

      // Quality / Popularity
      const sMustTry = item.is_must_try ? 0.2 : 0.0;
      const sFeatured = item.is_featured ? 0.15 : 0.0;
      const sRating = computeBayesianRating(rest?.rating_avg || 4.3, rest?.rating_count || 15);

      const finalScore =
        0.30 * sDist +
        0.25 * sMeal +
        0.20 * sSavings +
        0.15 * sRating +
        sMustTry +
        sFeatured;

      return {
        ...item,
        restaurantName: rest?.name || 'Verified Counter',
        restaurantSlug: rest?.slug || '',
        restaurantArea: rest?.landmark || rest?.city || 'Delhi NCR',
        recommendationScore: Number(finalScore.toFixed(3)),
        appPrice,
        savingsAmt,
        savingsPct,
        distanceKm: distKm,
      };
    });

  return scored.sort((a, b) => b.recommendationScore - a.recommendationScore).slice(0, limit);
}

/**
 * Generate Dynamic Live Hero Counter Ticket from actual DB records
 */
export function getLiveHeroTicket(
  restaurants: Restaurant[],
  menuItems: MenuItem[],
  userCoords?: GeoCoordinates | null
): {
  restaurant: Restaurant | null;
  items: Array<{ name: string; rest: string; price: number; app: number }>;
  counterTotal: number;
  appTotal: number;
  savingsTotal: number;
  savingsPctTotal: number;
} {
  const venues = getRecommendedVenues(restaurants, userCoords, 3);
  const heroRest = venues[0] || restaurants[0] || null;

  if (!heroRest) {
    return {
      restaurant: null,
      items: [],
      counterTotal: 0,
      appTotal: 0,
      savingsTotal: 0,
      savingsPctTotal: 0,
    };
  }

  // Get items for this venue
  const venueItems = menuItems.filter((m) => m.restaurant_id === heroRest.id && m.is_available !== false);
  const pool = venueItems.length >= 3 ? venueItems : menuItems.filter((m) => m.is_available !== false);

  const scoredItems = getRecommendedDishes(pool, restaurants, userCoords, 3);

  const formattedItems = scoredItems.map((item) => ({
    name: item.name,
    rest: heroRest.name,
    price: item.price,
    app: item.appPrice,
  }));

  const counterTotal = formattedItems.reduce((acc, i) => acc + i.price, 0);
  const appTotal = formattedItems.reduce((acc, i) => acc + i.app, 0);
  const savingsTotal = Math.max(0, appTotal - counterTotal);
  const savingsPctTotal = appTotal > 0 ? Math.round((savingsTotal / appTotal) * 100) : 0;

  return {
    restaurant: heroRest,
    items: formattedItems,
    counterTotal,
    appTotal,
    savingsTotal,
    savingsPctTotal,
  };
}

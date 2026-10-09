import { Restaurant, MenuItem, MenuCategory, Collection } from '../../types/database';
import { DELHI_LOCATIONS, DelhiLocation } from '../delhiLocationsData';

export type MealTimeWindow = 'breakfast' | 'lunch' | 'evening_snacks' | 'dinner' | 'late_night';

export interface MealTimeInfo {
  key: MealTimeWindow;
  label: string;
  icon: string;
  timeRange: string;
  tagline: string;
  recommendedKeywords: string[];
}

export interface CounterSavings {
  counterPrice: number;
  deliveryAppPrice: number;
  estimatedDeliveryFee: number;
  estimatedPackagingFee: number;
  totalAppSpend: number;
  totalSavings: number;
  savingsPercentage: number;
}

export const MEAL_TIME_WINDOWS: Record<MealTimeWindow, MealTimeInfo> = {
  breakfast: {
    key: 'breakfast',
    label: 'Breakfast & Morning Chai',
    icon: '☕',
    timeRange: '7:00 AM – 11:30 AM',
    tagline: 'Freshly steamed idlis, piping hot chole bhature, kulhad chai & parathas',
    recommendedKeywords: ['chai', 'tea', 'coffee', 'dosa', 'idli', 'paratha', 'chole bhature', 'kachori', 'poha', 'sandwich'],
  },
  lunch: {
    key: 'lunch',
    label: 'Lunch & Comfort Thalis',
    icon: '🍛',
    timeRange: '12:00 PM – 4:00 PM',
    tagline: 'Wholesome North Indian thalis, dal makhani rice, meal combos & executive platters',
    recommendedKeywords: ['thali', 'dal makhani', 'paneer', 'roti', 'naan', 'rice', 'pulao', 'biryani', 'curry', 'combo'],
  },
  evening_snacks: {
    key: 'evening_snacks',
    label: 'Evening Adda & Snacks',
    icon: '🥟',
    timeRange: '4:00 PM – 8:00 PM',
    tagline: 'Crunchy kurkure momos, peri peri platters, monster shakes & waffles',
    recommendedKeywords: ['momo', 'shake', 'cold coffee', 'fries', 'burger', 'chaat', 'waffle', 'pasta', 'maggi', 'roll'],
  },
  dinner: {
    key: 'dinner',
    label: 'Dinner & Evening Feasts',
    icon: '🍲',
    timeRange: '8:00 PM – 11:30 PM',
    tagline: 'Butter chicken, tandoori soya chaap, wood-fired pizzas, sizzlers & pastas',
    recommendedKeywords: ['butter chicken', 'chaap', 'tikka', 'pizza', 'pasta', 'biryani', 'naan', 'kebab', 'sizzler', 'platter'],
  },
  late_night: {
    key: 'late_night',
    label: 'Late Night Cravings',
    icon: '🌙',
    timeRange: '11:30 PM – 3:30 AM',
    tagline: 'Midnight loaded rolls, cheesy burgers, midnight shakes & desserts',
    recommendedKeywords: ['burger', 'roll', 'shake', 'ice cream', 'dessert', 'brownie', 'fries', 'sandwich', 'wrap'],
  },
};

/**
 * Calculates genuine counter savings compared to major delivery aggregators (Swiggy / Zomato).
 * Delivery aggregators add:
 * - 20% to 30% menu price markup
 * - ₹40–₹60 delivery fee
 * - ₹10 platform fee
 * - ₹25 packaging fee
 */
export function calculateCounterSavings(counterPrice: number): CounterSavings {
  const p = Math.max(0, counterPrice);
  const baseAppPrice = Math.round(p * 1.25); // 25% average markup
  const deliveryFee = p > 0 ? (p > 500 ? 35 : 55) : 0;
  const packagingFee = p > 0 ? 25 : 0;
  const platformFee = p > 0 ? 8 : 0;
  const totalAppSpend = baseAppPrice + deliveryFee + packagingFee + platformFee;
  const totalSavings = totalAppSpend - p;
  const savingsPercentage = totalAppSpend > 0 ? Math.round((totalSavings / totalAppSpend) * 100) : 0;

  return {
    counterPrice: p,
    deliveryAppPrice: baseAppPrice,
    estimatedDeliveryFee: deliveryFee,
    estimatedPackagingFee: packagingFee + platformFee,
    totalAppSpend,
    totalSavings,
    savingsPercentage,
  };
}

/**
 * Detects the active Delhi dining meal window based on local time.
 */
export function getCurrentMealTimeWindow(now: Date = new Date()): MealTimeWindow {
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeVal = hours + minutes / 60;

  if (timeVal >= 7 && timeVal < 11.5) return 'breakfast';
  if (timeVal >= 11.5 && timeVal < 16) return 'lunch';
  if (timeVal >= 16 && timeVal < 20) return 'evening_snacks';
  if (timeVal >= 20 && timeVal < 23.5) return 'dinner';
  return 'late_night';
}

/**
 * Centralized High-Performance In-Memory Graph & Discovery Brain.
 */
export class CentralDiscoveryEngine {
  private restaurantsById = new Map<string, Restaurant>();
  private restaurantsBySlug = new Map<string, Restaurant>();
  private dishesById = new Map<string, MenuItem>();
  private dishesBySlug = new Map<string, MenuItem>();
  private dishesByRestaurantId = new Map<string, MenuItem[]>();
  private categoriesByRestaurantId = new Map<string, MenuCategory[]>();
  private collectionsBySlug = new Map<string, Collection>();
  private isHydrated = false;

  /**
   * Hydrates the in-memory graph from all data sources.
   */
  public hydrate(
    restaurants: Restaurant[] = [],
    menuItems: MenuItem[] = [],
    categories: MenuCategory[] = [],
    collections: Collection[] = []
  ): void {
    this.restaurantsById.clear();
    this.restaurantsBySlug.clear();
    for (const r of restaurants) {
      this.restaurantsById.set(r.id, r);
      if (r.slug) this.restaurantsBySlug.set(r.slug, r);
    }

    this.dishesById.clear();
    this.dishesBySlug.clear();
    this.dishesByRestaurantId.clear();
    for (const d of menuItems) {
      this.dishesById.set(d.id, d);
      if (d.slug) this.dishesBySlug.set(d.slug, d);

      const existing = this.dishesByRestaurantId.get(d.restaurant_id) || [];
      existing.push(d);
      this.dishesByRestaurantId.set(d.restaurant_id, existing);
    }

    this.categoriesByRestaurantId.clear();
    for (const c of categories) {
      const existing = this.categoriesByRestaurantId.get(c.restaurant_id) || [];
      existing.push(c);
      this.categoriesByRestaurantId.set(c.restaurant_id, existing);
    }

    this.collectionsBySlug.clear();
    for (const col of collections) {
      if (col.slug) this.collectionsBySlug.set(col.slug, col);
    }

    this.isHydrated = true;
  }

  public getIsHydrated(): boolean {
    return this.isHydrated;
  }

  public getRestaurantById(id: string): Restaurant | undefined {
    return this.restaurantsById.get(id);
  }

  public getRestaurantBySlug(slug: string): Restaurant | undefined {
    return this.restaurantsBySlug.get(slug);
  }

  public getDishById(id: string): MenuItem | undefined {
    return this.dishesById.get(id);
  }

  public getDishBySlug(slug: string): MenuItem | undefined {
    return this.dishesBySlug.get(slug);
  }

  public getDishesForRestaurant(restaurantId: string): MenuItem[] {
    return this.dishesByRestaurantId.get(restaurantId) || [];
  }

  public getCategoriesForRestaurant(restaurantId: string): MenuCategory[] {
    return this.categoriesByRestaurantId.get(restaurantId) || [];
  }

  public getCollectionBySlug(slug: string): Collection | undefined {
    return this.collectionsBySlug.get(slug);
  }

  public getAllRestaurants(): Restaurant[] {
    return Array.from(this.restaurantsById.values());
  }

  public getAllDishes(): MenuItem[] {
    return Array.from(this.dishesById.values());
  }

  /**
   * Finds all restaurants in a specific locality (matched by name, landmark, address or coordinates).
   */
  public getRestaurantsInLocality(localityQuery: string): Restaurant[] {
    const q = localityQuery.toLowerCase().trim();
    if (!q) return this.getAllRestaurants().slice(0, 12);

    return this.getAllRestaurants().filter((r) => {
      const addr = `${r.name} ${r.landmark || ''} ${r.address_line1 || ''} ${r.city || ''}`.toLowerCase();
      return addr.includes(q);
    });
  }

  /**
   * Cross-Entity Alternative Dishes:
   * "Where else in [Locality] can I get verified [Dish Name] with counter savings?"
   */
  public getAlternativeDishesInLocality(
    targetDish: MenuItem,
    localityName?: string,
    limit: number = 4
  ): { dish: MenuItem; restaurant: Restaurant; counterSavings: CounterSavings }[] {
    const targetKeywords = targetDish.name
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const isTargetVeg = targetDish.dietary_tags?.includes('Veg');
    const allDishes = this.getAllDishes();
    const locLower = localityName ? localityName.toLowerCase() : '';

    const candidates = allDishes
      .filter((d) => d.id !== targetDish.id && d.restaurant_id !== targetDish.restaurant_id)
      .map((d) => {
        const rest = this.restaurantsById.get(d.restaurant_id);
        if (!rest) return null;

        // Locality filter if provided
        if (locLower) {
          const restAddr = `${rest.name} ${rest.landmark || ''} ${rest.address_line1 || ''} ${rest.city || ''}`.toLowerCase();
          if (!restAddr.includes(locLower)) return null;
        }

        let score = 0;
        const dName = d.name.toLowerCase();

        // 1. Keyword match on dish title (e.g. coffee, burger, pasta, momo)
        for (const kw of targetKeywords) {
          if (dName.includes(kw)) score += 3.5;
        }

        // 2. Dietary alignment
        const isVeg = d.dietary_tags?.includes('Veg');
        if (isVeg === isTargetVeg) score += 1.5;

        // 3. Price proximity
        if (targetDish.price > 0 && Math.abs(d.price - targetDish.price) / targetDish.price <= 0.4) {
          score += 1.0;
        }

        if (d.is_must_try) score += 0.8;

        return score > 2.0 ? { dish: d, restaurant: rest, score, counterSavings: calculateCounterSavings(d.price) } : null;
      })
      .filter((item): item is { dish: MenuItem; restaurant: Restaurant; score: number; counterSavings: CounterSavings } => item !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return candidates.map(({ dish, restaurant, counterSavings }) => ({ dish, restaurant, counterSavings }));
  }

  /**
   * Cross-Entity Pairing Suggestions:
   * "Frequently paired with this dish at [Restaurant]"
   * If dish is food, suggests top shake / beverage. If dish is beverage, suggests top starter / food.
   */
  public getDishPairings(
    dish: MenuItem,
    restaurantDishes?: MenuItem[],
    limit: number = 3
  ): MenuItem[] {
    const list = restaurantDishes || this.getDishesForRestaurant(dish.restaurant_id);
    const siblings = list.filter((d) => d.id !== dish.id);

    const isBeverage = /beverage|shake|coffee|tea|drink|mocktail|cooler|frappe|juice|chai/i.test(
      `${dish.name} ${dish.description || ''}`
    );

    let prioritized: MenuItem[] = [];

    if (isBeverage) {
      // Find food starters / snacks
      prioritized = siblings.filter((d) =>
        /momo|burger|fries|pizza|pasta|snack|starter|sandwich|waffle/i.test(`${d.name} ${d.description || ''}`)
      );
    } else {
      // Find beverages / shakes / coffee / desserts
      prioritized = siblings.filter((d) =>
        /shake|coffee|beverage|mojito|tea|chai|waffle|lava|brownie/i.test(`${d.name} ${d.description || ''}`)
      );
    }

    if (prioritized.length === 0) {
      prioritized = siblings.filter((d) => d.is_must_try);
    }

    if (prioritized.length === 0) {
      prioritized = siblings;
    }

    return prioritized.slice(0, limit);
  }

  /**
   * Similar Vibe Recommendations:
   * Finds other cafes nearby that share similar cuisines, price brackets, or ambiance tags.
   */
  public getSimilarVibeRestaurants(
    targetRest: Restaurant,
    limit: number = 3
  ): { restaurant: Restaurant; matchingFeatures: string[] }[] {
    const all = this.getAllRestaurants().filter((r) => r.id !== targetRest.id);

    const scored = all.map((r) => {
      let score = 0;
      const matchingFeatures: string[] = [];

      // Cuisine overlap
      const sharedCuisines = (r.cuisine_types || []).filter((c) =>
        (targetRest.cuisine_types || []).some((tc) => tc.toLowerCase() === c.toLowerCase())
      );
      if (sharedCuisines.length > 0) {
        score += sharedCuisines.length * 2.5;
        matchingFeatures.push(sharedCuisines.join(', '));
      }

      // Proximity / Locality
      if (targetRest.city && r.city && targetRest.city.toLowerCase() === r.city.toLowerCase()) {
        score += 2.0;
        matchingFeatures.push(r.city);
      } else if (targetRest.landmark && r.landmark && targetRest.landmark.toLowerCase() === r.landmark.toLowerCase()) {
        score += 3.0;
        matchingFeatures.push(r.landmark);
      }

      // Price band similarity
      if (targetRest.price_range === r.price_range) {
        score += 1.5;
        matchingFeatures.push(`Avg ₹${r.average_cost_for_two || 400} for two`);
      }

      // Facility matching (e.g. WiFi, Rooftop, AC)
      const sharedFacilities = (r.facilities || []).filter((f) =>
        (targetRest.facilities || []).some((tf) => tf.toLowerCase() === f.toLowerCase())
      );
      if (sharedFacilities.length > 0) {
        score += sharedFacilities.length * 0.8;
      }

      return { restaurant: r, score, matchingFeatures };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ restaurant, matchingFeatures }) => ({ restaurant, matchingFeatures }));
  }

  /**
   * Personalized Dish Feed based on Time-of-Day, User Dietary Intent, and Locality.
   */
  public getPersonalizedDishes(options: {
    mealWindow?: MealTimeWindow;
    dietPreference?: 'all' | 'veg' | 'non_veg';
    localityQuery?: string;
    limit?: number;
  }): { dish: MenuItem; restaurant: Restaurant; counterSavings: CounterSavings }[] {
    const windowKey = options.mealWindow || getCurrentMealTimeWindow();
    const meta = MEAL_TIME_WINDOWS[windowKey];
    const diet = options.dietPreference || 'all';
    const locLower = options.localityQuery ? options.localityQuery.toLowerCase() : '';
    const limit = options.limit || 8;

    const allDishes = this.getAllDishes();

    const scored = allDishes
      .map((d) => {
        const rest = this.restaurantsById.get(d.restaurant_id);
        if (!rest) return null;

        // Diet filter
        if (diet === 'veg' && !d.dietary_tags?.includes('Veg')) return null;
        if (diet === 'non_veg' && d.dietary_tags?.includes('Veg')) return null;

        // Locality filter
        if (locLower) {
          const restAddr = `${rest.name} ${rest.landmark || ''} ${rest.address_line1 || ''} ${rest.city || ''}`.toLowerCase();
          if (!restAddr.includes(locLower)) return null;
        }

        let score = 0;
        const text = `${d.name} ${d.description || ''}`.toLowerCase();

        // Keyword alignment with meal-time
        for (const kw of meta.recommendedKeywords) {
          if (text.includes(kw)) {
            score += 3.0;
          }
        }

        if (d.is_must_try) score += 2.0;
        if (rest.is_featured) score += 1.0;

        return { dish: d, restaurant: rest, score, counterSavings: calculateCounterSavings(d.price) };
      })
      .filter((item): item is { dish: MenuItem; restaurant: Restaurant; score: number; counterSavings: CounterSavings } => item !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored.map(({ dish, restaurant, counterSavings }) => ({
      dish,
      restaurant,
      counterSavings,
    }));
  }
}

// Global Singleton Instance
export const discoveryEngine = new CentralDiscoveryEngine();

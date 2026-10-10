import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Restaurant,
  MenuCategory,
  MenuItem,
  Review,
  Collection,
  CollectionItem,
  SearchAnalytic,
  AdminLog,
  SiteSettings,
  RestaurantClaim,
  RestaurantOwnerAccount,
  ClaimStatus,
  DietaryTag,
  DietaryOption,
  PriceRange,
  AreaGuideMetadata,
  FamousDishSpotlight,
  FoodCrawlStop,
  ContactInquiry,
} from '../types/database';
import { AREA_FOOD_GUIDES } from './areaGuidesData';

export const ADMIN_EMAIL = 'xyzapplywork@gmail.com';

export const DEFAULT_SUPABASE_URL = 'https://ifurnbsejdwrrfwtvivg.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmdXJuYnNlamR3cnJmd3R2aXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3Njc3NTgsImV4cCI6MjEwNjM0Mzc1OH0.lNyyKz5PxYScYYo1dvkwBfqa5RjdN_7V-HgxEdI23zU';

// Config state
const STORAGE_PREFIX = 'menumap_';
const CONFIG_KEY = `${STORAGE_PREFIX}supabase_config`;

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSavedSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey && parsed.url.startsWith('http')) return parsed;
    }
  } catch (e) {
    // ignore
  }
  return { url: envUrl, anonKey: envKey };
}

export function saveSupabaseConfig(config: SupabaseConfig) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save Supabase config', e);
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSavedSupabaseConfig();
  if (!config.url || !config.anonKey || !config.url.startsWith('http')) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey);
    } catch (e) {
      console.warn('Could not initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
}

import { enrichRestaurant, enrichMenuItem } from './restaurantEnricher';
import { getSmartDishImage } from './dishImageRegistry';

// ----------------------------------------------------------------------------
// Local Storage Persistence Engine (Full-fidelity fallback & instant cache)
// ----------------------------------------------------------------------------
export function ensureUUID(id?: string): string {
  if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  return crypto.randomUUID();
}

// Dedicated rock-solid store for Google Maps verification progress
export const MAP_DONE_IDS_KEY = `${STORAGE_PREFIX}map_done_ids`;

export function getStoredMapDoneIds(): string[] {
  try {
    const raw = localStorage.getItem(MAP_DONE_IDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    // ignore
  }
  return [];
}

export function saveStoredMapDoneIds(ids: string[]): void {
  try {
    localStorage.setItem(MAP_DONE_IDS_KEY, JSON.stringify(Array.from(new Set(ids))));
  } catch (e) {
    console.error('Failed to save map done IDs:', e);
  }
}

export function recordMapDoneId(id: string, isDone: boolean): void {
  const current = new Set(getStoredMapDoneIds());
  if (isDone) {
    current.add(id);
  } else {
    current.delete(id);
  }
  saveStoredMapDoneIds(Array.from(current));
}

const CURRENT_DATA_VERSION = '2026-v5-full-delhi-10-hubs';
const VERSION_KEY = `${STORAGE_PREFIX}data_version`;

let seedInitPromise: Promise<void> | null = null;

export async function ensureSeedInitialized(): Promise<void> {
  try {
    const currentVer = localStorage.getItem(VERSION_KEY);
    const existing = localStorage.getItem(`${STORAGE_PREFIX}tbl_restaurants`);
    const parsed = existing ? JSON.parse(existing) : [];
    const colsRaw = localStorage.getItem(`${STORAGE_PREFIX}tbl_collections`);
    const colsParsed = colsRaw ? JSON.parse(colsRaw) : [];

    // Ensure all verified restaurants, categories, and area guides are initialized
    if (
      currentVer === CURRENT_DATA_VERSION &&
      existing &&
      Array.isArray(parsed) &&
      parsed.length >= 480 &&
      colsParsed.length >= 12
    ) {
      return;
    }

    if (!seedInitPromise) {
      seedInitPromise = (async () => {
        const { generateSeedData } = await import('./seedData');
        const data = generateSeedData();
        // Retain any existing map_profile_done progress during re-seed
        const doneIds = new Set(getStoredMapDoneIds());
        const seededRestaurants = data.restaurants.map((r) => ({
          ...enrichRestaurant(r),
          map_profile_done: Boolean(r.map_profile_done || doneIds.has(r.id)),
        }));

        localStorage.setItem(`${STORAGE_PREFIX}tbl_restaurants`, JSON.stringify(seededRestaurants));
        localStorage.setItem(`${STORAGE_PREFIX}tbl_menu_categories`, JSON.stringify(data.categories));
        localStorage.setItem(`${STORAGE_PREFIX}tbl_menu_items`, JSON.stringify(data.menuItems.map((i) => enrichMenuItem(i))));
        localStorage.setItem(`${STORAGE_PREFIX}tbl_collections`, JSON.stringify(data.collections));
        localStorage.setItem(`${STORAGE_PREFIX}tbl_collection_items`, JSON.stringify(data.collectionItems));
        localStorage.setItem(VERSION_KEY, CURRENT_DATA_VERSION);
      })();
    }
    await seedInitPromise;
  } catch (e) {
    console.error('Error auto-seeding verified restaurant data:', e);
  }
}

function loadTable<T>(table: string): T[] {
  // Trigger background seed initialization if uninitialized
  ensureSeedInitialized().catch(console.error);
  const doneIds = new Set(getStoredMapDoneIds());
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}tbl_${table}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (table === 'restaurants') {
          return parsed.map((r: any) => ({
            ...enrichRestaurant(r),
            map_profile_done: Boolean(
              r.map_profile_done ||
              r.google_maps_place_id === 'MAP_DONE' ||
              r.google_maps_place_id === 'DONE' ||
              doneIds.has(r.id)
            ),
          })) as T[];
        }
        if (table === 'menu_items') {
          return parsed.map((i: any) => enrichMenuItem(i)) as T[];
        }
        return parsed as T[];
      }
    }
  } catch (e) {
    console.error(`Error loading table ${table}:`, e);
  }
  return [];
}

function saveTable<T>(table: string, data: T[]): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}tbl_${table}`, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving table ${table}:`, e);
  }
}

// Default settings
const DEFAULT_SETTINGS: SiteSettings = {
  default_city: 'Nangloi, West Delhi',
  default_lat: 28.6752,
  default_lng: 77.0588,
  currency_symbol: '₹',
  contact_email: 'xyzapplywork@gmail.com',
  brand_primary_color: '#FF5A36',
  brand_accent_color: '#0D9488',
  feature_reviews: true,
  feature_bookmarks: true,
  feature_collections: true,
  feature_nearby: true,
};

// ----------------------------------------------------------------------------
// AUTHENTICATION GUARDS & METHODS
// ----------------------------------------------------------------------------
export const AUTH_SESSION_KEY = `${STORAGE_PREFIX}admin_session`;

export interface AdminSession {
  email: string;
  token: string;
  loggedInAt: string;
}

export function getCurrentAdminSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(AUTH_SESSION_KEY) || localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AdminSession;
    if (session.email === ADMIN_EMAIL) {
      return session;
    }
  } catch (e) {
    // invalid session
  }
  return null;
}

export function setAdminSession(session: AdminSession) {
  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export function clearAdminSession() {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
  localStorage.removeItem(AUTH_SESSION_KEY);
}

export async function adminLogin(password: string, email: string): Promise<{ success: boolean; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail !== ADMIN_EMAIL) {
    return { success: false, error: 'Unauthorized: Only the designated administrator account is permitted.' };
  }

  // Attempt Supabase Auth if client is configured
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password,
      });

      if (error) {
        // Explicit invalid credentials from Supabase
        if (error.status === 400 || error.message.toLowerCase().includes('invalid login credentials')) {
          return { success: false, error: 'Invalid administrator credentials.' };
        }
        console.warn('Supabase auth network warning:', error.message);
      } else if (data.session) {
        setAdminSession({
          email: data.user.email || ADMIN_EMAIL,
          token: data.session.access_token,
          loggedInAt: new Date().toISOString(),
        });
        return { success: true };
      }
    } catch (err: any) {
      console.warn('Supabase auth network warning:', err);
    }
  }

  // Secure offline / master password fallback
  const masterAdminPassword = (import.meta as any).env?.VITE_ADMIN_PASSWORD || 'MenumapsAdmin#2026';
  if (password !== masterAdminPassword) {
    return { success: false, error: 'Invalid administrator password.' };
  }

  // Store active admin session
  setAdminSession({
    email: ADMIN_EMAIL,
    token: 'admin-token-' + crypto.randomUUID(),
    loggedInAt: new Date().toISOString(),
  });

  return { success: true };
}

// ----------------------------------------------------------------------------
// RESTAURANT OWNER PORTAL SESSION & AUTH
// ----------------------------------------------------------------------------
const OWNER_SESSION_KEY = `${STORAGE_PREFIX}owner_session`;

export function getCurrentOwnerSession(): RestaurantOwnerAccount | null {
  try {
    const raw = sessionStorage.getItem(OWNER_SESSION_KEY) || localStorage.getItem(OWNER_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

export function setOwnerSession(owner: RestaurantOwnerAccount): void {
  try {
    sessionStorage.setItem(OWNER_SESSION_KEY, JSON.stringify(owner));
    localStorage.setItem(OWNER_SESSION_KEY, JSON.stringify(owner));
  } catch (e) {}
}

export function logoutRestaurantOwner(): void {
  sessionStorage.removeItem(OWNER_SESSION_KEY);
  localStorage.removeItem(OWNER_SESSION_KEY);
}

export async function hashPassword(plain: string): Promise<string> {
  const enc = new TextEncoder().encode(plain);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ----------------------------------------------------------------------------
// DATA REPOSITORIES (API)
// ----------------------------------------------------------------------------

export function generateFallbackMenuItems(restaurant: Restaurant): MenuItem[] {
  const dishes = [
    ...(restaurant.specialty_dishes || []),
    ...(restaurant.known_for_dishes || []),
  ];
  const uniqueDishes = Array.from(new Set(dishes.filter(Boolean)));
  if (uniqueDishes.length === 0) return [];

  const basePrice = Math.max(80, Math.round((restaurant.average_cost_for_two || 320) / 2.3));
  return uniqueDishes.map((dishName, idx) => {
    const isVeg =
      restaurant.dietary_options?.includes('Pure Veg') ||
      !dishName.toLowerCase().match(/\b(chicken|mutton|fish|egg|meat|prawn|boti|keema|seekh|tandoori chicken)\b/i);
    const variance = ((idx * 27) % 70) - 20;
    const price = Math.max(60, Math.round((basePrice + variance) / 10) * 10);
    return enrichMenuItem({
      id: `${restaurant.id}-syn-${idx}`,
      restaurant_id: restaurant.id,
      category_id: `${restaurant.id}-cat-main`,
      name: dishName,
      slug: slugify(dishName),
      description: `Authentic house specialty prepared fresh daily at ${restaurant.name} counter rates.`,
      price,
      is_available: true,
      is_featured: idx < 2,
      is_must_try: idx === 0,
      dietary_tags: isVeg ? ['Veg'] : ['Non-veg'],
      spice_level: idx % 3 === 0 ? 2 : 1,
      view_count: 50 + idx * 5,
      order_count: 20 + idx * 3,
      sort_order: idx + 1,
      image_url: getSmartDishImage(dishName, restaurant.cuisine_types?.[0] || 'North Indian'),
      created_at: restaurant.created_at || new Date().toISOString(),
      updated_at: restaurant.updated_at || new Date().toISOString(),
    });
  });
}

export const api = {
  // RESTAURANTS
  async getRestaurants(activeOnly: boolean = true): Promise<Restaurant[]> {
    const doneIds = new Set(getStoredMapDoneIds());
    const supabase = getSupabaseClient();
    let result: Restaurant[] = [];

    if (supabase) {
      try {
        let query = supabase.from('restaurants').select('*');
        if (activeOnly) query = query.eq('is_active', true);
        const { data, error } = await query.order('rating_avg', { ascending: false });
        if (!error && data && data.length > 0) {
          result = data as Restaurant[];
          // Cache verified cloud restaurants to local table for offline speed
          saveTable('restaurants', result);
        }
      } catch (e) {
        console.warn('Supabase fetch failed, falling back to local DB:', e);
      }
    }

    if (result.length === 0) {
      const list = loadTable<Restaurant>('restaurants');
      result = activeOnly ? list.filter((r) => r.is_active) : list;
    }

    if (activeOnly) {
      // Exclude empty draft entries with no menu items and no known specialties
      result = result.filter((r) => {
        const hasKnown =
          (r.known_for_dishes && r.known_for_dishes.length > 0) ||
          (r.specialty_dishes && r.specialty_dishes.length > 0);
        return hasKnown;
      });
    }

    let updatedDoneIds = false;
    result = result.map((r) => {
      const isCloudDone = Boolean(
        r.map_profile_done === true ||
        r.google_maps_place_id === 'MAP_DONE' ||
        r.google_maps_place_id === 'DONE' ||
        r.google_maps_place_id?.startsWith('DONE:')
      );
      const isLocalDone = doneIds.has(r.id);
      const isDone = Boolean(isCloudDone || isLocalDone);

      if (isCloudDone && !isLocalDone) {
        doneIds.add(r.id);
        updatedDoneIds = true;
      }

      return {
        ...r,
        map_profile_done: isDone,
      };
    });

    if (updatedDoneIds) {
      saveStoredMapDoneIds(Array.from(doneIds));
    }

    return result.map((r) => enrichRestaurant(r));
  },

  async getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
    await ensureSeedInitialized();
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('restaurants').select('*').eq('slug', slug).single();
        if (!error && data && data.id) return enrichRestaurant(data as Restaurant);
      } catch (e) {
        // fallback
      }
    }
    const list = loadTable<Restaurant>('restaurants');
    const match = list.find((r) => r.slug === slug);
    return match ? enrichRestaurant(match) : null;
  },

  async getRestaurantById(id: string): Promise<Restaurant | null> {
    await ensureSeedInitialized();
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('restaurants').select('*').eq('id', id).single();
        if (!error && data && data.id) return enrichRestaurant(data as Restaurant);
      } catch (e) {
        // fallback
      }
    }
    const list = loadTable<Restaurant>('restaurants');
    const match = list.find((r) => r.id === id);
    return match ? enrichRestaurant(match) : null;
  },

  async saveRestaurant(restaurant: Partial<Restaurant>): Promise<Restaurant> {
    const supabase = getSupabaseClient();
    const now = new Date().toISOString();
    const id = ensureUUID(restaurant.id);
    const record: Restaurant = {
      id,
      name: restaurant.name || '',
      slug: restaurant.slug || (restaurant.name ? slugify(restaurant.name) : `rest-${Date.now()}`),
      short_description: restaurant.short_description || '',
      long_description: restaurant.long_description || '',
      cuisine_types: restaurant.cuisine_types || [],
      meal_types: restaurant.meal_types || ['Lunch', 'Dinner'],
      price_range: restaurant.price_range || '₹₹',
      average_cost_for_two: Number(restaurant.average_cost_for_two) || 500,
      address_line1: restaurant.address_line1 || '',
      address_line2: restaurant.address_line2 || '',
      landmark: restaurant.landmark || '',
      city: restaurant.city || 'Delhi NCR',
      state: restaurant.state || '',
      pincode: restaurant.pincode || '',
      country: restaurant.country || 'India',
      latitude: Number(restaurant.latitude) || 28.6139,
      longitude: Number(restaurant.longitude) || 77.2090,
      phone: restaurant.phone || '',
      whatsapp_number: restaurant.whatsapp_number || '',
      email: restaurant.email || '',
      website_url: restaurant.website_url || '',
      social_instagram: restaurant.social_instagram || '',
      social_facebook: restaurant.social_facebook || '',
      google_maps_place_id: restaurant.google_maps_place_id || '',
      google_maps_url: restaurant.google_maps_url || '',
      map_profile_done: restaurant.map_profile_done ?? false,
      is_open: restaurant.is_open ?? true,
      opening_hours: restaurant.opening_hours || {
        Monday: { open: '10:00', close: '23:00' },
        Tuesday: { open: '10:00', close: '23:00' },
        Wednesday: { open: '10:00', close: '23:00' },
        Thursday: { open: '10:00', close: '23:00' },
        Friday: { open: '10:00', close: '23:30' },
        Saturday: { open: '10:00', close: '23:30' },
        Sunday: { open: '10:00', close: '23:00' },
      },
      delivery_available: restaurant.delivery_available ?? true,
      takeaway_available: restaurant.takeaway_available ?? true,
      dine_in_available: restaurant.dine_in_available ?? true,
      facilities: restaurant.facilities || ['WiFi', 'Air Conditioned'],
      dietary_options: restaurant.dietary_options || ['Vegan Options'],
      rating_avg: Number(restaurant.rating_avg) || 4.2,
      rating_count: Number(restaurant.rating_count) || 0,
      cover_image_url: restaurant.cover_image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80',
      is_featured: restaurant.is_featured ?? false,
      is_active: restaurant.is_active ?? true,
      is_temporarily_closed: restaurant.is_temporarily_closed ?? false,
      temporary_closed_reason: restaurant.temporary_closed_reason || '',
      known_for_dishes: restaurant.known_for_dishes || [],
      best_for_tags: restaurant.best_for_tags || [],
      ambience_tags: restaurant.ambience_tags || [],
      nearby_landmarks: restaurant.nearby_landmarks || [],
      heritage_area: restaurant.heritage_area ?? false,
      specialty_dishes: restaurant.specialty_dishes || [],
      created_at: restaurant.created_at || now,
      updated_at: now,
    };

    if (supabase) {
      try {
        const { error } = await supabase.from('restaurants').upsert(record);
        if (error) {
          console.warn('Supabase upsert restaurant error:', error.message);
        } else {
          console.log('Saved restaurant to Supabase cloud database:', record.name);
        }
      } catch (e) {
        console.warn('Supabase upsert restaurant error:', e);
      }
    }

    const list = loadTable<Restaurant>('restaurants');
    const idx = list.findIndex((r) => r.id === id);
    if (idx >= 0) {
      list[idx] = record;
    } else {
      list.unshift(record);
    }
    saveTable('restaurants', list);

    // Auto-link to matching Iconic Area Guide if locality or address matches
    try {
      const allCols = loadTable<Collection>('collections');
      const textToMatch = `${record.name} ${record.address_line1 || ''} ${record.address_line2 || ''} ${record.city || ''} ${record.landmark || ''}`.toLowerCase();
      for (const col of allCols) {
        if (col.type === 'Area-Guide' || col.area_metadata) {
          const areaName = (col.area_metadata?.area_name || col.title || '').toLowerCase();
          const matchTerms = areaName.split(/[\s,/]+/).filter(w => w.length > 2);
          const isMatch = matchTerms.some(term => textToMatch.includes(term));
          if (isMatch) {
            const allItems = loadTable<CollectionItem>('collection_items');
            if (!allItems.some(ci => ci.collection_id === col.id && ci.restaurant_id === record.id)) {
              const newCi: CollectionItem = {
                id: crypto.randomUUID(),
                collection_id: col.id,
                item_type: 'restaurant',
                restaurant_id: record.id,
                sort_order: allItems.filter(ci => ci.collection_id === col.id).length,
                note: record.short_description || `Iconic dining spot in ${col.title}`,
                created_at: now
              };
              allItems.push(newCi);
              saveTable('collection_items', allItems);
              if (supabase) {
                try {
                  await supabase.from('collection_items').upsert(newCi);
                } catch (e) {}
              }
            }
          }
        }
      }
    } catch (e) {
      // non-blocking
    }

    return record;
  },

  async updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<Restaurant | null> {
    if (updates.map_profile_done !== undefined) {
      recordMapDoneId(id, updates.map_profile_done);
      if (updates.map_profile_done && (!updates.google_maps_place_id || updates.google_maps_place_id === '')) {
        updates.google_maps_place_id = 'MAP_DONE';
      } else if (!updates.map_profile_done && (updates.google_maps_place_id === 'MAP_DONE' || updates.google_maps_place_id === 'DONE')) {
        updates.google_maps_place_id = '';
      }
    }

    const list = loadTable<Restaurant>('restaurants');
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    const updated: Restaurant = {
      ...list[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    list[idx] = updated;
    saveTable('restaurants', list);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('restaurants').update(updates).eq('id', id);
        if (error) {
          console.warn('Supabase update retry without map_profile_done:', error.message);
          const safeUpdates = { ...updates };
          delete (safeUpdates as any).map_profile_done;
          await supabase.from('restaurants').update(safeUpdates).eq('id', id);
        }
      } catch (e) {
        console.warn('Supabase update restaurant error:', e);
      }
    }
    return updated;
  },

  async deleteRestaurant(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('restaurants').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete error:', e);
      }
    }
    const list = loadTable<Restaurant>('restaurants').filter((r) => r.id !== id);
    saveTable('restaurants', list);

    // Also remove cascade data
    const categories = loadTable<MenuCategory>('menu_categories').filter((c) => c.restaurant_id !== id);
    saveTable('menu_categories', categories);
    const items = loadTable<MenuItem>('menu_items').filter((i) => i.restaurant_id !== id);
    saveTable('menu_items', items);
    const reviews = loadTable<Review>('reviews').filter((r) => r.restaurant_id !== id);
    saveTable('reviews', reviews);

    return true;
  },

  // MENU CATEGORIES
  async getCategories(restaurantId: string): Promise<MenuCategory[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('menu_categories')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('sort_order', { ascending: true });
        if (!error && data && data.length > 0) {
          return data as MenuCategory[];
        }
      } catch (e) {}
    }

    const local = loadTable<MenuCategory>('menu_categories').filter((c) => c.restaurant_id === restaurantId);
    if (local.length > 0) return local.sort((a, b) => a.sort_order - b.sort_order);

    // Provide default category so categories are never blank
    return [
      {
        id: `${restaurantId}-cat-main`,
        restaurant_id: restaurantId,
        name: 'House Specialties',
        description: 'Counter signature favorites and kitchen specialties',
        sort_order: 1,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ];
  },

  async saveCategory(cat: Partial<MenuCategory>): Promise<MenuCategory> {
    const supabase = getSupabaseClient();
    const id = ensureUUID(cat.id);
    const restaurant_id = ensureUUID(cat.restaurant_id);
    const record: MenuCategory = {
      id,
      restaurant_id,
      name: cat.name || 'Main Course',
      description: cat.description || '',
      sort_order: cat.sort_order ?? 0,
      is_active: cat.is_active ?? true,
      created_at: cat.created_at || new Date().toISOString(),
    };
    if (supabase) {
      try {
        const { error } = await supabase.from('menu_categories').upsert(record);
        if (error) console.warn('Supabase upsert category error:', error.message);
      } catch (e) {}
    }
    const list = loadTable<MenuCategory>('menu_categories');
    const idx = list.findIndex((c) => c.id === id);
    if (idx >= 0) list[idx] = record;
    else list.push(record);
    saveTable('menu_categories', list);
    return record;
  },

  async deleteCategory(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('menu_categories').delete().eq('id', id);
      } catch (e) {}
    }
    const list = loadTable<MenuCategory>('menu_categories').filter((c) => c.id !== id);
    saveTable('menu_categories', list);
    const items = loadTable<MenuItem>('menu_items').filter((i) => i.category_id !== id);
    saveTable('menu_items', items);
    return true;
  },

  // MENU ITEMS
  async getMenuItems(restaurantId?: string): Promise<MenuItem[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase.from('menu_items').select('*');
        if (restaurantId) query = query.eq('restaurant_id', restaurantId);
        const { data, error } = await query.order('sort_order', { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map((i: any) => enrichMenuItem(i));
        }
      } catch (e) {}
    }

    if (restaurantId) {
      const local = loadTable<MenuItem>('menu_items').filter((i) => i.restaurant_id === restaurantId);
      if (local.length > 0) return local.sort((a, b) => a.sort_order - b.sort_order);

      const rest = await api.getRestaurantById(restaurantId);
      if (rest) {
        const fallbacks = generateFallbackMenuItems(rest);
        if (fallbacks.length > 0) return fallbacks.map((i) => enrichMenuItem(i));
      }
      return [];
    }

    const local = loadTable<MenuItem>('menu_items');
    return local.sort((a, b) => a.sort_order - b.sort_order);
  },

  async getMenuItemBySlug(slug: string): Promise<MenuItem | null> {
    await ensureSeedInitialized();
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('menu_items').select('*').eq('slug', slug).single();
        if (!error && data && data.id) return data as MenuItem;
      } catch (e) {}
    }
    const list = loadTable<MenuItem>('menu_items');
    return list.find((i) => i.slug === slug) || null;
  },

  async saveMenuItem(item: Partial<MenuItem>): Promise<MenuItem> {
    const supabase = getSupabaseClient();
    const id = ensureUUID(item.id);
    const restaurant_id = ensureUUID(item.restaurant_id);
    const category_id = ensureUUID(item.category_id);
    const now = new Date().toISOString();
    const record: MenuItem = {
      id,
      restaurant_id,
      category_id,
      name: item.name || '',
      slug: item.slug || (item.name ? slugify(item.name) : `dish-${Date.now()}`),
      description: item.description || '',
      price: Number(item.price) || 0,
      image_url: item.image_url || '',
      dietary_tags: item.dietary_tags || ['Veg'],
      spice_level: item.spice_level ?? 0,
      portion_size: item.portion_size || 'Regular',
      is_available: item.is_available ?? true,
      sort_order: item.sort_order ?? 0,
      is_featured: item.is_featured ?? false,
      is_must_try: item.is_must_try ?? false,
      view_count: item.view_count || 0,
      order_count: item.order_count || 0,
      created_at: item.created_at || now,
      updated_at: now,
    };
    if (supabase) {
      try {
        const { error } = await supabase.from('menu_items').upsert(record);
        if (error) console.warn('Supabase upsert menu item error:', error.message);
      } catch (e) {}
    }
    const list = loadTable<MenuItem>('menu_items');
    const idx = list.findIndex((i) => i.id === id);
    if (idx >= 0) list[idx] = record;
    else list.push(record);
    saveTable('menu_items', list);
    return record;
  },

  async deleteMenuItem(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('menu_items').delete().eq('id', id);
      } catch (e) {}
    }
    const list = loadTable<MenuItem>('menu_items').filter((i) => i.id !== id);
    saveTable('menu_items', list);
    return true;
  },

  async incrementMenuItemView(id: string): Promise<void> {
    const list = loadTable<MenuItem>('menu_items');
    const item = list.find((i) => i.id === id);
    if (item) {
      item.view_count = (item.view_count || 0) + 1;
      saveTable('menu_items', list);
    }
  },

  // REVIEWS
  async getReviews(restaurantId?: string, approvedOnly: boolean = true): Promise<Review[]> {
    await ensureSeedInitialized();
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase.from('reviews').select('*');
        if (restaurantId) query = query.eq('restaurant_id', restaurantId);
        if (approvedOnly) query = query.eq('is_approved', true);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (!error && data) return data as Review[];
      } catch (e) {}
    }
    let list = loadTable<Review>('reviews');
    if (restaurantId) list = list.filter((r) => r.restaurant_id === restaurantId);
    if (approvedOnly) list = list.filter((r) => r.is_approved);
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async submitReview(review: Partial<Review>): Promise<Review> {
    const supabase = getSupabaseClient();
    const id = crypto.randomUUID();
    const record: Review = {
      id,
      restaurant_id: review.restaurant_id || '',
      user_name: review.user_name || 'Food Explorer',
      user_email: review.user_email || '',
      rating: Math.max(1, Math.min(5, Number(review.rating) || 5)),
      review_text: review.review_text || '',
      photos: review.photos || [],
      is_approved: true, // auto-approve unless moderated
      is_featured: false,
      created_at: new Date().toISOString(),
    };
    if (supabase) {
      try {
        await supabase.from('reviews').insert(record);
      } catch (e) {}
    }
    const list = loadTable<Review>('reviews');
    list.unshift(record);
    saveTable('reviews', list);

    // Recalculate restaurant rating
    await this.updateRestaurantRatingSummary(record.restaurant_id);
    return record;
  },

  async updateReview(id: string, updates: Partial<Review>): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('reviews').update(updates).eq('id', id);
      } catch (e) {}
    }
    const list = loadTable<Review>('reviews');
    const idx = list.findIndex((r) => r.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...updates };
      saveTable('reviews', list);
      if (list[idx].restaurant_id) {
        await this.updateRestaurantRatingSummary(list[idx].restaurant_id);
      }
    }
  },

  async deleteReview(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('reviews').delete().eq('id', id);
      } catch (e) {}
    }
    const list = loadTable<Review>('reviews');
    const found = list.find((r) => r.id === id);
    const restId = found?.restaurant_id;
    saveTable('reviews', list.filter((r) => r.id !== id));
    if (restId) {
      await this.updateRestaurantRatingSummary(restId);
    }
    return true;
  },

  async updateRestaurantRatingSummary(restaurantId: string): Promise<void> {
    const reviews = (await this.getReviews(restaurantId, true));
    if (reviews.length === 0) return;
    const avg = Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1));
    const rest = await this.getRestaurantById(restaurantId);
    if (rest) {
      rest.rating_avg = avg;
      rest.rating_count = reviews.length;
      await this.saveRestaurant(rest);
    }
  },

  // COLLECTIONS & LIVING NEIGHBORHOOD GUIDES
  async getCollections(activeOnly: boolean = true): Promise<Collection[]> {
    await ensureSeedInitialized();
    const list = loadTable<Collection>('collections');
    // Ensure all living area guides from AREA_FOOD_GUIDES are merged seamlessly
    const existingSlugs = new Set(list.map((c) => c.slug));
    const combined = [...list];
    for (const guide of AREA_FOOD_GUIDES) {
      if (!existingSlugs.has(guide.slug)) {
        combined.push(guide);
      } else {
        const idx = combined.findIndex((c) => c.slug === guide.slug);
        if (idx >= 0 && !combined[idx].area_metadata) {
          combined[idx] = { ...guide, ...combined[idx], area_metadata: guide.area_metadata };
        }
      }
    }
    const filtered = activeOnly ? combined.filter((c) => c.is_active) : combined;
    return filtered.sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99));
  },

  async getCollectionBySlug(slug: string): Promise<Collection | null> {
    const list = await this.getCollections(false);
    return list.find((c) => c.slug === slug) || null;
  },

  async saveCollection(col: Partial<Collection>): Promise<Collection> {
    const supabase = getSupabaseClient();
    const id = col.id || crypto.randomUUID();
    const record: Collection = {
      id,
      title: col.title || '',
      slug: col.slug || (col.title ? slugify(col.title) : `coll-${Date.now()}`),
      description: col.description || '',
      cover_image_url: col.cover_image_url || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80',
      type: col.type || 'Area-Guide',
      is_featured: col.is_featured ?? true,
      is_active: col.is_active ?? true,
      sort_order: col.sort_order ?? 0,
      area_metadata: col.area_metadata,
      created_at: col.created_at || new Date().toISOString(),
    };
    if (supabase) {
      try {
        await supabase.from('collections').upsert(record);
      } catch (e) {}
    }
    const list = loadTable<Collection>('collections');
    const idx = list.findIndex((c) => c.id === id);
    if (idx >= 0) list[idx] = record;
    else list.push(record);
    saveTable('collections', list);
    return record;
  },

  async deleteCollection(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('collections').delete().eq('id', id);
      } catch (e) {}
    }
    saveTable('collections', loadTable<Collection>('collections').filter((c) => c.id !== id));
    saveTable('collection_items', loadTable<CollectionItem>('collection_items').filter((ci) => ci.collection_id !== id));
    return true;
  },

  async getCollectionItems(collectionId: string): Promise<CollectionItem[]> {
    const items = loadTable<CollectionItem>('collection_items').filter((ci) => ci.collection_id === collectionId);
    if (items.length > 0) return items;

    // Auto-Tagging & Auto-Association for Area Guides: match cafes in this locality!
    const allCollections = await this.getCollections(false);
    const col = allCollections.find((c) => c.id === collectionId);
    if (col && (col.type === 'Area-Guide' || col.area_metadata || col.type === 'City-based')) {
      const allRests = await this.getRestaurants(true);
      const areaKeywords = (col.area_metadata?.area_name || col.title || col.slug).toLowerCase();
      
      const matched = allRests.filter((r) => {
        const text = `${r.name} ${r.city} ${r.address_line1 || ''} ${r.landmark || ''}`.toLowerCase();
        if (areaKeywords.includes('hudson') || areaKeywords.includes('north campus')) {
          return /hudson|gtb|campus|kamla/i.test(text);
        }
        if (areaKeywords.includes('nangloi')) {
          return /nangloi|shivram|rohtak/i.test(text);
        }
        if (areaKeywords.includes('connaught') || areaKeywords.includes('cp')) {
          return /connaught|rajiv chowk|inner circle|outer circle/i.test(text);
        }
        if (areaKeywords.includes('chandni') || areaKeywords.includes('old delhi')) {
          return /chandni|old delhi|chawri|jama masjid/i.test(text);
        }
        if (areaKeywords.includes('hauz khas')) {
          return /hauz khas|hkv|iit/i.test(text);
        }
        if (areaKeywords.includes('rajouri')) {
          return /rajouri|ring road|west/i.test(text);
        }
        return false;
      });

      if (matched.length > 0) {
        return matched.map((r, idx) => ({
          id: `auto-${collectionId}-${r.id}`,
          collection_id: collectionId,
          item_type: 'restaurant',
          restaurant_id: r.id,
          sort_order: idx + 1,
          note: r.short_description || 'Featured dining spot in this neighborhood',
          created_at: new Date().toISOString(),
        }));
      }
    }

    return [];
  },

  async setCollectionItems(collectionId: string, items: Array<{ item_type: 'restaurant' | 'menu_item'; id: string; note?: string }>): Promise<void> {
    const records: CollectionItem[] = items.map((item, index) => ({
      id: crypto.randomUUID(),
      collection_id: collectionId,
      item_type: item.item_type,
      restaurant_id: item.item_type === 'restaurant' ? item.id : undefined,
      menu_item_id: item.item_type === 'menu_item' ? item.id : undefined,
      note: item.note || '',
      sort_order: index,
      created_at: new Date().toISOString(),
    }));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('collection_items').delete().eq('collection_id', collectionId);
        if (records.length > 0) {
          await supabase.from('collection_items').insert(records);
        }
      } catch (e) {}
    }

    const all = loadTable<CollectionItem>('collection_items').filter((ci) => ci.collection_id !== collectionId);
    saveTable('collection_items', [...all, ...records]);
  },

  async saveCollectionItem(item: Partial<CollectionItem>): Promise<CollectionItem> {
    const record: CollectionItem = {
      id: item.id || crypto.randomUUID(),
      collection_id: item.collection_id || '',
      item_type: item.item_type || 'restaurant',
      restaurant_id: item.restaurant_id,
      menu_item_id: item.menu_item_id,
      note: item.note || '',
      sort_order: item.sort_order ?? 0,
      created_at: item.created_at || new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('collection_items').upsert(record);
      } catch (e) {}
    }

    const all = loadTable<CollectionItem>('collection_items');
    const idx = all.findIndex((ci) => ci.id === record.id);
    if (idx >= 0) all[idx] = record;
    else all.push(record);
    saveTable('collection_items', all);
    return record;
  },

  /**
   * Bulk Area & 50-Cafe Importer:
   * Accepts Area information (name, vibe, metro, parking, cost for two, coordinates)
   * and a list of up to 50+ cafes (text, CSV, TSV, pipe-delimited, or JSON).
   * Automatically creates or updates the Iconic Area Guide, creates all restaurants,
   * links them to the Iconic Guide via collection_items, generates menu dishes,
   * tags must-try dishes, and sets up the 3-stop crawl and top famous dishes!
   */
  async bulkImportAreaWithRestaurants(params: {
    areaName: string;
    zone?: string;
    vibeBadge?: string;
    famousForSummary?: string;
    nearestMetro?: string;
    parkingTips?: string;
    avgCostForTwo?: number;
    latitude?: number;
    longitude?: number;
    coverImageUrl?: string;
    rawCafesData: string;
  }): Promise<{ collection: Collection; createdCount: number; dishesCount: number; message: string }> {
    const areaName = params.areaName.trim();
    if (!areaName) {
      throw new Error('Area name is required.');
    }

    const areaSlug = slugify(areaName);
    const existingCols = await this.getCollections(false);
    let col = existingCols.find(
      (c) =>
        c.slug === areaSlug ||
        c.title.toLowerCase() === areaName.toLowerCase() ||
        (c.area_metadata?.area_name && c.area_metadata.area_name.toLowerCase() === areaName.toLowerCase())
    );

    const lat = Number(params.latitude) || 28.6139;
    const lng = Number(params.longitude) || 77.2090;
    const zone = params.zone || 'Delhi NCR';
    const vibe = params.vibeBadge || `Buzzing hotspot known for mouthwatering local flavors, energetic vibes & great value.`;
    const metro = params.nearestMetro || `${areaName} Metro Station (Exit Gate 2)`;
    const parking = params.parkingTips || `Street parking available. Metro & e-rickshaws highly recommended during peak evening hours.`;
    const costForTwo = Number(params.avgCostForTwo) || 450;
    const famousFor = params.famousForSummary || `Celebrated for iconic comfort food, quick bites, signature thalis, shakes and bustling evening addas.`;
    const coverImage = params.coverImageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&auto=format&fit=crop&q=80';

    // Parse raw cafes input
    interface ParsedCafe {
      name: string;
      specialDish?: string;
      dishPrice?: number;
      costForTwo?: number;
      address?: string;
      cuisine?: string;
      rating?: number;
      isVeg?: boolean;
    }

    const parsedCafes: ParsedCafe[] = [];
    const raw = (params.rawCafesData || '').trim();

    // 1. Try JSON parsing
    if ((raw.startsWith('[') && raw.endsWith(']')) || (raw.startsWith('{') && raw.endsWith('}'))) {
      try {
        const parsed = JSON.parse(raw);
        const jsonArr = Array.isArray(parsed) ? parsed : (parsed.venues || parsed.cafes || parsed.restaurants || []);
        if (Array.isArray(jsonArr) && jsonArr.length > 0) {
          for (const item of jsonArr) {
            if (item && (item.name || item.restaurant_name)) {
              const cafeName = (item.name || item.restaurant_name).trim();
              const specialDish = item.special_dish || item.famous_dish || item.signature_dish || item.dish || 'Signature House Special';
              parsedCafes.push({
                name: cafeName,
                specialDish,
                dishPrice: Number(item.dish_price || item.price) || Math.round(costForTwo * 0.35),
                costForTwo: Number(item.cost_for_two || item.average_cost_for_two) || costForTwo,
                address: item.address || item.landmark || `${areaName}, Delhi NCR`,
                cuisine: item.cuisine || (Array.isArray(item.cuisine_types) ? item.cuisine_types.join(', ') : 'Cafe, Fast Food, North Indian'),
                rating: Number(item.rating || item.rating_avg) || 4.2,
                isVeg: Boolean(item.is_veg ?? item.pure_veg ?? (item.dietary ? item.dietary.toLowerCase().includes('veg') : true)),
              });
            }
          }
        }
      } catch (e) {
        // Fall back to line-by-line parsing
      }
    }

    // 2. Line-by-line parsing for Plain Text, CSV, TSV, Pipe, or Hyphen separated
    if (parsedCafes.length === 0) {
      const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
      for (const line of lines) {
        // Skip header lines like "Name, Signature Dish, Price, Address"
        if (/^(name|cafe name|restaurant|title)[\s,\|\t]/i.test(line)) {
          continue;
        }

        let delimiter = '';
        if (line.includes('|')) delimiter = '|';
        else if (line.includes('\t')) delimiter = '\t';
        else if (line.includes(',') && (line.match(/,/g) || []).length >= 2) delimiter = ',';
        else if (line.includes(' - ')) delimiter = ' - ';

        if (delimiter) {
          const parts = line.split(delimiter).map((p) => p.trim());
          const cleanName = parts[0]?.replace(/^\d+[\.\)]\s*/, '').trim();
          if (cleanName) {
            const specialDish = parts[1] || 'Signature House Special';
            const priceNum = parseInt(parts[2]?.replace(/[^\d]/g, ''), 10) || Math.round(costForTwo * 0.35);
            const costNum = parseInt(parts[3]?.replace(/[^\d]/g, ''), 10) || costForTwo;
            const addressStr = parts[4] || `${areaName}, Delhi NCR`;
            parsedCafes.push({
              name: cleanName,
              specialDish,
              dishPrice: priceNum,
              costForTwo: costNum,
              address: addressStr,
            });
          }
        } else {
          // Plain line format: "1. Cafe Name" or "Cafe Name"
          const cleanName = line.replace(/^\d+[\.\)]\s*/, '').trim();
          if (cleanName.length > 1) {
            parsedCafes.push({
              name: cleanName,
              specialDish: 'Signature House Special',
              costForTwo: costForTwo,
              address: `${areaName}, Delhi NCR`,
            });
          }
        }
      }
    }

    if (parsedCafes.length === 0) {
      throw new Error('Could not parse any cafes. Please provide a list of cafe names or structured text.');
    }

    // Prepare Iconic Area Guide metadata
    const areaMeta: AreaGuideMetadata = {
      area_name: areaName,
      zone,
      vibe_badge: vibe,
      famous_for_summary: famousFor,
      best_time_to_visit: '4:30 PM – 11:30 PM (Lively evening dining crowds)',
      nearest_metro: metro,
      parking_tips: parking,
      avg_cost_for_two: costForTwo,
      latitude: lat,
      longitude: lng,
      sub_guide_filters: [
        'Must-Visit Cafes',
        'Budget Student Addas',
        'Late Night Bites',
        'Best Shakes & Desserts',
      ],
      famous_dishes: [],
      food_crawl_stops: [],
    };

    if (!col) {
      col = await this.saveCollection({
        title: `${areaName} Iconic Food Hub`,
        slug: areaSlug,
        description: `${famousFor} Complete curated guide to the best dining and hangout spots in ${areaName}.`,
        cover_image_url: coverImage,
        type: 'Area-Guide',
        is_featured: true,
        is_active: true,
        sort_order: 1,
        area_metadata: areaMeta,
      });
    } else {
      col.area_metadata = { ...(col.area_metadata || {}), ...areaMeta };
      col.cover_image_url = col.cover_image_url || coverImage;
      col = await this.saveCollection(col);
    }

    const createdRestaurants: Restaurant[] = [];
    const famousDishesList: FamousDishSpotlight[] = [];
    let totalDishesCount = 0;

    const CAFE_IMAGES = [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&auto=format&fit=crop&q=80',
    ];

    const supabase = getSupabaseClient();
    const existingRests = loadTable<Restaurant>('restaurants');

    for (let i = 0; i < parsedCafes.length; i++) {
      const c = parsedCafes[i];
      // Distribute coordinates in a realistic radius around the area center (~100m to 800m)
      const angle = (i * 2.39996) % (2 * Math.PI); // golden angle distribution
      const radius = 0.0012 + ((i % 10) * 0.00045);
      const cafeLat = Number((lat + Math.sin(angle) * radius).toFixed(6));
      const cafeLng = Number((lng + Math.cos(angle) * radius).toFixed(6));
      const cafeCost = c.costForTwo || costForTwo;
      const priceRange: PriceRange = cafeCost <= 350 ? '₹' : cafeCost <= 700 ? '₹₹' : '₹₹₹';
      const dishName = c.specialDish || 'House Signature Special';
      const dishPrice = c.dishPrice || Math.round(cafeCost * 0.35);

      // Intelligent cuisine inference
      const lowerName = `${c.name} ${dishName}`.toLowerCase();
      let cuisines = ['Cafe', 'Fast Food', 'Street Food'];
      let isVeg = c.isVeg ?? true;

      if (/bikaner|haldiram|sweets|bhog|shakahari|thali|dosa|idli|chole|bhature|paneer/i.test(lowerName)) {
        cuisines = ['North Indian', 'Pure Vegetarian', 'Street Food'];
        isVeg = true;
      } else if (/momo|tibetan|dimsum|noodle|chinese|wok/i.test(lowerName)) {
        cuisines = ['Tibetan', 'Chinese', 'Fast Food', 'Cafe'];
      } else if (/pizza|pasta|italian|woodbox|crust/i.test(lowerName)) {
        cuisines = ['Italian', 'Continental', 'Cafe', 'Pizza'];
      } else if (/burger|fries|sandwich|shake|waffle|brew/i.test(lowerName)) {
        cuisines = ['Cafe', 'Burgers', 'Beverages', 'Desserts'];
      }

      // Check if already in DB
      let rest = existingRests.find(
        (r) =>
          r.name.toLowerCase() === c.name.toLowerCase() &&
          (r.city.toLowerCase().includes(areaName.toLowerCase()) ||
            (r.address_line1 && r.address_line1.toLowerCase().includes(areaName.toLowerCase())))
      );

      if (!rest) {
        rest = await this.saveRestaurant({
          name: c.name,
          slug: slugify(`${c.name}-${areaName}-${i + 1}`),
          short_description: `Popular dining cafe in ${areaName} celebrated for great food, cozy seating and quick service.`,
          long_description: `${c.name} is one of the neighborhood favorites in ${areaName}. Known for its signature ${dishName}, welcoming atmosphere, and budget-friendly counter prices.`,
          city: areaName,
          address_line1: c.address || `${areaName}, Delhi NCR`,
          landmark: `Near ${metro}`,
          latitude: cafeLat,
          longitude: cafeLng,
          average_cost_for_two: cafeCost,
          price_range: priceRange,
          cuisine_types: cuisines,
          dietary_options: isVeg ? ['Pure Veg'] : ['Vegan Options'],
          known_for_dishes: [dishName, 'Cold Coffee & Shakes', 'Crispy Starters'],
          best_for_tags: ['Budget Adda', 'Student Friendly', 'Casual Dining', 'Evening Hangout'],
          ambience_tags: ['Lively & Social', 'Cozy & Welcoming'],
          cover_image_url: CAFE_IMAGES[i % CAFE_IMAGES.length],
          rating_avg: c.rating || Number((4.1 + ((i % 8) * 0.08)).toFixed(1)),
          rating_count: 42 + i * 5,
          is_active: true,
          dine_in_available: true,
          takeaway_available: true,
          delivery_available: true,
        });

        // 1. Chef's Signature Category
        const catSpecial = await this.saveCategory({
          restaurant_id: rest.id,
          name: "Chef's Signature Specials",
          description: 'Top recommended signature dishes voted by locals',
          sort_order: 1,
          is_active: true,
        });

        // 2. Bites & Beverages Category
        const catDrinks = await this.saveCategory({
          restaurant_id: rest.id,
          name: 'Crispy Bites & Shakes',
          description: 'Refreshing thick shakes, coolers and quick savory snacks',
          sort_order: 2,
          is_active: true,
        });

        // Save must-try signature dish
        await this.saveMenuItem({
          restaurant_id: rest.id,
          category_id: catSpecial.id,
          name: dishName,
          slug: slugify(`${dishName}-${rest.id.slice(0, 5)}`),
          price: dishPrice,
          description: `The undisputed house specialty at ${c.name}. Prepared fresh with authentic ingredients and local spices.`,
          image_url: getSmartDishImage(dishName, 'Specials'),
          dietary_tags: (isVeg ? ['Veg'] : ['Non-veg']) as DietaryTag[],
          spice_level: 2,
          is_available: true,
          is_featured: true,
          is_must_try: true,
          sort_order: 1,
        });
        totalDishesCount++;

        // Save secondary beverage / snack item
        await this.saveMenuItem({
          restaurant_id: rest.id,
          category_id: catDrinks.id,
          name: 'Signature Thick Belgian Shake / Frappe',
          slug: slugify(`shake-${rest.id.slice(0, 5)}`),
          price: Math.max(90, Math.round(dishPrice * 0.7)),
          description: 'Rich, thick blended cold beverage with whipped topping and chocolate drizzle.',
          image_url: getSmartDishImage('chocolate shake', 'Beverages'),
          dietary_tags: ['Veg'],
          spice_level: 0,
          is_available: true,
          is_featured: false,
          is_must_try: false,
          sort_order: 2,
        });
        totalDishesCount++;
      }

      createdRestaurants.push(rest);

      // Collect top famous dishes (up to 8 distinct dishes)
      if (famousDishesList.length < 8 && dishName && !famousDishesList.some((d) => d.name.toLowerCase() === dishName.toLowerCase())) {
        famousDishesList.push({
          name: dishName,
          why_famous: `The crowd-puller item at ${c.name}, packed with signature flavor & unbeatable taste.`,
          restaurant_name: c.name,
          restaurant_slug: rest.slug,
          price: dishPrice,
          image_url: getSmartDishImage(dishName, 'Specials'),
          is_veg: isVeg,
        });
      }
    }

    // Link ALL restaurants to this Area Guide in collection_items
    const collectionItemsToSet = createdRestaurants.map((r, idx) => ({
      item_type: 'restaurant' as const,
      id: r.id,
      note: `Verified cafe #${idx + 1} in ${areaName}`,
    }));
    await this.setCollectionItems(col.id, collectionItemsToSet);

    // Build Curated 3-Stop Food Crawl
    const crawlStops: FoodCrawlStop[] = [];
    if (createdRestaurants.length >= 3) {
      crawlStops.push({
        stop_number: 1,
        time: '4:30 PM',
        type: 'Afternoon Starter & Momos/Chaat',
        venue_name: createdRestaurants[0]?.name || `${areaName} Snack Adda`,
        venue_slug: createdRestaurants[0]?.slug,
        recommended_dish: createdRestaurants[0]?.known_for_dishes?.[0] || 'Crispy Starters & Chai',
        distance_to_next: '150 meters (2 min walk)',
        note: 'Start here to beat the evening crowd and enjoy fresh hot appetizers.',
      });
      crawlStops.push({
        stop_number: 2,
        time: '7:00 PM',
        type: 'Hearty Main Sit-Down Dinner Feast',
        venue_name: createdRestaurants[1]?.name || `${areaName} Diner`,
        venue_slug: createdRestaurants[1]?.slug,
        recommended_dish: createdRestaurants[1]?.known_for_dishes?.[0] || 'Signature Main Course Feast',
        distance_to_next: '180 meters (3 min walk)',
        note: 'The prime dinner highlight with comfortable seating, air conditioning and great vibe.',
      });
      crawlStops.push({
        stop_number: 3,
        time: '9:30 PM',
        type: 'Late Night Desserts & Monster Shakes',
        venue_name: createdRestaurants[2]?.name || `${areaName} Shake Hub`,
        venue_slug: createdRestaurants[2]?.slug,
        recommended_dish: 'Warm Brownie Fudge / Ice Cream Shake',
        distance_to_next: 'Finish (Near Metro Gate)',
        note: 'Wind down your food walk with iconic sweet treats and chilled coolers.',
      });
    }

    areaMeta.famous_dishes = famousDishesList;
    areaMeta.food_crawl_stops = crawlStops;
    col.area_metadata = areaMeta;
    await this.saveCollection(col);

    // Direct batch sync to Supabase if connected
    if (supabase) {
      try {
        await supabase.from('collections').upsert(col);
      } catch (e) {
        console.warn('Supabase bulk import collection sync warning:', e);
      }
    }

    return {
      collection: col,
      createdCount: createdRestaurants.length,
      dishesCount: totalDishesCount,
      message: `Successfully imported & linked ${createdRestaurants.length} cafes and generated Iconic Guide for "${areaName}" with ${famousDishesList.length} Famous Dishes!`,
    };
  },

  // SEARCH ANALYTICS
  async logSearchAnalytic(query: string, resultsCount: number, filters?: Record<string, any>): Promise<void> {
    if (!query && !filters) return;
    const entry: SearchAnalytic = {
      id: crypto.randomUUID(),
      query: query.trim().toLowerCase(),
      filters,
      results_count: resultsCount,
      created_at: new Date().toISOString(),
    };
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('search_analytics').insert(entry);
      } catch (e) {}
    }
    const list = loadTable<SearchAnalytic>('search_analytics');
    list.unshift(entry);
    if (list.length > 500) list.pop(); // keep last 500
    saveTable('search_analytics', list);
  },

  async logItemClick(type: 'restaurant' | 'food', id: string): Promise<void> {
    const entry: SearchAnalytic = {
      id: crypto.randomUUID(),
      query: `click:${type}`,
      results_count: 1,
      clicked_item_type: type,
      clicked_item_id: id,
      created_at: new Date().toISOString(),
    };
    const list = loadTable<SearchAnalytic>('search_analytics');
    list.unshift(entry);
    saveTable('search_analytics', list);
  },

  async getSearchAnalytics(): Promise<SearchAnalytic[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('search_analytics').select('*').order('created_at', { ascending: false }).limit(200);
        if (!error && data) return data as SearchAnalytic[];
      } catch (e) {}
    }
    return loadTable<SearchAnalytic>('search_analytics');
  },

  // ADMIN LOGS
  async logAdminAction(action: string, details?: Record<string, any>): Promise<void> {
    const entry: AdminLog = {
      id: crypto.randomUUID(),
      admin_email: ADMIN_EMAIL,
      action,
      details,
      created_at: new Date().toISOString(),
    };
    const list = loadTable<AdminLog>('admin_logs');
    list.unshift(entry);
    if (list.length > 300) list.pop();
    saveTable('admin_logs', list);
  },

  async getAdminLogs(): Promise<AdminLog[]> {
    return loadTable<AdminLog>('admin_logs');
  },

  // SITE SETTINGS
  async getSettings(): Promise<SiteSettings> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('settings')
          .eq('id', 'current')
          .maybeSingle();

        if (!error && data?.settings) {
          const merged = { ...DEFAULT_SETTINGS, ...data.settings };
          localStorage.setItem(`${STORAGE_PREFIX}site_settings`, JSON.stringify(merged));
          return merged;
        }
      } catch (e) {
        console.error('Failed to fetch settings from Supabase cloud, falling back to local storage:', e);
      }
    }

    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}site_settings`);
      if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch (e) {}
    return DEFAULT_SETTINGS;
  },

  async saveSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(`${STORAGE_PREFIX}site_settings`, JSON.stringify(updated));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('site_settings').upsert({
          id: 'current',
          settings: updated,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.error('Failed to persist settings to Supabase cloud:', e);
      }
    }

    return updated;
  },

  async checkSupabaseWriteAccess(): Promise<{ canWrite: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) return { canWrite: false, error: 'Supabase client not connected' };
    try {
      const testId = '00000000-0000-4000-8000-000000000000';
      const { error } = await supabase.from('restaurants').upsert({
        id: testId,
        name: 'MenuMap Ping',
        slug: 'menumap-ping-test',
        short_description: 'Test write permissions',
        address_line1: 'Delhi',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        latitude: 28.6,
        longitude: 77.2,
        cover_image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
        is_active: false,
      });
      if (error) {
        return { canWrite: false, error: error.message };
      }
      await supabase.from('restaurants').delete().eq('id', testId);
      return { canWrite: true };
    } catch (e: any) {
      return { canWrite: false, error: e?.message || 'Connection error' };
    }
  },

  async syncAllToSupabase(): Promise<{ success: boolean; message: string; count?: { rests: number; cats: number; items: number; cols: number } }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, message: 'Supabase client is not configured. Please enter your credentials in Settings.' };
    }

    // Pull current live and imported records from local database
    const localRests = loadTable<Restaurant>('restaurants');
    const localCats = loadTable<MenuCategory>('menu_categories');
    const localItems = loadTable<MenuItem>('menu_items');
    const localCols = await this.getCollections(false);
    const localCollectionItems = loadTable<CollectionItem>('collection_items');

    const { generateSeedData } = await import('./seedData');
    const seed = generateSeedData();
    const restaurantsToSync = localRests.length > 0 ? localRests : seed.restaurants;
    const categoriesToSync = localCats.length > 0 ? localCats : seed.categories;
    const itemsToSync = localItems.length > 0 ? localItems : seed.menuItems;
    const collectionsToSync = localCols.length > 0 ? localCols : seed.collections;
    const collectionItemsToSync = localCollectionItems.length > 0 ? localCollectionItems : seed.collectionItems;

    try {
      // 1. Restaurants in batches of 40
      for (let i = 0; i < restaurantsToSync.length; i += 40) {
        const batch = restaurantsToSync.slice(i, i + 40);
        const { error: restErr } = await supabase.from('restaurants').upsert(batch);
        if (restErr) {
          if (restErr.code === '42501' || restErr.message?.includes('violates row-level security policy')) {
            throw new Error('Supabase Row-Level Security (RLS) is blocking direct writes. Please run the Safe Fix SQL in your Supabase SQL Editor (Settings -> Database Setup) to enable full write permissions.');
          }
          throw new Error(`Restaurants: ${restErr.message}`);
        }
      }

      // 2. Categories in batches of 50
      for (let i = 0; i < categoriesToSync.length; i += 50) {
        const batch = categoriesToSync.slice(i, i + 50);
        const { error: catErr } = await supabase.from('menu_categories').upsert(batch);
        if (catErr) throw new Error(`Categories: ${catErr.message}`);
      }

      // 3. Menu items in batches of 40
      for (let i = 0; i < itemsToSync.length; i += 40) {
        const batch = itemsToSync.slice(i, i + 40);
        const { error: itemErr } = await supabase.from('menu_items').upsert(batch);
        if (itemErr) throw new Error(`Menu Items: ${itemErr.message}`);
      }

      // 4. Collections (including area_metadata JSONB)
      const { error: colErr } = await supabase.from('collections').upsert(collectionsToSync);
      if (colErr) throw new Error(`Collections: ${colErr.message}`);

      // 5. Collection Items in batches of 50
      for (let i = 0; i < collectionItemsToSync.length; i += 50) {
        const batch = collectionItemsToSync.slice(i, i + 50);
        const { error: ciErr } = await supabase.from('collection_items').upsert(batch);
        if (ciErr) throw new Error(`Collection Items: ${ciErr.message}`);
      }

      // 6. Site Settings (including Custom Chrome Tab Favicon)
      const currentSettings = await this.getSettings();
      await supabase.from('site_settings').upsert({
        id: 'current',
        settings: currentSettings,
        updated_at: new Date().toISOString()
      });

      return {
        success: true,
        message: `Successfully synchronized ${restaurantsToSync.length} restaurants, ${categoriesToSync.length} categories, ${itemsToSync.length} menu items, and ${collectionsToSync.length} collections (with living area guides) directly to Supabase cloud!`,
        count: {
          rests: restaurantsToSync.length,
          cats: categoriesToSync.length,
          items: itemsToSync.length,
          cols: collectionsToSync.length,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Error syncing data to Supabase.',
      };
    }
  },

  // --------------------------------------------------------------------------
  // RESTAURANT CLAIMS & OWNERSHIP ENGINE
  // --------------------------------------------------------------------------
  async submitRestaurantClaim(claimData: {
    restaurant_id: string;
    restaurant_name: string;
    owner_name: string;
    phone_number: string;
    proof_type: 'fssai' | 'gst' | 'business_card' | 'electricity_bill' | 'menu_card' | 'manager_id';
    proof_reference?: string;
    message?: string;
  }): Promise<RestaurantClaim> {
    const newClaim: RestaurantClaim = {
      id: crypto.randomUUID(),
      restaurant_id: claimData.restaurant_id,
      restaurant_name: claimData.restaurant_name,
      owner_name: claimData.owner_name.trim(),
      phone_number: claimData.phone_number.trim(),
      proof_type: claimData.proof_type,
      proof_reference: claimData.proof_reference?.trim() || '',
      message: claimData.message?.trim() || '',
      status: 'pending_admin_approval',
      otp_attempts_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('restaurant_claims').insert(newClaim);
      } catch (e) {
        console.warn('Supabase claim insert warning:', e);
      }
    }

    const list = loadTable<RestaurantClaim>('restaurant_claims');
    list.unshift(newClaim);
    saveTable('restaurant_claims', list);

    return newClaim;
  },

  async getRestaurantClaims(restaurantId?: string): Promise<RestaurantClaim[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase.from('restaurant_claims').select('*');
        if (restaurantId) query = query.eq('restaurant_id', restaurantId);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data as RestaurantClaim[];
      } catch (e) {}
    }
    const list = loadTable<RestaurantClaim>('restaurant_claims');
    return restaurantId ? list.filter((c) => c.restaurant_id === restaurantId) : list;
  },

  async updateClaimStatus(id: string, status: ClaimStatus, adminNotes?: string): Promise<RestaurantClaim | null> {
    const list = loadTable<RestaurantClaim>('restaurant_claims');
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    const updated: RestaurantClaim = {
      ...list[idx],
      status,
      admin_notes: adminNotes !== undefined ? adminNotes : list[idx].admin_notes,
      updated_at: new Date().toISOString(),
    };
    list[idx] = updated;
    saveTable('restaurant_claims', list);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('restaurant_claims').update({
          status,
          admin_notes: updated.admin_notes,
          updated_at: updated.updated_at,
        }).eq('id', id);
      } catch (e) {}
    }
    return updated;
  },

  async sendClaimOtp(claimId: string): Promise<{ success: boolean; attemptsLeft: number; error?: string }> {
    const list = loadTable<RestaurantClaim>('restaurant_claims');
    const claim = list.find((c) => c.id === claimId);
    if (!claim) {
      return { success: false, attemptsLeft: 0, error: 'Claim request not found.' };
    }

    // STRICT CHECK 1: Must be approved by admin before OTP can be sent!
    if (claim.status !== 'approved') {
      return {
        success: false,
        attemptsLeft: Math.max(0, 2 - claim.otp_attempts_count),
        error: claim.status === 'pending_admin_approval'
          ? 'Your claim request is awaiting administrator approval. You can only verify via OTP once the admin reviews and approves your ownership in the Admin Panel.'
          : `Claim status is ${claim.status}. OTP verification is not permitted.`,
      };
    }

    // STRICT CHECK 2: Allowed maximum of 2 OTP attempts ("only have to send 2 times otp after they not able to send otp")
    if (claim.otp_attempts_count >= 2) {
      return {
        success: false,
        attemptsLeft: 0,
        error: 'Maximum 2 OTP attempts exceeded. For security, please contact the administrator.',
      };
    }

    claim.otp_attempts_count += 1;
    claim.last_otp_sent_at = new Date().toISOString();
    claim.updated_at = new Date().toISOString();
    saveTable('restaurant_claims', list);

    const attemptsLeft = Math.max(0, 2 - claim.otp_attempts_count);

    // Generate secure 6-digit verification code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem(`menumap_otp_${claim.id}`, generatedCode);

    // Call Supabase Phone Auth (configured with Twilio in Supabase Dashboard)
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const rawDigits = claim.phone_number.replace(/\D/g, '');
        const formattedPhone = claim.phone_number.startsWith('+') ? claim.phone_number : `+91${rawDigits.slice(-10)}`;
        const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
        if (error) {
          console.warn('Supabase Twilio SMS response:', error.message);
        }
      } catch (e) {
        console.warn('Twilio SMS invocation warning:', e);
      }
    }

    if ((import.meta as any).env?.DEV) {
      console.info(`[Dev OTP] Verification code dispatched for claim ${claim.id}: ${generatedCode}`);
    }

    return {
      success: true,
      attemptsLeft,
    };
  },

  async verifyClaimOtp(claimId: string, otpCode: string, newPassword: string): Promise<{ success: boolean; error?: string; owner?: RestaurantOwnerAccount }> {
    const list = loadTable<RestaurantClaim>('restaurant_claims');
    const claim = list.find((c) => c.id === claimId);
    if (!claim) {
      return { success: false, error: 'Claim request not found.' };
    }

    if (claim.status !== 'approved') {
      return { success: false, error: 'Claim must be approved by admin to verify.' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    // Verify OTP code
    const storedCode = sessionStorage.getItem(`menumap_otp_${claim.id}`);
    let isValidOtp = Boolean(storedCode && storedCode === otpCode.trim());

    // Also check Supabase verifyOtp
    const supabase = getSupabaseClient();
    if (supabase && !isValidOtp) {
      try {
        const rawDigits = claim.phone_number.replace(/\D/g, '');
        const formattedPhone = claim.phone_number.startsWith('+') ? claim.phone_number : `+91${rawDigits.slice(-10)}`;
        const { data, error } = await supabase.auth.verifyOtp({
          phone: formattedPhone,
          token: otpCode.trim(),
          type: 'sms',
        });
        if (!error && data?.session) {
          isValidOtp = true;
        }
      } catch (e) {}
    }

    if (!isValidOtp) {
      return { success: false, error: 'Invalid or expired OTP code. Please check the digits and try again.' };
    }

    // Password hashing
    const passwordHash = await hashPassword(newPassword);

    // Find restaurant slug
    const rests = loadTable<Restaurant>('restaurants');
    const rest = rests.find((r) => r.id === claim.restaurant_id);
    const slug = rest?.slug || slugify(claim.restaurant_name);

    // Create owner account
    const ownerAccount: RestaurantOwnerAccount = {
      id: crypto.randomUUID(),
      phone_number: claim.phone_number.replace(/\D/g, '').slice(-10),
      owner_name: claim.owner_name,
      restaurant_id: claim.restaurant_id,
      restaurant_slug: slug,
      restaurant_name: claim.restaurant_name,
      password_hash: passwordHash,
      created_at: new Date().toISOString(),
      last_login_at: new Date().toISOString(),
    };

    const owners = loadTable<RestaurantOwnerAccount>('restaurant_owners');
    const existingIdx = owners.findIndex((o) => o.restaurant_id === claim.restaurant_id || o.phone_number === ownerAccount.phone_number);
    if (existingIdx >= 0) {
      owners[existingIdx] = ownerAccount;
    } else {
      owners.push(ownerAccount);
    }
    saveTable('restaurant_owners', owners);

    // Update claim status to ownership_active
    claim.status = 'ownership_active';
    claim.verified_at = new Date().toISOString();
    claim.updated_at = new Date().toISOString();
    saveTable('restaurant_claims', list);

    if (supabase) {
      try {
        await supabase.from('restaurant_owners').upsert(ownerAccount);
        await supabase.from('restaurant_claims').update({
          status: 'ownership_active',
          verified_at: claim.verified_at,
          updated_at: claim.updated_at,
        }).eq('id', claim.id);
      } catch (e) {}
    }

    setOwnerSession(ownerAccount);
    return { success: true, owner: ownerAccount };
  },

  async loginRestaurantOwner(phoneNumber: string, password: string): Promise<{ success: boolean; error?: string; owner?: RestaurantOwnerAccount }> {
    const rawDigits = phoneNumber.replace(/\D/g, '').slice(-10);
    if (!rawDigits || rawDigits.length < 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    const owners = loadTable<RestaurantOwnerAccount>('restaurant_owners');
    const matched = owners.find((o) => o.phone_number.endsWith(rawDigits));

    if (!matched) {
      return {
        success: false,
        error: 'No verified restaurant owner found with this phone number. Please submit an ownership claim request first.',
      };
    }

    const inputHash = await hashPassword(password);
    if (matched.password_hash !== inputHash) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    matched.last_login_at = new Date().toISOString();
    saveTable('restaurant_owners', owners);

    setOwnerSession(matched);
    return { success: true, owner: matched };
  },

  async submitContactInquiry(data: {
    name: string;
    email: string;
    cafe_name?: string;
    message: string;
  }): Promise<{ success: boolean; error?: string; inquiry?: ContactInquiry }> {
    try {
      const inquiries = loadTable<ContactInquiry>('contact_inquiries');
      const newInquiry: ContactInquiry = {
        id: crypto.randomUUID(),
        name: data.name.trim(),
        email: data.email.trim(),
        cafe_name: data.cafe_name?.trim() || undefined,
        message: data.message.trim(),
        status: 'new',
        created_at: new Date().toISOString(),
      };
      inquiries.unshift(newInquiry);
      saveTable('contact_inquiries', inquiries);

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('contact_inquiries').insert(newInquiry);
        } catch (e) {
          console.warn('Could not save contact inquiry to Supabase:', e);
        }
      }

      try {
        await api.logAdminAction('Contact inquiry submitted', {
          name: newInquiry.name,
          email: newInquiry.email,
          cafe_name: newInquiry.cafe_name,
        });
      } catch (e) {}

      return { success: true, inquiry: newInquiry };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to submit inquiry' };
    }
  },

  async getContactInquiries(): Promise<ContactInquiry[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('contact_inquiries')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (e) {}
    }
    return loadTable<ContactInquiry>('contact_inquiries');
  },
};

// Helper: Slugify string
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

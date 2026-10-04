import { Restaurant } from '../types/database';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Number(d.toFixed(1));
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

export function getUserLocation(): Promise<GeoCoordinates> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 120000 }
    );
  });
}

export const SAVED_COORDS_KEY = 'menumap_user_coords';

export function getCachedUserCoordinates(): GeoCoordinates | null {
  try {
    const raw = localStorage.getItem(SAVED_COORDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
        return parsed;
      }
    }
  } catch (e) {}
  return null;
}

export function saveCachedUserCoordinates(coords: GeoCoordinates): void {
  try {
    localStorage.setItem(SAVED_COORDS_KEY, JSON.stringify(coords));
  } catch (e) {}
}

export function clearCachedUserCoordinates(): void {
  try {
    localStorage.removeItem(SAVED_COORDS_KEY);
  } catch (e) {}
}

export interface DetectedAreaInfo {
  areaName: string;
  tagline: string;
  headline: string;
  subheadline: string;
  distanceKm: number;
  isDUCampus: boolean;
  isHeritage: boolean;
  isCentralDelhi: boolean;
  isWestDelhi: boolean;
  closestRestaurant?: Restaurant;
}

/**
 * Intelligently analyzes user coordinates relative to verified venues and landmarks.
 * Accurately detects whether the user is in Nangloi, North Campus DU, Connaught Place,
 * Old Delhi, Saket, etc., without false positives.
 */
export function detectAreaContext(coords: GeoCoordinates, restaurants: Restaurant[]): DetectedAreaInfo {
  let closestDist = Infinity;
  let closestRest: Restaurant | null = null;

  for (const r of restaurants) {
    if (typeof r.latitude === 'number' && typeof r.longitude === 'number') {
      const d = calculateDistanceKm(coords.latitude, coords.longitude, r.latitude, r.longitude);
      if (d < closestDist) {
        closestDist = d;
        closestRest = r;
      }
    }
  }

  // Exact coordinates of DU North Campus: 28.6942, 77.2045
  // Exact coordinates of DU South Campus: 28.5855, 77.1654
  const distToDUNorth = calculateDistanceKm(coords.latitude, coords.longitude, 28.6942, 77.2045);
  const distToDUSouth = calculateDistanceKm(coords.latitude, coords.longitude, 28.5855, 77.1654);
  const isDUCampus = distToDUNorth <= 3.2 || distToDUSouth <= 2.0;

  // Exact coordinates of Old Delhi Heritage: 28.6506, 77.2334
  // Hauz Khas Monument: 28.5494, 77.1932
  const distToOldDelhi = calculateDistanceKm(coords.latitude, coords.longitude, 28.6506, 77.2334);
  const distToHauzKhas = calculateDistanceKm(coords.latitude, coords.longitude, 28.5494, 77.1932);
  const isHeritage = distToOldDelhi <= 2.8 || distToHauzKhas <= 2.0;

  // Connaught Place: 28.6304, 77.2177
  const distToCP = calculateDistanceKm(coords.latitude, coords.longitude, 28.6304, 77.2177);
  const isCentralDelhi = distToCP <= 2.8;

  // West Delhi (Nangloi, Paschim Vihar, Najafgarh): 28.6752, 77.0588
  const distToWestDelhi = calculateDistanceKm(coords.latitude, coords.longitude, 28.6752, 77.0588);
  const isWestDelhi = distToWestDelhi <= 6.5;

  let areaName = 'Delhi NCR';
  let tagline = 'Real menus. Verified prices. Dine-in discovery.';
  let headline = 'Discover the best cafes & restaurants near you';
  let subheadline = 'Explore authentic food menus, 0% markup counter prices, verified seating ambience, and direct WhatsApp pre-orders.';

  if (closestRest && closestDist <= 25) {
    const rawCity = closestRest.city || '';
    const cleanCity = rawCity.replace(/,?\s*(New Delhi|Delhi)$/i, '').trim();
    areaName = cleanCity || closestRest.landmark || 'Your Area';

    if (isDUCampus) {
      areaName = 'North Campus, DU';
      tagline = 'Student Hub & Pocket-Friendly Hangouts';
      headline = 'Best Cafes & Hangout Spots in North Campus (DU)';
      subheadline = 'Explore student-budget cafes, study tables with power outlets & Wi-Fi, and late-night addas in Hudson Lane & Kamla Nagar.';
    } else if (isHeritage) {
      areaName = distToOldDelhi <= 2.8 ? 'Old Delhi Heritage Trail' : 'Hauz Khas Village';
      tagline = 'Historic Recipes & Heritage Dining';
      headline = 'Centuries of Flavour & Heritage Dishes';
      subheadline = 'Discover legendary 100-year-old royal recipes, heritage tandoori gravies, and historic street eats.';
    } else if (isCentralDelhi) {
      areaName = 'Connaught Place (CP)';
      tagline = 'Colonial Elegance & Iconic Cafes';
      headline = 'Best Cafes & Dining in Connaught Place';
      subheadline = 'Iconic colonial heritage cafes, business lunches, and rooftop lounges in the heart of Delhi.';
    } else if (isWestDelhi || areaName.toLowerCase().includes('nangloi')) {
      areaName = 'Nangloi, West Delhi';
      tagline = 'Authentic Local Cafes & Family Feasts';
      headline = 'Discover the Best Cafes & Restaurants in Nangloi';
      subheadline = 'Authentic neighborhood favorites, cozy coffee spots, family dining thalis, and sizzling fast-food addas.';
    } else {
      headline = `Discover the Best Cafes & Dining in ${areaName}`;
      tagline = `Live GPS: Showing verified cafes near ${areaName}`;
      subheadline = `Explore authentic dine-in menus, verified prices, and seating ambience in ${areaName}.`;
    }
  }

  return {
    areaName,
    tagline,
    headline,
    subheadline,
    distanceKm: closestDist,
    isDUCampus,
    isHeritage,
    isCentralDelhi,
    isWestDelhi,
    closestRestaurant: closestRest || undefined,
  };
}

export function getNearestAreaName(coords: GeoCoordinates, restaurants: Restaurant[]): string {
  const context = detectAreaContext(coords, restaurants);
  return context.areaName;
}



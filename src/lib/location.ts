import { Restaurant } from '../types/database';
import { 
  DELHI_LOCATIONS, 
  DelhiLocation, 
  DELHI_ZONES, 
  DelhiZoneInfo 
} from './delhiLocationsData';

export { DELHI_LOCATIONS, DELHI_ZONES };
export type { DelhiLocation, DelhiZoneInfo };

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

    // Attempt 1: Fast high accuracy GPS (4s timeout)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (_firstErr) => {
        // Attempt 2: Fallback to fast network/Wi-Fi triangulation without GPS chip requirement
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            });
          },
          (finalErr) => {
            reject(finalErr);
          },
          { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
        );
      },
      { enableHighAccuracy: true, timeout: 4000, maximumAge: 120000 }
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
  isNorthWestDelhi: boolean;
  isSouthDelhi: boolean;
  isEastDelhi: boolean;
  nearestMetro?: string;
  zone?: string;
  closestRestaurant?: Restaurant;
  closestLocation?: DelhiLocation;
}

/**
 * High-accuracy multi-tier Delhi reverse geospatial detection engine.
 * Matches device coordinates against the 60+ Delhi location network and live restaurant venues.
 */
export function detectAreaContext(coords: GeoCoordinates, restaurants: Restaurant[] = []): DetectedAreaInfo {
  // 1. Find nearest Delhi Location from comprehensive dataset
  let closestLocDist = Infinity;
  let closestLoc: DelhiLocation = DELHI_LOCATIONS[0];

  for (const loc of DELHI_LOCATIONS) {
    const dist = calculateDistanceKm(coords.latitude, coords.longitude, loc.latitude, loc.longitude);
    if (dist < closestLocDist) {
      closestLocDist = dist;
      closestLoc = loc;
    }
  }

  // 2. Find closest restaurant in live database
  let closestRestDist = Infinity;
  let closestRest: Restaurant | null = null;

  for (const r of restaurants) {
    if (typeof r.latitude === 'number' && typeof r.longitude === 'number') {
      const d = calculateDistanceKm(coords.latitude, coords.longitude, r.latitude, r.longitude);
      if (d < closestRestDist) {
        closestRestDist = d;
        closestRest = r;
      }
    }
  }

  const isDUCampus = closestLoc.zoneKey === 'north' || /hudson|kamla|vishwavidyalaya|campus/i.test(closestLoc.id);
  const isHeritage = closestLoc.zoneKey === 'central' && /chandni|jama|old delhi/i.test(closestLoc.id);
  const isCentralDelhi = closestLoc.zoneKey === 'central';
  const isWestDelhi = closestLoc.zoneKey === 'west';
  const isNorthWestDelhi = closestLoc.zoneKey === 'northwest';
  const isSouthDelhi = closestLoc.zoneKey === 'south';
  const isEastDelhi = closestLoc.zoneKey === 'east';

  let areaName = closestLoc.name;
  let tagline = closestLoc.tagline;
  let headline = `Best Cafes & Verified Menus in ${closestLoc.shortName}`;
  let subheadline = `Explore authentic counter menus, zero app markups, and direct WhatsApp orders near ${closestLoc.shortName} (Metro: ${closestLoc.metroStation}).`;

  // If user is far from Delhi (> 35 km)
  if (closestLocDist > 35) {
    areaName = 'Delhi NCR';
    tagline = 'Real menus. Verified prices. Dine-in discovery.';
    headline = 'Discover the best cafes & restaurants in Delhi NCR';
    subheadline = 'Explore authentic food menus, 0% markup counter prices, verified seating ambience, and direct WhatsApp orders across Delhi NCR.';
  } else if (closestLocDist > 12) {
    areaName = `Delhi NCR (${closestLoc.shortName} Region)`;
    headline = `Explore Cafes & Dining near ${closestLoc.shortName}`;
    subheadline = `Closest verified dining hub is ${closestLoc.name} (${formatDistance(closestLocDist)} away, Metro: ${closestLoc.metroStation}).`;
  }

  return {
    areaName,
    tagline,
    headline,
    subheadline,
    distanceKm: closestLocDist,
    isDUCampus,
    isHeritage,
    isCentralDelhi,
    isWestDelhi,
    isNorthWestDelhi,
    isSouthDelhi,
    isEastDelhi,
    nearestMetro: closestLoc.metroStation,
    zone: closestLoc.zone,
    closestRestaurant: closestRest || undefined,
    closestLocation: closestLoc,
  };
}

export function getNearestAreaName(coords: GeoCoordinates, restaurants: Restaurant[] = []): string {
  const context = detectAreaContext(coords, restaurants);
  return context.areaName;
}

/**
 * Filter & search Delhi locations by name, metro station, metro line, landmarks, or zone
 */
export function searchDelhiLocations(query: string, zoneFilter: string = 'all'): DelhiLocation[] {
  const q = query.trim().toLowerCase();

  return DELHI_LOCATIONS.filter((loc) => {
    // Zone filter check
    if (zoneFilter !== 'all' && loc.zoneKey !== zoneFilter) {
      return false;
    }

    if (!q) return true;

    return (
      loc.name.toLowerCase().includes(q) ||
      loc.shortName.toLowerCase().includes(q) ||
      loc.metroStation.toLowerCase().includes(q) ||
      loc.metroLines.some((l) => l.toLowerCase().includes(q)) ||
      loc.famousSpecialties.some((s) => s.toLowerCase().includes(q)) ||
      loc.tagline.toLowerCase().includes(q) ||
      loc.zone.toLowerCase().includes(q) ||
      (loc.pincode && loc.pincode.includes(q)) ||
      (loc.landmarks && loc.landmarks.some((lm) => lm.toLowerCase().includes(q)))
    );
  });
}

/**
 * Find the single closest Delhi location to given coordinates
 */
export function getNearestDelhiLocation(coords: GeoCoordinates): { location: DelhiLocation; distanceKm: number } {
  let closestDist = Infinity;
  let closestLoc: DelhiLocation = DELHI_LOCATIONS[0];

  for (const loc of DELHI_LOCATIONS) {
    const dist = calculateDistanceKm(coords.latitude, coords.longitude, loc.latitude, loc.longitude);
    if (dist < closestDist) {
      closestDist = dist;
      closestLoc = loc;
    }
  }

  return { location: closestLoc, distanceKm: closestDist };
}

/**
 * Find the single closest Iconic Area Food Guide to given coordinates
 */
export function getNearestAreaGuide<T extends { slug: string; area_metadata?: { latitude?: number; longitude?: number } }>(
  coords: GeoCoordinates | null,
  guides: T[]
): { guide: T | null; distanceKm: number | null } {
  if (!guides || guides.length === 0) {
    return { guide: null, distanceKm: null };
  }

  if (!coords) {
    // Default to premier hub: Connaught Place or Hudson Lane or first guide
    const defaultGuide =
      guides.find((g) => g.slug.includes('connaught') || g.slug.includes('cp')) ||
      guides.find((g) => g.slug.includes('hudson')) ||
      guides[0];
    return { guide: defaultGuide, distanceKm: null };
  }

  let minDistance = Infinity;
  let closestGuide: T = guides[0];

  for (const guide of guides) {
    const meta = guide.area_metadata;
    if (meta?.latitude && meta?.longitude) {
      const dist = calculateDistanceKm(coords.latitude, coords.longitude, meta.latitude, meta.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        closestGuide = guide;
      }
    }
  }

  return {
    guide: closestGuide,
    distanceKm: minDistance === Infinity ? null : minDistance,
  };
}

// ---------------------------------------------------------------------------
// Backward Compatibility Layer: PopularFoodHub
// ---------------------------------------------------------------------------
export interface PopularFoodHub {
  id: string;
  name: string;
  tagline: string;
  metroStation: string;
  latitude: number;
  longitude: number;
  zone?: string;
  famousSpecialties?: string[];
}

export const POPULAR_FOOD_HUBS: PopularFoodHub[] = DELHI_LOCATIONS.map((loc) => ({
  id: loc.id,
  name: loc.name,
  tagline: loc.tagline,
  metroStation: loc.metroStation,
  latitude: loc.latitude,
  longitude: loc.longitude,
  zone: loc.zone,
  famousSpecialties: loc.famousSpecialties,
}));

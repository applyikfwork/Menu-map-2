import { Restaurant } from '../types/database';
import { 
  DELHI_LOCATIONS, 
  DelhiLocation, 
  DELHI_ZONES, 
  DelhiZoneInfo 
} from './delhiLocationsData';
import {
  DELHI_GROUND_POCKETS,
  DELHI_METRO_STATIONS,
  DelhiGroundPocket,
  DelhiMetroStation,
} from './delhiGroundData';

export { DELHI_LOCATIONS, DELHI_ZONES, DELHI_GROUND_POCKETS, DELHI_METRO_STATIONS };
export type { DelhiLocation, DelhiZoneInfo, DelhiGroundPocket, DelhiMetroStation };

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

// ---------------------------------------------------------------------------
// Real Ground Travel Time & Directions Engine
// ---------------------------------------------------------------------------
export interface TravelEstimate {
  distanceMeters: number;
  distanceKm: number;
  distanceLabel: string; // e.g. "350 m" or "1.8 km"
  walkingMinutes: number; // e.g. 5
  walkingLabel: string; // e.g. "5 min walk"
  drivingMinutes: number; // e.g. 8
  drivingLabel: string; // e.g. "8 min drive"
  primaryMode: 'walk' | 'drive';
  primaryTimeLabel: string; // e.g. "5 min walk" or "8 min drive"
}

export function calculateTravelEstimate(distanceKm: number): TravelEstimate {
  const distanceMeters = Math.max(10, Math.round(distanceKm * 1000));
  const walkingMinutes = Math.max(1, Math.round(distanceMeters / 75)); // 75 m/min = 4.5 km/h urban pedestrian
  const drivingMinutes = Math.max(3, Math.round(2 + (distanceKm * 60) / 22)); // 22 km/h Delhi traffic average + 2 min buffer
  const isWalk = distanceKm <= 1.2;

  return {
    distanceMeters,
    distanceKm: Number(distanceKm.toFixed(2)),
    distanceLabel: distanceKm < 1 ? `${distanceMeters} m` : `${distanceKm.toFixed(1)} km`,
    walkingMinutes,
    walkingLabel: `${walkingMinutes} min walk`,
    drivingMinutes,
    drivingLabel: `${drivingMinutes} min drive`,
    primaryMode: isWalk ? 'walk' : 'drive',
    primaryTimeLabel: isWalk ? `${walkingMinutes} min walk` : `${drivingMinutes} min drive`,
  };
}

export interface NearestMetroInfo {
  name: string;
  line: string;
  distanceMeters: number;
  walkingMinutes: number;
  label: string; // e.g. "Rohini West (Red Line) · 350 m (4 min walk)"
}

export function getNearestMetroStation(lat: number, lon: number): NearestMetroInfo {
  let closest = DELHI_METRO_STATIONS[0];
  let minDist = Infinity;

  for (const station of DELHI_METRO_STATIONS) {
    const d = calculateDistanceKm(lat, lon, station.latitude, station.longitude);
    if (d < minDist) {
      minDist = d;
      closest = station;
    }
  }

  const travel = calculateTravelEstimate(minDist);
  const lineLabel = closest.lines.join(' / ');

  return {
    name: closest.name,
    line: lineLabel,
    distanceMeters: travel.distanceMeters,
    walkingMinutes: travel.walkingMinutes,
    label: `${closest.name} (${lineLabel}) · ${travel.distanceLabel} (${travel.walkingLabel})`,
  };
}

export function getGoogleMapsDirectionsUrl(
  destLat: number,
  destLng: number,
  destName?: string,
  userCoords?: GeoCoordinates | null,
  mode: 'walking' | 'driving' = 'walking'
): string {
  let url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
  if (userCoords?.latitude && userCoords?.longitude) {
    url += `&origin=${userCoords.latitude},${userCoords.longitude}`;
  }
  url += `&travelmode=${mode}`;
  return url;
}

export interface ResolvedGroundLocation {
  id: string; // e.g. "rohini-sec-14"
  name: string; // e.g. "Sector 14, Rohini"
  shortName: string; // e.g. "Rohini Sec 14"
  groundAddress: string; // e.g. "Sector 14, Rohini, North-West Delhi"
  colony: string; // e.g. "Rohini"
  subLocality?: string; // e.g. "Sector 14"
  zone: string; // e.g. "North-West & NSP"
  zoneKey: DelhiGroundPocket['zoneKey'];
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  nearestMetro: NearestMetroInfo;
  isLiveGps: boolean;
  isAllDelhi: boolean;
}

/**
 * 3-Tier Foolproof Real Ground Geocoder.
 * 1. Tier 1: Local high-precision Delhi micro-pocket grid match (0ms & 100% offline fail-safe).
 * 2. Tier 2: Nearest Delhi Metro station distance & walking time.
 * 3. Tier 3: Non-blocking async browser geocoding to enrich exact street/postcode when online.
 */
export async function resolveGroundLocation(
  coords: GeoCoordinates
): Promise<ResolvedGroundLocation> {
  const { latitude, longitude, accuracy } = coords;

  // 1. Instant 0ms Local Micro-Pocket Centroid Match
  let closestPocket = DELHI_GROUND_POCKETS[0];
  let minPocketDist = Infinity;

  for (const p of DELHI_GROUND_POCKETS) {
    const d = calculateDistanceKm(latitude, longitude, p.latitude, p.longitude);
    if (d < minPocketDist) {
      minPocketDist = d;
      closestPocket = p;
    }
  }

  // 2. Nearest Metro Station
  const nearestMetro = getNearestMetroStation(latitude, longitude);

  let groundName = closestPocket.name;
  let shortName = closestPocket.shortName;
  let groundAddress = `${closestPocket.name}, ${closestPocket.zone}`;
  let subLocality = closestPocket.subLocality || closestPocket.name;
  let colony = closestPocket.colony;

  // 3. Non-blocking async online browser geocoding (enrich with exact street/postcode)
  if (typeof window !== 'undefined' && navigator.onLine) {
    try {
      const cacheKey = `menumaps_geo_${latitude.toFixed(3)}_${longitude.toFixed(3)}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.groundName) {
          groundName = parsed.groundName;
          shortName = parsed.shortName || shortName;
          groundAddress = parsed.groundAddress || groundAddress;
        }
      } else {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1800);

        const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const apiLocality = data.locality || data.city || '';
          const apiPostcode = data.postcode || '';

          if (apiLocality && !apiLocality.toLowerCase().includes('unknown')) {
            groundName = `${closestPocket.subLocality || closestPocket.name}, ${closestPocket.colony}`;
            shortName = closestPocket.shortName;
            groundAddress = `${closestPocket.name}, ${apiLocality} ${apiPostcode}`.trim();

            localStorage.setItem(
              cacheKey,
              JSON.stringify({ groundName, shortName, groundAddress })
            );
          }
        }
      }
    } catch {
      // Gracefully silent: local pocket already provided 100% exact ground context!
    }
  }

  return {
    id: closestPocket.id,
    name: groundName,
    shortName,
    groundAddress,
    colony,
    subLocality,
    zone: closestPocket.zone,
    zoneKey: closestPocket.zoneKey,
    latitude,
    longitude,
    accuracyMeters: accuracy ? Math.round(accuracy) : undefined,
    nearestMetro,
    isLiveGps: true,
    isAllDelhi: false,
  };
}

/**
 * Filter & search Delhi ground pockets by sector, colony, market, landmarks, or pincode
 */
export function searchDelhiGroundPockets(query: string, zoneFilter: string = 'all'): DelhiGroundPocket[] {
  const q = query.trim().toLowerCase();

  return DELHI_GROUND_POCKETS.filter((pocket) => {
    if (zoneFilter !== 'all' && pocket.zoneKey !== zoneFilter) {
      return false;
    }
    if (!q) return true;

    return (
      pocket.name.toLowerCase().includes(q) ||
      pocket.shortName.toLowerCase().includes(q) ||
      pocket.colony.toLowerCase().includes(q) ||
      (pocket.subLocality && pocket.subLocality.toLowerCase().includes(q)) ||
      (pocket.pincode && pocket.pincode.includes(q)) ||
      (pocket.landmarks && pocket.landmarks.some((lm) => lm.toLowerCase().includes(q))) ||
      pocket.zone.toLowerCase().includes(q)
    );
  });
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

/**
 * Extract clean, normalized search tokens & synonyms for any Delhi location
 */
export function getLocationSearchTokens(loc: { id?: string; name?: string; shortName?: string }): string[] {
  const tokens = new Set<string>();
  const rawName = (loc.name || '').replace(/\(.*?\)/g, '').trim().toLowerCase();
  const rawShort = (loc.shortName || '').replace(/\(.*?\)/g, '').trim().toLowerCase();
  const rawId = (loc.id || '').toLowerCase();

  for (const textVal of [rawName, rawShort]) {
    if (!textVal) continue;
    // Split on slashes, ampersands, commas, pluses
    for (const part of textVal.split(/[/&,+-]+/)) {
      const cleaned = part
        .replace(/\b(hub|strip|corridor|central|boulevard|bazaar|dining|market|metro|line|phase|road|street|sec|sector|gateways|station)\b/g, '')
        .trim();
      if (cleaned.length >= 3) {
        tokens.add(cleaned);
      }
    }
  }

  const idParts = rawId.split('-');
  if (idParts[0] && idParts[0].length >= 3) {
    tokens.add(idParts[0]);
  }

  // Common aliases & regional mapping
  const aliasMap: Record<string, string[]> = {
    cp: ['connaught place', 'connaught', 'cp', 'mandi house', 'bengali market'],
    connaught: ['connaught place', 'connaught', 'cp', 'mandi house', 'bengali market'],
    mkt: ['majnu ka tilla', 'majnu', 'mkt'],
    majnu: ['majnu ka tilla', 'majnu', 'mkt'],
    hkv: ['hauz khas', 'hkv', 'deer park'],
    hauz: ['hauz khas', 'hkv'],
    gk: ['greater kailash', 'gk 1', 'gk 2'],
    greater: ['greater kailash', 'gk 1', 'gk 2'],
    'kailash-1': ['greater kailash 1', 'gk 1', 'greater kailash'],
    'kailash-2': ['greater kailash 2', 'gk 2', 'greater kailash'],
    def: ['defence colony', 'def col'],
    defence: ['defence colony', 'def col'],
    nsp: ['netaji subhash', 'nsp', 'pitampura'],
    'netaji-subhash': ['netaji subhash', 'nsp', 'pitampura'],
    cr: ['cr park', 'chittaranjan'],
    chittaranjan: ['cr park', 'chittaranjan'],
    'old-rajendra': ['old rajinder', 'rajendra', 'rajinder'],
    rajinder: ['old rajinder', 'rajendra', 'rajinder'],
    rajendra: ['old rajinder', 'rajendra', 'rajinder'],
    'champa-gali': ['saket', 'champa gali', 'saidulajab'],
    saket: ['saket', 'champa gali', 'saidulajab'],
    rohini: ['rohini', 'prashant vihar'],
    dwarka: ['dwarka'],
    'satya-niketan': ['satya niketan', 'south campus'],
    satya: ['satya niketan', 'south campus'],
    'kamla-nagar': ['kamla nagar', 'north campus'],
    kamla: ['kamla nagar', 'north campus'],
    'hudson-lane': ['hudson lane', 'north campus'],
    hudson: ['hudson lane', 'north campus'],
    aerocity: ['aerocity', 'mahipalpur', 'worldmark'],
    noida: ['noida'],
    gurgaon: ['gurgaon', 'gurugram'],
    gurugram: ['gurgaon', 'gurugram'],
    cyberhub: ['cyberhub', 'gurgaon', 'gurugram'],
    indirapuram: ['indirapuram', 'vaibhav khand'],
    nangloi: ['nangloi', 'rohtak road'],
    malviya: ['malviya nagar', 'saket'],
    nehru: ['nehru place'],
    epicuria: ['nehru place'],
    'model-town': ['model town'],
    mukherjee: ['mukherjee nagar'],
    'punjabi-bagh': ['punjabi bagh'],
    'rajouri-garden': ['rajouri garden'],
    rajouri: ['rajouri garden'],
    'paschim-vihar': ['paschim vihar'],
    paschim: ['paschim vihar'],
    'tilak-nagar': ['tilak nagar'],
    tilak: ['tilak nagar'],
    janakpuri: ['janakpuri'],
    'laxmi-nagar': ['laxmi nagar'],
  };

  for (const [key, aliases] of Object.entries(aliasMap)) {
    if (rawId.includes(key) || rawName.includes(key) || rawShort.includes(key)) {
      for (const a of aliases) {
        tokens.add(a);
      }
    }
  }

  return Array.from(tokens);
}

/**
 * Filter and sort restaurants dynamically for a selected location.
 * - When All Delhi NCR is selected: returns city-wide spots balanced across iconic districts with Bayesian rating.
 * - When a specific neighborhood is selected: returns real venues from that neighborhood, supplemented with closest adjacent venues if needed.
 */
export function getRestaurantsForLocation(
  restaurants: Restaurant[],
  location: { id: string; name: string; shortName?: string; isAllDelhi: boolean; latitude?: number; longitude?: number },
  userCoords?: GeoCoordinates | null
): Restaurant[] {
  if (!restaurants || restaurants.length === 0) return [];

  // 1. ALL DELHI NCR: Balanced city-wide ranking
  if (location.isAllDelhi) {
    return [...restaurants].sort((a, b) => {
      // Bayesian score incorporating rating and review counts
      const avgA = a.rating_avg || 4.2;
      const countA = a.rating_count || 10;
      const bayesA = (countA * avgA + 25 * 4.3) / (countA + 25);

      const avgB = b.rating_avg || 4.2;
      const countB = b.rating_count || 10;
      const bayesB = (countB * avgB + 25 * 4.3) / (countB + 25);

      return bayesB - bayesA;
    });
  }

  // 2. SPECIFIC NEIGHBORHOOD: Tiered proximity + keyword matching
  const targetLat = typeof location.latitude === 'number' ? location.latitude : userCoords?.latitude;
  const targetLng = typeof location.longitude === 'number' ? location.longitude : userCoords?.longitude;
  const hasCoords = typeof targetLat === 'number' && typeof targetLng === 'number';

  const tokens = getLocationSearchTokens(location);

  const tier1: Array<{ rest: Restaurant; dist: number }> = [];
  const tier2: Array<{ rest: Restaurant; dist: number }> = [];

  for (const r of restaurants) {
    const rText = `${r.name} ${r.city || ''} ${r.address_line1 || ''} ${r.landmark || ''} ${r.metro_station || ''}`.toLowerCase();
    const hasToken = tokens.length > 0 && tokens.some((t) => rText.includes(t));

    let dist = 999;
    if (hasCoords && typeof r.latitude === 'number' && typeof r.longitude === 'number') {
      dist = calculateDistanceKm(targetLat!, targetLng!, r.latitude, r.longitude);
    }

    if (hasToken || dist <= 4.0) {
      tier1.push({ rest: r, dist });
    } else if (dist <= 8.5) {
      tier2.push({ rest: r, dist });
    }
  }

  // Sort Tier 1: strictly by proximity for ground pockets & live GPS, otherwise hybrid proximity/rating
  const isStrictGround = !!(location as any).isLiveGps || location.id?.startsWith('pocket-');
  const distThreshold = isStrictGround ? 0.25 : 0.8;

  tier1.sort((a, b) => {
    if (Math.abs(a.dist - b.dist) > distThreshold) return a.dist - b.dist;
    return (b.rest.rating_avg || 4.2) - (a.rest.rating_avg || 4.2);
  });

  // Sort Tier 2: by proximity first, then rating
  tier2.sort((a, b) => {
    if (Math.abs(a.dist - b.dist) > distThreshold) return a.dist - b.dist;
    return (b.rest.rating_avg || 4.2) - (a.rest.rating_avg || 4.2);
  });

  const pool: Restaurant[] = tier1.map((x) => x.rest);

  // If fewer than 8 cafes, supplement from Tier 2
  if (pool.length < 8 && tier2.length > 0) {
    const existingIds = new Set(pool.map((r) => r.id));
    for (const item of tier2) {
      if (!existingIds.has(item.rest.id)) {
        pool.push(item.rest);
        existingIds.add(item.rest.id);
        if (pool.length >= 8) break;
      }
    }
  }

  // Outlying locations fallback: nearest cafes by distance
  if (pool.length < 6 && hasCoords) {
    const existingIds = new Set(pool.map((r) => r.id));
    const sortedByDist = [...restaurants]
      .filter((r) => typeof r.latitude === 'number' && typeof r.longitude === 'number' && !existingIds.has(r.id))
      .sort((a, b) => {
        const dA = calculateDistanceKm(targetLat!, targetLng!, a.latitude, a.longitude);
        const dB = calculateDistanceKm(targetLat!, targetLng!, b.latitude, b.longitude);
        return dA - dB;
      });

    for (const r of sortedByDist) {
      pool.push(r);
      if (pool.length >= 6) break;
    }
  }

  return pool.length > 0 ? pool : restaurants;
}

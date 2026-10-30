import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { DelhiLocation, DELHI_LOCATIONS } from '../lib/delhiLocationsData';
import { DelhiGroundPocket } from '../lib/delhiGroundData';
import { 
  calculateDistanceKm, 
  GeoCoordinates, 
  getUserLocation, 
  resolveGroundLocation, 
  getNearestMetroStation,
  NearestMetroInfo
} from '../lib/location';
import { useToast } from '../components/Toast';

export interface ActiveLocation {
  id: string; // 'all' or locality id or 'ground-gps'
  name: string; // e.g. "Sector 14, Rohini" or "All Delhi NCR"
  shortName: string; // e.g. "Rohini Sec 14" or "All Delhi"
  groundAddress?: string; // e.g. "Sector 14, Rohini, North-West Delhi"
  subLocality?: string; // e.g. "Sector 14"
  colony?: string; // e.g. "Rohini"
  zone?: string; // e.g. "North-West & NSP"
  nearestMetro?: NearestMetroInfo;
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  metroStation?: string;
  isAllDelhi: boolean;
  isLiveGps: boolean;
}

export const ALL_DELHI_LOCATION: ActiveLocation = {
  id: 'all',
  name: 'All Delhi NCR',
  shortName: 'All Delhi',
  isAllDelhi: true,
  isLiveGps: false,
};

interface LocationContextType {
  currentLocation: ActiveLocation;
  selectLocality: (loc: DelhiLocation) => void;
  selectGroundPocket: (pocket: DelhiGroundPocket) => void;
  selectAllDelhi: () => void;
  detectLiveGps: (silent?: boolean) => Promise<void>;
  isLocating: boolean;
  isLocationModalOpen: boolean;
  openLocationModal: () => void;
  closeLocationModal: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const STORAGE_KEY = 'menumaps_global_location_v2';

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [isLocating, setIsLocating] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Initialize from localStorage or default to All Delhi NCR
  const [currentLocation, setCurrentLocation] = useState<ActiveLocation>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.name) {
            return parsed;
          }
        }
      } catch {
        // ignore
      }
    }
    return ALL_DELHI_LOCATION;
  });

  // Save to localStorage whenever currentLocation changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentLocation));
      } catch {
        // ignore
      }
    }
  }, [currentLocation]);

  // Find the closest DelhiLocation for given coordinates
  const findClosestLocality = (coords: GeoCoordinates): { loc: DelhiLocation; distKm: number } => {
    let closest = DELHI_LOCATIONS[0];
    let minDist = Infinity;

    for (const loc of DELHI_LOCATIONS) {
      const d = calculateDistanceKm(coords.latitude, coords.longitude, loc.latitude, loc.longitude);
      if (d < minDist) {
        minDist = d;
        closest = loc;
      }
    }

    return { loc: closest, distKm: minDist };
  };

  // User manually selects a locality: user choice is king!
  const selectLocality = (loc: DelhiLocation) => {
    const nearestMetro = getNearestMetroStation(loc.latitude, loc.longitude);
    const next: ActiveLocation = {
      id: loc.id,
      name: loc.name,
      shortName: loc.shortName || loc.name,
      groundAddress: `${loc.name}, ${loc.zone}`,
      colony: loc.shortName || loc.name,
      zone: loc.zone,
      nearestMetro,
      metroStation: nearestMetro.name,
      latitude: loc.latitude,
      longitude: loc.longitude,
      metroStation: loc.metroStation,
      isAllDelhi: false,
      isLiveGps: false,
    };

    setCurrentLocation(next);
    setIsLocationModalOpen(false);
    showToast(`Location set to ${loc.shortName || loc.name}`, 'success');
  };

  // User manually selects a granular ground pocket (sector, colony, market)
  const selectGroundPocket = (pocket: DelhiGroundPocket) => {
    const nearestMetro = getNearestMetroStation(pocket.latitude, pocket.longitude);
    const next: ActiveLocation = {
      id: pocket.id,
      name: pocket.name,
      shortName: pocket.shortName,
      groundAddress: `${pocket.name}, ${pocket.zone}`,
      colony: pocket.colony,
      subLocality: pocket.subLocality,
      zone: pocket.zone,
      nearestMetro,
      metroStation: nearestMetro.name,
      latitude: pocket.latitude,
      longitude: pocket.longitude,
      isAllDelhi: false,
      isLiveGps: false,
    };

    setCurrentLocation(next);
    setIsLocationModalOpen(false);
    showToast(`Ground location set to ${pocket.name}`, 'success');
  };

  // User selects All Delhi NCR
  const selectAllDelhi = () => {
    setCurrentLocation(ALL_DELHI_LOCATION);
    setIsLocationModalOpen(false);
    showToast('Showing all verified cafes across Delhi NCR', 'info');
  };

  // Detect live GPS with real ground resolution
  const detectLiveGps = async (silent = false) => {
    setIsLocating(true);
    try {
      const coords = await getUserLocation();
      const resolved = await resolveGroundLocation(coords);

      // Distance from central Delhi (Connaught Place reference)
      const distFromDelhi = calculateDistanceKm(coords.latitude, coords.longitude, 28.6139, 77.2090);
      if (distFromDelhi > 60) {
        // User is outside Delhi NCR
        setCurrentLocation(ALL_DELHI_LOCATION);
        if (!silent) {
          showToast('GPS detected location outside Delhi NCR. Showing All Delhi.', 'info');
        }
      } else {
        const next: ActiveLocation = {
          id: resolved.id,
          name: resolved.name,
          shortName: resolved.shortName,
          groundAddress: resolved.groundAddress,
          colony: resolved.colony,
          subLocality: resolved.subLocality,
          zone: resolved.zone,
          nearestMetro: resolved.nearestMetro,
          metroStation: resolved.nearestMetro?.name,
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracyMeters: resolved.accuracyMeters,
          isAllDelhi: false,
          isLiveGps: true,
        };
        setCurrentLocation(next);
        if (!silent) {
          const accStr = resolved.accuracyMeters ? ` (±${resolved.accuracyMeters}m accuracy)` : '';
          showToast(`🎯 Ground Location: ${resolved.shortName}${accStr}`, 'success');
        }
      }
      setIsLocationModalOpen(false);
    } catch (err) {
      if (!silent) {
        showToast('Could not retrieve GPS location. Showing All Delhi.', 'info');
      }
      // Guarantee fallback is All Delhi NCR, never a hardcoded single locality
      setCurrentLocation((prev) => (prev.isLiveGps ? ALL_DELHI_LOCATION : prev));
    } finally {
      setIsLocating(false);
    }
  };

  // Automatically fetch user's live location when website opens
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      let isManualSpecificChoice = false;
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // If the user previously manually chose a specific locality (not GPS and not 'all')
          if (parsed && !parsed.isLiveGps && !parsed.isAllDelhi && parsed.id && parsed.id !== 'all') {
            isManualSpecificChoice = true;
          }
        }
      } catch {
        // ignore
      }

      // If no manual specific locality was selected, auto-fetch user's nearest area on site open
      if (!isManualSpecificChoice) {
        detectLiveGps(true).catch(() => {});
      }
    }
  }, []);

  const openLocationModal = () => setIsLocationModalOpen(true);
  const closeLocationModal = () => setIsLocationModalOpen(false);

  const value = useMemo(
    () => ({
      currentLocation,
      selectLocality,
      selectGroundPocket,
      selectAllDelhi,
      detectLiveGps,
      isLocating,
      isLocationModalOpen,
      openLocationModal,
      closeLocationModal,
    }),
    [currentLocation, isLocating, isLocationModalOpen]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useLocationContext = (): LocationContextType => {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return ctx;
};

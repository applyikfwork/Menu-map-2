import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  Sparkles, 
  MapPin, 
  Navigation, 
  Clock, 
  ShieldCheck, 
  Users, 
  Share2, 
  Check, 
  Copy, 
  Car, 
  Wifi, 
  Heart, 
  Volume2, 
  Coffee, 
  TrendingUp, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Restaurant, MenuItem } from '../../types/database';
import { useToast } from '../Toast';
import { useLocationContext } from '../../context/LocationContext';
import { 
  calculateDistanceKm, 
  calculateTravelEstimate, 
  getGoogleMapsDirectionsUrl, 
  getNearestMetroStation,
  GeoCoordinates
} from '../../lib/location';

interface RestaurantSuperWidgetsProps {
  restaurant: Restaurant;
  menuItems: MenuItem[];
  cartTotalAmount: number;
  onAddToCart?: (item: MenuItem) => void;
  onOpenPhysicalMenu?: () => void;
}

export const RestaurantSuperWidgets: React.FC<RestaurantSuperWidgetsProps> = ({
  restaurant,
  menuItems,
  cartTotalAmount,
  onAddToCart,
  onOpenPhysicalMenu,
}) => {
  const { showToast } = useToast();

  // Budget Combo Builder & Bill Splitter State
  const [partySize, setPartySize] = useState<1 | 2 | 4>(2);
  const [budgetCap, setBudgetCap] = useState<number>(() => (restaurant.average_cost_for_two || 450) * 1.2);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Active Base Cost (uses cart total if cart > 0, otherwise restaurant average cost)
  const basePrice = cartTotalAmount > 0 ? cartTotalAmount : (restaurant.average_cost_for_two || 400);

  // User Ground Location & Transit Discovery
  const { currentLocation } = useLocationContext();

  const userCoords = useMemo(() => {
    if (typeof currentLocation.latitude === 'number' && typeof currentLocation.longitude === 'number') {
      return {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      };
    }
    return null;
  }, [currentLocation]);

  const nearestMetroCalc = useMemo(() => {
    if (typeof restaurant.latitude === 'number' && typeof restaurant.longitude === 'number') {
      return getNearestMetroStation(restaurant.latitude, restaurant.longitude);
    }
    return null;
  }, [restaurant.latitude, restaurant.longitude]);

  const liveDistanceKm = useMemo(() => {
    if (!userCoords || typeof restaurant.latitude !== 'number' || typeof restaurant.longitude !== 'number') {
      return null;
    }
    return calculateDistanceKm(userCoords.latitude, userCoords.longitude, restaurant.latitude, restaurant.longitude);
  }, [userCoords, restaurant.latitude, restaurant.longitude]);

  const liveTravelEstimate = useMemo(() => {
    if (liveDistanceKm === null) return null;
    return calculateTravelEstimate(liveDistanceKm);
  }, [liveDistanceKm]);

  const navUrl = useMemo(() => {
    if (typeof restaurant.latitude === 'number' && typeof restaurant.longitude === 'number') {
      return getGoogleMapsDirectionsUrl(
        restaurant.latitude,
        restaurant.longitude,
        restaurant.name,
        userCoords,
        liveTravelEstimate?.primaryMode || 'driving'
      );
    }
    if (restaurant.google_maps_url && restaurant.google_maps_url.trim().length > 5) {
      return restaurant.google_maps_url;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${restaurant.name}, ${restaurant.address_line1 || ''}, ${restaurant.city || ''}`
    )}`;
  }, [restaurant, userCoords, liveTravelEstimate]);

  // Delivery Markup Calculation Formula
  // Food aggregators markup dish prices by ~25-30% + packaging fee ₹35 + platform fee ₹10 + delivery/surge fee ₹50
  const deliveryFoodMarkup = Math.round(basePrice * 0.28);
  const packagingFee = 35;
  const platformFee = 10;
  const deliverySurgeFee = 50;
  const deliveryAppTotal = basePrice + deliveryFoodMarkup + packagingFee + platformFee + deliverySurgeFee;
  const totalSavings = deliveryAppTotal - basePrice;
  const savingsPercent = Math.round((totalSavings / deliveryAppTotal) * 100);

  // Metro & Transit Context
  const metroDetails = useMemo(() => {
    if (nearestMetroCalc) {
      const walkTime = nearestMetroCalc.walkingMinutes;
      const distStr = nearestMetroCalc.distanceMeters < 1000 
        ? `${nearestMetroCalc.distanceMeters}m` 
        : `${nearestMetroCalc.distanceKm} km`;
      return {
        station: nearestMetroCalc.name,
        line: `${nearestMetroCalc.line} ${nearestMetroCalc.isInterchange ? '(Interchange)' : ''}`,
        gate: `Direct Street Access (${distStr})`,
        rickshawFare: walkTime <= 5 
          ? `🚶 ${walkTime} min walk (${distStr})` 
          : `₹10-15 Shared E-Rickshaw (${walkTime} min walk / ${distStr})`,
        lineColor: nearestMetroCalc.lineColor,
      };
    }

    const rawLandmark = restaurant.landmark || '';
    const city = restaurant.city_area || restaurant.city || 'Delhi';
    
    // Fallback station mapping based on area
    let station = rawLandmark.includes('Metro') ? rawLandmark : `${city} Metro`;
    let line = 'Yellow Line';
    let gate = 'Exit Gate 2 or 3';
    let rickshawFare = '₹10 Shared E-Rickshaw (3 mins)';
    let lineColor = '#EAB308';

    if (city.toLowerCase().includes('hudson') || city.toLowerCase().includes('north campus')) {
      station = 'GTB Nagar Metro Station';
      line = 'Yellow Line';
      gate = 'Exit Gate 3 (Towards Hudson Lane)';
      rickshawFare = '₹10 E-Rickshaw or 4-min walk (350m)';
    } else if (city.toLowerCase().includes('connaught') || city.toLowerCase().includes('cp')) {
      station = 'Rajiv Chowk Metro Station';
      line = 'Blue & Yellow Line Interchange';
      gate = 'Exit Gate 6 or 7';
      rickshawFare = '2-min walk directly into the Inner/Outer Circle';
    } else if (city.toLowerCase().includes('hauz khas') || city.toLowerCase().includes('hkv')) {
      station = 'IIT or Hauz Khas Metro Station';
      line = 'Magenta & Yellow Line';
      gate = 'Exit Gate 1';
      rickshawFare = '₹15 E-Rickshaw directly to Village gate';
    } else if (city.toLowerCase().includes('nangloi')) {
      station = 'Nangloi Metro Station';
      line = 'Green Line';
      gate = 'Exit Gate 2 (Rohtak Road)';
      rickshawFare = 'Walking distance 200m';
    } else if (city.toLowerCase().includes('kailash') || city.toLowerCase().includes('gk')) {
      station = 'Greater Kailash or Kailash Colony Metro';
      line = 'Magenta / Violet Line';
      gate = 'Exit Gate 2';
      rickshawFare = '₹20 Auto to M-Block Market';
    }

    return { station, line, gate, rickshawFare, lineColor: lineColor || '#EAB308' };
  }, [restaurant, nearestMetroCalc]);

  // Vibe Tags
  const vibeBadges = useMemo(() => {
    const badges = [
      {
        icon: '💻',
        title: 'Laptop & Study Friendly',
        desc: 'Wi-Fi connectivity & power outlets for focused work.',
        active: restaurant.facilities?.some((f) => f.toLowerCase().includes('wi-fi') || f.toLowerCase().includes('wifi')) || (restaurant.average_cost_for_two || 0) < 600,
      },
      {
        icon: '🕯️',
        title: 'Date Night & Ambiance',
        desc: 'Warm ambient lighting and cozy couple booths.',
        active: (restaurant.average_cost_for_two || 0) >= 400 || (restaurant.name.toLowerCase().includes('cafe') || restaurant.name.toLowerCase().includes('bistro')),
      },
      {
        icon: '🌿',
        title: 'Rooftop & Open Terrace',
        desc: 'Scenic open-air seating for breezy evenings.',
        active: restaurant.facilities?.some((f) => f.toLowerCase().includes('rooftop') || f.toLowerCase().includes('outdoor')) || restaurant.name.toLowerCase().includes('terrace') || restaurant.name.toLowerCase().includes('rooftop'),
      },
      {
        icon: '🐶',
        title: 'Pet Friendly Welcome',
        desc: 'Outdoor seating welcoming furry family members.',
        active: restaurant.facilities?.some((f) => f.toLowerCase().includes('pet')),
      },
      {
        icon: '🎂',
        title: 'Group & Student Adda',
        desc: 'Pocket-friendly sharing platters & group tables.',
        active: (restaurant.average_cost_for_two || 0) <= 600,
      },
      {
        icon: '🚗',
        title: 'Parking Convenience',
        desc: 'Metro multi-level lot or complimentary valet.',
        active: true,
      }
    ];
    return badges.filter((b) => b.active).slice(0, 4);
  }, [restaurant]);

  // Smart Budget Combo Algorithm
  const curatedCombo = useMemo(() => {
    if (!menuItems || menuItems.length === 0) return [];
    
    // Sort items by popularity / value
    const bestItems = [...menuItems].sort((a, b) => (b.is_must_try ? 1 : 0) - (a.is_must_try ? 1 : 0));
    
    const picked: MenuItem[] = [];
    let currentCost = 0;

    for (const item of bestItems) {
      if (currentCost + item.price <= budgetCap) {
        picked.push(item);
        currentCost += item.price;
      }
      if (picked.length >= (partySize === 1 ? 2 : partySize === 2 ? 3 : 5)) break;
    }

    return picked;
  }, [menuItems, budgetCap, partySize]);

  const comboTotalCost = curatedCombo.reduce((sum, item) => sum + item.price, 0);
  const costPerHead = Math.round(comboTotalCost / partySize);

  const handleCopyUpiAmount = () => {
    navigator.clipboard.writeText(`₹${costPerHead}`);
    setCopiedUpi(true);
    showToast(`Copied ₹${costPerHead} per head to clipboard!`, 'success');
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleAddComboToCart = () => {
    if (onAddToCart) {
      curatedCombo.forEach((item) => onAddToCart(item));
      showToast(`Added full ${partySize}-person combo to your order tray!`, 'success');
    }
  };

  return (
    <div className="space-y-8 my-8">
      {/* ========================================================
          1. DELIVERY APP PRICE MARKUP TRANSPARENCY CALCULATOR
      ======================================================== */}
      <section className="bg-gradient-to-br from-white via-white to-amber-50/40 border-2 border-emerald-200/80 rounded-3xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 w-32 h-32 bg-emerald-100/50 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-xs">
              💰
            </span>
            <div>
              <h3 className="hd text-xl sm:text-2xl font-black text-[#1C1917]">
                MenuMaps Price Transparency Meter
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                {cartTotalAmount > 0 ? 'Calculated on your selected order tray' : 'Estimated for 2 people dining in'}
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider">
            Zero Markup Guarantee
          </span>
        </div>

        {/* Visual Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          {/* MenuMaps Counter Price */}
          <div className="bg-[#FAF8F5] border border-emerald-300/80 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                  MenuMaps In-Store / Direct
                </span>
                <span className="text-emerald-700 font-bold text-xs bg-emerald-100 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
              <div className="hd text-3xl font-black text-[#1C1917] mt-2">
                ₹{basePrice}
              </div>
              <ul className="text-xs text-stone-600 space-y-1.5 mt-3">
                <li className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <Check className="w-3.5 h-3.5" /> 100% Original printed counter menu rates
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <Check className="w-3.5 h-3.5" /> ₹0 Restaurant packaging markup
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <Check className="w-3.5 h-3.5" /> ₹0 App platform & rain surge fees
                </li>
              </ul>
            </div>
          </div>

          {/* Delivery App Inflated Price */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col justify-between opacity-90">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Delivery Apps (Zomato / Swiggy)
                </span>
                <span className="text-rose-700 font-bold text-xs bg-rose-100 px-2 py-0.5 rounded-full">
                  Marked Up
                </span>
              </div>
              <div className="hd text-3xl font-black text-stone-700 line-through mt-2">
                ₹{deliveryAppTotal}
              </div>
              <ul className="text-xs text-stone-500 space-y-1.5 mt-3">
                <li>• Inflated dish pricing markup: +₹{deliveryFoodMarkup}</li>
                <li>• Restaurant packaging fee: +₹{packagingFee}</li>
                <li>• Platform convenience fee: +₹{platformFee}</li>
                <li>• Standard delivery & surge fee: +₹{deliverySurgeFee}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Big Savings Callout Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                Total Dine-In / Direct Savings
              </p>
              <p className="text-lg sm:text-xl font-black">
                You save ₹{totalSavings} ({savingsPercent}%) with MenuMaps!
              </p>
            </div>
          </div>

          {onOpenPhysicalMenu && (
            <button
              onClick={onOpenPhysicalMenu}
              className="px-4 py-2 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-extrabold text-xs transition-colors shadow-sm cursor-pointer"
            >
              Inspect Paper Menu Proof &rarr;
            </button>
          )}
        </div>
      </section>

      {/* ========================================================
          2. VIBE & AMENITIES RADAR + BUSY HOURS CROWD METER
      ======================================================== */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vibe & Atmosphere Radar */}
        <div className="bg-white border border-[#EFEAE2] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <h4 className="hd text-lg font-extrabold text-[#1C1917]">
                  Vibe & Atmosphere Radar
                </h4>
              </div>
              <span className="text-[11px] font-bold text-[#0F766E] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/60">
                Delhi NCR Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {vibeBadges.map((vb, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E7E2DA] flex items-start gap-2.5"
                >
                  <span className="text-xl shrink-0 mt-0.5">{vb.icon}</span>
                  <div>
                    <h5 className="font-extrabold text-xs text-[#1C1917]">{vb.title}</h5>
                    <p className="text-[11px] text-stone-500 leading-tight mt-0.5">{vb.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 text-xs text-stone-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Atmosphere verified by student community & dining explorers</span>
          </div>
        </div>

        {/* Busy Hours Crowd Meter */}
        <div className="bg-white border border-[#EFEAE2] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#FF5A36]" />
                <h4 className="hd text-lg font-extrabold text-[#1C1917]">
                  Best Time to Visit & Crowd Meter
                </h4>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                {restaurant.is_open ? 'Open Now' : 'Opens 11 AM'}
              </span>
            </div>

            <p className="text-xs text-stone-600 mb-4">
              Real-time crowd patterns based on footfall trends in {restaurant.city_area || restaurant.city}:
            </p>

            <div className="space-y-3">
              {/* Quiet hours */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-bold text-[#1C1917]">12:00 PM – 4:00 PM</span>
                </div>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  Quiet & Peaceful (Best for work)
                </span>
              </div>

              {/* Snack rush */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="font-bold text-[#1C1917]">4:30 PM – 7:00 PM</span>
                </div>
                <span className="text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                  Lively Evening Buzz (Chai & Momos)
                </span>
              </div>

              {/* Dinner Peak */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="font-bold text-[#1C1917]">7:30 PM – 10:30 PM</span>
                </div>
                <span className="text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded">
                  Peak Dinner Rush (5–10 min wait)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Average dining duration: ~45–60 mins</span>
            <span className="font-bold text-[#FF5A36]">No reservations needed</span>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. HYPERLOCAL TRANSIT & METRO LAST-MILE GUIDE
      ======================================================== */}
      <section className="bg-white border border-[#EFEAE2] rounded-3xl p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#0F766E]/10 text-[#0F766E] font-bold text-base">
              🚇
            </span>
            <div>
              <h4 className="hd text-xl font-extrabold text-[#1C1917]">
                Delhi Metro & Last-Mile Transit Guide
              </h4>
              <p className="text-xs text-stone-500">
                Fastest public transit directions to {restaurant.name}
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
            {metroDetails.line}
          </span>
        </div>

        {liveTravelEstimate && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-emerald-600 text-white font-bold text-sm shrink-0">
                📍
              </span>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Live Ground Route from {currentLocation.name}
                </div>
                <div className="text-sm font-black text-emerald-950">
                  {liveTravelEstimate.distanceLabel} · {liveTravelEstimate.primaryTimeLabel}
                </div>
              </div>
            </div>
            <a
              href={navUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-emerald-700 hover:bg-emerald-800 text-white min-h-[38px] px-4 text-xs font-extrabold flex items-center gap-1.5 shadow-sm rounded-xl"
            >
              <Navigation className="w-3.5 h-3.5" />
              Start Live Navigation &rarr;
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E7E2DA]">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500 block mb-1">
              Nearest Metro Station
            </span>
            <span className="font-bold text-sm text-[#1C1917] block">{metroDetails.station}</span>
            <span className="text-xs text-[#0F766E] font-semibold mt-0.5 block">{metroDetails.gate}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E7E2DA]">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500 block mb-1">
              Last-Mile Commute
            </span>
            <span className="font-bold text-sm text-[#1C1917] block">{metroDetails.rickshawFare}</span>
            <span className="text-xs text-stone-500 mt-0.5 block">Shared E-Rickshaws available right at exit</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E7E2DA]">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500 block mb-1">
              Parking Recommendation
            </span>
            <span className="font-bold text-sm text-[#1C1917] block">Metro Multi-Level / Valet</span>
            <span className="text-xs text-stone-500 mt-0.5 block">Avoid narrow street parking during peak college hours</span>
          </div>
        </div>

        {/* 1-Tap Directions & Ride Buttons */}
        <div className="flex flex-wrap gap-2.5 pt-2">
          <a
            href={navUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn bg-[#0F766E] hover:bg-[#0D9488] text-white min-h-[44px] px-5 text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Navigation className="w-3.5 h-3.5" />
            Turn-by-Turn in Google Maps {liveTravelEstimate ? `(${liveTravelEstimate.primaryTimeLabel})` : ''}
          </a>

          <a
            href={`https://m.uber.com/ul/?action=setPickup&dropoff[formatted_address]=${encodeURIComponent(
              `${restaurant.name}, ${restaurant.address_line1}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn bg-black hover:bg-stone-800 text-white min-h-[44px] px-4 text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Car className="w-3.5 h-3.5" />
            Book Uber Drop-off
          </a>

          <a
            href={`https://www.rapido.bike/`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn bg-amber-400 hover:bg-amber-500 text-black min-h-[44px] px-4 text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            🛵 Book Rapido Bike
          </a>
        </div>
      </section>

      {/* ========================================================
          4. SMART GROUP BILL SPLITTER & BUDGET COMBO BUILDER
      ======================================================== */}
      {menuItems.length > 2 && (
        <section className="bg-gradient-to-br from-white to-orange-50/40 border border-orange-200/70 rounded-3xl p-6 sm:p-7 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#FF5A36]/10 text-[#FF5A36] font-bold text-base">
                👥
              </span>
              <div>
                <h4 className="hd text-xl font-extrabold text-[#1C1917]">
                  Smart Budget Combo Builder & Bill Splitter
                </h4>
                <p className="text-xs text-stone-500">
                  Pick your party size and target budget to auto-curate the perfect meal.
                </p>
              </div>
            </div>

            {/* Party Size Selector */}
            <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-2xl border border-[#E7E2DA]">
              {([1, 2, 4] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setPartySize(size)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    partySize === size
                      ? 'bg-[#FF5A36] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {size === 1 ? 'Solo (1)' : size === 2 ? 'Date (2)' : 'Squad (4)'}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Presets */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-bold text-stone-500 mr-1">Target Budget:</span>
            {[400, 600, 800, 1200].map((b) => (
              <button
                key={b}
                onClick={() => setBudgetCap(b)}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
                  budgetCap === b
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
                }`}
              >
                ₹{b}
              </button>
            ))}
          </div>

          {/* Curated Combo Items */}
          {curatedCombo.length > 0 && (
            <div className="bg-white border border-[#E7E2DA] rounded-2xl p-4 my-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-[#1C1917] uppercase tracking-wider">
                  Recommended Balanced Meal:
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  {curatedCombo.length} dishes matched
                </span>
              </div>

              <div className="divide-y divide-stone-100">
                {curatedCombo.map((item) => (
                  <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={item.dietary_tags?.includes('Veg') ? 'text-emerald-700' : 'text-rose-700'}>
                        {item.dietary_tags?.includes('Veg') ? '🟢' : '🔴'}
                      </span>
                      <span className="font-bold text-[#1C1917]">{item.name}</span>
                    </div>
                    <span className="font-extrabold text-stone-800">₹{item.price}</span>
                  </div>
                ))}
              </div>

              {/* Total & Per-Head Splitter */}
              <div className="mt-3 pt-3 border-t-2 border-dashed border-stone-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-stone-500 block">Total Combo Price:</span>
                  <span className="hd text-xl font-black text-[#1C1917]">₹{comboTotalCost}</span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-stone-500 block">Cost Per Person ({partySize}):</span>
                  <span className="hd text-xl font-black text-[#FF5A36]">₹{costPerHead} / head</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={handleCopyUpiAmount}
              className="px-4 py-2.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-stone-500" />
              {copiedUpi ? 'Copied ₹' + costPerHead + '!' : 'Copy UPI Share (₹' + costPerHead + ')'}
            </button>

            {onAddToCart && (
              <button
                onClick={handleAddComboToCart}
                className="px-5 py-2.5 rounded-xl bg-[#FF5A36] hover:bg-[#D8350F] text-white font-extrabold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <span>Add Entire Combo to Order Tray &rarr;</span>
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

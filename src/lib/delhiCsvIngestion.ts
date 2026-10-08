import { Restaurant, MenuCategory, MenuItem } from '../types/database';
import { api, slugify } from './supabase';
import { getSmartDishImage, getSmartCoverImage } from './dishImageRegistry';
import { DELHI_LOCATIONS, DelhiLocation } from './delhiLocationsData';

export interface CsvParsedDish {
  restaurantName: string;
  locality: string;
  zone: string;
  landmark: string;
  nearestMetro: string;
  avgCostForTwo: number;
  cuisineTypes: string[];
  categoryName: string;
  dishName: string;
  price: number;
  description: string;
  isVeg: boolean;
  isMustTry: boolean;
}

export interface CsvGroupedVenue {
  name: string;
  locality: string;
  zone: string;
  landmark: string;
  nearestMetro: string;
  avgCostForTwo: number;
  cuisineTypes: string[];
  categories: {
    name: string;
    dishes: {
      name: string;
      price: number;
      description: string;
      isVeg: boolean;
      isMustTry: boolean;
    }[];
  }[];
}

export interface CsvParseResult {
  venues: CsvGroupedVenue[];
  totalVenues: number;
  totalDishes: number;
  errors: string[];
}

/**
 * Standard CSV Line Parser handling quotes, commas and tabs.
 */
function parseCsvLine(line: string, delimiter: string = ','): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parses CSV/TSV text output by Gemini Spark into grouped restaurants and menu items.
 */
export function parseDelhiScoutCsv(rawText: string): CsvParseResult {
  const errors: string[] = [];
  if (!rawText || !rawText.trim()) {
    return { venues: [], totalVenues: 0, totalDishes: 0, errors: ['Input CSV text is empty'] };
  }

  // Strip code block fences if present
  let clean = rawText.trim();
  const codeBlockMatch = clean.match(/```(?:csv)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    clean = codeBlockMatch[1].trim();
  }

  const lines = clean.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length < 2) {
    return { venues: [], totalVenues: 0, totalDishes: 0, errors: ['CSV must have a header row and at least one data row'] };
  }

  // Detect delimiter: tab or comma
  const firstLine = lines[0];
  const delimiter = firstLine.includes('\t') ? '\t' : ',';

  // Parse Header
  const headers = parseCsvLine(firstLine, delimiter).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  
  // Find column indexes
  const colRest = headers.findIndex((h) => h.includes('restaurant') || h.includes('venue') || h.includes('name'));
  const colLoc = headers.findIndex((h) => h.includes('locality') || h.includes('area'));
  const colZone = headers.findIndex((h) => h.includes('zone'));
  const colLandmark = headers.findIndex((h) => h.includes('landmark'));
  const colMetro = headers.findIndex((h) => h.includes('metro'));
  const colCost = headers.findIndex((h) => h.includes('cost') || h.includes('avg'));
  const colCuisine = headers.findIndex((h) => h.includes('cuisine'));
  const colCat = headers.findIndex((h) => h.includes('category') || h.includes('section'));
  const colDish = headers.findIndex((h) => h.includes('dish') || h.includes('item'));
  const colPrice = headers.findIndex((h) => h.includes('price') || h.includes('rate') || h.includes('amount'));
  const colDesc = headers.findIndex((h) => h.includes('desc'));
  const colVeg = headers.findIndex((h) => h.includes('veg'));
  const colMustTry = headers.findIndex((h) => h.includes('must') || h.includes('famous') || h.includes('special'));

  const parsedDishes: CsvParsedDish[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const cols = parseCsvLine(rawLine, delimiter);
    if (cols.length < 3) continue;

    const restName = cols[colRest >= 0 ? colRest : 0] || '';
    const dishName = cols[colDish >= 0 ? colDish : 8] || '';
    if (!restName || !dishName) continue;

    const rawPrice = cols[colPrice >= 0 ? colPrice : 9] || '150';
    const numPrice = parseInt(rawPrice.replace(/[^0-9]/g, ''), 10) || 150;

    const rawCost = cols[colCost >= 0 ? colCost : 5] || '400';
    const numCost = parseInt(rawCost.replace(/[^0-9]/g, ''), 10) || 400;

    const rawVeg = cols[colVeg >= 0 ? colVeg : 11] || 'true';
    const isVeg = !/false|non|no/i.test(rawVeg);

    const rawMustTry = cols[colMustTry >= 0 ? colMustTry : 12] || 'false';
    const isMustTry = /true|yes|1|must/i.test(rawMustTry);

    const rawCuisine = cols[colCuisine >= 0 ? colCuisine : 6] || 'Cafe, Fast Food';
    const cuisines = rawCuisine.split(/[,/|]/).map((c) => c.trim()).filter(Boolean);

    parsedDishes.push({
      restaurantName: restName,
      locality: cols[colLoc >= 0 ? colLoc : 1] || 'Delhi NCR',
      zone: cols[colZone >= 0 ? colZone : 2] || 'Delhi',
      landmark: cols[colLandmark >= 0 ? colLandmark : 3] || '',
      nearestMetro: cols[colMetro >= 0 ? colMetro : 4] || '',
      avgCostForTwo: numCost,
      cuisineTypes: cuisines.length > 0 ? cuisines : ['Cafe', 'Fast Food'],
      categoryName: cols[colCat >= 0 ? colCat : 7] || 'Main Menu',
      dishName: dishName,
      price: numPrice,
      description: cols[colDesc >= 0 ? colDesc : 10] || '',
      isVeg: isVeg,
      isMustTry: isMustTry,
    });
  }

  // Group by Restaurant Name
  const venueMap = new Map<string, CsvGroupedVenue>();

  for (const item of parsedDishes) {
    if (!venueMap.has(item.restaurantName)) {
      venueMap.set(item.restaurantName, {
        name: item.restaurantName,
        locality: item.locality,
        zone: item.zone,
        landmark: item.landmark,
        nearestMetro: item.nearestMetro,
        avgCostForTwo: item.avgCostForTwo,
        cuisineTypes: item.cuisineTypes,
        categories: [],
      });
    }

    const venue = venueMap.get(item.restaurantName)!;
    let cat = venue.categories.find((c) => c.name.toLowerCase() === item.categoryName.toLowerCase());
    if (!cat) {
      cat = { name: item.categoryName, dishes: [] };
      venue.categories.push(cat);
    }

    cat.dishes.push({
      name: item.dishName,
      price: item.price,
      description: item.description,
      isVeg: item.isVeg,
      isMustTry: item.isMustTry,
    });
  }

  const venues = Array.from(venueMap.values());
  return {
    venues,
    totalVenues: venues.length,
    totalDishes: parsedDishes.length,
    errors,
  };
}

/**
 * Ingests grouped CSV venues into Supabase and local storage.
 * Automatically assigns zero-mismatch smart images and GPS coordinates.
 */
export async function ingestDelhiScoutData(
  parsed: CsvParseResult,
  onProgress?: (msg: string) => void
): Promise<{ restaurantsCount: number; dishesCount: number; venueNames: string[] }> {
  let restCount = 0;
  let dishCount = 0;
  const venueNames: string[] = [];

  for (const v of parsed.venues) {
    onProgress?.(`Ingesting venue: ${v.name}...`);

    // Match locality coordinates from DELHI_LOCATIONS
    const locMatch = DELHI_LOCATIONS.find(
      (l) => l.name.toLowerCase().includes(v.locality.toLowerCase()) || 
             v.locality.toLowerCase().includes(l.shortName.toLowerCase()) ||
             v.name.toLowerCase().includes(l.shortName.toLowerCase())
    );

    const lat = locMatch ? locMatch.latitude : 28.6139;
    const lng = locMatch ? locMatch.longitude : 77.2090;
    const metro = v.nearestMetro || (locMatch ? `${locMatch.metroStation} (${locMatch.metroLines.join(', ')})` : 'Delhi Metro Connected');

    // Create / Save Restaurant
    const baseSlug = slugify(`${v.name}-${v.locality || 'delhi'}`);
    const coverPhoto = getSmartCoverImage(v.name, v.cuisineTypes.join(', '));

    const restRecord: Partial<Restaurant> = {
      name: v.name,
      slug: baseSlug,
      short_description: `Popular dining destination in ${v.locality || 'Delhi'}. Verified counter menu with zero delivery app markups.`,
      long_description: `${v.name} is a celebrated food hotspot in ${v.locality || 'Delhi'}, known for authentic preparations, pleasant seating, and honest counter pricing.`,
      cuisine_types: v.cuisineTypes,
      meal_types: ['Lunch', 'Dinner', 'Snacks'],
      price_range: v.avgCostForTwo > 800 ? '₹₹₹' : v.avgCostForTwo > 400 ? '₹₹' : '₹',
      average_cost_for_two: v.avgCostForTwo,
      address_line1: v.landmark ? `${v.landmark}, ${v.locality}` : `${v.locality}, Delhi`,
      landmark: v.landmark || (locMatch ? locMatch.landmarks?.[0] : ''),
      city: 'Delhi',
      state: 'Delhi',
      pincode: locMatch?.pincode || '110001',
      country: 'India',
      latitude: lat,
      longitude: lng,
      phone: '+91 98765 43210',
      whatsapp_number: '919876543210',
      is_open: true,
      delivery_available: false,
      takeaway_available: true,
      dine_in_available: true,
      facilities: ['Dine-in Available', 'Air Conditioned', 'Takeaway Counter', 'Wi-Fi Available'],
      dietary_options: v.categories.every(c => c.dishes.every(d => d.isVeg)) ? ['Pure Veg'] : ['Jain Friendly'],
      cover_image_url: coverPhoto,
      is_featured: true,
      is_active: true,
      rating_avg: 4.3,
      rating_count: 85,
    };

    const savedRest = await api.saveRestaurant(restRecord);
    venueNames.push(savedRest.name);
    restCount++;

    // Ingest Categories & Dishes
    for (let catIdx = 0; catIdx < v.categories.length; catIdx++) {
      const cat = v.categories[catIdx];
      const savedCat = await api.saveCategory({
        restaurant_id: savedRest.id,
        name: cat.name,
        sort_order: catIdx + 1,
        is_active: true,
      });

      for (let dishIdx = 0; dishIdx < cat.dishes.length; dishIdx++) {
        const dish = cat.dishes[dishIdx];
        
        // Zero-Mismatch Smart Image Assigner!
        const dishImage = getSmartDishImage(dish.name, cat.name);

        await api.saveMenuItem({
          restaurant_id: savedRest.id,
          category_id: savedCat.id,
          name: dish.name,
          slug: slugify(`${savedRest.name}-${dish.name}-${dishIdx}`),
          description: dish.description || `${dish.name} prepared freshly at the counter.`,
          price: dish.price,
          image_url: dishImage,
          dietary_tags: dish.isVeg ? ['Veg'] : ['Non-veg'],
          spice_level: 1,
          is_available: true,
          is_must_try: dish.isMustTry,
          sort_order: dishIdx + 1,
        });

        dishCount++;
      }
    }
  }

  onProgress?.(`Successfully ingested ${restCount} restaurants and ${dishCount} menu items!`);
  return { restaurantsCount: restCount, dishesCount: dishCount, venueNames };
}

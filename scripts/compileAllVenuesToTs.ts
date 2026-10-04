import fs from 'fs';
import path from 'path';
import { getSmartDishImage, getSmartCoverImage } from '../src/lib/dishImageRegistry';
import { cleanCity, slugify } from './batchDataParser';

interface MenuItem {
  id: string;
  category_id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number;
  dietary: 'Veg' | 'Non-Veg' | 'Vegan' | 'Jain' | 'Gluten-Free';
  spice_level: number;
  portion_size: string;
  image_url: string;
  is_available: boolean;
  is_featured: boolean;
  is_must_try: boolean;
}

interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  display_order: number;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  long_description: string;
  cuisine_types: string[];
  meal_types: string[];
  price_range: '₹' | '₹₹' | '₹₹₹' | '₹₹₹₹';
  average_cost_for_two: number;
  address_line1: string;
  address_line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude: number;
  longitude: number;
  phone: string;
  whatsapp_number?: string;
  website_url?: string;
  cover_image_url: string;
  is_open: boolean;
  opening_hours: Record<string, { open: string; close: string; is_closed: boolean }>;
  dietary_tags: string[];
  ambiance_tags: string[];
  facilities: string[];
  seating_capacity?: number;
  google_rating?: number;
  total_reviews?: number;
  verified_status: 'verified';
  map_profile_done: boolean;
}

export function processBatchVenues(
  rawVenues: any[],
  basePrefix: string,
  startCounter: number
): {
  restaurants: Restaurant[];
  categories: MenuCategory[];
  menuItems: MenuItem[];
} {
  const restaurants: Restaurant[] = [];
  const categories: MenuCategory[] = [];
  const menuItems: MenuItem[] = [];

  let rCounter = startCounter;

  for (const rv of rawVenues) {
    rCounter++;
    const restId = `${basePrefix}-${String(rCounter).padStart(4, '0')}-4000-8000-000000000001`;
    const name = rv.name || rv.official_name || 'Restaurant';
    const slug = slugify(name);
    const shortDesc = rv.short_description || rv.category_ambience || `${name} in Delhi NCR`;
    const longDesc = rv.long_description || shortDesc;

    // Normalizing cuisines
    let cuisines: string[] = ['North Indian'];
    if (Array.isArray(rv.cuisine_types) && rv.cuisine_types.length > 0) {
      cuisines = rv.cuisine_types;
    } else if (rv.category_ambience) {
      cuisines = rv.category_ambience.split(',').map((s: string) => s.trim());
    }
    if (rv.is_pure_veg && !cuisines.includes('Pure Vegetarian')) {
      cuisines.unshift('Pure Vegetarian');
    }

    // Normalizing facilities
    let facs: string[] = ['Air Conditioned', 'UPI Payments', 'Table Service', 'Washroom'];
    if (Array.isArray(rv.facilities)) {
      facs = rv.facilities;
    } else if (Array.isArray(rv.dining_facilities)) {
      facs = rv.dining_facilities;
    } else if (typeof rv.dining_facilities === 'string') {
      facs = rv.dining_facilities.split(',').map((s: string) => s.trim());
    } else if (typeof rv.facilities === 'string') {
      facs = rv.facilities.split(',').map((s: string) => s.trim());
    }

    // Normalizing dietary tags
    const dietaryTags: string[] = [];
    if (rv.is_pure_veg) {
      dietaryTags.push('Pure Veg');
    } else {
      dietaryTags.push('Veg Options');
      if (rv.dietary_options?.includes('Non-Vegetarian') || rv.dietary_options?.includes('Non-Veg')) {
        dietaryTags.push('Non-Veg Available');
      }
    }

    // Normalizing price range & avg cost
    let avgCost = 400;
    if (typeof rv.average_cost_for_two === 'number') {
      avgCost = rv.average_cost_for_two;
    } else if (typeof rv.average_cost_for_two === 'string') {
      const match = rv.average_cost_for_two.match(/\d+/);
      if (match) avgCost = parseInt(match[0], 10);
    }

    let priceRange: '₹' | '₹₹' | '₹₹₹' | '₹₹₹₹' = '₹₹';
    if (avgCost <= 300) priceRange = '₹';
    else if (avgCost <= 700) priceRange = '₹₹';
    else if (avgCost <= 1200) priceRange = '₹₹₹';
    else priceRange = '₹₹₹₹';

    // Phone & WhatsApp
    const phone = rv.phone || rv.phone_number || '+91 98110 00000';
    const cleanDigits = phone.replace(/[^\d]/g, '');
    const wa = cleanDigits.length >= 10 ? (cleanDigits.startsWith('91') ? `+${cleanDigits}` : `+91${cleanDigits.slice(-10)}`) : undefined;

    // Smart cover image
    const coverImage = rv.cover_image_url || getSmartCoverImage(name, cuisines[0] || 'North Indian');

    const rest: Restaurant = {
      id: restId,
      name,
      slug,
      short_description: shortDesc,
      long_description: longDesc,
      cuisine_types: cuisines,
      meal_types: rv.meal_types || ['Lunch', 'Dinner'],
      price_range: priceRange,
      average_cost_for_two: avgCost,
      address_line1: rv.address_line1 || rv.full_offline_address || 'Main Market',
      address_line2: rv.address_line2 || '',
      landmark: rv.landmark || rv.nearby_landmark || 'Near Metro Station',
      city: cleanCity(rv.city),
      state: rv.state || 'Delhi',
      pincode: rv.pincode || '110001',
      country: 'India',
      latitude: rv.latitude || 28.6139,
      longitude: rv.longitude || 77.2090,
      phone,
      whatsapp_number: wa,
      website_url: rv.website_url || '',
      cover_image_url: coverImage,
      is_open: true,
      opening_hours: {
        Monday: { open: rv.opening_time || '11:00 AM', close: rv.closing_time || '11:00 PM', is_closed: false },
        Tuesday: { open: rv.opening_time || '11:00 AM', close: rv.closing_time || '11:00 PM', is_closed: false },
        Wednesday: { open: rv.opening_time || '11:00 AM', close: rv.closing_time || '11:00 PM', is_closed: false },
        Thursday: { open: rv.opening_time || '11:00 AM', close: rv.closing_time || '11:00 PM', is_closed: false },
        Friday: { open: rv.opening_time || '11:00 AM', close: rv.closing_time || '11:30 PM', is_closed: false },
        Saturday: { open: rv.opening_time || '11:00 AM', close: rv.closing_time || '11:30 PM', is_closed: false },
        Sunday: { open: rv.opening_time || '11:00 AM', close: rv.closing_time || '11:30 PM', is_closed: false }
      },
      dietary_tags: dietaryTags,
      ambiance_tags: rv.ambiance_tags || ['Casual Dining', 'Cozy', 'Student Favorite'],
      facilities: facs,
      seating_capacity: rv.seating_capacity || 45,
      google_rating: 4.4 + (Math.floor(Math.random() * 5) / 10),
      total_reviews: 180 + Math.floor(Math.random() * 400),
      verified_status: 'verified',
      map_profile_done: true
    };

    restaurants.push(rest);

    // Parsing categories and menu items
    let catIndex = 0;
    if (Array.isArray(rv.menu_categories) && rv.menu_categories.length > 0) {
      for (const cat of rv.menu_categories) {
        catIndex++;
        const catId = `${basePrefix}-${String(rCounter).padStart(4, '0')}-cat-${String(catIndex).padStart(2, '0')}`;
        categories.push({
          id: catId,
          restaurant_id: restId,
          name: cat.name,
          display_order: catIndex
        });

        let itemIndex = 0;
        if (Array.isArray(cat.items)) {
          for (const item of cat.items) {
            itemIndex++;
            const itemId = `${basePrefix}-${String(rCounter).padStart(4, '0')}-item-${String(catIndex).padStart(2, '0')}${String(itemIndex).padStart(2, '0')}`;
            const dishName = item.name || item.dish_name || 'Signature Dish';
            const dishDesc = item.description || `${dishName} freshly prepared with special chef spices.`;
            const dishPrice = typeof item.price === 'number' ? item.price : 150;
            const isVeg = item.dietary === 'Veg' || item.type === 'Veg' || rv.is_pure_veg || false;
            const smartImg = getSmartDishImage(dishName, isVeg ? 'Veg' : 'Non-Veg', cat.name);

            menuItems.push({
              id: itemId,
              category_id: catId,
              restaurant_id: restId,
              name: dishName,
              description: dishDesc,
              price: dishPrice,
              dietary: isVeg ? 'Veg' : 'Non-Veg',
              spice_level: item.spice_level !== undefined ? item.spice_level : 1,
              portion_size: item.portion_size || 'Serves 1-2',
              image_url: smartImg,
              is_available: true,
              is_featured: Boolean(item.is_featured || itemIndex === 1),
              is_must_try: Boolean(item.is_must_try || itemIndex === 1)
            });
          }
        }
      }
    } else if (rv.menu_breakdown && typeof rv.menu_breakdown === 'object') {
      for (const [catName, catItems] of Object.entries(rv.menu_breakdown)) {
        catIndex++;
        const catId = `${basePrefix}-${String(rCounter).padStart(4, '0')}-cat-${String(catIndex).padStart(2, '0')}`;
        categories.push({
          id: catId,
          restaurant_id: restId,
          name: catName.replace(/^Category \d+:\s*/, ''),
          display_order: catIndex
        });

        let itemIndex = 0;
        if (Array.isArray(catItems)) {
          for (const item of catItems) {
            itemIndex++;
            const itemId = `${basePrefix}-${String(rCounter).padStart(4, '0')}-item-${String(catIndex).padStart(2, '0')}${String(itemIndex).padStart(2, '0')}`;
            const dishName = item.dish_name || item.name || 'Signature Dish';
            const dishDesc = item.description || `${dishName} freshly prepared with chef spices.`;
            const dishPrice = typeof item.price === 'number' ? item.price : 150;
            const isVeg = item.type === 'Veg' || item.dietary === 'Veg' || rv.is_pure_veg || false;
            const smartImg = getSmartDishImage(dishName, isVeg ? 'Veg' : 'Non-Veg', catName);

            menuItems.push({
              id: itemId,
              category_id: catId,
              restaurant_id: restId,
              name: dishName,
              description: dishDesc,
              price: dishPrice,
              dietary: isVeg ? 'Veg' : 'Non-Veg',
              spice_level: 1,
              portion_size: 'Regular Portion',
              image_url: smartImg,
              is_available: true,
              is_featured: itemIndex === 1,
              is_must_try: itemIndex === 1
            });
          }
        }
      }
    }
  }

  return { restaurants, categories, menuItems };
}

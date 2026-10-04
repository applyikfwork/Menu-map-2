const fs = require('fs');
const path = require('path');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'northCampusCafes.json'), 'utf8'));

const restaurants = [];
const categories = [];
const menuItems = [];

let restIdCounter = 100;
let catIdCounter = 500;
let itemIdCounter = 1000;

const validMealTypes = new Set(['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Late Night']);

function mapMealTypes(meals) {
  const mapped = [];
  for (const m of meals || []) {
    if (validMealTypes.has(m)) {
      mapped.push(m);
    } else if (m === 'Brunch') {
      mapped.push('Breakfast', 'Lunch');
    } else if (m === 'Evening Snacks' || m === 'Quick Bite' || m === 'Afternoon Tea' || m === 'Dessert') {
      mapped.push('Snacks');
    }
  }
  const unique = Array.from(new Set(mapped));
  return unique.length > 0 ? unique : ['Lunch', 'Snacks', 'Dinner'];
}

function mapDietaryOptions(options) {
  const isPureVeg = (options || []).some(o => /pure veg/i.test(o));
  if (isPureVeg) {
    return ['Pure Veg', 'Vegan Options'];
  }
  return ['Vegan Options'];
}

for (const r of raw.restaurants) {
  restIdCounter++;
  const restId = `55555555-0000-4000-8000-${String(restIdCounter).padStart(12, '0')}`;
  const restSlug = slugify(r.name) + '-north-campus';

  const defaultHours = {
    Monday: { open: '11:00 AM', close: '11:00 PM', is_closed: false },
    Tuesday: { open: '11:00 AM', close: '11:00 PM', is_closed: false },
    Wednesday: { open: '11:00 AM', close: '11:00 PM', is_closed: false },
    Thursday: { open: '11:00 AM', close: '11:00 PM', is_closed: false },
    Friday: { open: '11:00 AM', close: '11:30 PM', is_closed: false },
    Saturday: { open: '11:00 AM', close: '11:30 PM', is_closed: false },
    Sunday: { open: '11:00 AM', close: '11:00 PM', is_closed: false },
  };

  const restaurantRecord = {
    id: restId,
    name: r.name,
    slug: restSlug,
    short_description: r.short_description || '',
    long_description: r.long_description || r.short_description || '',
    cuisine_types: r.cuisine_types || ['Cafe', 'Fast Food'],
    meal_types: mapMealTypes(r.meal_types),
    price_range: r.price_range || '₹₹',
    average_cost_for_two: r.average_cost_for_two || 500,
    address_line1: r.address_line1,
    address_line2: 'North Campus Belt',
    landmark: 'Near Delhi University North Campus',
    city: r.city || 'North Campus, New Delhi',
    state: r.state || 'Delhi',
    pincode: r.pincode || '110009',
    country: 'India',
    latitude: r.latitude || 28.6974,
    longitude: r.longitude || 77.2043,
    phone: r.phone || '+91 98111 22334',
    whatsapp_number: (r.phone || '+91 98111 22334').replace(/[^\d+]/g, ''),
    cover_image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1000&auto=format&fit=crop&q=80',
    is_open: true,
    opening_hours: defaultHours,
    delivery_available: true,
    takeaway_available: true,
    dine_in_available: true,
    facilities: r.facilities || ['Air Conditioned', 'Free WiFi', 'Takeout'],
    dietary_options: mapDietaryOptions(r.dietary_options),
    rating_avg: r.rating_avg || 4.2,
    rating_count: r.rating_count || 1200,
    is_featured: (r.rating_avg || 0) >= 4.3,
    is_active: true,
    is_temporarily_closed: false,
    known_for_dishes: r.known_for_dishes || [],
    best_for_tags: ['Studying', 'Groups', 'Budget', 'Coffee'],
    ambience_tags: ['Lively & Social', 'Modern & Trendy'],
    nearby_landmarks: ['Delhi University North Campus', 'Hudson Lane', 'GTB Nagar Metro'],
    heritage_area: false,
    specialty_dishes: r.known_for_dishes || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  restaurants.push(restaurantRecord);

  let catOrder = 0;
  for (const cat of r.menu_categories || []) {
    catIdCounter++;
    catOrder++;
    const catId = `77777777-0000-4000-8000-${String(catIdCounter).padStart(12, '0')}`;
    categories.push({
      id: catId,
      restaurant_id: restId,
      name: cat.category_name,
      sort_order: catOrder,
      is_active: true,
      created_at: new Date().toISOString(),
    });

    let itemOrder = 0;
    for (const it of cat.items || []) {
      itemIdCounter++;
      itemOrder++;
      const itemId = `88888888-0000-4000-8000-${String(itemIdCounter).padStart(12, '0')}`;
      menuItems.push({
        id: itemId,
        restaurant_id: restId,
        category_id: catId,
        name: it.name,
        slug: slugify(it.name) + '-' + itemIdCounter,
        description: it.description || '',
        price: it.price || 150,
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
        dietary_tags: [it.dietary_tag === 'Non-veg' ? 'Non-veg' : 'Veg'],
        spice_level: it.spice_level !== undefined ? it.spice_level : 1,
        portion_size: it.portion_size || 'Serving',
        is_available: true,
        sort_order: itemOrder,
        is_featured: itemOrder <= 2,
        is_must_try: itemOrder === 1,
        view_count: 320,
        order_count: 140,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }
}

const fileContent = `import { Restaurant, MenuCategory, MenuItem } from '../types/database';

export const NORTH_CAMPUS_DU_RESTAURANTS: Restaurant[] = ${JSON.stringify(restaurants, null, 2)};

export const NORTH_CAMPUS_DU_CATEGORIES: MenuCategory[] = ${JSON.stringify(categories, null, 2)};

export const NORTH_CAMPUS_DU_MENU_ITEMS: MenuItem[] = ${JSON.stringify(menuItems, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../src/lib/northCampusDuVenues.ts'), fileContent, 'utf8');
console.log(`Regenerated northCampusDuVenues.ts with strict types: ${restaurants.length} restaurants, ${categories.length} categories, ${menuItems.length} menu items`);

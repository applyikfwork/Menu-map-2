import { generateSeedData } from '../src/lib/seedData';
import fs from 'fs';
import path from 'path';

const data = generateSeedData();

// Deduplicate restaurants by slug
const restaurantsBySlug = new Map<string, any>();
const restaurantIdToSlug = new Map<string, string>();

for (const r of data.restaurants) {
  if (r.slug && !restaurantsBySlug.has(r.slug)) {
    restaurantsBySlug.set(r.slug, r);
    restaurantIdToSlug.set(r.id, r.slug);
  }
}

// Group dishes by restaurant_id and deduplicate by slug
const dishesByRestaurantId = new Map<string, any[]>();
const dishesBySlug = new Map<string, any>();

for (const dish of data.menuItems) {
  if (!dish.slug) continue;
  if (!dishesBySlug.has(dish.slug)) {
    // Attach restaurant info for easy dish page pre-rendering
    const restSlug = restaurantIdToSlug.get(dish.restaurant_id);
    const rest = restSlug ? restaurantsBySlug.get(restSlug) : null;
    dishesBySlug.set(dish.slug, {
      ...dish,
      restaurant_name: rest ? rest.name : 'Delhi Cafe',
      restaurant_slug: restSlug || '',
      restaurant_address: rest ? (rest.address_line1 || rest.city || 'Delhi') : 'Delhi',
      restaurant_city: rest ? (rest.city || 'Delhi NCR') : 'Delhi NCR',
      restaurant_cover_image: rest ? (rest.cover_image_url || 'https://menumaps.in/logo.jpg') : 'https://menumaps.in/logo.jpg',
      restaurant_phone: rest ? (rest.whatsapp_number || rest.phone || '') : '',
    });
  }
  if (!dishesByRestaurantId.has(dish.restaurant_id)) {
    dishesByRestaurantId.set(dish.restaurant_id, []);
  }
  dishesByRestaurantId.get(dish.restaurant_id)!.push(dish);
}

const payload = {
  restaurants: Array.from(restaurantsBySlug.values()),
  dishes: Array.from(dishesBySlug.values()),
  dishes_by_restaurant: Object.fromEntries(dishesByRestaurantId),
  area_guides: [],
};

fs.mkdirSync('dist', { recursive: true });
const outPath = path.resolve('dist', 'prerender_data.json');
fs.writeFileSync(outPath, JSON.stringify(payload));
console.log(`Successfully exported data for pre-rendering:`);
console.log(`  - Unique Restaurants: ${payload.restaurants.length}`);
console.log(`  - Unique Dishes: ${payload.dishes.length}`);

const fs = require('fs');

const originalSeed = fs.readFileSync('src/lib/seedData.ts', 'utf8');
const newCafes = JSON.parse(fs.readFileSync('scripts/batch3_7Cafes.json', 'utf8'));

const pad12 = (num) => String(num).padStart(12, '0');
const restUuid = (idx) => `11111111-0000-4000-8000-${pad12(idx)}`;
const catUuid = (idx) => `22222222-0000-4000-8000-${pad12(idx)}`;

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

const validMealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Late Night'];
const mealMap = { 'Brunch': 'Breakfast', 'Evening Snacks': 'Snacks' };

const validDietOptions = ['Pure Veg', 'Vegan Options', 'Gluten-Free Options', 'Halal', 'Jain Friendly'];
const dietMap = {
  'Veg Options': 'Vegan Options',
  'Non-veg Options': 'Halal',
  'Non-veg Only': 'Halal',
  'Eggitarian': 'Vegan Options',
  'Eggless Bakes': 'Pure Veg',
  'Jain Options Available': 'Jain Friendly',
  'No Onion No Garlic (Jain) Options Available': 'Jain Friendly',
};

// 1. Existing 48 restaurants
const restMatch = originalSeed.match(/const restaurants: Restaurant\[\] = (\[[\s\S]*?\n  \];)\n\n  \/\/ Helper/);
if (!restMatch) {
  console.error('Failed to match restaurants in seedData.ts');
  process.exit(1);
}
let existingRestsCode = restMatch[1].replace(/\n  \];$/, '');

// 2. Append 7 new restaurants (IDs 49 to 55)
let newRests = [];
newCafes.forEach((cafe, i) => {
  const id = restUuid(49 + i);
  const slug = slugify(cafe.name);
  const hours = {
    Monday: { open: '10:00 AM', close: '11:00 PM', is_closed: false },
    Tuesday: { open: '10:00 AM', close: '11:00 PM', is_closed: false },
    Wednesday: { open: '10:00 AM', close: '11:00 PM', is_closed: false },
    Thursday: { open: '10:00 AM', close: '11:00 PM', is_closed: false },
    Friday: { open: '10:00 AM', close: '11:30 PM', is_closed: false },
    Saturday: { open: '10:00 AM', close: '11:30 PM', is_closed: false },
    Sunday: { open: '10:00 AM', close: '11:00 PM', is_closed: false },
  };

  const normalizedMeals = [...new Set(cafe.meal_types.map((m) => mealMap[m] || m).filter((m) => validMealTypes.includes(m)))];
  const normalizedDiet = [...new Set(cafe.dietary_options.map((d) => dietMap[d] || d).filter((d) => validDietOptions.includes(d)))];
  if (normalizedDiet.length === 0) normalizedDiet.push('Pure Veg');

  newRests.push(`    {\n` +
    `      id: '${id}',\n` +
    `      name: ${JSON.stringify(cafe.name)},\n` +
    `      slug: '${slug}',\n` +
    `      short_description: ${JSON.stringify(cafe.short_description)},\n` +
    `      long_description: ${JSON.stringify(cafe.long_description)},\n` +
    `      cuisine_types: ${JSON.stringify(cafe.cuisine_types)},\n` +
    `      meal_types: ${JSON.stringify(normalizedMeals)},\n` +
    `      price_range: ${JSON.stringify(cafe.price_range)},\n` +
    `      average_cost_for_two: ${cafe.average_cost_for_two},\n` +
    `      address_line1: ${JSON.stringify(cafe.address_line1)},\n` +
    `      address_line2: '',\n` +
    `      landmark: '',\n` +
    `      city: ${JSON.stringify(cafe.city)},\n` +
    `      state: ${JSON.stringify(cafe.state)},\n` +
    `      pincode: ${JSON.stringify(cafe.pincode)},\n` +
    `      country: 'India',\n` +
    `      latitude: ${cafe.latitude},\n` +
    `      longitude: ${cafe.longitude},\n` +
    `      phone: ${JSON.stringify(cafe.phone)},\n` +
    `      whatsapp_number: ${JSON.stringify(cafe.phone)},\n` +
    `      email: '',\n` +
    `      website_url: '',\n` +
    `      social_instagram: '',\n` +
    `      social_facebook: '',\n` +
    `      cover_image_url: ${JSON.stringify(cafe.cover_image_url)},\n` +
    `      is_open: true,\n` +
    `      opening_hours: ${JSON.stringify(hours)},\n` +
    `      delivery_available: true,\n` +
    `      takeaway_available: true,\n` +
    `      dine_in_available: true,\n` +
    `      facilities: ${JSON.stringify(cafe.facilities)},\n` +
    `      dietary_options: ${JSON.stringify(normalizedDiet)},\n` +
    `      rating_avg: ${cafe.rating_avg},\n` +
    `      rating_count: ${cafe.rating_count},\n` +
    `      is_featured: ${i === 0 ? 'true' : 'false'},\n` +
    `      is_active: true,\n` +
    `      is_temporarily_closed: false,\n` +
    `      known_for_dishes: ${JSON.stringify(cafe.known_for_dishes)},\n` +
    `      created_at: new Date().toISOString(),\n` +
    `      updated_at: new Date().toISOString(),\n` +
    `    }`);
});

const fullRestaurants = existingRestsCode + ',\n' + newRests.join(',\n') + '\n  ];';

// 3. Existing Categories
const catMatch = originalSeed.match(/const categories: MenuCategory\[\] = (\[[\s\S]*?\n  \];)\n\n  let itemIdx/);
if (!catMatch) {
  console.error('Failed to match categories in seedData.ts');
  process.exit(1);
}
let existingCatsCode = catMatch[1].replace(/\n  \];$/, '');

// 4. Existing Dishes
const itemMatch = originalSeed.match(/const menuItems: MenuItem\[\] = (\[[\s\S]*?\n  \];)\n\n  \/\/ Collections/);
if (!itemMatch) {
  console.error('Failed to match menuItems in seedData.ts');
  process.exit(1);
}
let existingItemsCode = itemMatch[1].replace(/\n  \];$/, '');

const existingCatCount = (existingCatsCode.match(/id: '22222222-0000-4000-8000-/g) || []).length;
console.log('Existing categories count:', existingCatCount);

let newCats = [];
let newItems = [];
let catIdx = existingCatCount + 1;

newCafes.forEach((cafe, i) => {
  const restId = restUuid(49 + i);
  cafe.menu_categories.forEach((catGroup, cIdx) => {
    const categoryId = catUuid(catIdx++);
    newCats.push(`    { id: '${categoryId}', restaurant_id: '${restId}', name: ${JSON.stringify(catGroup.category_name)}, sort_order: ${cIdx + 1}, is_active: true, created_at: new Date().toISOString() }`);

    catGroup.items.forEach((item) => {
      let diet = item.dietary_tag || 'Veg';
      if (diet !== 'Veg' && diet !== 'Non-veg' && diet !== 'Vegan') diet = 'Veg';
      const spice = item.spice_level ?? 1;
      const portion = item.portion_size || 'Regular';
      newItems.push(`    createDish('${restId}', '${categoryId}', ${JSON.stringify(item.name)}, ${item.price}, ${JSON.stringify(item.description)}, '${diet}', ${spice}, ${JSON.stringify(portion)}, false)`);
    });
  });
});

const fullCategoriesCode = existingCatsCode + ',\n' + newCats.join(',\n') + '\n  ];';
const fullDishesCode = existingItemsCode + ',\n' + newItems.join(',\n') + '\n  ];';

// 5. Existing Collections
const collMatch = originalSeed.match(/(\/\/ Collections[\s\S]*)/);
const collectionsTail = collMatch ? collMatch[1] : '';

const output = `import { Restaurant, MenuCategory, MenuItem, Collection, CollectionItem } from '../types/database';
import { slugify } from './supabase';
import { getSmartDishImage } from './dishImageRegistry';

export interface SeedDataset {
  restaurants: Restaurant[];
  categories: MenuCategory[];
  menuItems: MenuItem[];
  collections: Collection[];
  collectionItems: CollectionItem[];
}

export function generateSeedData(): SeedDataset {
  const restaurants: Restaurant[] = ${fullRestaurants}

  // Helper for generating deterministic UUIDs
  const uuid = (prefix: string, index: number) => {
    const pad = String(index).padStart(12, '0');
    return prefix + pad;
  };

  // Categories
  const categories: MenuCategory[] = ${fullCategoriesCode}

  let itemIdx = 1;
  const createDish = (
    restId: string,
    catId: string,
    name: string,
    price: number,
    description: string,
    dietary: 'Veg' | 'Non-veg' | 'Vegan',
    spiceLevel: number,
    portion: string,
    isFeatured: boolean = false
  ): MenuItem => {
    const id = uuid('33333333-0000-4000-8000-', itemIdx++);
    return {
      id,
      restaurant_id: restId,
      category_id: catId,
      name,
      slug: slugify(\`\${name}-\${id.substring(30)}\`),
      description,
      price,
      image_url: getSmartDishImage(name),
      dietary_tags: [dietary],
      spice_level: spiceLevel,
      portion_size: portion,
      is_available: true,
      is_featured: isFeatured,
      sort_order: 0,
      view_count: Math.floor(Math.random() * 50) + 20,
      order_count: Math.floor(Math.random() * 25) + 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  };

  const menuItems: MenuItem[] = ${fullDishesCode}

  ${collectionsTail}
`;

fs.writeFileSync('src/lib/seedData.ts', output, 'utf8');
console.log('Successfully updated seedData.ts with the 7 approved restaurants from batch 3!');

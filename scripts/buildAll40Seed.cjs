const fs = require('fs');

const originalSeed = fs.readFileSync('src/lib/seedData.ts', 'utf8');
const newCafes = JSON.parse(fs.readFileSync('scripts/chandniChowk10Cafes.json', 'utf8'));

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
  'Eggitarian': 'Vegan Options',
  'Eggless Bakes': 'Pure Veg',
  'No Onion No Garlic (Jain) Options Available': 'Jain Friendly',
};

// 1. Existing 30 restaurants
// Extract between `const restaurants: Restaurant[] = [` and the `];` before `// Helper for generating deterministic UUIDs`
const restMatch = originalSeed.match(/const restaurants: Restaurant\[\] = (\[[\s\S]*?\n  \];)\n\n  \/\/ Helper/);
if (!restMatch) {
  console.error('Failed to match restaurants in seedData.ts');
  process.exit(1);
}
let existingRestsCode = restMatch[1].replace(/\n  \];$/, '');

// 2. Append 10 new restaurants
let newRests = [];
newCafes.forEach((cafe, i) => {
  const id = restUuid(31 + i);
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
    `      is_featured: ${i < 3 ? 'true' : 'false'},\n` +
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

// Count existing categories to get starting index
const existingCatCount = (existingCatsCode.match(/id: '22222222-0000-4000-8000-/g) || []).length;
console.log('Existing categories count:', existingCatCount);

let newCats = [];
let newItems = [];
let catIdx = existingCatCount + 1;

newCafes.forEach((cafe, i) => {
  const restId = restUuid(31 + i);
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

// 5. Collections (add Old Delhi & Chandni Chowk trail)
const collectionsCode = `[
    {
      id: uuid('44444444-0000-4000-8000-', 1),
      title: 'Best Cafes & Dhabas in Nangloi',
      slug: 'best-cafes-dhabas-nangloi',
      description: 'The definitive foodie trail across Najafgarh Road and Shivram Park for rich thalis, momos, and artisanal coffees.',
      cover_image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
      type: 'City-based',
      is_featured: true,
      is_active: true,
      sort_order: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: uuid('44444444-0000-4000-8000-', 2),
      title: 'Crispy Kurkure & Afghani Momos',
      slug: 'crispy-kurkure-afghani-momos',
      description: 'Cravings for steaming hot dumplings dipped in spicy garlic sauce and cashew cream gravies.',
      cover_image_url: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800&auto=format&fit=crop&q=80',
      type: 'Cuisine-based',
      is_featured: true,
      is_active: true,
      sort_order: 2,
      created_at: new Date().toISOString(),
    },
    {
      id: uuid('44444444-0000-4000-8000-', 3),
      title: 'Family Thalis & Pure Veg Delights',
      slug: 'family-thalis-pure-veg',
      description: 'Generous portions, authentic Punjabi gravies, and hot clay-oven butter naans for family dinners.',
      cover_image_url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80',
      type: 'Occasion-based',
      is_featured: true,
      is_active: true,
      sort_order: 3,
      created_at: new Date().toISOString(),
    },
    {
      id: uuid('44444444-0000-4000-8000-', 4),
      title: 'Chandni Chowk & Old Delhi Heritage Trail',
      slug: 'chandni-chowk-heritage-trail',
      description: 'Iconic century-old culinary legends: deep fried parathas, hot desi ghee jalebis, Bedmi Poori, and scenic Jama Masjid rooftop cafes.',
      cover_image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
      type: 'City-based',
      is_featured: true,
      is_active: true,
      sort_order: 4,
      created_at: new Date().toISOString(),
    }
  ];`;

const collectionItemsCode = `[
    { id: uuid('55555555-0000-4000-8000-', 1), collection_id: uuid('44444444-0000-4000-8000-', 1), item_type: 'restaurant', restaurant_id: '11111111-0000-4000-8000-000000000001', sort_order: 1, note: 'Must try their Dal Bukhara', created_at: new Date().toISOString() },
    { id: uuid('55555555-0000-4000-8000-', 2), collection_id: uuid('44444444-0000-4000-8000-', 1), item_type: 'restaurant', restaurant_id: '11111111-0000-4000-8000-000000000004', sort_order: 2, note: 'Top student hangout with hazelnut cold brews', created_at: new Date().toISOString() },
    { id: uuid('55555555-0000-4000-8000-', 3), collection_id: uuid('44444444-0000-4000-8000-', 1), item_type: 'restaurant', restaurant_id: '11111111-0000-4000-8000-000000000003', sort_order: 3, note: 'Family-friendly restro with play area', created_at: new Date().toISOString() },
    { id: uuid('55555555-0000-4000-8000-', 4), collection_id: uuid('44444444-0000-4000-8000-', 2), item_type: 'restaurant', restaurant_id: '11111111-0000-4000-8000-000000000005', sort_order: 1, note: 'Famous Afghani & Kurkure momos', created_at: new Date().toISOString() },
    { id: uuid('55555555-0000-4000-8000-', 5), collection_id: uuid('44444444-0000-4000-8000-', 3), item_type: 'restaurant', restaurant_id: '11111111-0000-4000-8000-000000000007', sort_order: 1, note: 'Traditional Punjabi dhaba flavors', created_at: new Date().toISOString() },
    { id: uuid('55555555-0000-4000-8000-', 6), collection_id: uuid('44444444-0000-4000-8000-', 3), item_type: 'restaurant', restaurant_id: '11111111-0000-4000-8000-000000000008', sort_order: 2, note: 'Budget-friendly authentic thalis', created_at: new Date().toISOString() },
    { id: uuid('55555555-0000-4000-8000-', 7), collection_id: uuid('44444444-0000-4000-8000-', 4), item_type: 'restaurant', restaurant_id: '11111111-0000-4000-8000-000000000031', sort_order: 1, note: 'Panoramic rooftop view of Jama Masjid domes', created_at: new Date().toISOString() },
    { id: uuid('55555555-0000-4000-8000-', 8), collection_id: uuid('44444444-0000-4000-8000-', 4), item_type: 'restaurant', restaurant_id: '11111111-0000-4000-8000-000000000035', sort_order: 2, note: '150-year-old Paranthe Wali Gali pioneer', created_at: new Date().toISOString() },
    { id: uuid('55555555-0000-4000-8000-', 9), collection_id: uuid('44444444-0000-4000-8000-', 4), item_type: 'restaurant', restaurant_id: '11111111-0000-4000-8000-000000000039', sort_order: 3, note: 'Iconic 1884 thick desi ghee jalebis with rabri', created_at: new Date().toISOString() },
    { id: uuid('55555555-0000-4000-8000-', 10), collection_id: uuid('44444444-0000-4000-8000-', 4), item_type: 'restaurant', restaurant_id: '11111111-0000-4000-8000-000000000040', sort_order: 4, note: 'World famous Dahi Bhalla & crispy Aloo Tikki', created_at: new Date().toISOString() },
  ];`;

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

  // Collections
  const collections: Collection[] = ${collectionsCode}

  const collectionItems: CollectionItem[] = ${collectionItemsCode}

  return {
    restaurants,
    categories,
    menuItems,
    collections,
    collectionItems,
  };
}
`;

fs.writeFileSync('src/lib/seedData.ts', output, 'utf8');
console.log('Successfully generated all 40 restaurants in src/lib/seedData.ts!');

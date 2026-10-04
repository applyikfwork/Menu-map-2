const fs = require('fs');

const originalSeed = fs.readFileSync('src/lib/seedData.ts', 'utf8');
const newCafes = JSON.parse(fs.readFileSync('scripts/new20Cafes.json', 'utf8'));

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
  'Eggitarian': 'Vegan Options',
  'Eggless Bakes': 'Pure Veg',
  'Non-veg Options': 'Halal',
};

// 1. Existing restaurants
const restArrayMatch = originalSeed.match(/const restaurants: Restaurant\[\] = (\[[\s\S]*?\n  \];)\n\n  \/\/ Helper/);
let existingRestsCode = restArrayMatch[1];
existingRestsCode = existingRestsCode.replace(/\n  \];$/, '');

// Append 20 new restaurants
let newRestsCode = '';
newCafes.forEach((cafe, i) => {
  const id = restUuid(11 + i);
  const slug = slugify(cafe.name);
  const hours = {
    Monday: { open: '11:00 AM', close: '10:30 PM', is_closed: false },
    Tuesday: { open: '11:00 AM', close: '10:30 PM', is_closed: false },
    Wednesday: { open: '11:00 AM', close: '10:30 PM', is_closed: false },
    Thursday: { open: '11:00 AM', close: '10:30 PM', is_closed: false },
    Friday: { open: '11:00 AM', close: '11:00 PM', is_closed: false },
    Saturday: { open: '11:00 AM', close: '11:00 PM', is_closed: false },
    Sunday: { open: '11:00 AM', close: '10:30 PM', is_closed: false },
  };

  const normalizedMeals = [...new Set(cafe.meal_types.map((m) => mealMap[m] || m).filter((m) => validMealTypes.includes(m)))];
  const normalizedDiet = [...new Set(cafe.dietary_options.map((d) => dietMap[d] || d).filter((d) => validDietOptions.includes(d)))];
  if (normalizedDiet.length === 0) normalizedDiet.push('Pure Veg');

  newRestsCode += `,\n    {\n`;
  newRestsCode += `      id: '${id}',\n`;
  newRestsCode += `      name: ${JSON.stringify(cafe.name)},\n`;
  newRestsCode += `      slug: '${slug}',\n`;
  newRestsCode += `      short_description: ${JSON.stringify(cafe.short_description)},\n`;
  newRestsCode += `      long_description: ${JSON.stringify(cafe.long_description)},\n`;
  newRestsCode += `      cuisine_types: ${JSON.stringify(cafe.cuisine_types)},\n`;
  newRestsCode += `      meal_types: ${JSON.stringify(normalizedMeals)},\n`;
  newRestsCode += `      price_range: ${JSON.stringify(cafe.price_range)},\n`;
  newRestsCode += `      average_cost_for_two: ${cafe.average_cost_for_two},\n`;
  newRestsCode += `      address_line1: ${JSON.stringify(cafe.address_line1)},\n`;
  newRestsCode += `      address_line2: '',\n`;
  newRestsCode += `      landmark: '',\n`;
  newRestsCode += `      city: ${JSON.stringify(cafe.city)},\n`;
  newRestsCode += `      state: ${JSON.stringify(cafe.state)},\n`;
  newRestsCode += `      pincode: ${JSON.stringify(cafe.pincode)},\n`;
  newRestsCode += `      country: 'India',\n`;
  newRestsCode += `      latitude: ${cafe.latitude},\n`;
  newRestsCode += `      longitude: ${cafe.longitude},\n`;
  newRestsCode += `      phone: ${JSON.stringify(cafe.phone)},\n`;
  newRestsCode += `      whatsapp_number: ${JSON.stringify(cafe.phone)},\n`;
  newRestsCode += `      email: '',\n`;
  newRestsCode += `      website_url: '',\n`;
  newRestsCode += `      social_instagram: '',\n`;
  newRestsCode += `      social_facebook: '',\n`;
  newRestsCode += `      cover_image_url: ${JSON.stringify(cafe.cover_image_url)},\n`;
  newRestsCode += `      is_open: true,\n`;
  newRestsCode += `      opening_hours: ${JSON.stringify(hours)},\n`;
  newRestsCode += `      delivery_available: true,\n`;
  newRestsCode += `      takeaway_available: true,\n`;
  newRestsCode += `      dine_in_available: true,\n`;
  newRestsCode += `      facilities: ${JSON.stringify(cafe.facilities)},\n`;
  newRestsCode += `      dietary_options: ${JSON.stringify(normalizedDiet)},\n`;
  newRestsCode += `      rating_avg: ${cafe.rating_avg},\n`;
  newRestsCode += `      rating_count: ${cafe.rating_count},\n`;
  newRestsCode += `      is_featured: false,\n`;
  newRestsCode += `      is_active: true,\n`;
  newRestsCode += `      is_temporarily_closed: false,\n`;
  newRestsCode += `      known_for_dishes: ${JSON.stringify(cafe.known_for_dishes)},\n`;
  newRestsCode += `      created_at: new Date().toISOString(),\n`;
  newRestsCode += `      updated_at: new Date().toISOString(),\n`;
  newRestsCode += `    }`;
});

const fullRestsCode = existingRestsCode + newRestsCode + '\n  ];';

// 2. Categories
// Extract up to initial 44 categories from original
const catArrayMatch = originalSeed.match(/const categories: MenuCategory\[\] = (\[[\s\S]*?\n  \];)\n\n  let itemIdx/);
let existingCatsCode = catArrayMatch[1];
// Keep only first 44 categories
const catsList = existingCatsCode.split('\n    { id:');
// First element has "[\n    { id:"
const originalFirst44 = catsList.slice(0, 45).join('\n    { id:').replace(/\n  \];$/, '').trim();

let newCatsCode = '';
let newItemsCode = '';
let catIdx = 45;

newCafes.forEach((cafe, i) => {
  const restId = restUuid(11 + i);
  cafe.menu_categories.forEach((catGroup, cIdx) => {
    const categoryId = catUuid(catIdx++);
    newCatsCode += `,\n    { id: '${categoryId}', restaurant_id: '${restId}', name: ${JSON.stringify(catGroup.category_name)}, sort_order: ${cIdx + 1}, is_active: true, created_at: new Date().toISOString() }`;

    catGroup.items.forEach((item) => {
      let diet = item.dietary_tag || 'Veg';
      if (diet !== 'Veg' && diet !== 'Non-veg' && diet !== 'Vegan') diet = 'Veg';
      const spice = item.spice_level ?? 1;
      const portion = item.portion_size || 'Regular';
      newItemsCode += `    createDish('${restId}', '${categoryId}', ${JSON.stringify(item.name)}, ${item.price}, ${JSON.stringify(item.description)}, '${diet}', ${spice}, ${JSON.stringify(portion)}, false),\n`;
    });
  });
});

const fullCatsCode = originalFirst44 + newCatsCode + '\n  ];';

// 3. Menu Items
// Extract initial 258 dishes from original
const itemArrayMatch = originalSeed.match(/const menuItems: MenuItem\[\] = (\[[\s\S]*?\n  \];)\n\n  \/\/ Collections/);
let existingItemsCode = itemArrayMatch[1];
// The original dishes were 258 lines of createDish
const lines = existingItemsCode.split('\n').filter(l => l.includes('createDish('));
const original258Lines = lines.slice(0, 258).join('\n');

const fullItemsCode = '[\n' + original258Lines + ',\n' + newItemsCode.trim().replace(/,\s*$/, '') + '\n  ];';

// 4. Assemble the whole file
let output = `import { Restaurant, MenuCategory, MenuItem, Collection, CollectionItem } from '../types/database';
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
  const restaurants: Restaurant[] = ${fullRestsCode}

  // Helper for generating deterministic UUIDs
  const uuid = (prefix: string, index: number) => {
    const pad = String(index).padStart(12, '0');
    return prefix + pad;
  };

  // Categories
  const categories: MenuCategory[] = ${fullCatsCode}

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

  const menuItems: MenuItem[] = ${fullItemsCode}

  // Collections
  const collections: Collection[] = [
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
    }
  ];

  const collectionItems: CollectionItem[] = [
    { id: uuid('55555555-0000-4000-8000-', 1), collection_id: uuid('44444444-0000-4000-8000-', 1), item_type: 'restaurant', restaurant_id: '11111111-0000-4000-8000-000000000001', sort_order: 1, note: 'Must try their Dal Bukhara', created_at: new Date().toISOString() },
    { id: uuid('55555555-0000-4000-8000-', 2), collection_id: uuid('44444444-0000-4000-8000-', 1), item_type: 'restaurant', restaurant_id: '11111111-0000-4000-8000-000000000004', sort_order: 2, note: 'Top student hangout with hazelnut cold brews', created_at: new Date().toISOString() },
    { id: uuid('55555555-0000-4000-8000-', 3), collection_id: uuid('44444444-0000-4000-8000-', 1), item_type: 'restaurant', restaurant_id: '11111111-0000-4000-8000-000000000003', sort_order: 3, note: 'Family-friendly restro with play area', created_at: new Date().toISOString() },
    { id: uuid('55555555-0000-4000-8000-', 4), collection_id: uuid('44444444-0000-4000-8000-', 2), item_type: 'restaurant', restaurant_id: '11111111-0000-4000-8000-000000000005', sort_order: 1, note: 'Famous Afghani & Kurkure momos', created_at: new Date().toISOString() },
    { id: uuid('55555555-0000-4000-8000-', 5), collection_id: uuid('44444444-0000-4000-8000-', 3), item_type: 'restaurant', restaurant_id: '11111111-0000-4000-8000-000000000007', sort_order: 1, note: 'Traditional Punjabi dhaba flavors', created_at: new Date().toISOString() },
    { id: uuid('55555555-0000-4000-8000-', 6), collection_id: uuid('44444444-0000-4000-8000-', 3), item_type: 'restaurant', restaurant_id: '11111111-0000-4000-8000-000000000008', sort_order: 2, note: 'Budget-friendly authentic thalis', created_at: new Date().toISOString() },
  ];

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
console.log('Successfully generated perfectly typed src/lib/seedData.ts');

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { generateSeedData } from '../src/lib/seedData';
import { enrichRestaurant, enrichMenuItem } from '../src/lib/restaurantEnricher';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

async function sync() {
  console.log('--- Starting MenuMap Supabase Ingestion ---');
  if (!SUPABASE_URL || !SUPABASE_KEY || !SUPABASE_URL.startsWith('http')) {
    console.warn('⚠️ Supabase URL/Key not found in environment variables. Local seed is used.');
    console.log('To push directly to live Supabase, provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY).');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const data = generateSeedData();

  console.log(`📦 Loaded ${data.restaurants.length} restaurants, ${data.categories.length} categories, ${data.menuItems.length} menu items, and ${data.collections.length} area guides.`);

  // 1. Ingest restaurants in batches
  console.log('🚀 Upserting restaurants to Supabase...');
  const enrichedRestaurants = data.restaurants.map(r => enrichRestaurant(r));
  const restBatchSize = 50;
  for (let i = 0; i < enrichedRestaurants.length; i += restBatchSize) {
    const batch = enrichedRestaurants.slice(i, i + restBatchSize);
    const { error } = await supabase.from('restaurants').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`Error inserting restaurants batch ${i}:`, error.message);
    } else {
      console.log(`✅ Synced restaurants ${i + 1} - ${Math.min(i + restBatchSize, enrichedRestaurants.length)}`);
    }
  }

  // 2. Ingest menu categories
  console.log('🚀 Upserting menu categories to Supabase...');
  for (let i = 0; i < data.categories.length; i += 100) {
    const batch = data.categories.slice(i, i + 100);
    const { error } = await supabase.from('menu_categories').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`Error inserting categories batch ${i}:`, error.message);
    }
  }
  console.log(`✅ Synced ${data.categories.length} menu categories.`);

  // 3. Ingest menu items
  console.log('🚀 Upserting menu items to Supabase...');
  const enrichedItems = data.menuItems.map(i => enrichMenuItem(i));
  for (let i = 0; i < enrichedItems.length; i += 100) {
    const batch = enrichedItems.slice(i, i + 100);
    const { error } = await supabase.from('menu_items').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`Error inserting menu items batch ${i}:`, error.message);
    }
  }
  console.log(`✅ Synced ${enrichedItems.length} menu items.`);

  // 4. Ingest collections & items
  console.log('🚀 Upserting collections to Supabase...');
  const { error: colErr } = await supabase.from('collections').upsert(data.collections, { onConflict: 'id' });
  if (colErr) console.error('Error inserting collections:', colErr.message);

  const { error: colItemErr } = await supabase.from('collection_items').upsert(data.collectionItems, { onConflict: 'id' });
  if (colItemErr) console.error('Error inserting collection items:', colItemErr.message);

  console.log('🎉 Supabase live cloud synchronization complete!');
}

sync().catch(err => {
  console.error('Fatal synchronization error:', err);
});

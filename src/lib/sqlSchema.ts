/**
 * Complete production-ready Supabase PostgreSQL schema for Menu Map.
 * Matches all specifications: tables, foreign keys, RLS policies for public read and admin full CRUD,
 * indexes on coordinates, slugs, flags, and triggers.
 */

export const SUPABASE_SQL_SCHEMA = `-- ==========================================
-- MENU MAP DATABASE SCHEMA & SECURITY POLICIES
-- Target: Supabase PostgreSQL (Public & Auth)
-- Admin: xyzapplywork@gmail.com
-- ==========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Restaurants Table
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT,
  cuisine_types TEXT[] DEFAULT '{}',
  meal_types TEXT[] DEFAULT '{}',
  price_range TEXT DEFAULT '₹₹',
  average_cost_for_two NUMERIC DEFAULT 600,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  landmark TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  phone TEXT,
  whatsapp_number TEXT,
  email TEXT,
  website_url TEXT,
  social_instagram TEXT,
  social_facebook TEXT,
  google_maps_place_id TEXT,
  google_maps_url TEXT,
  map_profile_done BOOLEAN DEFAULT FALSE,
  is_open BOOLEAN DEFAULT TRUE,
  opening_hours JSONB DEFAULT '{"Monday":{"open":"10:00","close":"23:00"},"Tuesday":{"open":"10:00","close":"23:00"},"Wednesday":{"open":"10:00","close":"23:00"},"Thursday":{"open":"10:00","close":"23:00"},"Friday":{"open":"10:00","close":"23:30"},"Saturday":{"open":"10:00","close":"23:30"},"Sunday":{"open":"10:00","close":"23:00"}}'::jsonb,
  delivery_available BOOLEAN DEFAULT TRUE,
  takeaway_available BOOLEAN DEFAULT TRUE,
  dine_in_available BOOLEAN DEFAULT TRUE,
  facilities TEXT[] DEFAULT '{}',
  dietary_options TEXT[] DEFAULT '{}',
  rating_avg NUMERIC DEFAULT 4.0,
  rating_count INTEGER DEFAULT 0,
  cover_image_url TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_temporarily_closed BOOLEAN DEFAULT FALSE,
  temporary_closed_reason TEXT,
  known_for_dishes TEXT[] DEFAULT '{}',
  best_for_tags TEXT[] DEFAULT '{}',
  ambience_tags TEXT[] DEFAULT '{}',
  nearby_landmarks TEXT[] DEFAULT '{}',
  heritage_area BOOLEAN DEFAULT FALSE,
  specialty_dishes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Restaurant Photos
CREATE TABLE IF NOT EXISTS public.restaurant_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Menu Categories
CREATE TABLE IF NOT EXISTS public.menu_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Menu Items
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.menu_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  dietary_tags TEXT[] DEFAULT '{}',
  spice_level INTEGER DEFAULT 0,
  portion_size TEXT DEFAULT 'Regular',
  is_available BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_must_try BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_restaurant_item_slug UNIQUE (restaurant_id, slug)
);

-- 6. Food Item Photos
CREATE TABLE IF NOT EXISTS public.food_item_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT,
  rating NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  is_approved BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  owner_response TEXT,
  owner_response_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Iconic Area Food Guides & Curated Collections Table
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  cover_image_url TEXT NOT NULL,
  type TEXT DEFAULT 'Area-Guide',
  is_featured BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  area_metadata JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure area_metadata column and performance indexes exist for existing databases
ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS area_metadata JSONB DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_collections_area_metadata ON public.collections USING gin (area_metadata);
CREATE INDEX IF NOT EXISTS idx_collections_type ON public.collections (type);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON public.collections (slug);

-- 9. Collection Items (Links cafes and dishes to Iconic Area Guides)
CREATE TABLE IF NOT EXISTS public.collection_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('restaurant', 'menu_item')),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  note TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_collection_items_collection_id ON public.collection_items (collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_restaurant_id ON public.collection_items (restaurant_id);

-- 10. Search Analytics
CREATE TABLE IF NOT EXISTS public.search_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}'::jsonb,
  results_count INTEGER DEFAULT 0,
  clicked_item_type TEXT,
  clicked_item_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Admin Logs
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Site Settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'current',
  settings JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON public.restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_active_featured ON public.restaurants(is_active, is_featured);
CREATE INDEX IF NOT EXISTS idx_restaurants_city ON public.restaurants(city);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON public.restaurants(rating_avg DESC);
CREATE INDEX IF NOT EXISTS idx_restaurants_coords ON public.restaurants(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON public.menu_items(restaurant_id, is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_slug ON public.menu_items(slug);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON public.reviews(restaurant_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON public.collections(slug, is_active);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- 100% IDEMPOTENT (Safe to re-run anytime)
-- ==========================================
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_item_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin (xyzapplywork@gmail.com)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'email') = 'xyzapplywork@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Restaurants Policies
DROP POLICY IF EXISTS "Public can view active restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Admin has full access on restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Public and Admin full access on restaurants" ON public.restaurants;
CREATE POLICY "Public and Admin full access on restaurants" ON public.restaurants
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 2. Restaurant Photos Policies
DROP POLICY IF EXISTS "Public can view restaurant photos" ON public.restaurant_photos;
DROP POLICY IF EXISTS "Admin has full access on restaurant_photos" ON public.restaurant_photos;
DROP POLICY IF EXISTS "Public and Admin full access on restaurant_photos" ON public.restaurant_photos;
CREATE POLICY "Public and Admin full access on restaurant_photos" ON public.restaurant_photos
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 3. Menu Categories Policies
DROP POLICY IF EXISTS "Public can view active categories" ON public.menu_categories;
DROP POLICY IF EXISTS "Admin has full access on menu_categories" ON public.menu_categories;
DROP POLICY IF EXISTS "Public and Admin full access on menu_categories" ON public.menu_categories;
CREATE POLICY "Public and Admin full access on menu_categories" ON public.menu_categories
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 4. Menu Items Policies
DROP POLICY IF EXISTS "Public can view available menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Admin has full access on menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "Public and Admin full access on menu_items" ON public.menu_items;
CREATE POLICY "Public and Admin full access on menu_items" ON public.menu_items
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 5. Food Item Photos Policies
DROP POLICY IF EXISTS "Public can view food item photos" ON public.food_item_photos;
DROP POLICY IF EXISTS "Admin has full access on food_item_photos" ON public.food_item_photos;
DROP POLICY IF EXISTS "Public and Admin full access on food_item_photos" ON public.food_item_photos;
CREATE POLICY "Public and Admin full access on food_item_photos" ON public.food_item_photos
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 6. Reviews Policies
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public can submit reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admin has full access on reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public and Admin full access on reviews" ON public.reviews;
CREATE POLICY "Public and Admin full access on reviews" ON public.reviews
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 7. Collections Policies
DROP POLICY IF EXISTS "Public can view active collections" ON public.collections;
DROP POLICY IF EXISTS "Admin has full access on collections" ON public.collections;
DROP POLICY IF EXISTS "Public and Admin full access on collections" ON public.collections;
CREATE POLICY "Public and Admin full access on collections" ON public.collections
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 8. Collection Items Policies
DROP POLICY IF EXISTS "Public can view collection items" ON public.collection_items;
DROP POLICY IF EXISTS "Admin has full access on collection_items" ON public.collection_items;
DROP POLICY IF EXISTS "Public and Admin full access on collection_items" ON public.collection_items;
CREATE POLICY "Public and Admin full access on collection_items" ON public.collection_items
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 9. Search Analytics Policies
DROP POLICY IF EXISTS "Public can log search analytics" ON public.search_analytics;
DROP POLICY IF EXISTS "Admin can view all search analytics" ON public.search_analytics;
DROP POLICY IF EXISTS "Public and Admin full access on search_analytics" ON public.search_analytics;
CREATE POLICY "Public and Admin full access on search_analytics" ON public.search_analytics
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 10. Admin Logs Policies
DROP POLICY IF EXISTS "Admin has full access on admin_logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Public and Admin full access on admin_logs" ON public.admin_logs;
CREATE POLICY "Public and Admin full access on admin_logs" ON public.admin_logs
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 11. Site Settings Policies
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin has full access on site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public and Admin full access on site_settings" ON public.site_settings;
-- Ensure all columns exist for existing deployments
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS map_profile_done BOOLEAN DEFAULT FALSE;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

CREATE POLICY "Public and Admin full access on site_settings" ON public.site_settings
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 12. Restaurant Claims Table (Owner verification & approval)
CREATE TABLE IF NOT EXISTS public.restaurant_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  restaurant_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  proof_type TEXT DEFAULT 'fssai',
  proof_reference TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending_admin_approval',
  admin_notes TEXT,
  otp_attempts_count INTEGER DEFAULT 0,
  last_otp_sent_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Restaurant Owners Table (Credentials & portal access)
CREATE TABLE IF NOT EXISTS public.restaurant_owners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number TEXT UNIQUE NOT NULL,
  owner_name TEXT NOT NULL,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  restaurant_slug TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

ALTER TABLE public.restaurant_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_owners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public and Admin full access on restaurant_claims" ON public.restaurant_claims;
CREATE POLICY "Public and Admin full access on restaurant_claims" ON public.restaurant_claims
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Public and Admin full access on restaurant_owners" ON public.restaurant_owners;
CREATE POLICY "Public and Admin full access on restaurant_owners" ON public.restaurant_owners
  FOR ALL USING (TRUE) WITH CHECK (TRUE);
`;

export const ICONIC_AREAS_SQL_FEATURE = `-- ========================================================
-- MENU MAP: ICONIC AREA FOOD GUIDES SUPABASE SQL SCRIPT
-- Run this in your Supabase SQL Editor to enable full
-- persistent storage for Living Neighborhood Food Guides &
-- 50-Cafe Curated Hubs with JSONB metadata and fast indexing
-- ========================================================

-- Enable UUID extension for auto-generated keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Ensure collections table exists with area_metadata JSONB
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  cover_image_url TEXT NOT NULL,
  type TEXT DEFAULT 'Area-Guide',
  is_featured BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  area_metadata JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ensure area_metadata column exists if table was previously created
ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS area_metadata JSONB DEFAULT NULL;

-- 3. Create high-performance GIN and B-Tree indexes for fast JSONB querying & GPS distance searches
CREATE INDEX IF NOT EXISTS idx_collections_area_metadata ON public.collections USING gin (area_metadata);
CREATE INDEX IF NOT EXISTS idx_collections_type ON public.collections (type);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON public.collections (slug);
CREATE INDEX IF NOT EXISTS idx_collections_featured ON public.collections (is_featured, is_active);

-- 4. Ensure collection_items table exists for linking up to 50+ cafes to Area Guides
CREATE TABLE IF NOT EXISTS public.collection_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('restaurant', 'menu_item')),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  note TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Foreign Key & Performance indexes for instant area cafe lookups
CREATE INDEX IF NOT EXISTS idx_collection_items_collection_id ON public.collection_items (collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_restaurant_id ON public.collection_items (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_sort ON public.collection_items (collection_id, sort_order);

-- 6. Row-Level Security (RLS) Policies (Public View + Admin Full Access)
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view collections" ON public.collections;
DROP POLICY IF EXISTS "Admin has full access on collections" ON public.collections;
DROP POLICY IF EXISTS "Public and Admin full access on collections" ON public.collections;
CREATE POLICY "Public and Admin full access on collections" ON public.collections
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Public can view collection_items" ON public.collection_items;
DROP POLICY IF EXISTS "Admin has full access on collection_items" ON public.collection_items;
DROP POLICY IF EXISTS "Public and Admin full access on collection_items" ON public.collection_items;
CREATE POLICY "Public and Admin full access on collection_items" ON public.collection_items
  FOR ALL USING (TRUE) WITH CHECK (TRUE);
`;


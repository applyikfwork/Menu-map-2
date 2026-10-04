export type DietaryOption = 'Pure Veg' | 'Vegan Options' | 'Gluten-Free Options' | 'Halal' | 'Jain Friendly';

export type DietaryTag = 'Veg' | 'Non-veg' | 'Vegan' | 'Gluten-free' | 'High Protein' | 'Low Calorie' | 'Egg' | 'Spicy';

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' | 'Late Night';

export type PriceRange = '₹' | '₹₹' | '₹₹₹' | '₹₹₹₹';

export interface OpeningHours {
  [day: string]: {
    open: string;
    close: string;
    is_closed?: boolean;
  };
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  long_description?: string;
  cuisine_types: string[];
  meal_types: MealType[];
  price_range: PriceRange;
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
  phone?: string;
  whatsapp_number?: string;
  email?: string;
  website_url?: string;
  social_instagram?: string;
  social_facebook?: string;
  google_maps_place_id?: string;
  google_maps_url?: string;
  map_profile_done?: boolean;
  is_open: boolean;
  opening_hours: OpeningHours;
  delivery_available: boolean;
  takeaway_available: boolean;
  dine_in_available: boolean;
  facilities: string[];
  dietary_options: DietaryOption[];
  rating_avg: number;
  rating_count: number;
  cover_image_url: string;
  is_featured: boolean;
  is_active: boolean;
  is_temporarily_closed?: boolean;
  temporary_closed_reason?: string;
  known_for_dishes?: string[];
  best_for_tags?: string[];
  ambience_tags?: string[];
  nearby_landmarks?: string[];
  heritage_area?: boolean;
  specialty_dishes?: string[];
  created_at: string;
  updated_at: string;
}

export interface RestaurantPhoto {
  id: string;
  restaurant_id: string;
  photo_url: string;
  caption?: string;
  sort_order: number;
  created_at: string;
}

export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  image_url?: string;
  dietary_tags: DietaryTag[];
  spice_level: number; // 0 to 5
  portion_size?: string;
  is_available: boolean;
  sort_order: number;
  is_featured: boolean;
  is_must_try?: boolean;
  view_count: number;
  order_count: number;
  created_at: string;
  updated_at: string;
}

export interface FoodItemPhoto {
  id: string;
  menu_item_id: string;
  photo_url: string;
  created_at: string;
}

export interface Review {
  id: string;
  restaurant_id: string;
  user_name: string;
  user_email?: string;
  rating: number; // 1 to 5
  review_text: string;
  photos: string[];
  is_approved: boolean;
  is_featured: boolean;
  owner_response?: string;
  owner_response_date?: string;
  created_at: string;
}

export type CollectionType = 'Editorial' | 'City-based' | 'Cuisine-based' | 'Occasion-based' | 'Area-Guide';

export interface FamousDishSpotlight {
  name: string;
  why_famous: string;
  restaurant_name: string;
  restaurant_slug?: string;
  price: number;
  image_url?: string;
  is_veg?: boolean;
}

export interface FoodCrawlStop {
  stop_number: number;
  time: string;
  type: string; // e.g. "Appetizer & Momos"
  venue_name: string;
  venue_slug?: string;
  recommended_dish: string;
  distance_to_next?: string;
  note?: string;
}

export interface AreaGuideMetadata {
  area_name: string;
  zone?: string; // 'North Delhi', 'West Delhi', 'Central Delhi', 'South Delhi', etc.
  vibe_badge: string; // e.g. "Buzzing student adda, late-night waffles & pocket-friendly platters."
  famous_for_summary?: string;
  famous_dishes?: FamousDishSpotlight[];
  best_time_to_visit: string;
  nearest_metro: string;
  parking_tips: string;
  avg_cost_for_two: number;
  food_crawl_stops?: FoodCrawlStop[];
  sub_guide_filters?: string[];
  latitude?: number;
  longitude?: number;
}

export interface Collection {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url: string;
  type: CollectionType;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  area_metadata?: AreaGuideMetadata;
  created_at: string;
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  item_type: 'restaurant' | 'menu_item';
  restaurant_id?: string;
  menu_item_id?: string;
  note?: string;
  sort_order: number;
  created_at: string;
}

export interface SearchAnalytic {
  id: string;
  query: string;
  filters?: Record<string, any>;
  results_count: number;
  clicked_item_type?: 'restaurant' | 'food';
  clicked_item_id?: string;
  created_at: string;
}

export interface AdminLog {
  id: string;
  admin_email: string;
  action: string;
  details?: Record<string, any>;
  created_at: string;
}

export interface SiteSettings {
  default_city: string;
  default_lat: number;
  default_lng: number;
  currency_symbol: string;
  contact_email: string;
  brand_primary_color: string;
  brand_accent_color: string;
  feature_reviews: boolean;
  feature_bookmarks: boolean;
  feature_collections: boolean;
  feature_nearby: boolean;
  custom_favicon_url?: string;
}

export interface BookmarkStore {
  restaurants: string[]; // ids
  dishes: string[]; // ids
  collections: string[]; // ids
}

export type ClaimStatus = 'pending_admin_approval' | 'approved' | 'rejected' | 'ownership_active';

export interface RestaurantClaim {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  owner_name: string;
  phone_number: string;
  proof_type: 'fssai' | 'gst' | 'business_card' | 'electricity_bill' | 'menu_card' | 'manager_id';
  proof_reference?: string;
  message?: string;
  status: ClaimStatus;
  admin_notes?: string;
  otp_attempts_count: number; // strictly max 2
  last_otp_sent_at?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RestaurantOwnerAccount {
  id: string;
  phone_number: string;
  owner_name: string;
  restaurant_id: string;
  restaurant_slug: string;
  restaurant_name: string;
  password_hash: string;
  created_at: string;
  last_login_at?: string;
}


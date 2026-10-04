import fs from 'fs';
import path from 'path';

export interface RawVenue {
  name?: string;
  official_name?: string;
  restaurant_number?: number;
  short_description?: string;
  long_description?: string;
  category_ambience?: string;
  cuisine_types?: string[];
  meal_types?: string[];
  price_range?: string;
  average_cost_for_two?: number | string;
  address_line1?: string;
  address_line2?: string;
  full_offline_address?: string;
  landmark?: string;
  nearby_landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  phone_number?: string;
  website_url?: string;
  has_website?: boolean;
  has_independent_website?: boolean;
  is_pure_veg?: boolean;
  dietary_options?: string[];
  facilities?: string[] | string;
  dining_facilities?: string[] | string;
  ambiance_tags?: string[];
  seating_capacity?: number;
  seating_capacity_size?: string;
  opening_time?: string;
  closing_time?: string;
  opening_hours?: any;
  cover_image_url?: string;
  signature_dishes?: string[];
  menu_categories?: Array<{
    name: string;
    items: Array<{
      name?: string;
      dish_name?: string;
      description?: string;
      price: number;
      dietary?: string;
      type?: string;
      spice_level?: number;
      portion_size?: string;
      is_featured?: boolean;
      is_must_try?: boolean;
    }>;
  }>;
  menu_breakdown?: Record<string, Array<{
    dish_name?: string;
    name?: string;
    price: number;
    type?: string;
    dietary?: string;
    description?: string;
  }>>;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

export function cleanCity(rawCity?: string, defaultCity = 'New Delhi'): string {
  if (!rawCity) return defaultCity;
  if (rawCity.includes('**') || rawCity.includes('http') || rawCity.length > 50) {
    if (rawCity.toLowerCase().includes('satya')) return 'Satya Niketan, South Delhi';
    if (rawCity.toLowerCase().includes('malviya') || rawCity.toLowerCase().includes('saket')) return 'Malviya Nagar / Saket, South Delhi';
    if (rawCity.toLowerCase().includes('hauz khas') || rawCity.toLowerCase().includes('sda')) return 'Hauz Khas, South Delhi';
    if (rawCity.toLowerCase().includes('mukherjee')) return 'Mukherjee Nagar, North Delhi';
    if (rawCity.toLowerCase().includes('majnu') || rawCity.toLowerCase().includes('mkt')) return 'Majnu Ka Tilla, North Delhi';
    if (rawCity.toLowerCase().includes('rajendra') || rawCity.toLowerCase().includes('karol bagh')) return 'Karol Bagh / Rajendra Nagar, Central Delhi';
    if (rawCity.toLowerCase().includes('hudson') || rawCity.toLowerCase().includes('kamla')) return 'Hudson Lane / Kamla Nagar, North Delhi';
    return defaultCity;
  }
  return rawCity;
}

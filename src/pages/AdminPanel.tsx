import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  KeyRound, 
  LayoutDashboard, 
  UtensilsCrossed, 
  BookOpen, 
  MessageSquare, 
  Sparkles, 
  BarChart3, 
  Settings, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Upload, 
  Download, 
  Search, 
  Copy, 
  Eye, 
  TrendingUp, 
  Compass, 
  MapPin, 
  Star, 
  AlertTriangle,
  RefreshCw,
  Sliders,
  DollarSign,
  Layers,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Save,
  Navigation,
  Zap,
  Play,
  ShieldCheck,
  Utensils,
  Code2,
  Globe,
  Image as ImageIcon
} from 'lucide-react';
import { applyBrowserFavicon } from '../lib/favicon';
import { 
  Restaurant, 
  MenuCategory, 
  MenuItem, 
  Review, 
  Collection, 
  CollectionItem, 
  SearchAnalytic, 
  SiteSettings,
  DietaryTag,
  DietaryOption,
  MealType,
  PriceRange,
  RestaurantClaim,
  ClaimStatus,
  FamousDishSpotlight,
  FoodCrawlStop
} from '../types/database';
import { 
  api, 
  ADMIN_EMAIL, 
  getCurrentAdminSession, 
  adminLogin, 
  clearAdminSession, 
  slugify, 
  getSavedSupabaseConfig, 
  saveSupabaseConfig,
  getSupabaseClient
} from '../lib/supabase';
import { SUPABASE_SQL_SCHEMA, ICONIC_AREAS_SQL_FEATURE } from '../lib/sqlSchema';
import { MenuMapLogo } from '../components/Logo';
import { useToast } from '../components/Toast';
import { getSmartDishImage, DISH_IMAGE_PRESETS } from '../lib/dishImageRegistry';
import { NANGLOI_50_CAFES_SAMPLE, HUDSON_LANE_50_CAFES_SAMPLE } from '../lib/sample50Cafes';

interface AdminPanelProps {
  navigate: (path: string) => void;
}

export type AdminSection = 
  | 'dashboard'
  | 'ai_scout'
  | 'restaurants'
  | 'map_links'
  | 'menu'
  | 'reviews'
  | 'collections'
  | 'global_food'
  | 'analytics'
  | 'settings'
  | 'owner_claims';

export const AdminPanel: React.FC<AdminPanelProps> = ({ navigate }) => {
  const { showToast } = useToast();

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Active section
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');

  // Loaded Data
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [analytics, setAnalytics] = useState<SearchAnalytic[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [claims, setClaims] = useState<RestaurantClaim[]>([]);

  // Selected Restaurant for Menu Management
  const [selectedRestId, setSelectedRestId] = useState<string>('');

  // Restaurant Edit/Create Modal
  const [restaurantModalOpen, setRestaurantModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Partial<Restaurant>>({});

  // Menu Item Modal
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem>>({});

  // Category Modal
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<MenuCategory>>({});

  // Collection Modal
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Partial<Collection>>({});
  const [collectionItemsSelection, setCollectionItemsSelection] = useState<string[]>([]);
  const [collectionRestFilter, setCollectionRestFilter] = useState('');
  const [showOnlySelectedRests, setShowOnlySelectedRests] = useState(false);

  // Iconic Area Guides & 50-Cafe Importer state
  const [copiedIconicSql, setCopiedIconicSql] = useState(false);
  const [sqlModalOpen, setSqlModalOpen] = useState(false);
  const [bulkAreaModalOpen, setBulkAreaModalOpen] = useState(false);
  const [bulkAreaName, setBulkAreaName] = useState('Nangloi');
  const [bulkAreaZone, setBulkAreaZone] = useState('West Delhi');
  const [bulkAreaVibe, setBulkAreaVibe] = useState('Generous portions, pure desi ghee classics, lively family dining & party addas.');
  const [bulkAreaFamousFor, setBulkAreaFamousFor] = useState('Rich Desi Ghee Thalis, Paneer Tikka Platters, Crispy Momos & Budget Student Addas.');
  const [bulkAreaMetro, setBulkAreaMetro] = useState('Nangloi Metro Station (Green Line), Exit Gate 2');
  const [bulkAreaParking, setBulkAreaParking] = useState('Street parking available along Rohtak Road. E-rickshaws available from Metro.');
  const [bulkAreaCostForTwo, setBulkAreaCostForTwo] = useState(450);
  const [bulkAreaLat, setBulkAreaLat] = useState(28.6833);
  const [bulkAreaLng, setBulkAreaLng] = useState(77.0667);
  const [bulkAreaCafesText, setBulkAreaCafesText] = useState('');
  const [bulkAreaLoading, setBulkAreaLoading] = useState(false);

  // Bulk Menu Import Modal
  const [bulkImportModalOpen, setBulkImportModalOpen] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');
  const [bulkCategoryId, setBulkCategoryId] = useState('');

  // Supabase Config state in Settings
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [writeTestStatus, setWriteTestStatus] = useState<{ checked: boolean; canWrite: boolean; error?: string } | null>(null);
  const [checkingWrite, setCheckingWrite] = useState(false);

  // Global food filter
  const [foodSearch, setFoodSearch] = useState('');

  // AI Restaurant Scout Prompt state
  const [scoutArea, setScoutArea] = useState('Nangloi, West Delhi');
  const [scoutCount, setScoutCount] = useState(5);
  const [scoutPureVeg, setScoutPureVeg] = useState(false);
  const [scoutVibe, setScoutVibe] = useState('dine_in_cafes');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importingJson, setImportingJson] = useState(false);

  const generateScoutPrompt = () => {
    return `### SYSTEM ROLE:
Act as an elite local restaurant scout and living neighborhood food guide editor for Delhi NCR.

### ABOUT OUR PLATFORM:
Platform Name: MenuMap Delhi (https://menumap.delhi)
Mission: MenuMap Delhi is Delhi NCR's dedicated local cafe & restaurant discovery platform and Living Neighborhood Food Guide. Our mission is to digitize and showcase established, quality medium-to-large dine-in cafes and standalone restaurants that DO NOT have their own website. We bring real physical counter menus, genuine counter prices in INR (₹), food item dietary badges (Veg/Non-veg/Vegan), seating vibes, study/work amenities (Wi-Fi, power outlets, quietness), opening hours, exact physical addresses, and geo-coordinates online for food lovers and college students across Delhi NCR.

### TARGET LOCATION & SCOUTING GOAL:
- Target Locality/Area: "${scoutArea}" (Delhi NCR)
- Number of Establishments: Find ${scoutCount} verified dining venues.
${scoutPureVeg ? '- Dietary: STRICTLY PURE VEGETARIAN ONLY.\n' : ''}- Establishment Type: Established, popular MEDIUM-TO-LARGE DINE-IN cafes & restaurants with good seating capacity (e.g., 25-100 seats).

### STRICT CONDITIONS & CONSTRAINTS (CRITICAL):
1. NO WEBSITE: The cafe/restaurant MUST NOT have its own standalone website (e.g., no .com, no custom web ordering portal). They must rely on Google Maps, walk-ins, Instagram, or local word of mouth.
2. NO SMALL VENDORS / STREET CARTS: Do NOT include small street vendors, roadside stalls, food trucks, or tiny takeaway kiosks. Target proper, well-reviewed, medium-to-large dining cafes and family restaurants where people sit down and eat.
3. FULL REAL MENU: Provide the complete, authentic counter menu with real categories (e.g. Starters, Burgers, Momos, Pizza, Pastas, Indian Gravies, Tandoori Breads, Shakes, Beverages, Desserts). All prices MUST be in Indian Rupees (₹) reflecting real counter prices.
4. ACCURATE LOCAL DETAILS: Include exact physical address, landmark, nearest Delhi Metro station, accurate GPS latitude & longitude coordinates, phone number, operating hours, seating capacity, price for two, and amenities (Wi-Fi, Power sockets, AC, Outdoor seating, Parking, Washroom).
5. LIVING NEIGHBORHOOD FOOD GUIDE: Provide the authentic neighborhood narrative: "The Vibe of the Area" badge, 3-5 legendary food items unique to this area, peak vibe hours, nearest metro station & gate, parking realities, and an interactive 3-stop food crawl sequence.

### REQUIRED OUTPUT FORMAT (VALID JSON ONLY):
Return ONLY a valid JSON object matching the exact MenuMap database schema below (no preamble, no markdown chatter outside the code block):

\`\`\`json
{
  "scouted_area": "${scoutArea}",
  "area_food_guide": {
    "title": "${scoutArea} Food Map & Living Neighborhood Guide",
    "zone": "Delhi NCR",
    "vibe_badge": "Catchy 1-line vibe (e.g. 'Buzzing student adda, late-night waffles & pocket-friendly platters.')",
    "famous_for_summary": "Top 3 to 4 famous dishes and specialties of this locality",
    "best_time_to_visit": "e.g. 4:00 PM – 8:30 PM (Evening street snacks & student study sessions)",
    "nearest_metro": "Exact station name, line and gate number (e.g. GTB Nagar Metro Station, Exit Gate 3)",
    "parking_tips": "Practical parking realities (e.g. Street parking is congested; use Metro Multilevel Parking)",
    "avg_cost_for_two": 500,
    "famous_dishes": [
      {
        "name": "Iconic Dish 1",
        "why_famous": "Exact reason (e.g. Simmered for 16 hours with Amul butter)",
        "restaurant_name": "Cafe A",
        "price": 220,
        "is_veg": true
      },
      {
        "name": "Iconic Dish 2",
        "why_famous": "Exact reason (e.g. Double fried panko crusted dumplings with fiery chili dip)",
        "restaurant_name": "Cafe B",
        "price": 180,
        "is_veg": true
      },
      {
        "name": "Iconic Dish 3",
        "why_famous": "Exact reason (e.g. Tall glass layered with Nutella and whole Ferrero rochers)",
        "restaurant_name": "Cafe C",
        "price": 240,
        "is_veg": true
      }
    ],
    "food_crawl_stops": [
      {
        "stop_number": 1,
        "time": "4:00 PM",
        "type": "Appetizers / Momos or Chaat",
        "venue_name": "Cafe A",
        "recommended_dish": "Signature Starter",
        "distance_to_next": "120 meters (2 min walk)",
        "note": "Start before evening crowd peaks"
      },
      {
        "stop_number": 2,
        "time": "5:30 PM",
        "type": "Main Meal / Gourmet Pizza or Dal Makhani",
        "venue_name": "Cafe B",
        "recommended_dish": "Signature Main Course",
        "distance_to_next": "150 meters (2 min walk)",
        "note": "Spacious sit-down dinner with AC"
      },
      {
        "stop_number": 3,
        "time": "7:00 PM",
        "type": "Thick Shake, Waffle, or Kulhad Chai",
        "venue_name": "Cafe C",
        "recommended_dish": "Signature Dessert or Shake",
        "distance_to_next": "End of Crawl",
        "note": "Wind down your tour"
      }
    ]
  },
  "venues": [
    {
      "name": "Cafe / Restaurant Name",
      "short_description": "1-2 lines summarizing atmosphere, seating vibe, and key specialties.",
      "long_description": "Detailed 3-4 sentence paragraph highlighting ambiance, air conditioning, seating comfort, who visits (students, families, couples), and must-try house dishes.",
      "cuisine_types": ["Cafe", "North Indian", "Italian", "Chinese", "Fast Food"],
      "meal_types": ["Breakfast", "Lunch", "Dinner"],
      "price_range": "₹₹",
      "average_cost_for_two": 600,
      "address_line1": "Exact Shop / Plot / Building Number, Road",
      "address_line2": "Block / Sector, Market",
      "landmark": "Near Metro Station / Landmark",
      "city": "${scoutArea}",
      "state": "Delhi",
      "pincode": "110041",
      "latitude": 28.6752,
      "longitude": 77.0588,
      "phone": "+91 98765 43210",
      "website_url": "",
      "has_website": false,
      "is_pure_veg": ${scoutPureVeg},
      "dietary_options": [${scoutPureVeg ? '"Pure Veg"' : '"Veg", "Non-veg"'}],
      "facilities": ["Air Conditioned", "Free Wi-Fi", "Laptop Friendly", "Power Outlets", "Washroom", "Card Payments"],
      "ambiance_tags": ["Cozy", "Lively", "Work Friendly", "Casual Hangout"],
      "seating_capacity": 45,
      "opening_time": "11:00 AM",
      "closing_time": "11:00 PM",
      "cover_image_url": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1000&auto=format&fit=crop&q=80",
      "menu_categories": [
        {
          "name": "Burgers & Sandwiches",
          "items": [
            {
              "name": "Crispy Paneer Supreme Burger",
              "description": "Herb spiced crispy cottage cheese patty, cheddar slice, chipotle mayo, and fresh lettuce.",
              "price": 149,
              "dietary": "Veg",
              "spice_level": 2,
              "portion_size": "1 Piece",
              "is_featured": true,
              "is_must_try": true
            }
          ]
        },
        {
          "name": "Handmade Pizzas & Pastas",
          "items": [
            {
              "name": "Creamy Alfredo Penne",
              "description": "Penne tossed in silky parmesan cream sauce with mushrooms and sweet corn.",
              "price": 219,
              "dietary": "Veg",
              "spice_level": 1,
              "portion_size": "Regular Bowl",
              "is_featured": true,
              "is_must_try": false
            }
          ]
        }
      ]
    }
  ]
}
\`\`\``;
  };

  const handleCopyPrompt = () => {
    const text = generateScoutPrompt();
    try {
      navigator.clipboard.writeText(text);
      setCopiedPrompt(true);
      showToast('AI Scout Master Prompt copied to clipboard! Paste into Gemini, ChatGPT, Claude or Perplexity.', 'success');
      setTimeout(() => setCopiedPrompt(false), 3000);
    } catch (e) {
      showToast('Please select and copy the prompt text manually.', 'info');
    }
  };

  const handleImportScoutJson = async () => {
    if (!importJsonText.trim()) {
      showToast('Please paste the AI JSON response first', 'info');
      return;
    }
    setImportingJson(true);
    try {
      let clean = importJsonText.trim();
      const codeBlockMatch = clean.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        clean = codeBlockMatch[1].trim();
      }
      const data = JSON.parse(clean);
      const venues = data.venues || data.restaurants || (Array.isArray(data) ? data : []);
      if (!Array.isArray(venues) || venues.length === 0) {
        throw new Error('No venues found in JSON. Expected {"venues": [...]}');
      }

      let restCount = 0;
      let dishCount = 0;
      const savedRestaurantIds: string[] = [];
      const savedMustTryDishes: Array<{ name: string; why: string; venue: string; price: number; isVeg: boolean }> = [];

      // If area_food_guide is included, create or update the Living Neighborhood Food Guide collection
      const guideData = data.area_food_guide || data.area_guide;
      let targetCollectionId: string | null = null;

      for (const venue of venues) {
        const savedRest = await api.saveRestaurant({
          name: venue.name,
          slug: slugify(venue.name),
          short_description: venue.short_description || `Popular dine-in cafe in ${scoutArea}`,
          long_description: venue.long_description || '',
          cuisine_types: venue.cuisine_types || ['Cafe', 'Fast Food'],
          meal_types: venue.meal_types || ['Lunch', 'Dinner'],
          price_range: venue.price_range || '₹₹',
          average_cost_for_two: venue.average_cost_for_two || 500,
          address_line1: venue.address_line1 || venue.address || '',
          landmark: venue.landmark || '',
          city: venue.city || scoutArea,
          state: 'Delhi',
          pincode: venue.pincode || '',
          latitude: Number(venue.latitude) || 28.6752,
          longitude: Number(venue.longitude) || 77.0588,
          phone: venue.phone || '',
          website_url: '',
          dietary_options: venue.dietary_options || (venue.is_pure_veg ? ['Pure Veg'] : ['Veg', 'Non-veg']),
          facilities: venue.facilities || ['Air Conditioned', 'Free Wi-Fi', 'Washroom'],
          ambience_tags: venue.ambiance_tags || venue.ambience_tags || ['Cozy', 'Casual'],
          dine_in_available: true,
          cover_image_url: venue.cover_image_url || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1000&auto=format&fit=crop&q=80',
          is_active: true,
          is_open: true,
        });

        restCount++;
        savedRestaurantIds.push(savedRest.id);

        const categories = venue.menu_categories || venue.categories || [];
        for (let cIdx = 0; cIdx < categories.length; cIdx++) {
          const cat = categories[cIdx];
          const savedCat = await api.saveCategory({
            restaurant_id: savedRest.id,
            name: cat.name || 'Specialties',
            sort_order: cIdx + 1,
            is_active: true,
          });

          const items = cat.items || cat.menu_items || [];
          for (let iIdx = 0; iIdx < items.length; iIdx++) {
            const item = items[iIdx];
            const itemName = item.name || 'Dish';
            const isVeg = item.dietary ? !item.dietary.toLowerCase().includes('non') : true;

            const savedItem = await api.saveMenuItem({
              restaurant_id: savedRest.id,
              category_id: savedCat.id,
              name: itemName,
              slug: slugify(`${itemName}-${Date.now().toString().slice(-4)}`),
              description: item.description || '',
              price: Number(item.price) || 120,
              image_url: item.image_url || getSmartDishImage(itemName),
              dietary_tags: [item.dietary || (venue.is_pure_veg ? 'Veg' : 'Veg')],
              spice_level: item.spice_level ?? 1,
              portion_size: item.portion_size || 'Regular',
              is_available: true,
              is_featured: item.is_featured ?? false,
              is_must_try: item.is_must_try ?? false,
              sort_order: iIdx + 1,
            });
            dishCount++;

            if (item.is_must_try || item.is_featured) {
              savedMustTryDishes.push({
                name: itemName,
                why: item.description || `Signature house specialty at ${savedRest.name}`,
                venue: savedRest.name,
                price: Number(item.price) || 120,
                isVeg,
              });
            }
          }
        }
      }

      // Auto-create or sync Area Guide collection with rich metadata
      const areaTitle = guideData?.title || `${scoutArea} Living Neighborhood Food Guide`;
      const areaSlug = slugify(scoutArea + '-food-guide');
      const existingCollections = await api.getCollections(false);
      let targetCol = existingCollections.find((c) => c.slug === areaSlug || c.title.toLowerCase().includes(scoutArea.toLowerCase()));

      const finalDishes = guideData?.famous_dishes && guideData.famous_dishes.length > 0 
        ? guideData.famous_dishes 
        : savedMustTryDishes.slice(0, 5).map((d) => ({
            name: d.name,
            why_famous: d.why,
            restaurant_name: d.venue,
            price: d.price,
            image_url: getSmartDishImage(d.name),
            is_veg: d.isVeg,
          }));

      const areaMetadata = {
        area_name: scoutArea,
        zone: guideData?.zone || 'Delhi NCR',
        vibe_badge: guideData?.vibe_badge || `Authentic ${scoutArea} dine-in cafes & local specialties`,
        famous_for_summary: guideData?.famous_for_summary || `Legendary dishes and verified counter menus in ${scoutArea}`,
        best_time_to_visit: guideData?.best_time_to_visit || '4:00 PM – 9:00 PM (Lively evening dining crowds)',
        nearest_metro: guideData?.nearest_metro || `${scoutArea} Metro Station`,
        parking_tips: guideData?.parking_tips || 'Street parking available; arrive early on weekends',
        avg_cost_for_two: guideData?.avg_cost_for_two || 500,
        sub_guide_filters: [
          'Pocket-Friendly Student Addas',
          'Date Night & Aesthetic Photos',
          'Family Dining & Royal Platters',
          'Quick Evening Chai & Bites'
        ],
        famous_dishes: finalDishes,
        food_crawl_stops: guideData?.food_crawl_stops || [
          {
            stop_number: 1,
            time: '4:30 PM',
            type: 'Crispy Appetizers & Snacks',
            venue_name: venues[0]?.name || 'Cafe 1',
            recommended_dish: 'Crispy Starters & Kulhad Chai',
            distance_to_next: '150 meters (2 min walk)',
            note: 'Kick off your evening trail'
          },
          {
            stop_number: 2,
            time: '6:00 PM',
            type: 'Main Sit-Down Dinner',
            venue_name: venues[1]?.name || venues[0]?.name || 'Cafe 2',
            recommended_dish: 'House Special Pizzas & North Indian Mains',
            distance_to_next: '120 meters (2 min walk)',
            note: 'Spacious AC dining'
          },
          {
            stop_number: 3,
            time: '7:45 PM',
            type: 'Dessert, Shakes & Chai Finish',
            venue_name: venues[2]?.name || venues[0]?.name || 'Cafe 3',
            recommended_dish: 'Overload Thickshake or Hot Waffle',
            distance_to_next: 'End of Crawl',
            note: 'Sweet finish to the neighborhood crawl'
          }
        ]
      };

      const savedCollection = await api.saveCollection({
        id: targetCol ? targetCol.id : undefined,
        title: areaTitle,
        slug: targetCol ? targetCol.slug : areaSlug,
        description: guideData?.famous_for_summary || `Complete living food guide for ${scoutArea} with verified counter menus, prices, and 3-stop food crawl.`,
        cover_image_url: venues[0]?.cover_image_url || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1000&auto=format&fit=crop&q=80',
        type: 'Area-Guide',
        is_featured: true,
        is_active: true,
        sort_order: 1,
        area_metadata: areaMetadata,
      });

      // Auto-tag all saved restaurants into this collection
      for (let i = 0; i < savedRestaurantIds.length; i++) {
        await api.saveCollectionItem({
          collection_id: savedCollection.id,
          item_type: 'restaurant',
          restaurant_id: savedRestaurantIds[i],
          sort_order: i + 1,
          note: `Verified dine-in spot in ${scoutArea}`,
        });
      }

      await loadAllAdminData();
      setImportJsonText('');
      showToast(`Successfully created Living Guide for "${scoutArea}" with ${restCount} cafes, ${dishCount} dishes, and 3-stop crawl!`, 'success');
      setActiveSection('collections');
    } catch (err: any) {
      console.error('Import error:', err);
      showToast(`Import failed: ${err.message || 'Invalid JSON format'}`, 'error');
    } finally {
      setImportingJson(false);
    }
  };

  // Map Links Manager state
  const [mapLinksSearch, setMapLinksSearch] = useState('');
  const [mapLinksFilter, setMapLinksFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [copiedRestId, setCopiedRestId] = useState<string | null>(null);
  const [togglingMapDoneId, setTogglingMapDoneId] = useState<string | null>(null);

  // Fast 1-Click "Start": Copy link, open Google Maps profile in new tab, and mark as Done
  const handleStartRestaurantMap = (r: Restaurant) => {
    // 1. Copy live restaurant link to clipboard immediately
    const url = `${window.location.origin}/restaurant/${r.slug}`;
    try {
      navigator.clipboard.writeText(url);
      setCopiedRestId(r.id);
      setTimeout(() => setCopiedRestId(null), 2500);
    } catch (e) {
      console.warn('Clipboard write error:', e);
    }

    // 2. Open Google Maps profile in a new window/tab immediately
    const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r.name}, ${r.address_line1}, ${r.city}`)}`;
    window.open(searchUrl, '_blank', 'noopener,noreferrer');

    // 3. Fast optimistic update: mark Done immediately in UI state
    setRestaurants((prev) =>
      prev.map((item) => (item.id === r.id ? { ...item, map_profile_done: true } : item))
    );
    showToast(`⚡ Link copied & Google Maps opened for ${r.name}! Marked as Done.`, 'success');

    // 4. Background persist to database and persistent store
    api.updateRestaurant(r.id, { map_profile_done: true }).catch((err) => {
      console.error('Failed to sync done status to database:', err);
    });
  };

  const handleCopyRestaurantLink = (r: Restaurant) => {
    const url = `${window.location.origin}/restaurant/${r.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedRestId(r.id);
    showToast(`Copied restaurant link for ${r.name}!`, 'success');
    setTimeout(() => setCopiedRestId(null), 2500);
  };

  const handleToggleMapDone = async (restId: string, newStatus: boolean) => {
    setTogglingMapDoneId(restId);
    try {
      const updated = await api.updateRestaurant(restId, { map_profile_done: newStatus });
      if (updated) {
        setRestaurants((prev) =>
          prev.map((r) => (r.id === restId ? { ...r, map_profile_done: newStatus } : r))
        );
        showToast(
          newStatus
            ? `✓ Marked "${updated.name}" as Done!`
            : `Marked "${updated.name}" as Not Done (Pending).`,
          newStatus ? 'success' : 'info'
        );
      }
    } catch (e) {
      showToast('Could not update status.', 'error');
    } finally {
      setTogglingMapDoneId(null);
    }
  };

  const handleExportMapDoneBackup = () => {
    const doneIds = restaurants.filter(r => r.map_profile_done).map(r => r.id);
    const dataStr = JSON.stringify({ doneCount: doneIds.length, doneIds, exportedAt: new Date().toISOString() });
    navigator.clipboard.writeText(dataStr);
    showToast(`Copied progress backup (${doneIds.length} done cafes) to clipboard!`, 'success');
  };

  const handleImportMapDoneBackup = async () => {
    const input = window.prompt('Paste your exported progress JSON:');
    if (!input) return;
    try {
      const parsed = JSON.parse(input);
      const ids: string[] = Array.isArray(parsed) ? parsed : Array.isArray(parsed.doneIds) ? parsed.doneIds : [];
      if (ids.length === 0) {
        showToast('No valid restaurant IDs found in backup.', 'error');
        return;
      }
      for (const id of ids) {
        await api.updateRestaurant(id, { map_profile_done: true });
      }
      setRestaurants(prev => prev.map(r => ids.includes(r.id) ? { ...r, map_profile_done: true } : r));
      showToast(`Restored ${ids.length} cafes marked as Done!`, 'success');
    } catch (e) {
      showToast('Invalid backup JSON format.', 'error');
    }
  };

  useEffect(() => {
    checkAdminGuard();
  }, []);

  const checkAdminGuard = () => {
    const session = getCurrentAdminSession();
    if (session && session.email === ADMIN_EMAIL) {
      setIsAuthenticated(true);
      loadAllAdminData();
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [rests, items, revs, cols, anl, sets, allClaims] = await Promise.all([
        api.getRestaurants(false),
        api.getMenuItems(),
        api.getReviews(undefined, false),
        api.getCollections(false),
        api.getSearchAnalytics(),
        api.getSettings(),
        api.getRestaurantClaims(),
      ]);

      setRestaurants(rests);
      setMenuItems(items);
      setReviews(revs);
      setCollections(cols);
      setAnalytics(anl);
      setSettings(sets);
      setClaims(allClaims || []);

      if (rests.length > 0 && !selectedRestId) {
        setSelectedRestId(rests[0].id);
        const cats = await api.getCategories(rests[0].id);
        setCategories(cats);
      }

      const cfg = getSavedSupabaseConfig();
      setSupabaseUrl(cfg.url);
      setSupabaseAnonKey(cfg.anonKey);
    } catch (e) {
      console.error('Error loading admin data:', e);
      showToast('Error loading database records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClaim = async (claimId: string) => {
    try {
      const updated = await api.updateClaimStatus(claimId, 'approved', 'Approved by administrator');
      if (updated) {
        setClaims((prev) => prev.map((c) => (c.id === claimId ? updated : c)));
        showToast(
          `✓ Approved claim for "${updated.restaurant_name}"! Owner can now verify via Twilio OTP (Max 2 attempts).`,
          'success'
        );
      }
    } catch (e) {
      showToast('Failed to approve claim.', 'error');
    }
  };

  const handleRejectClaim = async (claimId: string) => {
    const reason = window.prompt('Enter reason for rejection:') || 'Business credentials could not be verified.';
    try {
      const updated = await api.updateClaimStatus(claimId, 'rejected', reason);
      if (updated) {
        setClaims((prev) => prev.map((c) => (c.id === claimId ? updated : c)));
        showToast('Claim request rejected.', 'info');
      }
    } catch (e) {
      showToast('Failed to reject claim.', 'error');
    }
  };

  // Change selected restaurant for menu management
  const handleSelectRestaurant = async (id: string) => {
    setSelectedRestId(id);
    const [cats, allItems] = await Promise.all([
      api.getCategories(id),
      api.getMenuItems(),
    ]);
    setCategories(cats);
    setMenuItems(allItems);
  };

  // Handle Login Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    const normalizedEmail = loginEmail.trim().toLowerCase();
    if (normalizedEmail !== ADMIN_EMAIL) {
      setLoginLoading(false);
      setLoginError(`Unauthorized: Only the designated admin account (${ADMIN_EMAIL}) is permitted.`);
      showToast('Unauthorized access. Redirecting...', 'error');
      setTimeout(() => navigate('/'), 2000);
      return;
    }

    const res = await adminLogin(loginPassword, normalizedEmail);
    setLoginLoading(false);

    if (res.success) {
      setIsAuthenticated(true);
      showToast('Welcome back, Administrator!', 'success');
      loadAllAdminData();
    } else {
      setLoginError(res.error || 'Invalid administrator password.');
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    setIsAuthenticated(false);
    showToast('Signed out of admin panel.', 'info');
    navigate('/');
  };

  // --------------------------------------------------------------------------
  // RESTAURANTS CRUD HANDLERS
  // --------------------------------------------------------------------------
  const handleOpenAddRestaurant = () => {
    setEditingRestaurant({
      name: '',
      slug: '',
      short_description: '',
      long_description: '',
      cuisine_types: ['Cafe', 'Bakes'],
      meal_types: ['Breakfast', 'Lunch', 'Dinner'],
      price_range: '₹₹',
      average_cost_for_two: 600,
      address_line1: '',
      city: settings?.default_city || 'Delhi NCR',
      state: 'Delhi',
      pincode: '110001',
      country: 'India',
      latitude: settings?.default_lat || 28.6139,
      longitude: settings?.default_lng || 77.2090,
      phone: '',
      whatsapp_number: '',
      email: '',
      website_url: '',
      cover_image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1000&auto=format&fit=crop&q=80',
      is_open: true,
      delivery_available: true,
      takeaway_available: true,
      dine_in_available: true,
      facilities: ['WiFi', 'Air Conditioned', 'Outdoor Seating'],
      dietary_options: ['Vegan Options'],
      rating_avg: 4.5,
      rating_count: 1,
      is_featured: false,
      is_active: true,
      is_temporarily_closed: false,
      temporary_closed_reason: '',
      known_for_dishes: [],
    });
    setRestaurantModalOpen(true);
  };

  const handleSaveRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRestaurant.name?.trim()) {
      showToast('Restaurant name is required.', 'error');
      return;
    }
    try {
      const saved = await api.saveRestaurant(editingRestaurant);
      await api.logAdminAction('Saved restaurant', { name: saved.name, id: saved.id });
      setRestaurantModalOpen(false);
      showToast(`Restaurant "${saved.name}" saved successfully!`, 'success');
      loadAllAdminData();
    } catch (err: any) {
      showToast('Failed to save restaurant.', 'error');
    }
  };

  const handleDeleteRestaurant = async (id: string, name: string) => {
    if (window.confirm(`Permanently delete restaurant "${name}" and all its menu categories, items, and reviews?`)) {
      await api.deleteRestaurant(id);
      await api.logAdminAction('Deleted restaurant', { name, id });
      showToast(`Deleted ${name}.`, 'info');
      loadAllAdminData();
    }
  };

  // --------------------------------------------------------------------------
  // CATEGORIES CRUD
  // --------------------------------------------------------------------------
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestId || !editingCategory.name?.trim()) return;
    try {
      await api.saveCategory({
        ...editingCategory,
        restaurant_id: selectedRestId,
      });
      setCategoryModalOpen(false);
      showToast('Menu category saved!', 'success');
      const cats = await api.getCategories(selectedRestId);
      setCategories(cats);
    } catch (err) {
      showToast('Failed to save category', 'error');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (window.confirm(`Delete category "${name}" and its associated dishes?`)) {
      await api.deleteCategory(id);
      showToast(`Deleted category ${name}.`, 'info');
      const cats = await api.getCategories(selectedRestId);
      setCategories(cats);
      const items = await api.getMenuItems(selectedRestId);
      setMenuItems(items);
    }
  };

  // --------------------------------------------------------------------------
  // MENU ITEMS CRUD
  // --------------------------------------------------------------------------
  const handleOpenAddItem = () => {
    if (categories.length === 0) {
      showToast('Please create at least one category first (e.g. Beverages or Starters).', 'info');
      setCategoryModalOpen(true);
      setEditingCategory({ name: 'Specialties', sort_order: 1, is_active: true });
      return;
    }
    setEditingItem({
      restaurant_id: selectedRestId,
      category_id: categories[0]?.id,
      name: '',
      slug: '',
      description: '',
      price: 250,
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
      dietary_tags: ['Veg'],
      spice_level: 0,
      portion_size: 'Regular',
      is_available: true,
      is_featured: false,
      sort_order: 0,
    });
    setItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem.name?.trim() || !editingItem.category_id) {
      showToast('Item name and category are required.', 'error');
      return;
    }
    try {
      await api.saveMenuItem({
        ...editingItem,
        restaurant_id: selectedRestId,
      });
      setItemModalOpen(false);
      showToast('Menu dish saved successfully!', 'success');
      const items = await api.getMenuItems();
      setMenuItems(items);
    } catch (e) {
      showToast('Failed to save dish.', 'error');
    }
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (window.confirm(`Delete menu item "${name}"?`)) {
      await api.deleteMenuItem(id);
      showToast(`Deleted ${name}.`, 'info');
      const items = await api.getMenuItems();
      setMenuItems(items);
    }
  };

  // Bulk Menu Import
  const handleBulkImport = async () => {
    if (!bulkCategoryId) {
      showToast('Please select a category for imported items.', 'error');
      return;
    }
    if (!bulkImportText.trim()) {
      showToast('Please enter CSV or JSON menu data.', 'error');
      return;
    }

    try {
      let itemsToCreate: Array<Partial<MenuItem>> = [];
      const trimmed = bulkImportText.trim();

      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const parsed = JSON.parse(trimmed);
        const array = Array.isArray(parsed) ? parsed : [parsed];
        itemsToCreate = array.map((p) => ({
          name: p.name || 'Dish',
          price: Number(p.price) || 199,
          description: p.description || '',
          dietary_tags: p.dietary_tags || ['Veg'],
          spice_level: Number(p.spice_level) || 0,
          portion_size: p.portion_size || 'Regular',
          image_url: p.image_url || '',
        }));
      } else {
        // CSV parsing: Name, Price, Description, Dietary
        const lines = trimmed.split('\n');
        for (const line of lines) {
          const parts = line.split(',');
          if (parts[0] && parts[0].trim()) {
            itemsToCreate.push({
              name: parts[0].trim(),
              price: Number(parts[1]?.trim()) || 199,
              description: parts[2]?.trim() || '',
              dietary_tags: (parts[3]?.trim() as any) ? [parts[3].trim() as any] : ['Veg'],
            });
          }
        }
      }

      for (const item of itemsToCreate) {
        await api.saveMenuItem({
          ...item,
          restaurant_id: selectedRestId,
          category_id: bulkCategoryId,
          is_available: true,
        });
      }

      showToast(`Imported ${itemsToCreate.length} menu items successfully!`, 'success');
      setBulkImportModalOpen(false);
      setBulkImportText('');
      const items = await api.getMenuItems();
      setMenuItems(items);
    } catch (err: any) {
      showToast(`Bulk import error: ${err.message}`, 'error');
    }
  };

  // --------------------------------------------------------------------------
  // COLLECTIONS & ICONIC AREA GUIDES CRUD
  // --------------------------------------------------------------------------
  const copyIconicSql = () => {
    navigator.clipboard.writeText(ICONIC_AREAS_SQL_FEATURE);
    setCopiedIconicSql(true);
    showToast('Iconic Area Guides Supabase SQL copied to clipboard! Paste into Supabase SQL Editor.', 'success');
    setTimeout(() => setCopiedIconicSql(false), 3000);
  };

  const handleBulkImportAreaCafes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkAreaName.trim()) {
      showToast('Area Name is required.', 'error');
      return;
    }
    if (!bulkAreaCafesText.trim()) {
      showToast('Please paste your list of cafes.', 'error');
      return;
    }
    setBulkAreaLoading(true);
    try {
      const res = await api.bulkImportAreaWithRestaurants({
        areaName: bulkAreaName.trim(),
        zone: bulkAreaZone,
        vibeBadge: bulkAreaVibe,
        famousForSummary: bulkAreaFamousFor,
        nearestMetro: bulkAreaMetro,
        parkingTips: bulkAreaParking,
        avgCostForTwo: Number(bulkAreaCostForTwo) || 450,
        latitude: Number(bulkAreaLat) || 28.6833,
        longitude: Number(bulkAreaLng) || 77.0667,
        rawCafesData: bulkAreaCafesText,
      });
      showToast(res.message, 'success');
      setBulkAreaModalOpen(false);
      setBulkAreaCafesText('');
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to import cafes.', 'error');
    } finally {
      setBulkAreaLoading(false);
    }
  };

  const handleOpenAddCollection = (type: 'Area-Guide' | 'Editorial' = 'Area-Guide') => {
    setEditingCollection({
      title: '',
      slug: '',
      description: '',
      cover_image_url: type === 'Area-Guide'
        ? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80',
      type: type,
      is_featured: true,
      is_active: true,
      sort_order: 0,
      area_metadata: type === 'Area-Guide' ? {
        area_name: '',
        zone: 'North Delhi',
        vibe_badge: 'Buzzing food hub with lively atmosphere and great prices.',
        famous_for_summary: 'Celebrated for iconic dishes, budget addas, and popular hangout spots.',
        best_time_to_visit: '5:00 PM – 11:30 PM',
        nearest_metro: '',
        parking_tips: 'Street parking available nearby.',
        avg_cost_for_two: 500,
        latitude: 28.6139,
        longitude: 77.2090,
        sub_guide_filters: ['Top Cafes', 'Budget Addas', 'Late Night', 'Sweet Treats'],
        famous_dishes: [],
        food_crawl_stops: [],
      } : undefined,
    });
    setCollectionItemsSelection([]);
    setCollectionModalOpen(true);
  };

  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollection.title?.trim()) {
      showToast('Collection title is required.', 'error');
      return;
    }
    try {
      const saved = await api.saveCollection(editingCollection);
      // Map selected restaurants into collection items
      const items = collectionItemsSelection.map((rid) => ({
        item_type: 'restaurant' as const,
        id: rid,
      }));
      await api.setCollectionItems(saved.id, items);
      setCollectionModalOpen(false);
      showToast('Collection saved!', 'success');
      loadAllAdminData();
    } catch (err) {
      showToast('Failed to save collection.', 'error');
    }
  };

  const handleDeleteCollection = async (id: string, title: string) => {
    if (window.confirm(`Delete collection "${title}"?`)) {
      await api.deleteCollection(id);
      showToast(`Deleted ${title}.`, 'info');
      loadAllAdminData();
    }
  };

  // --------------------------------------------------------------------------
  // REVIEWS MODERATION
  // --------------------------------------------------------------------------
  const handleToggleReviewApproval = async (rev: Review) => {
    await api.updateReview(rev.id, { is_approved: !rev.is_approved });
    showToast(`Review marked as ${!rev.is_approved ? 'Approved' : 'Hidden'}.`, 'info');
    const revs = await api.getReviews(undefined, false);
    setReviews(revs);
  };

  const handleToggleReviewFeatured = async (rev: Review) => {
    await api.updateReview(rev.id, { is_featured: !rev.is_featured });
    showToast(`Review marked as ${!rev.is_featured ? 'Featured' : 'Regular'}.`, 'info');
    const revs = await api.getReviews(undefined, false);
    setReviews(revs);
  };

  const handleOwnerReply = async (revId: string) => {
    const reply = window.prompt('Enter official restaurant reply:');
    if (reply !== null) {
      await api.updateReview(revId, {
        owner_response: reply,
        owner_response_date: new Date().toISOString(),
      });
      showToast('Owner reply saved!', 'success');
      const revs = await api.getReviews(undefined, false);
      setReviews(revs);
    }
  };

  // --------------------------------------------------------------------------
  // SETTINGS & SUPABASE CONFIG
  // --------------------------------------------------------------------------
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    await api.saveSettings(settings);
    saveSupabaseConfig({ url: supabaseUrl, anonKey: supabaseAnonKey });
    if (settings.custom_favicon_url) {
      applyBrowserFavicon(settings.custom_favicon_url);
    } else {
      applyBrowserFavicon('/favicon.svg');
    }
    showToast('Admin settings & Chrome Tab Logo updated!', 'success');
  };

  const handleFaviconFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Favicon file must be under 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl && settings) {
        setSettings({ ...settings, custom_favicon_url: dataUrl });
        applyBrowserFavicon(dataUrl);
        showToast('Chrome tab icon applied in browser! Remember to click Save Settings.', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const [syncingCloud, setSyncingCloud] = useState(false);

  const handleSyncCloud = async () => {
    setSyncingCloud(true);
    try {
      const res = await api.syncAllToSupabase();
      if (res.success) {
        showToast(res.message, 'success');
        loadAllAdminData();
      } else {
        showToast(res.message, 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to sync to Supabase.', 'error');
    } finally {
      setSyncingCloud(false);
    }
  };

  const copySqlSchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    showToast('Full PostgreSQL schema copied to clipboard! Paste it into Supabase SQL Editor.', 'success');
    setTimeout(() => setCopiedSchema(false), 3000);
  };

  const handleTestWrite = async () => {
    setCheckingWrite(true);
    try {
      const res = await api.checkSupabaseWriteAccess();
      setWriteTestStatus({ checked: true, canWrite: res.canWrite, error: res.error });
      if (res.canWrite) {
        showToast('Supabase write test passed! Cloud database writes are active.', 'success');
      } else {
        showToast(`Supabase write blocked: ${res.error || 'Row Level Security policy active'}. Run Safe SQL in Database Setup.`, 'error');
      }
    } catch (e: any) {
      setWriteTestStatus({ checked: true, canWrite: false, error: e?.message });
    } finally {
      setCheckingWrite(false);
    }
  };

  // --------------------------------------------------------------------------
  // UN-AUTHENTICATED LOGIN SCREEN
  // --------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-stone-100 via-stone-50 to-orange-50/40">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-stone-200 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-white p-2 flex items-center justify-center mx-auto shadow-md shadow-orange-500/20 border border-orange-100">
              <MenuMapLogo className="w-full h-full" />
            </div>
            <h1 className="font-heading font-black text-2xl text-slate-900 tracking-tight">
              Admin Access Gate
            </h1>
            <p className="text-xs text-slate-500">
              Restricted portal. Only authorized management credentials may proceed.
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="xyzapplywork@gmail.com"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:border-rose-500 font-medium"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Required account: <strong className="text-slate-600">{ADMIN_EMAIL}</strong>
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:border-rose-500 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-sm rounded-2xl shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {loginLoading ? 'Verifying Credentials...' : 'Authenticate Admin'}
            </button>
          </form>

          <div className="pt-4 border-t border-stone-100 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              ← Return to Home
            </button>
          </div>

        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // AUTHENTICATED ADMIN DASHBOARD
  // --------------------------------------------------------------------------
  const currentRestaurant = restaurants.find((r) => r.id === selectedRestId);
  const currentMenuItems = menuItems.filter((i) => i.restaurant_id === selectedRestId);

  return (
    <div className="min-h-screen bg-stone-50/60 pb-20">
      
      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-40 bg-stone-900 text-white border-b border-stone-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs">
              <MenuMapLogo className="w-full h-full" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-base tracking-tight text-white">
                Menu Map Admin
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {ADMIN_EMAIL}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-xs font-bold text-stone-300 hover:text-white px-3 py-1.5 rounded-xl hover:bg-stone-800 transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-teal-400" />
              <span>Live Site</span>
            </button>

            <button
              onClick={handleLogout}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-xl hover:bg-stone-800 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Section Tabs Bar */}
      <div className="bg-white border-b border-stone-200 shadow-2xs sticky top-16 z-30 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 sm:gap-2 py-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'ai_scout', label: 'AI Restaurant Scout', icon: Sparkles },
            { id: 'restaurants', label: `Restaurants (${restaurants.length})`, icon: UtensilsCrossed },
            { 
              id: 'map_links', 
              label: `Map Links (${restaurants.filter(r => r.map_profile_done).length}/${restaurants.length} Done)`, 
              icon: MapPin 
            },
            { id: 'menu', label: 'Menu Management', icon: Layers },
            { id: 'global_food', label: `All Dishes (${menuItems.length})`, icon: BookOpen },
            { id: 'reviews', label: `Reviews (${reviews.length})`, icon: MessageSquare },
            { 
              id: 'owner_claims', 
              label: `Owner Claims (${claims.filter(c => c.status === 'pending_admin_approval').length})`, 
              icon: ShieldCheck 
            },
            { id: 'collections', label: `Collections (${collections.length})`, icon: Sparkles },
            { id: 'analytics', label: 'Search Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Settings & Supabase', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as AdminSection)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-stone-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Admin Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ================================================================ */}
        {/* 1. DASHBOARD OVERVIEW */}
        {/* ================================================================ */}
        {activeSection === 'dashboard' && (
          <div className="space-y-8">
            
            {/* Quick KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-1">
                <span className="text-xs font-bold text-slate-500">Total Cafes & Venues</span>
                <div className="text-3xl font-heading font-black text-slate-900">
                  {restaurants.length}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold">
                  {restaurants.filter((r) => r.is_active).length} active on live site
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-1">
                <span className="text-xs font-bold text-slate-500">Total Menu Dishes</span>
                <div className="text-3xl font-heading font-black text-slate-900">
                  {menuItems.length}
                </div>
                <div className="text-[11px] text-teal-600 font-semibold">
                  {menuItems.filter((i) => i.is_available).length} available to order
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-1">
                <span className="text-xs font-bold text-slate-500">Moderated Reviews</span>
                <div className="text-3xl font-heading font-black text-slate-900">
                  {reviews.length}
                </div>
                <div className="text-[11px] text-amber-600 font-semibold">
                  {reviews.filter((r) => r.is_approved).length} approved
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-1">
                <span className="text-xs font-bold text-slate-500">Curated Collections</span>
                <div className="text-3xl font-heading font-black text-slate-900">
                  {collections.length}
                </div>
                <div className="text-[11px] text-purple-600 font-semibold">
                  {collections.filter((c) => c.is_featured).length} featured on homepage
                </div>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-amber-500/10 rounded-3xl p-6 border border-orange-200/80 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-slate-900">
                  Ready to add new cafe or food data?
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  The live website reflects changes instantly without hardcoded placeholders.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setActiveSection('ai_scout')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>AI Restaurant Finder Prompt</span>
                </button>

                <button
                  onClick={handleOpenAddRestaurant}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Restaurant</span>
                </button>

                <button
                  onClick={() => {
                    setActiveSection('menu');
                    if (restaurants.length > 0) handleOpenAddItem();
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Menu Dish</span>
                </button>

                <button
                  onClick={() => handleOpenAddCollection('Area-Guide')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-stone-900 hover:bg-black text-white font-bold text-xs shadow-md transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>New Collection</span>
                </button>

                <button
                  onClick={() => setActiveSection('map_links')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
                >
                  <MapPin className="w-4 h-4 text-white" />
                  <span>Map Links ({restaurants.filter(r => r.map_profile_done).length}/${restaurants.length})</span>
                </button>
              </div>
            </div>

            {/* Recent Search Queries & Top Items from Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Analytics preview */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-rose-500" />
                    <h3 className="font-heading font-extrabold text-base text-slate-900">
                      Recent Search Activity
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveSection('analytics')}
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    View All →
                  </button>
                </div>

                {analytics.length > 0 ? (
                  <div className="space-y-2 text-xs">
                    {analytics.slice(0, 5).map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100"
                      >
                        <span className="font-bold text-slate-800">"{a.query}"</span>
                        <span className="text-slate-400">
                          {a.results_count} results •{' '}
                          {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No search logs yet.</p>
                )}
              </div>

              {/* Status summary */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-orange-500" />
                  <h3 className="font-heading font-extrabold text-base text-slate-900">
                    Database Health
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center p-3 rounded-2xl bg-stone-50">
                    <span className="font-medium text-slate-600">PostgreSQL / Supabase Adapter</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Active & Syncing
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-2xl bg-stone-50">
                    <span className="font-medium text-slate-600">Admin Authentication</span>
                    <span className="font-bold text-slate-800">{ADMIN_EMAIL}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-2xl bg-stone-50">
                    <span className="font-medium text-slate-600">Default Discovery City</span>
                    <span className="font-bold text-slate-800">{settings?.default_city || 'Delhi NCR'}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================================================================ */}
        {/* AI RESTAURANT SCOUT & MENU PROMPT GENERATOR */}
        {/* ================================================================ */}
        {activeSection === 'ai_scout' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-orange-600 via-rose-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="max-w-3xl space-y-3 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider text-white">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>AI Scout Prompt Builder & Instant Importer</span>
                </div>
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight">
                  Find Dine-In Cafes & Full Menus with AI
                </h2>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  Use this master prompt with Gemini, ChatGPT, Claude, or Perplexity to discover established, medium-to-large dine-in cafes with full categorised menus, genuine counter prices, and zero existing websites. Then paste the AI response below to import them into MenuMap in 1 click!
                </p>
              </div>
            </div>

            {/* Config & Prompt Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Config Controls (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-5">
                  <h3 className="font-heading font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-orange-500" />
                    <span>Target Parameters</span>
                  </h3>

                  {/* Locality Input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Target Area / Locality (Delhi NCR)
                    </label>
                    <input
                      type="text"
                      value={scoutArea}
                      onChange={(e) => setScoutArea(e.target.value)}
                      placeholder="e.g. Nangloi, West Delhi or Rajouri Garden"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-orange-400"
                    />
                    {/* Quick Area Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        'Nangloi, West Delhi',
                        'Hudson Lane, North Campus',
                        'Rajouri Garden',
                        'Connaught Place',
                        'Hauz Khas Village',
                        'Dwarka Sector 12',
                        'Pitampura / NSP',
                        'Chandni Chowk, Old Delhi',
                      ].map((area) => (
                        <button
                          key={area}
                          type="button"
                          onClick={() => setScoutArea(area)}
                          className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                            scoutArea === area
                              ? 'bg-rose-50 text-rose-700 border-rose-300 font-bold'
                              : 'bg-stone-50 text-slate-600 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {area.split(',')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity selector */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Number of Establishments to Scout
                    </label>
                    <div className="flex items-center gap-2">
                      {[3, 5, 8, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setScoutCount(num)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                            scoutCount === num
                              ? 'bg-rose-500 text-white border-rose-500 shadow-2xs'
                              : 'bg-stone-50 text-slate-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {num} Cafes
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Strict Conditions Checklist (Auto-enforced) */}
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                      Auto-Enforced Rules
                    </span>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2 text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>Strictly No Website:</strong> AI targets only venues without a standalone site.</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>Medium to Large Only:</strong> No small road-side vendors, kiosks, or carts.</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>Full Menu with ₹ Prices:</strong> Real categorised counter items and prices.</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>MenuMap Context Included:</strong> Tells the AI about our site so it outputs perfect schema.</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer p-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200">
                        <input
                          type="checkbox"
                          checked={scoutPureVeg}
                          onChange={(e) => setScoutPureVeg(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span>Enforce Pure Vegetarian Only</span>
                      </label>
                    </div>
                  </div>

                  {/* Copy Prompt Button */}
                  <button
                    onClick={handleCopyPrompt}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-bold text-sm shadow-md shadow-orange-500/25 transition-all cursor-pointer"
                  >
                    {copiedPrompt ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>Master Prompt Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy AI Scout Prompt</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Workflow Instructions */}
                <div className="bg-stone-900 rounded-3xl p-5 text-white space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <Zap className="w-4 h-4" />
                    <span>How to use in 3 steps</span>
                  </div>
                  <ol className="text-xs text-stone-300 space-y-2 list-decimal list-inside leading-relaxed">
                    <li><strong className="text-white">Copy prompt:</strong> Click the button above to copy the tailored instructions.</li>
                    <li><strong className="text-white">Ask your AI:</strong> Paste into Gemini, ChatGPT, Claude, or Perplexity.</li>
                    <li><strong className="text-white">Import in 1 click:</strong> Copy the AI's JSON output and paste it in the importer on the right. All cafes and dishes appear live immediately!</li>
                  </ol>
                </div>
              </div>

              {/* Right Side: Prompt Preview & Instant JSON Importer (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Instant JSON Importer Box */}
                <div className="bg-white rounded-3xl p-6 border-2 border-orange-200 shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Upload className="w-5 h-5 text-orange-600" />
                      <h3 className="font-heading font-extrabold text-base text-slate-900">
                        ⚡ Instant AI JSON Importer
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Automatic Parsing & DB Sync
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Paste the JSON code block generated by the AI scout here. It will automatically create all venues, categories, dishes, prices, descriptions, and dietary tags!
                  </p>

                  <textarea
                    rows={8}
                    value={importJsonText}
                    onChange={(e) => setImportJsonText(e.target.value)}
                    placeholder='Paste AI output JSON here (e.g. { "venues": [ ... ] } or ```json ... ```)'
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-mono text-slate-800 focus:outline-hidden focus:border-orange-400"
                  />

                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setImportJsonText('')}
                      disabled={!importJsonText || importingJson}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 disabled:opacity-40"
                    >
                      Clear
                    </button>

                    <button
                      type="button"
                      onClick={handleImportScoutJson}
                      disabled={!importJsonText.trim() || importingJson}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      {importingJson ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Importing Venues...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Import Venues & Menus to Live Site</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Prompt Preview Accordion */}
                <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span>Live Prompt Preview (What gets copied)</span>
                    </span>
                    <button
                      onClick={handleCopyPrompt}
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>

                  <pre className="max-h-72 overflow-y-auto p-4 bg-stone-900 text-stone-200 text-[11px] rounded-2xl font-mono leading-relaxed whitespace-pre-wrap select-all border border-stone-800">
                    {generateScoutPrompt()}
                  </pre>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* 2. RESTAURANTS CRUD */}
        {/* ================================================================ */}
        {activeSection === 'restaurants' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div>
                <h2 className="font-heading font-extrabold text-2xl text-slate-900">
                  Restaurants & Cafes Directory
                </h2>
                <p className="text-xs text-slate-500">
                  Create, edit, and maintain detailed profiles with opening hours, geolocation, and amenities.
                </p>
              </div>

              <button
                onClick={handleOpenAddRestaurant}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-all self-start sm:self-center"
              >
                <Plus className="w-4 h-4" />
                <span>Add Restaurant</span>
              </button>
            </div>

            {restaurants.length > 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-stone-50 border-b border-stone-200 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-5 py-3.5">Venue</th>
                        <th className="px-5 py-3.5">Cuisines</th>
                        <th className="px-5 py-3.5">Cost for 2</th>
                        <th className="px-5 py-3.5">Rating</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {restaurants.map((rest) => (
                        <tr key={rest.id} className="hover:bg-stone-50/80 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={rest.cover_image_url}
                                alt={rest.name}
                                className="w-12 h-12 rounded-xl object-cover shrink-0"
                              />
                              <div>
                                <div className="font-extrabold text-slate-900 text-sm">{rest.name}</div>
                                <div className="text-[11px] text-slate-400">{rest.city} • /{rest.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {rest.cuisine_types?.map((c) => (
                                <span key={c} className="px-2 py-0.5 rounded-md bg-stone-100 text-[10px] font-semibold">
                                  {c}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-5 py-4 font-bold">
                            ₹{rest.average_cost_for_two} ({rest.price_range})
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                              <Star className="w-3 h-3 fill-amber-500" />
                              {rest.rating_avg.toFixed(1)}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {rest.is_temporarily_closed ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                Temp Closed
                              </span>
                            ) : rest.is_active ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Active Live
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-200 text-stone-700">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedRestId(rest.id);
                                  setActiveSection('menu');
                                }}
                                className="p-1.5 hover:bg-stone-100 rounded-lg text-teal-600 font-bold"
                                title="Manage menu"
                              >
                                <Layers className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingRestaurant(rest);
                                  setRestaurantModalOpen(true);
                                }}
                                className="p-1.5 hover:bg-stone-100 rounded-lg text-slate-600"
                                title="Edit restaurant"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteRestaurant(rest.id, rest.name)}
                                className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600"
                                title="Delete restaurant"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-16 text-center border border-stone-200 space-y-4">
                <UtensilsCrossed className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="font-heading font-extrabold text-xl text-slate-800">
                  No restaurants added yet
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click "Add Restaurant" to create your first venue. Real data only, exactly as required.
                </p>
                <button
                  onClick={handleOpenAddRestaurant}
                  className="px-5 py-2.5 bg-rose-500 text-white font-bold rounded-2xl text-xs shadow-md"
                >
                  Create First Restaurant
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* 2.5 GOOGLE MAPS PROFILE LINKS MANAGER */}
        {/* ================================================================ */}
        {activeSection === 'map_links' && (
          <div className="space-y-6">
            {/* Header & KPI Summary Banner */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>Google Maps Profile Sync</span>
                  </div>
                  <h2 className="font-heading font-black text-2xl sm:text-3xl tracking-tight text-white">
                    Google Maps Restaurant Profile Links
                  </h2>
                  <p className="text-xs sm:text-sm text-blue-200/90 leading-relaxed">
                    Click <strong>⚡ START</strong> on any cafe to automatically copy its menu link, open Google Maps profile in a new tab, and mark it as <strong>Done</strong> in 1 click!
                  </p>
                </div>

                {/* Progress Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 min-w-[260px] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-200 font-semibold">Profile Update Progress</span>
                    <span className="font-extrabold text-white text-sm">
                      {restaurants.filter(r => r.map_profile_done).length} / {restaurants.length} ({Math.round((restaurants.filter(r => r.map_profile_done).length / (restaurants.length || 1)) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-500"
                      style={{
                        width: `${Math.round((restaurants.filter(r => r.map_profile_done).length / (restaurants.length || 1)) * 100)}%`
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/10">
                    <span className="text-emerald-300 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {restaurants.filter(r => r.map_profile_done).length} Done
                    </span>
                    <span className="text-amber-300 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {restaurants.length - restaurants.filter(r => r.map_profile_done).length} Pending
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={mapLinksSearch}
                  onChange={(e) => setMapLinksSearch(e.target.value)}
                  placeholder="Search by cafe name, street, or city..."
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm focus:outline-hidden focus:border-blue-500 font-medium"
                />
                {mapLinksSearch && (
                  <button
                    onClick={() => setMapLinksSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setMapLinksFilter('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    mapLinksFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-slate-700 border border-stone-200'
                  }`}
                >
                  All ({restaurants.length})
                </button>
                <button
                  onClick={() => setMapLinksFilter('pending')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    mapLinksFilter === 'pending'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-amber-800 border border-stone-200'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Pending ({restaurants.length - restaurants.filter(r => r.map_profile_done).length})</span>
                </button>
                <button
                  onClick={() => setMapLinksFilter('done')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    mapLinksFilter === 'done'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-emerald-800 border border-stone-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Done ({restaurants.filter(r => r.map_profile_done).length})</span>
                </button>

                <div className="h-4 w-px bg-stone-200 hidden sm:block mx-1" />

                <button
                  onClick={handleExportMapDoneBackup}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-slate-700 transition-all shrink-0 flex items-center gap-1.5"
                  title="Copy backup of all Done cafes to clipboard"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Backup</span>
                </button>

                <button
                  onClick={handleImportMapDoneBackup}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-slate-700 transition-all shrink-0 flex items-center gap-1.5"
                  title="Restore or import previously marked Done cafes from JSON"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Restore</span>
                </button>
              </div>
            </div>

            {/* Restaurant Map Links List */}
            <div className="space-y-4">
              {restaurants
                .filter(r => {
                  const q = mapLinksSearch.toLowerCase().trim();
                  const matchesSearch = !q || r.name.toLowerCase().includes(q) || r.address_line1.toLowerCase().includes(q) || r.city.toLowerCase().includes(q);
                  if (!matchesSearch) return false;
                  const isDone = Boolean(r.map_profile_done);
                  if (mapLinksFilter === 'pending') return !isDone;
                  if (mapLinksFilter === 'done') return isDone;
                  return true;
                })
                .map((r, index) => {
                  const isDone = Boolean(r.map_profile_done);
                  const isToggling = togglingMapDoneId === r.id;
                  const isCopied = copiedRestId === r.id;
                  const restaurantPageUrl = `${window.location.origin}/restaurant/${r.slug}`;
                  const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r.name}, ${r.address_line1}, ${r.city}`)}`;

                  return (
                    <div
                      key={r.id}
                      className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all space-y-4 shadow-xs ${
                        isDone ? 'border-emerald-200/90 bg-emerald-50/20' : 'border-amber-200/90 bg-amber-50/15'
                      }`}
                    >
                      {/* Top: Cafe Info & Done/Not Done status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start sm:items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center font-heading font-black text-sm text-slate-700 shrink-0 mt-0.5 sm:mt-0">
                            {index + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-heading font-extrabold text-base text-slate-900">
                                {r.name}
                              </h4>
                              {/* Status Badge */}
                              {isDone ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>DONE</span>
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 shadow-2xs">
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                  <span>NOT DONE</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {r.address_line1}, {r.city} • Phone: {r.phone || 'N/A'}
                            </p>
                          </div>
                        </div>

                        {/* URL Preview */}
                        <div className="text-[11px] font-mono text-slate-400 truncate max-w-xs self-start sm:self-auto bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200">
                          {restaurantPageUrl}
                        </div>
                      </div>

                      {/* Bottom Action Row: START Super Button + Copy Link, Open Maps, Done/Not Done */}
                      <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-stone-100">
                        {/* ⚡ 1-Click START Super Button (Copy Link + Open Google Maps + Mark Done) */}
                        <button
                          onClick={() => handleStartRestaurantMap(r)}
                          className={`px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${
                            isDone
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white shadow-orange-500/25 ring-2 ring-orange-400/40 hover:shadow-lg'
                          }`}
                          title="Instant 1-Click: Copies menu link, opens Google Maps in a new tab, and marks as Done!"
                        >
                          <Zap className="w-4 h-4 fill-white text-white shrink-0" />
                          <span>{isDone ? '⚡ Start Again (Copy & Open)' : '⚡ START (Copy, Open & Mark Done)'}</span>
                        </button>

                        {/* 1. Copy Restaurant Page Link */}
                        <button
                          onClick={() => handleCopyRestaurantLink(r)}
                          className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-2xs ${
                            isCopied
                              ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                              : 'bg-slate-900 hover:bg-black text-white'
                          }`}
                          title="Click to copy this restaurant's website link only"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-white" />
                              <span>Link Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-amber-300" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>

                        {/* 2. Open on Google Maps */}
                        <a
                          href={searchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs active:scale-95"
                          title="Open this restaurant's profile on Google Maps in a new tab"
                        >
                          <Navigation className="w-3.5 h-3.5 text-blue-600" />
                          <span>Open Maps</span>
                          <ExternalLink className="w-3 h-3 text-blue-400" />
                        </a>

                        {/* 3. Done or Not Button */}
                        <button
                          onClick={() => handleToggleMapDone(r.id, !isDone)}
                          disabled={isToggling}
                          className={`px-3.5 py-2.5 rounded-xl font-black text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50 sm:ml-auto ${
                            isDone
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-white hover:bg-stone-50 text-slate-800 border border-stone-200'
                          }`}
                          title={isDone ? 'Mark as Not Done' : 'Mark as Done'}
                        >
                          {isDone ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Done ✓ (Undo)</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Mark Done</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* 3. MENU MANAGEMENT */}
        {/* ================================================================ */}
        {activeSection === 'menu' && (
          <div className="space-y-6">
            
            {/* Restaurant Selector Bar */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-slate-500">Active Restaurant:</span>
                <select
                  value={selectedRestId}
                  onChange={(e) => handleSelectRestaurant(e.target.value)}
                  className="bg-stone-50 border border-stone-200 text-slate-900 font-extrabold text-sm rounded-xl px-3 py-2 focus:outline-hidden"
                >
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.city})
                    </option>
                  ))}
                </select>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl whitespace-nowrap">
                  {categories.length} Categories • {currentMenuItems.length} Total Dishes
                </span>
              </div>

              {currentRestaurant && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingCategory({
                        restaurant_id: selectedRestId,
                        name: '',
                        sort_order: categories.length + 1,
                        is_active: true,
                      });
                      setCategoryModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold text-xs"
                  >
                    + Add Category
                  </button>

                  <button
                    onClick={handleOpenAddItem}
                    className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-xs"
                  >
                    + Add Dish
                  </button>

                  <button
                    onClick={() => {
                      setBulkCategoryId(categories[0]?.id || '');
                      setBulkImportModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 font-bold text-xs"
                  >
                    Bulk Import (CSV/JSON)
                  </button>
                </div>
              )}
            </div>

            {restaurants.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-stone-200">
                Please add a restaurant before managing menus.
              </div>
            ) : categories.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
                <Layers className="w-10 h-10 text-stone-300 mx-auto" />
                <h3 className="font-heading font-bold text-lg text-slate-800">
                  No menu categories yet for {currentRestaurant?.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Create categories like "Appetizers", "Main Course", "Beverages", or "Desserts".
                </p>
                <button
                  onClick={() => {
                    setEditingCategory({ name: 'Specialties', sort_order: 1, is_active: true });
                    setCategoryModalOpen(true);
                  }}
                  className="px-5 py-2.5 bg-rose-500 text-white font-bold text-xs rounded-xl"
                >
                  Create Category
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {categories.map((cat) => {
                  const itemsInCat = currentMenuItems.filter((i) => i.category_id === cat.id);
                  return (
                    <div key={cat.id} className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                        <div className="flex items-center gap-3">
                          <h3 className="font-heading font-extrabold text-lg text-slate-900">
                            {cat.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-slate-600">
                            {itemsInCat.length} items
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingItem({
                                restaurant_id: selectedRestId,
                                category_id: cat.id,
                                name: '',
                                price: 200,
                                dietary_tags: ['Veg'],
                                spice_level: 0,
                                is_available: true,
                              });
                              setItemModalOpen(true);
                            }}
                            className="text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1"
                          >
                            + Add to {cat.name}
                          </button>
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setCategoryModalOpen(true);
                            }}
                            className="p-1 hover:bg-stone-100 rounded-lg text-slate-500"
                            title="Edit Category"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="p-1 hover:bg-rose-50 rounded-lg text-rose-500"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Items table / grid */}
                      {itemsInCat.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {itemsInCat.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-100 hover:border-orange-200 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {item.image_url ? (
                                  <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-stone-200 flex items-center justify-center text-stone-400 shrink-0">
                                    <UtensilsCrossed className="w-5 h-5" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="font-extrabold text-sm text-slate-900 truncate">
                                    {item.name}
                                  </div>
                                  <div className="text-xs font-bold text-slate-800">
                                    ₹{item.price}{' '}
                                    <span className="text-[10px] font-normal text-slate-400">
                                      ({item.portion_size})
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => {
                                    setEditingItem(item);
                                    setItemModalOpen(true);
                                  }}
                                  className="p-1.5 hover:bg-white rounded-lg text-slate-600 shadow-2xs"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id, item.name)}
                                  className="p-1.5 hover:bg-rose-100 rounded-lg text-rose-600"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic py-2">
                          No dishes yet in this category. Click "+ Add to {cat.name}" above.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* 4. GLOBAL FOOD ITEMS */}
        {/* ================================================================ */}
        {activeSection === 'global_food' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div>
                <h2 className="font-heading font-extrabold text-2xl text-slate-900">
                  Global Dishes Directory
                </h2>
                <p className="text-xs text-slate-500">
                  Filter, search, and toggle availability across all {menuItems.length} menu items.
                </p>
              </div>

              <div className="w-full sm:w-64">
                <input
                  type="text"
                  value={foodSearch}
                  onChange={(e) => setFoodSearch(e.target.value)}
                  placeholder="Filter by dish name..."
                  className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-stone-50 border-b border-stone-200 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Dish</th>
                      <th className="px-5 py-3.5">Restaurant</th>
                      <th className="px-5 py-3.5">Price</th>
                      <th className="px-5 py-3.5">Dietary</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {menuItems
                      .filter((i) => i.name.toLowerCase().includes(foodSearch.toLowerCase()))
                      .map((dish) => {
                        const rest = restaurants.find((r) => r.id === dish.restaurant_id);
                        return (
                          <tr key={dish.id} className="hover:bg-stone-50/80 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                {dish.image_url ? (
                                  <img
                                    src={dish.image_url}
                                    alt={dish.name}
                                    className="w-10 h-10 rounded-xl object-cover shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400">
                                    <UtensilsCrossed className="w-4 h-4" />
                                  </div>
                                )}
                                <div>
                                  <div className="font-extrabold text-slate-900">{dish.name}</div>
                                  <div className="text-[10px] text-slate-400">/{dish.slug}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 font-semibold text-slate-700">
                              {rest?.name || 'Unknown'}
                            </td>
                            <td className="px-5 py-3.5 font-bold text-slate-900">
                              ₹{dish.price}
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex gap-1">
                                {dish.dietary_tags?.map((t) => (
                                  <span key={t} className="px-2 py-0.5 rounded-md bg-stone-100 text-[10px]">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <button
                                onClick={async () => {
                                  await api.saveMenuItem({
                                    ...dish,
                                    is_available: !dish.is_available,
                                  });
                                  const items = await api.getMenuItems();
                                  setMenuItems(items);
                                }}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  dish.is_available
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {dish.is_available ? 'Available' : 'Out of Stock'}
                              </button>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <button
                                onClick={() => navigate(`/food/${dish.slug}`)}
                                className="p-1 hover:bg-stone-100 rounded text-rose-600 font-bold"
                                title="View public page"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* 5. REVIEWS MODERATION */}
        {/* ================================================================ */}
        {activeSection === 'reviews' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div>
                <h2 className="font-heading font-extrabold text-2xl text-slate-900">
                  Reviews & Ratings Moderation
                </h2>
                <p className="text-xs text-slate-500">
                  Approve, feature, reply to customer feedback, or remove abuse.
                </p>
              </div>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((rev) => {
                  const rest = restaurants.find((r) => r.id === rev.restaurant_id);
                  return (
                    <div
                      key={rev.id}
                      className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="font-extrabold text-slate-900 text-sm">
                            {rev.user_name}
                          </span>{' '}
                          <span className="text-xs text-slate-400">
                            for {rest?.name || 'Restaurant'} •{' '}
                            {new Date(rev.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-xl text-xs font-bold border border-amber-200">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                            {rev.rating} / 5
                          </span>

                          <button
                            onClick={() => handleToggleReviewApproval(rev)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                              rev.is_approved
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {rev.is_approved ? 'Approved' : 'Hidden'}
                          </button>

                          <button
                            onClick={() => handleToggleReviewFeatured(rev)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                              rev.is_featured
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-stone-100 text-slate-600'
                            }`}
                          >
                            {rev.is_featured ? 'Featured' : 'Regular'}
                          </button>

                          <button
                            onClick={() => handleOwnerReply(rev.id)}
                            className="px-3 py-1 rounded-xl text-xs font-bold bg-stone-100 text-slate-700 hover:bg-stone-200"
                          >
                            Reply
                          </button>

                          <button
                            onClick={async () => {
                              if (window.confirm('Delete this review?')) {
                                await api.deleteReview(rev.id);
                                const revs = await api.getReviews(undefined, false);
                                setReviews(revs);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-stone-50 p-3.5 rounded-2xl border border-stone-100">
                        {rev.review_text}
                      </p>

                      {rev.owner_response && (
                        <div className="p-3 rounded-xl bg-orange-50/80 text-xs text-orange-950 border border-orange-200 space-y-1">
                          <span className="font-bold">Owner Response:</span>
                          <p>{rev.owner_response}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-stone-200">
                No customer reviews submitted yet.
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* 6. COLLECTIONS CRUD */}
        {/* ================================================================ */}
        {activeSection === 'collections' && (
          <div className="space-y-6">
            {/* Header with Title and Primary Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                    Living Neighborhood Food Guides
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-slate-600">
                    {collections.length} Total Guides
                  </span>
                </div>
                <h2 className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
                  Iconic Area Guides & Curated Neighborhood Hubs
                </h2>
                <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
                  Complete living food guides featuring live GPS distance tracking, Delhi Metro station & gate advice, local vibe badges, top 3–5 famous dishes with prices in ₹, and curated 3-stop food crawls.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* View / Copy Supabase SQL */}
                <button
                  type="button"
                  onClick={() => setSqlModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white border border-stone-200 hover:border-stone-300 text-slate-700 font-bold text-xs shadow-2xs transition-all cursor-pointer hover:bg-stone-50"
                  title="View ready-to-run Supabase SQL script"
                >
                  <Code2 className="w-4 h-4 text-rose-500" />
                  <span>View Supabase SQL</span>
                </button>

                <button
                  type="button"
                  onClick={copyIconicSql}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-stone-900 hover:bg-black text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
                  title="Copy ready-to-run Supabase SQL script"
                >
                  {copiedIconicSql ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300 font-extrabold">SQL Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-stone-300" />
                      <span>Copy Supabase SQL</span>
                    </>
                  )}
                </button>

                {/* ⚡ Bulk 50-Cafe Importer */}
                <button
                  type="button"
                  onClick={() => setBulkAreaModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-200 fill-amber-200 animate-pulse" />
                  <span>⚡ Bulk 50-Cafe Importer</span>
                </button>

                {/* New Area Guide */}
                <button
                  type="button"
                  onClick={() => handleOpenAddCollection('Area-Guide')}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Area Guide</span>
                </button>
              </div>
            </div>

            {/* Supabase Schema Sync Callout */}
            <div className="bg-gradient-to-r from-stone-900 to-slate-900 rounded-3xl p-5 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-stone-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-400">
                    Supabase PostgreSQL Sync
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">
                  Iconic Area Guides Stored with JSONB Metadata & Cafe Links
                </h4>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Every guide stores its zone, live coordinates, vibe badge, nearest metro station & gate, top famous dishes with prices in ₹, and 3-stop food crawls in the <code className="px-1.5 py-0.5 bg-black/40 rounded text-rose-300 font-mono text-[11px]">collections.area_metadata</code> column. Cafes are linked in <code className="px-1.5 py-0.5 bg-black/40 rounded text-rose-300 font-mono text-[11px]">collection_items</code>.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setSqlModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs transition-colors flex items-center gap-1.5 border border-stone-700"
                >
                  <Code2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Inspect Script</span>
                </button>
                <button
                  type="button"
                  onClick={copyIconicSql}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  {copiedIconicSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIconicSql ? 'Copied to Clipboard' : 'Copy Supabase SQL'}</span>
                </button>
              </div>
            </div>

            {/* Area Guides & Collections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((col) => {
                const meta = col.area_metadata;
                const isArea = col.type === 'Area-Guide' || !!meta;
                const famousDishesCount = meta?.famous_dishes?.length || 0;
                const crawlStopsCount = meta?.food_crawl_stops?.length || 0;

                return (
                  <div
                    key={col.id}
                    className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group"
                  >
                    <div>
                      {/* Image Header with Badges */}
                      <div className="aspect-[16/9] relative overflow-hidden bg-stone-100">
                        <img
                          src={col.cover_image_url}
                          alt={col.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${
                            isArea ? 'bg-rose-500/90 text-white shadow-xs' : 'bg-black/60 text-white'
                          }`}>
                            {isArea ? '📍 Iconic Area Guide' : col.type}
                          </span>
                          {meta?.zone && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-800 backdrop-blur-md">
                              {meta.zone}
                            </span>
                          )}
                        </div>

                        {/* Title overlay */}
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <h3 className="font-heading font-extrabold text-base leading-snug drop-shadow-sm">
                            {col.title}
                          </h3>
                          <div className="flex items-center gap-2 text-[11px] text-stone-200 mt-0.5">
                            <span>/{col.slug}</span>
                            {meta?.avg_cost_for_two && (
                              <span>• ₹{meta.avg_cost_for_two} for two</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Details & Metadata */}
                      <div className="p-4 space-y-3">
                        {/* Vibe badge */}
                        {meta?.vibe_badge ? (
                          <div className="p-2.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-amber-950 text-xs italic leading-relaxed">
                            "{meta.vibe_badge}"
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {col.description}
                          </p>
                        )}

                        {/* Metro & Parking Highlights */}
                        {meta?.nearest_metro && (
                          <div className="flex items-start gap-2 text-xs text-slate-700 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                            <Navigation className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                            <span className="line-clamp-1 font-medium">{meta.nearest_metro}</span>
                          </div>
                        )}

                        {/* Famous Dishes & Crawl Stats */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {famousDishesCount > 0 && (
                            <span className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px] flex items-center gap-1">
                              <Utensils className="w-3 h-3" />
                              <span>{famousDishesCount} Famous Dishes</span>
                            </span>
                          )}
                          {crawlStopsCount > 0 && (
                            <span className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-[10px] flex items-center gap-1">
                              <Compass className="w-3 h-3" />
                              <span>{crawlStopsCount}-Stop Crawl</span>
                            </span>
                          )}
                          {meta?.latitude && meta?.longitude && (
                            <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium text-[10px] flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>GPS Ready</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions Footer */}
                    <div className="px-4 py-3 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => navigate(`/collections/${col.slug}`)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Live Guide</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={async () => {
                            setEditingCollection(col);
                            const items = await api.getCollectionItems(col.id);
                            setCollectionItemsSelection(items.map((i) => i.restaurant_id || '').filter(Boolean));
                            setCollectionModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-stone-200/70 rounded-lg text-slate-700 transition-colors"
                          title="Edit Guide & Famous Dishes"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCollection(col.id, col.title)}
                          className="p-1.5 hover:bg-rose-100 rounded-lg text-rose-600 transition-colors"
                          title="Delete Guide"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* 7. SEARCH & ANALYTICS */}
        {/* ================================================================ */}
        {activeSection === 'analytics' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div>
                <h2 className="font-heading font-extrabold text-2xl text-slate-900">
                  Search & Traffic Analytics
                </h2>
                <p className="text-xs text-slate-500">
                  Track what dishes and cuisines diners are actively searching for.
                </p>
              </div>

              <button
                onClick={() => {
                  const csv =
                    'Query,Results,Time\n' +
                    analytics
                      .map((a) => `"${a.query}",${a.results_count},"${a.created_at}"`)
                      .join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `menumap-analytics-${Date.now()}.csv`;
                  a.click();
                  showToast('Exported analytics CSV!', 'success');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-bold text-slate-700 shadow-2xs"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-stone-50 border-b border-stone-200 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Query / Click</th>
                    <th className="px-5 py-3.5">Results Returned</th>
                    <th className="px-5 py-3.5">Filters Used</th>
                    <th className="px-5 py-3.5 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {analytics.map((a) => (
                    <tr key={a.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {a.query}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            a.results_count === 0
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {a.results_count} results
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {a.filters ? JSON.stringify(a.filters) : 'None'}
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-400">
                        {new Date(a.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* 8. SETTINGS & SUPABASE SQL SCHEMA GENERATOR */}
        {/* ================================================================ */}
        {activeSection === 'settings' && settings && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div>
                <h2 className="font-heading font-extrabold text-2xl text-slate-900">
                  Site Configuration & Supabase Connection
                </h2>
                <p className="text-xs text-slate-500">
                  Manage database connectivity, default city coordinates, brand settings, and copy the full SQL script.
                </p>
              </div>
            </div>

            {/* Supabase Connection Setup Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-extrabold text-lg text-slate-900">
                      Supabase PostgreSQL Connection & Live Sync
                    </h3>
                    {writeTestStatus?.checked && (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        writeTestStatus.canWrite 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {writeTestStatus.canWrite ? '● Cloud Writes Active' : '▲ RLS Protected'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Connect your Supabase project URL and Anon Public Key. All cafe, category, and dish edits sync with Supabase cloud.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestWrite}
                    disabled={checkingWrite}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold text-xs shadow-xs transition-all disabled:opacity-50"
                  >
                    <Check className={`w-4 h-4 ${checkingWrite ? 'animate-spin' : ''}`} />
                    <span>{checkingWrite ? 'Testing...' : 'Test Cloud Connection'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSyncCloud}
                    disabled={syncingCloud}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${syncingCloud ? 'animate-spin' : ''}`} />
                    <span>{syncingCloud ? 'Syncing to Cloud...' : '⚡ Sync All 88 Restaurants & 1,162 Dishes'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={copySqlSchema}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copiedSchema ? 'Copied!' : 'Copy Safe Fix SQL (No 42710 Error)'}</span>
                  </button>
                </div>
              </div>

              {/* Notice regarding Error 42710 resolution & Supabase SQL */}
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200/80 text-teal-950 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-teal-900">
                  <ShieldAlert className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Idempotent SQL Schema (Resolved "ERROR: 42710 policy already exists")</span>
                </div>
                <p className="text-teal-800 leading-relaxed">
                  PostgreSQL raises <code className="bg-teal-100/70 px-1 py-0.5 rounded font-mono font-semibold">ERROR: 42710</code> when executing <code className="bg-teal-100/70 px-1 py-0.5 rounded font-mono font-semibold">CREATE POLICY</code> if a policy was previously created. The updated schema includes <code className="bg-teal-100/70 px-1 py-0.5 rounded font-mono font-semibold">DROP POLICY IF EXISTS</code> before each table policy, making it 100% safe to run multiple times in your Supabase SQL Editor.
                </p>
                <p className="text-teal-800 leading-relaxed font-semibold">
                  Once you copy and run this updated SQL in your Supabase dashboard, full write access is granted so that creating or editing restaurants, categories, and dishes in this Admin Panel immediately saves to your Supabase cloud tables.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Supabase Anon Public API Key
                  </label>
                  <input
                    type="password"
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6Ik..."
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* General Site Settings Form */}
            <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
              <h3 className="font-heading font-extrabold text-lg text-slate-900 pb-2 border-b border-stone-100">
                Default Geolocation & Brand Info
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Default City Name
                  </label>
                  <input
                    type="text"
                    value={settings.default_city}
                    onChange={(e) => setSettings({ ...settings, default_city: e.target.value })}
                    className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Default Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={settings.default_lat}
                    onChange={(e) => setSettings({ ...settings, default_lat: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Default Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={settings.default_lng}
                    onChange={(e) => setSettings({ ...settings, default_lng: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    value={settings.currency_symbol}
                    onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                    className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                    className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Browser Tab Favicon (Chrome Tab Logo) */}
              <div className="pt-6 border-t border-stone-100 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-orange-600" />
                      <h4 className="font-heading font-extrabold text-base text-slate-900">
                        Browser Tab Favicon (Chrome Tab Logo)
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold">
                        Browser Tab Only
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Upload or configure the exact icon shown in Google Chrome & browser tabs without changing your website's header/footer brand logo.
                    </p>
                  </div>
                </div>

                {/* Live Chrome Tab Simulator */}
                <div className="bg-stone-900 rounded-2xl p-4 text-white shadow-inner space-y-3">
                  <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Live Google Chrome Tab Preview</span>
                    <span className="text-emerald-400 text-[10px] font-semibold">● Real-Time Simulation</span>
                  </div>

                  <div className="flex items-center gap-2 max-w-sm bg-stone-800/90 rounded-t-xl px-3.5 py-2 border-t border-x border-stone-700/60 shadow-xs">
                    <div className="w-4 h-4 rounded-sm overflow-hidden flex items-center justify-center bg-white/10 shrink-0">
                      <img
                        src={settings.custom_favicon_url || '/favicon.svg'}
                        alt="Tab Icon"
                        className="w-4 h-4 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/favicon.svg';
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-stone-200 truncate flex-1">
                      Menu Map – Real Menus, Cafes & Restaurant Discovery
                    </span>
                    <span className="text-stone-500 hover:text-white text-xs cursor-pointer ml-1">✕</span>
                  </div>
                </div>

                {/* Upload & Input Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Upload Image / SVG File
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-50 hover:bg-orange-50/50 border border-dashed border-stone-300 hover:border-orange-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition-colors">
                        <Upload className="w-4 h-4 text-orange-600" />
                        <span>Choose File (SVG, PNG, ICO)</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/svg+xml,image/webp,image/x-icon"
                          onChange={handleFaviconFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Supports SVG, PNG, WebP, ICO (recommended: 32×32 or 64×64 SVG).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Or Custom Favicon URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="https://example.com/custom-icon.png or /favicon.svg"
                        value={settings.custom_favicon_url || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSettings({ ...settings, custom_favicon_url: val });
                          if (val) applyBrowserFavicon(val);
                        }}
                        className="flex-1 px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSettings({ ...settings, custom_favicon_url: '' });
                          applyBrowserFavicon('/favicon.svg');
                          showToast('Reset tab icon to default MenuMap favicon!', 'success');
                        }}
                        className="text-[11px] font-bold text-slate-500 hover:text-rose-600 transition-colors"
                      >
                        Reset to Default Icon
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick 1-Click Presets */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-slate-600">Quick 1-Click Tab Icon Presets:</div>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { name: '🔥 Default MenuMap Coral Pin', url: '/favicon.svg' },
                      { name: '📍 Full Brand Logo', url: '/logo.svg' },
                      { name: '🍔 Gourmet Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=64&auto=format&fit=crop&q=80' },
                      { name: '☕ Hot Espresso Cafe', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=64&auto=format&fit=crop&q=80' },
                      { name: '🍕 Wood-Fired Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=64&auto=format&fit=crop&q=80' },
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSettings({ ...settings, custom_favicon_url: preset.url });
                          applyBrowserFavicon(preset.url);
                          showToast(`Applied preset: ${preset.name}!`, 'success');
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          settings.custom_favicon_url === preset.url
                            ? 'bg-orange-50 border-orange-300 text-orange-700 shadow-2xs'
                            : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-slate-600'
                        }`}
                      >
                        <img src={preset.url} alt="" className="w-3.5 h-3.5 object-cover rounded-full" />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feature Flags */}
              <div className="pt-4 border-t border-stone-100 space-y-3">
                <h4 className="text-xs font-extrabold uppercase text-slate-400">
                  Feature Flags
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { key: 'feature_reviews', label: 'User Reviews' },
                    { key: 'feature_bookmarks', label: 'Bookmarks' },
                    { key: 'feature_collections', label: 'Curated Lists' },
                    { key: 'feature_nearby', label: 'GPS Discovery' },
                  ].map((f) => (
                    <label key={f.key} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={(settings as any)[f.key]}
                        onChange={(e) => setSettings({ ...settings, [f.key]: e.target.checked })}
                        className="w-4 h-4 text-rose-600 rounded"
                      />
                      <span>{f.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-2xl shadow-md transition-colors"
              >
                Save Settings
              </button>
            </form>
          </div>
        )}

        {/* ================================================================ */}
        {/* 10. RESTAURANT OWNER CLAIMS & TWILIO OTP APPROVAL */}
        {/* ================================================================ */}
        {activeSection === 'owner_claims' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Twilio OTP Verification & Owner Security</span>
              </div>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-white">
                Restaurant Ownership Claims
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                Review business credentials submitted by restaurant owners. Once you click <strong>Approve Claim</strong>, the owner is authorized to send up to 2 Twilio verification OTPs to their registered phone number and set their permanent password to log into their Owner Portal.
              </p>
            </div>

            {/* Claims Table / List */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-heading font-black text-base text-slate-900">
                  All Ownership Requests ({claims.length})
                </h3>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
                  {claims.filter(c => c.status === 'pending_admin_approval').length} Pending Approval
                </span>
              </div>

              {claims.length === 0 ? (
                <div className="py-12 text-center space-y-2 text-slate-400">
                  <ShieldCheck className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="font-heading font-bold text-sm text-slate-600">No ownership claims yet</p>
                  <p className="text-xs max-w-sm mx-auto">
                    When restaurant owners click "Claim Ownership" on their restaurant page, their requests will appear here for your approval.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {claims.map((claim) => (
                    <div key={claim.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5 max-w-xl">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-heading font-black text-sm text-slate-900">
                            {claim.restaurant_name}
                          </h4>
                          {/* Status Badge */}
                          {claim.status === 'pending_admin_approval' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                              Pending Approval
                            </span>
                          )}
                          {claim.status === 'approved' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-100 text-blue-800 border border-blue-300">
                              Approved (Awaiting OTP)
                            </span>
                          )}
                          {claim.status === 'ownership_active' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                              ✓ Ownership Active
                            </span>
                          )}
                          {claim.status === 'rejected' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-100 text-red-800 border border-red-300">
                              Rejected
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600">
                          <strong>Claimant:</strong> {claim.owner_name} • <strong>Phone:</strong> {claim.phone_number} • <strong>Proof:</strong> {claim.proof_type.toUpperCase()} ({claim.proof_reference || 'N/A'})
                        </p>
                        {claim.message && (
                          <p className="text-[11px] text-slate-500 italic bg-stone-50 p-2 rounded-lg border border-stone-200">
                            "{claim.message}"
                          </p>
                        )}
                        <p className="text-[11px] text-slate-400">
                          Submitted on {new Date(claim.created_at).toLocaleString()} • OTP Attempts: {claim.otp_attempts_count}/2
                        </p>
                      </div>

                      {/* Admin Actions */}
                      <div className="flex items-center gap-2 self-start md:self-auto">
                        {claim.status === 'pending_admin_approval' && (
                          <>
                            <button
                              onClick={() => handleApproveClaim(claim.id)}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve Claim</span>
                            </button>
                            <button
                              onClick={() => handleRejectClaim(claim.id)}
                              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-red-50 text-red-600 border border-stone-200 font-bold text-xs transition-colors"
                            >
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                        {claim.status === 'approved' && (
                          <div className="text-right">
                            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 inline-block">
                              Approved • Owner Can Send OTP ({2 - claim.otp_attempts_count} left)
                            </span>
                          </div>
                        )}
                        {claim.status === 'ownership_active' && (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 inline-block">
                            Active & Logged In
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* ==================================================================== */}
      {/* MODAL: ADD / EDIT RESTAURANT */}
      {/* ==================================================================== */}
      {restaurantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 my-8">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <h3 className="font-heading font-extrabold text-xl text-slate-900">
                {editingRestaurant.id ? 'Edit Restaurant' : 'Add New Restaurant'}
              </h3>
              <button onClick={() => setRestaurantModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRestaurant} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRestaurant.name || ''}
                    onChange={(e) => {
                      const name = e.target.value;
                      setEditingRestaurant({
                        ...editingRestaurant,
                        name,
                        slug: editingRestaurant.id ? editingRestaurant.slug : slugify(name),
                      });
                    }}
                    placeholder="e.g. Roastery Coffee House"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    URL Slug * (auto-generated)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRestaurant.slug || ''}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, slug: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Description (1-2 lines) *
                </label>
                <input
                  type="text"
                  required
                  value={editingRestaurant.short_description || ''}
                  onChange={(e) => setEditingRestaurant({ ...editingRestaurant, short_description: e.target.value })}
                  placeholder="Cozy specialty cafe known for pour-overs, artisanal bakes, and lush garden seating."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Long Description / Story
                </label>
                <textarea
                  rows={3}
                  value={editingRestaurant.long_description || ''}
                  onChange={(e) => setEditingRestaurant({ ...editingRestaurant, long_description: e.target.value })}
                  placeholder="Full background, sourcing of beans/produce, atmosphere, and special dining experience..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cuisine Types (comma separated)
                  </label>
                  <input
                    type="text"
                    value={editingRestaurant.cuisine_types?.join(', ') || ''}
                    onChange={(e) =>
                      setEditingRestaurant({
                        ...editingRestaurant,
                        cuisine_types: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="Cafe, Italian, Desserts"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Price Range
                  </label>
                  <select
                    value={editingRestaurant.price_range || '₹₹'}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, price_range: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  >
                    <option value="₹">₹ (Budget-Friendly)</option>
                    <option value="₹₹">₹₹ (Moderate)</option>
                    <option value="₹₹₹">₹₹₹ (Fine Dine / Upscale)</option>
                    <option value="₹₹₹₹">₹₹₹₹ (Luxury)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Average Cost for Two (INR)
                  </label>
                  <input
                    type="number"
                    value={editingRestaurant.average_cost_for_two || 600}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, average_cost_for_two: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Address details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRestaurant.address_line1 || ''}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, address_line1: e.target.value })}
                    placeholder="Plot 12, Main Market, Sector 29"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRestaurant.city || 'Delhi NCR'}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Latitude (for map & nearby) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editingRestaurant.latitude || 28.6139}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, latitude: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editingRestaurant.longitude || 77.2090}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, longitude: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editingRestaurant.phone || ''}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={editingRestaurant.whatsapp_number || ''}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, whatsapp_number: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Website URL</label>
                  <input
                    type="url"
                    value={editingRestaurant.website_url || ''}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, website_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Maps Profile Link (Direct Place URL)
                </label>
                <input
                  type="url"
                  value={editingRestaurant.google_maps_url || ''}
                  onChange={(e) => setEditingRestaurant({ ...editingRestaurant, google_maps_url: e.target.value })}
                  placeholder="https://maps.app.goo.gl/... or https://google.com/maps/place/..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                />
              </div>

              {/* Cover Image URL with Live Preview & Curated Ambiance Presets */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Cover Photo Visual Asset *
                </label>
                
                <div className="flex gap-3 items-start">
                  <div className="w-20 h-16 rounded-xl border border-stone-200 bg-stone-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {editingRestaurant.cover_image_url ? (
                      <img 
                        src={editingRestaurant.cover_image_url} 
                        alt="Cover Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold">No Image</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="url"
                      required
                      value={editingRestaurant.cover_image_url || ''}
                      onChange={(e) => setEditingRestaurant({ ...editingRestaurant, cover_image_url: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                    />

                    <div className="flex flex-wrap gap-1">
                      <span className="text-[10px] font-bold text-slate-400 self-center mr-1">Vibe Presets:</span>
                      {[
                        { label: 'Cozy Cafe', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1000&auto=format&fit=crop&q=80' },
                        { label: 'Modern Bistro', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80' },
                        { label: 'Rooftop Lounge', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000&auto=format&fit=crop&q=80' },
                        { label: 'Heritage Dining', url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=1000&auto=format&fit=crop&q=80' },
                        { label: 'Coffee Adda', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000&auto=format&fit=crop&q=80' },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setEditingRestaurant({ ...editingRestaurant, cover_image_url: preset.url })}
                          className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                            editingRestaurant.cover_image_url === preset.url
                              ? 'bg-rose-50 text-rose-700 border-rose-300 font-bold'
                              : 'bg-white text-slate-600 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Flags */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingRestaurant.is_active ?? true}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, is_active: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span>Active on Live Site</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingRestaurant.is_featured ?? false}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, is_featured: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span>Featured on Home</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingRestaurant.is_open ?? true}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, is_open: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span>Open Now</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingRestaurant.heritage_area ?? false}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, heritage_area: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span>🏛️ Heritage Area</span>
                </label>
              </div>

              {/* Best For Tags Selection */}
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Best For Tags (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Studying', 'Date Night', 'Groups', 'Budget', 'Coffee', 'Breakfast', 'Late Night', 'Traditional Food', 'Views'].map((tag) => {
                    const isSelected = (editingRestaurant.best_for_tags || []).includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          const current = new Set(editingRestaurant.best_for_tags || []);
                          if (isSelected) current.delete(tag);
                          else current.add(tag);
                          setEditingRestaurant({ ...editingRestaurant, best_for_tags: Array.from(current) });
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                          isSelected
                            ? 'bg-orange-500 text-white border-orange-500 shadow-2xs'
                            : 'bg-stone-50 border-stone-200 text-slate-700 hover:bg-stone-100'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ambience & Vibe Tags Selection */}
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Ambience & Dining Vibe Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Cozy & Quiet', 'Lively & Social', 'Romantic & Intimate', 'Modern & Trendy', 'Traditional & Heritage', 'Outdoor Seating Available'].map((tag) => {
                    const isSelected = (editingRestaurant.ambience_tags || []).includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          const current = new Set(editingRestaurant.ambience_tags || []);
                          if (isSelected) current.delete(tag);
                          else current.add(tag);
                          setEditingRestaurant({ ...editingRestaurant, ambience_tags: Array.from(current) });
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                            : 'bg-stone-50 border-stone-200 text-slate-700 hover:bg-stone-100'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nearby Landmarks & Context */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nearby Landmarks (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editingRestaurant.nearby_landmarks?.join(', ') || ''}
                    onChange={(e) =>
                      setEditingRestaurant({
                        ...editingRestaurant,
                        nearby_landmarks: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="Delhi University North Campus, Metro Gate 4, Hudson Lane"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Specialty / Must-Try Dishes (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editingRestaurant.specialty_dishes?.join(', ') || ''}
                    onChange={(e) =>
                      setEditingRestaurant({
                        ...editingRestaurant,
                        specialty_dishes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="Cheese Bomb Burger, Baked Alfredo Pasta, Thick Shake"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              {editingRestaurant.is_temporarily_closed && (
                <div>
                  <label className="block text-xs font-bold text-amber-700 mb-1">
                    Temporary Closure Reason
                  </label>
                  <input
                    type="text"
                    value={editingRestaurant.temporary_closed_reason || ''}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, temporary_closed_reason: e.target.value })}
                    placeholder="e.g. Renovation until next week"
                    className="w-full px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setRestaurantModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Save Restaurant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD / EDIT MENU ITEM */}
      {/* ==================================================================== */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <h3 className="font-heading font-extrabold text-xl text-slate-900">
                {editingItem.id ? 'Edit Menu Dish' : 'Add Dish to Menu'}
              </h3>
              <button onClick={() => setItemModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={editingItem.category_id || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, category_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dish Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.name || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value, slug: slugify(e.target.value) })}
                    placeholder="Truffle Mushroom Pasta"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Price (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingItem.price || 0}
                    onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Ingredients, flavors, preparation method..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                />
              </div>

              {/* Dish Photo Visual Asset with Auto-match & Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Dish Photo Visual Asset
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (editingItem.name && editingItem.name.trim()) {
                        const matched = getSmartDishImage(editingItem.name);
                        setEditingItem({ ...editingItem, image_url: matched });
                        showToast(`Auto-matched accurate food photo for "${editingItem.name}"`, 'success');
                      } else {
                        showToast('Please type the dish name first to auto-match photo', 'info');
                      }
                    }}
                    className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer bg-orange-50 hover:bg-orange-100 px-2 py-0.5 rounded-lg border border-orange-200 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-orange-500" />
                    <span>Auto-Match Food Photo</span>
                  </button>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-16 h-16 rounded-xl border border-stone-200 bg-stone-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {editingItem.image_url ? (
                      <img 
                        src={editingItem.image_url} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold text-center px-1">No Image</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="url"
                      value={editingItem.image_url || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })}
                      placeholder="Enter photo URL or pick from presets below..."
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                    />

                    {/* Curated Food Preset Chips */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Curated Category Presets:
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 bg-stone-50 rounded-xl border border-stone-200/80">
                        {DISH_IMAGE_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setEditingItem({ ...editingItem, image_url: preset.imageUrl })}
                            className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                              editingItem.image_url === preset.imageUrl
                                ? 'bg-orange-500 text-white border-orange-500 shadow-2xs font-bold'
                                : 'bg-white text-slate-700 border-stone-200 hover:bg-stone-100'
                            }`}
                            title={preset.name}
                          >
                            {preset.name.split('/')[0].trim()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Spice Level (0 to 5)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={editingItem.spice_level ?? 0}
                    onChange={(e) => setEditingItem({ ...editingItem, spice_level: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Portion Size
                  </label>
                  <input
                    type="text"
                    value={editingItem.portion_size || 'Regular'}
                    onChange={(e) => setEditingItem({ ...editingItem, portion_size: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.is_available ?? true}
                    onChange={(e) => setEditingItem({ ...editingItem, is_available: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span>Available to Order</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.is_featured ?? false}
                    onChange={(e) => setEditingItem({ ...editingItem, is_featured: e.target.checked })}
                    className="w-4 h-4 text-amber-500 rounded"
                  />
                  <span>Chef's Special / Featured</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.is_must_try ?? false}
                    onChange={(e) => setEditingItem({ ...editingItem, is_must_try: e.target.checked })}
                    className="w-4 h-4 text-orange-500 rounded"
                  />
                  <span>🔥 Must-Try Signature Dish</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: CATEGORY */}
      {/* ==================================================================== */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200">
            <h3 className="font-heading font-extrabold text-lg text-slate-900">
              {editingCategory.id ? 'Edit Category' : 'New Menu Category'}
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="e.g. Woodfired Pizzas"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={editingCategory.sort_order ?? 0}
                  onChange={(e) => setEditingCategory({ ...editingCategory, sort_order: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: BULK MENU IMPORT */}
      {/* ==================================================================== */}
      {bulkImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-stone-200">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <h3 className="font-heading font-extrabold text-lg text-slate-900">
                Bulk Import Menu Items
              </h3>
              <button onClick={() => setBulkImportModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Paste JSON or CSV (Format: <code>Name, Price, Description, DietaryTag</code>).
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Category *
              </label>
              <select
                value={bulkCategoryId}
                onChange={(e) => setBulkCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              rows={8}
              value={bulkImportText}
              onChange={(e) => setBulkImportText(e.target.value)}
              placeholder={`Classic Cappuccino, 180, Double espresso with velvety foam, Veg\nCold Brew, 210, 18-hour slow steep, Vegan\nAvocado Toast, 320, Sourdough with cherry tomatoes, Veg`}
              className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-mono focus:outline-hidden"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBulkImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkImport}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
              >
                Run Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: COLLECTION & ICONIC AREA GUIDE */}
      {/* ==================================================================== */}
      {collectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-stone-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-slate-900">
                  {editingCollection.id ? 'Edit Guide / Collection' : 'Create Living Area Guide'}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure neighborhood identity, Metro station/gate, GPS pin, vibe badge, and top famous dishes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCollectionModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCollection} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Guide Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCollection.title || ''}
                    onChange={(e) => setEditingCollection({ ...editingCollection, title: e.target.value, slug: slugify(e.target.value) })}
                    placeholder="e.g. Hudson Lane / North Campus Food Guide"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Slug / URL Path
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCollection.slug || ''}
                    onChange={(e) => setEditingCollection({ ...editingCollection, slug: slugify(e.target.value) })}
                    placeholder="e.g. hudson-lane-food-guide"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingCollection.description || ''}
                  onChange={(e) => setEditingCollection({ ...editingCollection, description: e.target.value })}
                  placeholder="The undisputed student food hub of Delhi University. Famous for giant monster shakes, crispy momos..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cover Photo URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={editingCollection.cover_image_url || ''}
                    onChange={(e) => setEditingCollection({ ...editingCollection, cover_image_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Collection Type
                  </label>
                  <select
                    value={editingCollection.type || 'Area-Guide'}
                    onChange={(e) => {
                      const t = e.target.value as any;
                      setEditingCollection({
                        ...editingCollection,
                        type: t,
                        area_metadata: t === 'Area-Guide' ? (editingCollection.area_metadata || {
                          area_name: editingCollection.title || '',
                          zone: 'North Delhi',
                          vibe_badge: 'Buzzing student adda, late-night waffles & pocket-friendly platters.',
                          best_time_to_visit: '4:00 PM – 11:30 PM',
                          nearest_metro: 'GTB Nagar Metro Station (Yellow Line), Exit Gate 4',
                          parking_tips: 'Paid municipal parking near Hudson Lane gate.',
                          avg_cost_for_two: 500,
                          latitude: 28.6942,
                          longitude: 77.2045,
                          famous_dishes: [],
                          food_crawl_stops: [],
                        }) : undefined
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold"
                  >
                    <option value="Area-Guide">📍 Living Area Guide (with Metro, GPS & Vibe)</option>
                    <option value="Editorial">Editorial Themed List</option>
                    <option value="City-based">City-based</option>
                    <option value="Cuisine-based">Cuisine-based</option>
                    <option value="Occasion-based">Occasion-based</option>
                  </select>
                </div>
              </div>

              {/* AREA METADATA SECTION */}
              {(editingCollection.type === 'Area-Guide' || !!editingCollection.area_metadata) && (
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-rose-900 font-extrabold text-xs uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span>Area Guide Metadata & Insider Tips</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Zone</label>
                      <select
                        value={editingCollection.area_metadata?.zone || 'North Delhi'}
                        onChange={(e) => setEditingCollection({
                          ...editingCollection,
                          area_metadata: {
                            ...(editingCollection.area_metadata || {} as any),
                            zone: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
                      >
                        <option value="North Delhi">North Delhi</option>
                        <option value="West Delhi">West Delhi</option>
                        <option value="Central Delhi">Central Delhi</option>
                        <option value="South Delhi">South Delhi</option>
                        <option value="East Delhi">East Delhi</option>
                        <option value="Gurgaon">Gurgaon</option>
                        <option value="Noida">Noida</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Avg Cost for Two (₹)</label>
                      <input
                        type="number"
                        value={editingCollection.area_metadata?.avg_cost_for_two || 500}
                        onChange={(e) => setEditingCollection({
                          ...editingCollection,
                          area_metadata: {
                            ...(editingCollection.area_metadata || {} as any),
                            avg_cost_for_two: Number(e.target.value) || 500
                          }
                        })}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Vibe Badge</label>
                    <input
                      type="text"
                      value={editingCollection.area_metadata?.vibe_badge || ''}
                      onChange={(e) => setEditingCollection({
                        ...editingCollection,
                        area_metadata: {
                          ...(editingCollection.area_metadata || {} as any),
                          vibe_badge: e.target.value
                        }
                      })}
                      placeholder="e.g. Buzzing student adda, late-night waffles & pocket-friendly platters."
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Nearest Metro & Exit Gate</label>
                      <input
                        type="text"
                        value={editingCollection.area_metadata?.nearest_metro || ''}
                        onChange={(e) => setEditingCollection({
                          ...editingCollection,
                          area_metadata: {
                            ...(editingCollection.area_metadata || {} as any),
                            nearest_metro: e.target.value
                          }
                        })}
                        placeholder="e.g. GTB Nagar Metro Station (Yellow Line), Gate 4"
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Parking Advice</label>
                      <input
                        type="text"
                        value={editingCollection.area_metadata?.parking_tips || ''}
                        onChange={(e) => setEditingCollection({
                          ...editingCollection,
                          area_metadata: {
                            ...(editingCollection.area_metadata || {} as any),
                            parking_tips: e.target.value
                          }
                        })}
                        placeholder="e.g. Paid municipal parking near Hudson Lane gate."
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Best Time to Visit</label>
                      <input
                        type="text"
                        value={editingCollection.area_metadata?.best_time_to_visit || ''}
                        onChange={(e) => setEditingCollection({
                          ...editingCollection,
                          area_metadata: {
                            ...(editingCollection.area_metadata || {} as any),
                            best_time_to_visit: e.target.value
                          }
                        })}
                        placeholder="e.g. 4:00 PM – 11:30 PM (Lively student addas & evening bites)"
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Famous For Summary</label>
                      <input
                        type="text"
                        value={editingCollection.area_metadata?.famous_for_summary || ''}
                        onChange={(e) => setEditingCollection({
                          ...editingCollection,
                          area_metadata: {
                            ...(editingCollection.area_metadata || {} as any),
                            famous_for_summary: e.target.value
                          }
                        })}
                        placeholder="e.g. Monster Shakes, Kurkure Momos, Desi Ghee Thalis..."
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Latitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={editingCollection.area_metadata?.latitude || 28.6139}
                        onChange={(e) => setEditingCollection({
                          ...editingCollection,
                          area_metadata: {
                            ...(editingCollection.area_metadata || {} as any),
                            latitude: Number(e.target.value)
                          }
                        })}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Longitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={editingCollection.area_metadata?.longitude || 77.2090}
                        onChange={(e) => setEditingCollection({
                          ...editingCollection,
                          area_metadata: {
                            ...(editingCollection.area_metadata || {} as any),
                            longitude: Number(e.target.value)
                          }
                        })}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-mono"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition((pos) => {
                            setEditingCollection({
                              ...editingCollection,
                              area_metadata: {
                                ...(editingCollection.area_metadata || {} as any),
                                latitude: Number(pos.coords.latitude.toFixed(5)),
                                longitude: Number(pos.coords.longitude.toFixed(5))
                              }
                            });
                            showToast('GPS coordinates updated from your device!', 'info');
                          });
                        }
                      }}
                      className="px-3 py-2 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <Navigation className="w-3.5 h-3.5 text-rose-500" />
                      <span>Use My GPS</span>
                    </button>
                  </div>

                  {/* -------------------------------------------------------- */}
                  {/* FAMOUS DISHES SPOTLIGHT MANAGER */}
                  {/* -------------------------------------------------------- */}
                  <div className="pt-3 border-t border-rose-200/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-rose-600" />
                        <span className="text-xs font-bold text-slate-800">
                          Top Famous Dishes Spotlight ({(editingCollection.area_metadata?.famous_dishes || []).length})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const currentDishes = editingCollection.area_metadata?.famous_dishes || [];
                          const newDish: FamousDishSpotlight = {
                            name: '',
                            price: 180,
                            restaurant_name: '',
                            why_famous: '',
                            image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
                            is_veg: true,
                          };
                          setEditingCollection({
                            ...editingCollection,
                            area_metadata: {
                              ...(editingCollection.area_metadata || {} as any),
                              famous_dishes: [...currentDishes, newDish],
                            },
                          });
                        }}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1 shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Famous Dish</span>
                      </button>
                    </div>

                    {(editingCollection.area_metadata?.famous_dishes || []).length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic p-3 bg-white rounded-xl border border-stone-200 text-center">
                        No famous dishes added yet. Click "+ Add Famous Dish" to spotlight iconic dishes of this area.
                      </p>
                    ) : (
                      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                        {(editingCollection.area_metadata?.famous_dishes || []).map((dish, dIdx) => (
                          <div
                            key={dIdx}
                            className="p-3 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-2.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                                Dish #{dIdx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (editingCollection.area_metadata?.famous_dishes || []).filter((_, idx) => idx !== dIdx);
                                  setEditingCollection({
                                    ...editingCollection,
                                    area_metadata: {
                                      ...(editingCollection.area_metadata || {} as any),
                                      famous_dishes: updated,
                                    },
                                  });
                                }}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                                title="Delete Dish"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Dish Name *</label>
                                <input
                                  type="text"
                                  required
                                  value={dish.name}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const dishes = [...(editingCollection.area_metadata?.famous_dishes || [])];
                                    dishes[dIdx] = { ...dishes[dIdx], name: val };
                                    setEditingCollection({
                                      ...editingCollection,
                                      area_metadata: {
                                        ...(editingCollection.area_metadata || {} as any),
                                        famous_dishes: dishes,
                                      },
                                    });
                                  }}
                                  placeholder="e.g. Crispy Kurkure Momos"
                                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Price (₹) *</label>
                                <input
                                  type="number"
                                  required
                                  value={dish.price}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const dishes = [...(editingCollection.area_metadata?.famous_dishes || [])];
                                    dishes[dIdx] = { ...dishes[dIdx], price: val };
                                    setEditingCollection({
                                      ...editingCollection,
                                      area_metadata: {
                                        ...(editingCollection.area_metadata || {} as any),
                                        famous_dishes: dishes,
                                      },
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Restaurant / Cafe Name</label>
                                <input
                                  type="text"
                                  value={dish.restaurant_name}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const dishes = [...(editingCollection.area_metadata?.famous_dishes || [])];
                                    dishes[dIdx] = { ...dishes[dIdx], restaurant_name: val };
                                    setEditingCollection({
                                      ...editingCollection,
                                      area_metadata: {
                                        ...(editingCollection.area_metadata || {} as any),
                                        famous_dishes: dishes,
                                      },
                                    });
                                  }}
                                  placeholder="e.g. Big Yellow Door"
                                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Why It's Famous</label>
                                <input
                                  type="text"
                                  value={dish.why_famous}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const dishes = [...(editingCollection.area_metadata?.famous_dishes || [])];
                                    dishes[dIdx] = { ...dishes[dIdx], why_famous: val };
                                    setEditingCollection({
                                      ...editingCollection,
                                      area_metadata: {
                                        ...(editingCollection.area_metadata || {} as any),
                                        famous_dishes: dishes,
                                      },
                                    });
                                  }}
                                  placeholder="Double fried panko crusted dumplings with fiery dip"
                                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 pt-1">
                              <div className="flex-1 flex items-center gap-2">
                                <input
                                  type="url"
                                  value={dish.image_url || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const dishes = [...(editingCollection.area_metadata?.famous_dishes || [])];
                                    dishes[dIdx] = { ...dishes[dIdx], image_url: val };
                                    setEditingCollection({
                                      ...editingCollection,
                                      area_metadata: {
                                        ...(editingCollection.area_metadata || {} as any),
                                        famous_dishes: dishes,
                                      },
                                    });
                                  }}
                                  placeholder="Image URL..."
                                  className="flex-1 px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-lg text-[11px]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (dish.name) {
                                      const matched = getSmartDishImage(dish.name);
                                      const dishes = [...(editingCollection.area_metadata?.famous_dishes || [])];
                                      dishes[dIdx] = { ...dishes[dIdx], image_url: matched };
                                      setEditingCollection({
                                        ...editingCollection,
                                        area_metadata: {
                                          ...(editingCollection.area_metadata || {} as any),
                                          famous_dishes: dishes,
                                        },
                                      });
                                      showToast(`Matched photo for "${dish.name}"`, 'success');
                                    } else {
                                      showToast('Please type dish name first', 'info');
                                    }
                                  }}
                                  className="px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold shrink-0 hover:bg-rose-100"
                                >
                                  Auto-Match Photo
                                </button>
                              </div>

                              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 cursor-pointer shrink-0">
                                <input
                                  type="checkbox"
                                  checked={dish.is_veg ?? true}
                                  onChange={(e) => {
                                    const val = e.target.checked;
                                    const dishes = [...(editingCollection.area_metadata?.famous_dishes || [])];
                                    dishes[dIdx] = { ...dishes[dIdx], is_veg: val };
                                    setEditingCollection({
                                      ...editingCollection,
                                      area_metadata: {
                                        ...(editingCollection.area_metadata || {} as any),
                                        famous_dishes: dishes,
                                      },
                                    });
                                  }}
                                  className="w-3.5 h-3.5 text-emerald-600 rounded"
                                />
                                <span>Pure Veg</span>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* -------------------------------------------------------- */}
                  {/* 3-STOP FOOD CRAWL ITINERARY MANAGER */}
                  {/* -------------------------------------------------------- */}
                  <div className="pt-3 border-t border-rose-200/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-xs font-bold text-slate-800">
                          Curated 3-Stop Food Crawl ({(editingCollection.area_metadata?.food_crawl_stops || []).length} stops)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const currentStops = editingCollection.area_metadata?.food_crawl_stops || [];
                          const stopNum = currentStops.length + 1;
                          const newStop: FoodCrawlStop = {
                            stop_number: stopNum,
                            time: stopNum === 1 ? '4:30 PM' : stopNum === 2 ? '7:00 PM' : '9:30 PM',
                            type: stopNum === 1 ? 'Afternoon Starters & Momos' : stopNum === 2 ? 'Main Course Dinner Feast' : 'Late Night Shakes & Desserts',
                            venue_name: '',
                            recommended_dish: '',
                            distance_to_next: stopNum === 3 ? 'End of Trail' : '150m (2 min walk)',
                            note: stopNum === 1 ? 'Start early to beat the rush' : stopNum === 2 ? 'Spacious indoor seating' : 'Wind down with sweet dessert',
                          };
                          setEditingCollection({
                            ...editingCollection,
                            area_metadata: {
                              ...(editingCollection.area_metadata || {} as any),
                              food_crawl_stops: [...currentStops, newStop],
                            },
                          });
                        }}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-white hover:bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center gap-1 shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Crawl Stop</span>
                      </button>
                    </div>

                    {(editingCollection.area_metadata?.food_crawl_stops || []).length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic p-3 bg-white rounded-xl border border-stone-200 text-center">
                        No crawl stops added yet. Click "+ Add Crawl Stop" to configure a recommended neighborhood walk!
                      </p>
                    ) : (
                      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                        {(editingCollection.area_metadata?.food_crawl_stops || []).map((stop, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-3 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                Stop #{stop.stop_number || sIdx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (editingCollection.area_metadata?.food_crawl_stops || []).filter((_, idx) => idx !== sIdx);
                                  setEditingCollection({
                                    ...editingCollection,
                                    area_metadata: {
                                      ...(editingCollection.area_metadata || {} as any),
                                      food_crawl_stops: updated,
                                    },
                                  });
                                }}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                                title="Delete Stop"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Time</label>
                                <input
                                  type="text"
                                  value={stop.time}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const stops = [...(editingCollection.area_metadata?.food_crawl_stops || [])];
                                    stops[sIdx] = { ...stops[sIdx], time: val };
                                    setEditingCollection({
                                      ...editingCollection,
                                      area_metadata: {
                                        ...(editingCollection.area_metadata || {} as any),
                                        food_crawl_stops: stops,
                                      },
                                    });
                                  }}
                                  placeholder="e.g. 4:30 PM"
                                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                                />
                              </div>

                              <div className="sm:col-span-3">
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Course / Experience Type</label>
                                <input
                                  type="text"
                                  value={stop.type}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const stops = [...(editingCollection.area_metadata?.food_crawl_stops || [])];
                                    stops[sIdx] = { ...stops[sIdx], type: val };
                                    setEditingCollection({
                                      ...editingCollection,
                                      area_metadata: {
                                        ...(editingCollection.area_metadata || {} as any),
                                        food_crawl_stops: stops,
                                      },
                                    });
                                  }}
                                  placeholder="e.g. Afternoon Crispy Momos & Chai"
                                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Venue / Cafe Name</label>
                                <input
                                  type="text"
                                  value={stop.venue_name}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const stops = [...(editingCollection.area_metadata?.food_crawl_stops || [])];
                                    stops[sIdx] = { ...stops[sIdx], venue_name: val };
                                    setEditingCollection({
                                      ...editingCollection,
                                      area_metadata: {
                                        ...(editingCollection.area_metadata || {} as any),
                                        food_crawl_stops: stops,
                                      },
                                    });
                                  }}
                                  placeholder="e.g. Ricos Cafe"
                                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Recommended Dish</label>
                                <input
                                  type="text"
                                  value={stop.recommended_dish}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const stops = [...(editingCollection.area_metadata?.food_crawl_stops || [])];
                                    stops[sIdx] = { ...stops[sIdx], recommended_dish: val };
                                    setEditingCollection({
                                      ...editingCollection,
                                      area_metadata: {
                                        ...(editingCollection.area_metadata || {} as any),
                                        food_crawl_stops: stops,
                                      },
                                    });
                                  }}
                                  placeholder="e.g. Crispy Kurkure Momos"
                                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Distance to Next Stop</label>
                                <input
                                  type="text"
                                  value={stop.distance_to_next || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const stops = [...(editingCollection.area_metadata?.food_crawl_stops || [])];
                                    stops[sIdx] = { ...stops[sIdx], distance_to_next: val };
                                    setEditingCollection({
                                      ...editingCollection,
                                      area_metadata: {
                                        ...(editingCollection.area_metadata || {} as any),
                                        food_crawl_stops: stops,
                                      },
                                    });
                                  }}
                                  placeholder="e.g. 150m (2 min walk)"
                                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Local Pro Tip / Note</label>
                                <input
                                  type="text"
                                  value={stop.note || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const stops = [...(editingCollection.area_metadata?.food_crawl_stops || [])];
                                    stops[sIdx] = { ...stops[sIdx], note: val };
                                    setEditingCollection({
                                      ...editingCollection,
                                      area_metadata: {
                                        ...(editingCollection.area_metadata || {} as any),
                                        food_crawl_stops: stops,
                                      },
                                    });
                                  }}
                                  placeholder="e.g. Beat the evening college rush"
                                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Enhanced Multi-select & Filter for Linked Cafes */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-800">
                      Linked Cafes & Restaurants:
                    </label>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                      {collectionItemsSelection.length} of {restaurants.length} Linked
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        const filteredIds = restaurants
                          .filter((r) => {
                            if (!collectionRestFilter.trim()) return true;
                            const text = `${r.name} ${r.city} ${r.address_line1}`.toLowerCase();
                            return text.includes(collectionRestFilter.toLowerCase());
                          })
                          .map((r) => r.id);
                        setCollectionItemsSelection((prev) => Array.from(new Set([...prev, ...filteredIds])));
                      }}
                      className="px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-700 text-[10.5px] font-bold"
                    >
                      Select Filtered
                    </button>
                    <button
                      type="button"
                      onClick={() => setCollectionItemsSelection([])}
                      className="px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-700 text-[10.5px] font-bold"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowOnlySelectedRests(!showOnlySelectedRests)}
                      className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold border transition-colors ${
                        showOnlySelectedRests
                          ? 'bg-rose-50 border-rose-300 text-rose-700'
                          : 'bg-white border-stone-200 text-slate-600'
                      }`}
                    >
                      {showOnlySelectedRests ? 'Showing Linked Only' : 'Show All'}
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={collectionRestFilter}
                    onChange={(e) => setCollectionRestFilter(e.target.value)}
                    placeholder="Search cafe name, locality or city to quickly link..."
                    className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1 p-2 bg-stone-50 rounded-2xl border border-stone-200">
                  {restaurants
                    .filter((r) => {
                      if (showOnlySelectedRests && !collectionItemsSelection.includes(r.id)) return false;
                      if (!collectionRestFilter.trim()) return true;
                      const text = `${r.name} ${r.city} ${r.address_line1}`.toLowerCase();
                      return text.includes(collectionRestFilter.toLowerCase());
                    })
                    .map((r) => {
                      const checked = collectionItemsSelection.includes(r.id);
                      return (
                        <label
                          key={r.id}
                          className={`flex items-center justify-between text-xs font-medium p-2 rounded-xl transition-all cursor-pointer ${
                            checked
                              ? 'bg-white border border-rose-200 text-slate-900 shadow-2xs font-semibold'
                              : 'hover:bg-white text-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setCollectionItemsSelection((prev) =>
                                  checked ? prev.filter((id) => id !== r.id) : [...prev, r.id]
                                );
                              }}
                              className="w-4 h-4 text-rose-600 rounded shrink-0 cursor-pointer"
                            />
                            <div className="truncate">
                              <span className="truncate">{r.name}</span>
                              <span className="text-[11px] text-slate-400 ml-1.5">
                                • {r.city} ({r.price_range})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                            {r.cuisine_types?.[0] && (
                              <span className="px-1.5 py-0.5 rounded bg-stone-100 text-slate-600">
                                {r.cuisine_types[0]}
                              </span>
                            )}
                            <span className="text-amber-600 font-bold">★ {r.rating_avg}</span>
                          </div>
                        </label>
                      );
                    })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setCollectionModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Save Guide & Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ⚡ BULK 50-CAFE & ICONIC AREA IMPORTER */}
      {/* ==================================================================== */}
      {bulkAreaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-rose-100 text-rose-600">
                  <Zap className="w-5 h-5 fill-rose-600" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-slate-900">
                    Bulk 50-Cafe & Iconic Area Importer
                  </h3>
                  <p className="text-xs text-slate-500">
                    Paste your list of cafes (e.g. 50 cafes of Nangloi, Hudson Lane, etc.) and auto-generate the complete Iconic Area Guide!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setBulkAreaModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkImportAreaCafes} className="space-y-4">
              {/* Quick 1-Click 50-Cafe Preset Buttons */}
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>1-Click Sample Pre-loaders (Ready-to-Test 50 Cafes):</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBulkAreaName('Nangloi');
                      setBulkAreaZone('West Delhi');
                      setBulkAreaVibe('Generous portions, pure desi ghee classics, lively family dining & budget student addas.');
                      setBulkAreaFamousFor('Rich Desi Ghee Thalis, Paneer Tikka Platters, Crispy Momos, Chole Bhature & Budget Addas.');
                      setBulkAreaMetro('Nangloi Metro Station (Green Line), Exit Gate 2');
                      setBulkAreaParking('Street parking available along Rohtak Road. E-rickshaws available from Metro.');
                      setBulkAreaCostForTwo(450);
                      setBulkAreaLat(28.6833);
                      setBulkAreaLng(77.0667);
                      setBulkAreaCafesText(NANGLOI_50_CAFES_SAMPLE);
                      showToast('Loaded 50 verified cafes for Nangloi (West Delhi)!', 'success');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-amber-300 text-amber-900 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Load 50 Nangloi Cafes Sample (West Delhi)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBulkAreaName('Hudson Lane');
                      setBulkAreaZone('North Delhi');
                      setBulkAreaVibe('Buzzing student adda, late-night monster shakes, crispy momos & pocket-friendly platters.');
                      setBulkAreaFamousFor('Monster Overload Shakes, Kurkure Momos, Pink Sauce Pasta, Woodfired Pizzas & Waffles.');
                      setBulkAreaMetro('GTB Nagar Metro Station (Yellow Line), Exit Gate 3');
                      setBulkAreaParking('Multilevel Metro parking at GTB Nagar Gate 2. E-rickshaws to Hudson Lane gate.');
                      setBulkAreaCostForTwo(500);
                      setBulkAreaLat(28.6942);
                      setBulkAreaLng(77.2045);
                      setBulkAreaCafesText(HUDSON_LANE_50_CAFES_SAMPLE);
                      showToast('Loaded 50 iconic cafes for Hudson Lane / North Campus DU!', 'success');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-amber-300 text-amber-900 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Load 50 Hudson Lane Cafes Sample (North Delhi)</span>
                  </button>
                </div>
              </div>

              {/* Area Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Area / Locality Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={bulkAreaName}
                    onChange={(e) => setBulkAreaName(e.target.value)}
                    placeholder="e.g. Nangloi, Hudson Lane, Rajouri Garden"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Zone
                  </label>
                  <select
                    value={bulkAreaZone}
                    onChange={(e) => setBulkAreaZone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold"
                  >
                    <option value="West Delhi">West Delhi</option>
                    <option value="North Delhi">North Delhi</option>
                    <option value="Central Delhi">Central Delhi</option>
                    <option value="South Delhi">South Delhi</option>
                    <option value="East Delhi">East Delhi</option>
                    <option value="Gurgaon">Gurgaon</option>
                    <option value="Noida">Noida</option>
                  </select>
                </div>
              </div>

              {/* Vibe and Famous For */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vibe Badge Summary
                  </label>
                  <input
                    type="text"
                    value={bulkAreaVibe}
                    onChange={(e) => setBulkAreaVibe(e.target.value)}
                    placeholder="e.g. Generous portions, pure desi ghee classics & party addas."
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Average Cost for Two (₹)
                  </label>
                  <input
                    type="number"
                    value={bulkAreaCostForTwo}
                    onChange={(e) => setBulkAreaCostForTwo(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Famous For / Food Identity Summary
                </label>
                <input
                  type="text"
                  value={bulkAreaFamousFor}
                  onChange={(e) => setBulkAreaFamousFor(e.target.value)}
                  placeholder="e.g. Rich Desi Ghee Thalis, Paneer Tikka Platters, Crispy Momos & Budget Student Addas."
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                />
              </div>

              {/* Metro & Parking Advice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nearest Delhi Metro Station & Gate
                  </label>
                  <input
                    type="text"
                    value={bulkAreaMetro}
                    onChange={(e) => setBulkAreaMetro(e.target.value)}
                    placeholder="e.g. Nangloi Metro Station (Green Line), Exit Gate 2"
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Parking Realities
                  </label>
                  <input
                    type="text"
                    value={bulkAreaParking}
                    onChange={(e) => setBulkAreaParking(e.target.value)}
                    placeholder="e.g. Street parking available. Metro & e-rickshaws recommended."
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={bulkAreaLat}
                    onChange={(e) => setBulkAreaLat(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={bulkAreaLng}
                    onChange={(e) => setBulkAreaLng(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition((pos) => {
                        setBulkAreaLat(Number(pos.coords.latitude.toFixed(5)));
                        setBulkAreaLng(Number(pos.coords.longitude.toFixed(5)));
                        showToast('Set to current GPS coordinates!', 'info');
                      });
                    }
                  }}
                  className="px-3 py-2 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1 shadow-2xs"
                >
                  <Navigation className="w-3.5 h-3.5 text-rose-500" />
                  <span>Use My Location</span>
                </button>
              </div>

              {/* 50 Cafes Textarea Input */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Paste 50 Cafes List (Text, CSV, TSV, or JSON) *
                  </label>
                  {bulkAreaCafesText.trim() && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>
                        {bulkAreaCafesText.trim().split(/\r?\n/).filter((l) => l.trim().length > 0 && !/^(name|cafe)[\s,\|\t]/i.test(l)).length} Cafes Detected
                      </span>
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <p className="font-semibold text-slate-700 mb-1">Supported Formats (accepts any):</p>
                  <ul className="list-disc list-inside space-y-0.5 font-mono text-[10.5px]">
                    <li>Delimited: <span className="text-rose-600">Cafe Name | Signature Dish | Dish Price | Cost for Two | Address</span></li>
                    <li>Simple text: <span className="text-rose-600">1. Cafe Name - Signature Dish - Address</span></li>
                    <li>Plain list: Just paste cafe names (one per line)</li>
                    <li>JSON array of restaurant/cafe objects</li>
                  </ul>
                </div>

                <textarea
                  rows={8}
                  required
                  value={bulkAreaCafesText}
                  onChange={(e) => setBulkAreaCafesText(e.target.value)}
                  placeholder={`Example list for Nangloi:\nNagpal Di Hatti | Chole Bhature | 140 | 300 | Main Rohtak Road, Nangloi\nBikaner Sweets & Restaurant | Paneer Butter Masala Thali | 240 | 500 | Near Nangloi Metro Gate 2\nThe Chai Adda | Kulhad Chai & Bun Maska | 80 | 200 | Nangloi Camp Market\nYellow Chilli Cafe | Tandoori Kurkure Momos | 160 | 400 | Shiv Ram Park, Nangloi\nAggarwal Sweet Corner | Special Rasmalai & Samosa | 90 | 220 | Railway Road, Nangloi`}
                  className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-mono focus:outline-hidden leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setBulkAreaModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-stone-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={bulkAreaLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {bulkAreaLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Creating Cafes, Dishes & Area Guide...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white" />
                      <span>⚡ Import Cafes & Generate Iconic Guide</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: 📋 SUPABASE SQL SCRIPT VIEWER & EXPORT */}
      {/* ==================================================================== */}
      {sqlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-stone-200 max-h-[90vh] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-rose-100 text-rose-600">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-slate-900">
                    Supabase PostgreSQL SQL Schema & RLS Policies
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ready-to-run SQL script for <code className="text-rose-600 font-bold">collections</code>, <code className="text-rose-600 font-bold">area_metadata JSONB</code>, and <code className="text-rose-600 font-bold">collection_items</code>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSqlModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 flex-1 overflow-hidden flex flex-col">
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">How to apply in Supabase:</span> Open your Supabase Dashboard, go to <strong>SQL Editor</strong> in the left sidebar, paste this script, and click <strong>Run</strong>. It is 100% idempotent and safe to re-run.
                </div>
              </div>

              <div className="relative flex-1 overflow-hidden rounded-2xl border border-stone-800 bg-stone-950 text-stone-200 font-mono text-[11px]">
                <div className="p-4 overflow-y-auto max-h-[46vh] whitespace-pre select-all leading-relaxed">
                  {ICONIC_AREAS_SQL_FEATURE}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <span className="text-xs text-slate-400">
                Includes GIN index on <code className="text-slate-600">area_metadata</code> & RLS policies
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSqlModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-stone-100"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={copyIconicSql}
                  className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedIconicSql ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy SQL to Clipboard</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

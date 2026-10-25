# Public Feature Catalog & Matrix: Menu Maps

This document catalogs every customer-facing feature discovered during the codebase audit of Menu Maps ([https://menumaps.in](https://menumaps.in)).

---

## 1. Feature Classification Matrix

| Feature | Customer Purpose | Where It Appears | Current Implementation | Verification Status | Known Limitations |
|---|---|---|---|---|---|
| **Location Context Switcher** | Switch discovery context between 64 Delhi localities or All Delhi NCR | Global Navbar & Mobile Header | Implemented in code | Code-inspected & Build-verified | Restricted to Delhi NCR geographic boundary |
| **Live GPS Auto-Detection** | Detect device coordinates and map to nearest Delhi neighborhood | `LocationPickerModal` & `/nearby` | Implemented in code | Code-inspected (HTML5 Geolocation) | Requires user browser permission; defaults to All Delhi if outside Delhi NCR |
| **Real-Time Meal Window Context** | Displays dynamic context banner based on time of day (Breakfast, Lunch, Dinner, etc.) | Homepage Hero & Explore Directory | Implemented in code | Code-inspected | Driven by client device clock; can be manually overridden in Discovery Context |
| **Universal Dual Search** | Search across restaurant names, cuisines, and dish menus simultaneously | Navbar, `/`, `/restaurants`, `/search` | Implemented in code | Code-inspected & Build-verified | Uses in-memory string matching and tokenization |
| **Counter Bill Ticket vs. App Markup** | Visual proof showing customer savings vs. delivery aggregator fees | Homepage Hero Column 2 | Implemented in code | Code-inspected | Uses mathematical baseline formula (28% markup + fees) |
| **Bill Comparison Widget** | Interactive slider allowing users to calculate exact savings on dine-in meals | Homepage Section | Implemented in code | Code-inspected | Default comparison compares in-store bill against typical delivery platform charges |
| **Visual Cravings Row** | 1-tap horizontal image slider for quick cravings (Momos, Shakes, Waffles, etc.) | Homepage | Implemented in code | Code-inspected | Preset list of popular cravings |
| **Curated Playlist Shelves** | Horizontal shelves showcasing Late-Night Spots, Budget Gems, and Trending Cafes | Homepage | Implemented in code | Code-inspected | Algorithmically filtered from venue database |
| **Proximity-Sorted Cafe Grid** | Displays cafes sorted by distance with live distance tags, ratings, and metro stops | Homepage & `/restaurants` | Implemented in code | Code-inspected & Build-verified | Relies on valid venue coordinate data |
| **Signature Dishes Spotlight** | Showcase top-rated dishes with counter prices and savings tags | Homepage Section | Implemented in code | Code-inspected | Curated from popular menu items |
| **Spin the Food Wheel** | Gamified decision maker randomizing local dishes for undecided diners | Homepage Modal (`SpinWheelModal`) | Implemented in code | Code-inspected | Picks from currently loaded venue dataset |
| **60-Second Craving Quiz** | 3-step quiz recommending meals based on mood, budget, and cravings | Homepage Modal (`FoodQuizModal`) | Implemented in code | Code-inspected | Quiz choices map to predefined filter categories |
| **Day Planner / Food Crawl Modal** | Itinerary generator suggesting a multi-stop walking food crawl | Homepage Modal (`DayPlannerModal`) | Implemented in code | Code-inspected | Template-based multi-stop suggestions |
| **Explore Directory Filter Bar** | Comprehensive filter for Cuisines, Price Tiers, Dietary, and Facilities | `/restaurants` | Implemented in code | Code-inspected & Build-verified | Multi-select filters run client-side |
| **Distance-Locked Near Me Feed** | Dedicated feed sorting strictly by distance from user position | `/nearby` | Implemented in code | Code-inspected & Build-verified | Requires geolocation access for meters/km distance accuracy |
| **Single Cafe Page (Storefront)** | Comprehensive cafe view with photos, hours, amenities, and full menu | `/restaurant/:slug` & `/:slug` | Implemented in code | Code-inspected & Build-verified | Static pre-rendered fallback with dynamic hydration |
| **Menu Category Tabs** | Horizontal scroll tabs categorizing food items by section | `/restaurant/:slug` | Implemented in code | Code-inspected | Generated dynamically from `menu_categories` |
| **In-Menu Dish Search** | Live search filtering only dishes within the current restaurant | `/restaurant/:slug` | Implemented in code | Code-inspected | Instant string match across item names and descriptions |
| **Honest Bill Box** | On-page cafe receipt calculator comparing walk-in bill vs. online order | `/restaurant/:slug` | Implemented in code | Code-inspected | Mathematical simulation comparing counter vs. app costs |
| **Counter Pulse Ticker** | Displays social proof counter of how many diners checked this menu today | `/restaurant/:slug` | Implemented in code | Code-inspected | Client-side daily seeded counter |
| **Top Picks Spotlight** | Highlights must-try items at an individual restaurant | `/restaurant/:slug` | Implemented in code | Code-inspected | Filtered by `is_must_try` or `is_popular` flags |
| **Dish Roulette Modal** | Cafe-specific spinner picking a random item from this cafe's menu | `/restaurant/:slug` (`DishRouletteModal`) | Implemented in code | Code-inspected | Limited to available menu items at that venue |
| **Table Perk Wheel Modal** | Gamified wheel offering table perks (free drink, dessert, discount) | `/restaurant/:slug` (`TablePerkWheelModal`) | Implemented in code | Code-inspected | Promotional engagement widget |
| **WhatsApp Order Drawer** | Itemized cart builder with fulfillment options and direct WhatsApp launch | `/restaurant/:slug` (`WhatsAppOrderDrawer`) | Implemented in code | Code-inspected & Build-verified | Requires user to have WhatsApp installed / Web client |
| **Table Reservation Request** | Modal capturing date, time, and guest count for table booking | `/restaurant/:slug` (`TableReservationModal`) | Implemented in code | Code-inspected | Sends request to cafe phone/WhatsApp |
| **Dine-In QR Standee Preview** | Generates digital QR standee for tabletop scanning | `/restaurant/:slug` (`RestaurantQrModal`) | Implemented in code | Code-inspected | Generates SVG/PNG QR code pointing to cafe's clean URL |
| **Social Share Modal** | Share venue link with pre-copied URL and WhatsApp/Twitter share links | `/restaurant/:slug` (`SocialShareModal`) | Implemented in code | Code-inspected | Native Web Share API with clipboard fallback |
| **Verified Dish Detail Page** | Dedicated page for an individual dish with price transparency | `/food/:slug` & `/dish/:slug` | Implemented in code | Code-inspected & Build-verified | Indexed with Schema.org `MenuItem` structured data |
| **Locality Price Comparison** | Compares dish price against neighborhood average for same item | `/food/:slug` (`LocalityPriceComparisonCard`) | Implemented in code | Code-inspected | Computes average from catalog items |
| **Dish Pairing Strip** | Suggests complementary items (beverages, sides) for a dish | `/food/:slug` (`DishPairingStrip`) | Implemented in code | Code-inspected | Recommends items from same venue or category |
| **Offline Bookmarks Vault** | Private bookmarking of restaurants and dishes without login | `/bookmarks` | Implemented in code | Code-inspected & Build-verified | Stored locally in `localStorage`; not synced across devices |
| **Cafe Self-Listing Portal** | Public onboarding form for cafe owners to list their business for free | `/list-cafe` & `/create-cafe` | Implemented in code | Code-inspected & Build-verified | Submits record to database for verification |
| **Ownership Claim & Verify** | Verification flow allowing cafe owners to claim an indexed listing | `/claim-verify` | Implemented in code | Code-inspected | Requires matching phone/email verification |
| **Mobile Bottom Navigation** | Sticky 4-tab bar (Home, Restaurants, Search, Saved) for mobile devices | Global (Mobile viewport `< 768px`) | Implemented in code | Code-inspected & Build-verified | Automatically hidden on desktop viewports |
| **Toast Notification System** | Floating feedback alerts for bookmarks, errors, and location updates | Global App Wrapper (`Toast.tsx`) | Implemented in code | Code-inspected & Build-verified | Accessible floating portal alerts |
| **Error Boundary Catchers** | Fallback UI catching render crashes without breaking whole app | Global App Wrapper (`ErrorBoundary.tsx`) | Implemented in code | Code-inspected | Provides reload and home navigation buttons |

---

## 2. In-Depth Feature Domain Analysis

### Domain A: Geospatial Discovery & Proximity Ranking
* **Implementation:** `src/lib/location.ts` and `src/context/LocationContext.tsx`.
* **Verification:** The website contains 64 statically defined Delhi localities with accurate GPS coordinates, metro station names, and metro line colors. Distance calculations use the standard Haversine formula (`R = 6371 km`).
* **Behavior:** When distance sort is active, distances under 1,000 meters are formatted as meters (e.g. `450 m`), while greater distances display in kilometers (e.g. `2.8 km`).

### Domain B: Price Transparency & Markup Calculations
* **Implementation:** `src/lib/engine/discoveryEngine.ts` and `src/components/discovery/BillComparisonWidget.tsx`.
* **Formula:** `calculateCounterSavings(price)`:
  - App Menu Price: `Math.round(price * 1.28)` (28% aggregator markup).
  - Platform Fee: `₹35`.
  - Delivery Fee: `₹40`.
  - Surge & Packaging: `₹25`.
  - Total Savings = `(App Menu Price + 35 + 40 + 25) - Counter Price`.

### Domain C: Direct WhatsApp Commission-Free Ordering
* **Implementation:** `src/components/WhatsAppOrderDrawer.tsx`.
* **Behavior:** Tracks an array of `CartItem` objects with quantity. Formats order as a markdown-styled message:
  ```
  🍽️ *NEW ORDER via Menu Maps*
  ━━━━━━━━━━━━━━━━━━━━━━
  *Restaurant:* The Hudson Cafe
  *Order Type:* Dine-in at Table (Table 6)
  
  *Items:*
  • 2x Cold Coffee (₹140) = ₹280
  • 1x Peri Peri Fries (₹160) = ₹160
  
  ━━━━━━━━━━━━━━━━━━━━━━
  *Counter Total:* ₹440
  *(0% App Markup • Direct Dine-in/Store Rate)*
  ```
* **Limitation:** Does not track live order delivery tracking; acts as an instant direct dispatcher to the kitchen.

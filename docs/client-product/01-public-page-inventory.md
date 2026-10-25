# Public Website Page Inventory: Menu Maps

This document provides a comprehensive inventory of all customer-facing routes, page types, visual layouts, interactions, data dependencies, and failure states currently implemented on Menu Maps ([https://menumaps.in](https://menumaps.in)).

---

## Summary of Public Route Patterns

| Route Pattern | Page Name | Primary Component | Rendering Mode |
|---|---|---|---|
| `/` | Public Homepage | `src/pages/Home.tsx` | Static Snapshot + Client SPA |
| `/restaurants` | Explore Restaurants Directory | `src/pages/RestaurantsList.tsx` (`mode="explore"`) | Static Snapshot + Client SPA |
| `/nearby` | Best Cafes Near Me | `src/pages/RestaurantsList.tsx` (`mode="near_me"`) | Static Snapshot + Client SPA |
| `/restaurant/:slug` | Restaurant Detail Page | `src/pages/RestaurantDetail.tsx` | Static Snapshot + Client SPA |
| `/:slug` (Direct clean slug) | Restaurant Detail (Clean URL) | `src/pages/RestaurantDetail.tsx` | Static Snapshot + Client SPA |
| `/search` | Universal Search & Discovery | `src/pages/Search.tsx` | Static Snapshot + Client SPA |
| `/food/:slug` & `/dish/:slug` | Verified Dish Detail Page | `src/pages/FoodDetail.tsx` | Static Snapshot + Client SPA |
| `/bookmarks` | Saved Places & Dishes Vault | `src/pages/Bookmarks.tsx` | Client SPA (Offline LocalStorage) |
| `/list-cafe` & `/create-cafe` | Partner Cafe Self-Onboarding | `src/pages/ListCafe.tsx` | Static Snapshot + Client SPA |
| `/claim-verify` | Cafe Ownership Verification | `src/pages/ClaimVerify.tsx` | Client SPA |
| `/owner/login` | Cafe Owner Authentication | `src/pages/OwnerLogin.tsx` | Client SPA |
| `/owner/dashboard` | Cafe Owner Self-Service Portal | `src/pages/OwnerDashboard.tsx` | Client SPA (Authenticated Session) |
| `/about` | About Menu Maps & Transparency | `src/pages/StaticPages.tsx` (`type="about"`) | Static Snapshot + Client SPA |
| `/contact` | Contact & Partner Support | `src/pages/StaticPages.tsx` (`type="contact"`) | Static Snapshot + Client SPA |
| `/terms` | Terms of Service | `src/pages/StaticPages.tsx` (`type="terms"`) | Static Snapshot + Client SPA |
| `/privacy` | Privacy Policy | `src/pages/StaticPages.tsx` (`type="privacy"`) | Static Snapshot + Client SPA |
| `*` (Unmatched routes) | 404 Page Not Found | `src/pages/NotFound.tsx` | Client SPA |

---

## Detailed Page Inventory

### 1. Public Homepage (`/`)
* **Source Component:** `src/pages/Home.tsx`
* **Primary Purpose:** Introduce Menu Maps value proposition, display time-of-day food context, provide instant location-aware search, show real bill savings vs food apps, and showcase verified neighborhood dining spots.
* **Intended User:** Any prospective diner, student, or cafe customer in Delhi NCR.
* **How Reached:** Direct navigation to `https://menumaps.in/`, clicking logo in Navbar/Footer, or clicking "Home" in mobile bottom nav.
* **Visual Hierarchy:**
  1. Sticky Global Navbar with Location Picker Pill & Direct Search.
  2. Sub-bar with active neighborhood context & Delhi Metro indicator.
  3. Left Hero Column: Real-time meal context badge ("Evening Snacks", "Lunch Fuel", etc.), main value proposition headline, search bar with instant cravings chips, and mood filters.
  4. Right Hero Column: Authentic Counter Bill Ticket with perforation visual, comparing in-store rate vs. typical app markup.
  5. 1-Tap Cravings visual horizontal scroll strip (`VisualCravingsRow`).
  6. Real Bill Comparison Calculator (`BillComparisonWidget`).
  7. Curated Playlist Shelves (`CuratedPlaylistsSection`: "Late-Night Spots", "Pocket-Friendly Gems", "Trending Spots").
  8. Proximity-sorted Verified Cafes Grid with live distance, dietary filters, and quick bookmarks.
  9. Signature Dish Spotlight feed.
  10. Interactive Decision Cards ("Spin the Food Wheel" and "60-Second Craving Quiz").
  11. Clean Diner CTA Banner leading to `/restaurants` and `/search`.
* **Important Controls & Inputs:**
  - Search Input: Submits search query to `/search?q=...`.
  - Cravings Chips: Instant navigation to filtered search for Momos, Shakes, Chur Chur Naan, etc.
  - Mood Filter Pills (`All`, `Pure Veg`, `Budget`, `Late night`, `Rooftop`): Re-filters cafe list and smooth-scrolls to `#cafes`.
  - Location Pill: Launches `LocationPickerModal`.
  - Modals: "Spin the Food Wheel" opens `SpinWheelModal`, "Take 60-Second Quiz" opens `FoodQuizModal`, "Plan Foodie Crawl" opens `DayPlannerModal`.
* **Data Dependencies:** `api.getRestaurants(true)`, `api.getMenuItems()`, `LocationContext`, `DiscoveryContext`.
* **States:**
  - *Loading:* Centered spinner while initial venue data hydrates.
  - *Empty:* If no cafes match selected dietary filter in current location, friendly prompt offering to clear filters or switch to "All Delhi NCR".
* **Responsive Behavior:** 
  - Desktop: 2-column hero with interactive ticket on right; 4-column restaurant grid.
  - Mobile: Single column; sticky bottom navigation; touch-optimized horizontal scroll bars with hidden native scrollbars.

---

### 2. Restaurants Directory (`/restaurants`)
* **Source Component:** `src/pages/RestaurantsList.tsx` (`initialMode="explore"`)
* **Primary Purpose:** Comprehensive multi-filter directory of all 770+ verified cafes across Delhi NCR.
* **Intended User:** Diners actively filtering places by budget, cuisine, dietary policy, facilities, or ratings.
* **How Reached:** Navbar "Restaurants" link, Mobile bottom nav "Restaurants" tab, or homepage CTAs.
* **Visual Hierarchy:**
  1. Search & Filter Bar with live autocomplete dropdown.
  2. Active location indicator banner with quick switch option.
  3. Dynamic Meal-Time Hero Banner (`MealTimeHeroBanner`).
  4. Multi-tier Filter Strip: Cuisine selector, Price tier (`₹`, `₹₹`, `₹₹₹`), Dietary preferences (`Pure Veg`, `Jain`, etc.), Sort Dropdown, and Mobile Filter Sheet button.
  5. Venue Results Header showing total count in active area.
  6. Responsive Card Grid rendering `RestaurantCard` components.
* **Important Controls & Inputs:**
  - Autocomplete Search Bar: Filters both venue names and individual menu dishes in real-time.
  - Sort Selector: Rating (High to Low), Cost (Low to High), Cost (High to Low), Distance (Nearest first).
  - Facility Filters: Free Wi-Fi, Plug points, AC, Outdoor, Pet Friendly, Free RO water.
* **Data Dependencies:** `CentralDiscoveryEngine`, `api.getRestaurants(true)`, `api.getMenuItems()`.
* **States:**
  - *Loading:* Skeleton cards (`RestaurantCardSkeleton`).
  - *Empty State:* "No verified cafes match your active filters" with a single-click "Reset All Filters" button.

---

### 3. Best Cafes Near Me (`/nearby`)
* **Source Component:** `src/pages/RestaurantsList.tsx` (`initialMode="near_me"`)
* **Primary Purpose:** Dedicated GPS-first discovery experience sorting venues strictly by walking and driving distance.
* **Intended User:** Diners currently on the move, in transit, or standing outside searching for immediate food options.
* **How Reached:** Footer "Best Cafes Near Me" link, direct URL `/nearby`, or GPS prompts.
* **Key Differences from `/restaurants`:**
  - Default sort option is forced to `distance` (nearest first).
  - Triggers browser geolocation prompt immediately on first visit.
  - Displays distance in meters (`< 1 km`) or kilometers with 1 decimal precision.

---

### 4. Restaurant Detail Page (`/restaurant/:slug` & `/:slug`)
* **Source Component:** `src/pages/RestaurantDetail.tsx`
* **Primary Purpose:** Comprehensive digital storefront for an individual cafe displaying exact in-store counter menus, verified prices, seating photos, opening hours, metro directions, amenities, and direct WhatsApp ordering.
* **Intended User:** Customer deciding whether to visit a venue, planning a meal, or ordering directly from table/takeaway.
* **How Reached:** Clicking any `RestaurantCard`, searching a dish/venue, or navigating to direct slug (e.g., `https://menumaps.in/the-pizza-family`).
* **Visual Hierarchy (Top to Bottom):**
  1. Back button & Breadcrumb navigation (`Home > Restaurants > [Cafe Name]`).
  2. Verification & Counter Badge ("100% Counter Prices Verified • 0% Markup").
  3. Cafe Header: Name, cuisine tags, average rating, cost for two, open/closed status.
  4. Quick Action Row: Save/Bookmark, Share, Table Reservation, Dine-In QR Standee preview, Direct Call, Google Maps Navigation.
  5. Storefront Photo Gallery with community uploads.
  6. Transparency Super Widgets:
     - `HonestBillBox`: Real receipt comparison calculator.
     - `CounterPulseTicker`: Number of diners checking menu today.
     - `TopPicksSpotlight`: Signature dishes.
     - `NeighborStealBanner`: What to pair nearby.
  7. Menu Explorer:
     - Category Navigation Bar (horizontal tabs: Pizzas, Pastas, Shakes, etc.).
     - In-menu Search bar.
     - Dietary switch (Veg only, All).
     - Menu Item Cards with price, spice level, portion size, and "Add to WhatsApp Order" button.
  8. Interactive Decision Widgets:
     - `DishRouletteModal`: Spin to pick a dish from this specific menu.
     - `TablePerkWheelModal`: Table discounts and free perks.
  9. Venue Information Grid:
     - Nearest Metro Station & Gate.
     - Water Policy (Free RO water vs. paid mineral bottle).
     - Birthday Cake Policy (cutting fee or free).
     - Wi-Fi availability & power outlets for laptops.
     - Full 7-day opening hours schedule.
  10. `SmartReviewShield`: Community reviews with photos, ratings, and owner responses.
  11. Floating / Drawer Cart: `WhatsAppOrderDrawer` appearing when items are added.
* **Data Dependencies:** `api.getRestaurantBySlug(slug)`, `api.getMenuCategories(id)`, `api.getMenuItems(id)`, `api.getReviews(id)`.
* **States:**
  - *Loading:* Full page pulse loader.
  - *Not Found:* Renders inline `NotFound` component if slug doesn't exist in live database or seed datasets.

---

### 5. Universal Search & Cravings (`/search`)
* **Source Component:** `src/pages/Search.tsx`
* **Primary Purpose:** Dual-entity search engine for both restaurants and specific food dishes across Delhi NCR.
* **Intended User:** Diners searching for specific cravings ("Butter Chicken", "Boba Tea", "Nutella Waffles") or specific brand names.
* **How Reached:** Navbar search icon, homepage search bar, mobile bottom nav "Search" tab, or `/search?q=...`.
* **Visual Hierarchy:**
  1. Header Search Bar with query clear button.
  2. Tab Switcher: "All" | "Places ({count})" | "Dishes ({count})".
  3. View Toggle: Grid view vs. List view.
  4. Desktop Sidebar / Mobile Sheet Filters:
     - Cuisine multi-select.
     - Dietary options (Pure Veg, Vegan, Gluten-free, Jain, Halal).
     - Price range chips.
     - Minimum rating (3.0+, 4.0+, 4.5+).
     - Open Now and Delivery toggles.
  5. Results Feed: Dual rendering of `RestaurantCard` and `FoodItemCard`.
* **Data Dependencies:** `api.getRestaurants(true)`, `api.getMenuItems()`, `LocationContext`.
* **States:**
  - *Empty Query:* Displays popular Delhi cravings chips and trending neighborhood spots.
  - *No Results Found:* Displays suggestions: "Check spelling, try broader keywords like 'Pizza', or clear location filters."

---

### 6. Verified Dish Detail Page (`/food/:slug` & `/dish/:slug`)
* **Source Component:** `src/pages/FoodDetail.tsx`
* **Primary Purpose:** Deep-linked individual dish showcase providing verified in-store counter price, delivery app markup comparison, dietary composition, and pairing recommendations.
* **Intended User:** Diners arriving via search engines researching dish prices (e.g. "Hudson Cafe Red Velvet Waffle price") or comparing locality prices.
* **How Reached:** Clicking any dish card from `/search`, homepage dish spotlight, or direct external link.
* **Visual Hierarchy:**
  1. Breadcrumbs (`Home > Dishes > [Dish Name]`).
  2. Verified Dish Header with high-resolution image, dietary badge, and spice indicator.
  3. Counter Price Card with "Save vs Delivery Apps" pill.
  4. Restaurant attribution card with address, direct call, and Google Maps link.
  5. `LocalityPriceComparisonCard`: Compares this dish's price against Delhi average.
  6. `DishPairingStrip`: Suggested beverage or side order pairings.
  7. "More Popular Items at [Restaurant Name]".
  8. "Similar [Dish Name] across Delhi NCR".
  9. Editorial and Storefront Photo Disclaimer.
* **Data Dependencies:** `api.getMenuItemBySlug(slug)`, `api.getRestaurantById(id)`, `CentralDiscoveryEngine`.
* **States:**
  - *Loading:* Skeleton loader.
  - *Not Found:* Redirects or shows dish unavailable state.

---

### 7. Saved Places & Dishes Vault (`/bookmarks`)
* **Source Component:** `src/pages/Bookmarks.tsx`
* **Primary Purpose:** Private, 100% offline browser-based vault for saved cafes and favorite dishes.
* **Intended User:** Regular patrons bookmarking daily coffee spots, wishlist cafes, and signature dishes.
* **How Reached:** Navbar "Saved" link (with badge counter), Mobile bottom nav "Saved" icon.
* **Key Characteristics:**
  - **Zero Registration Required:** Operates strictly on browser `localStorage` (`menumap_bookmarks`). No tracking or cloud profile needed.
  - **Tabs:** "Places ({count})" and "Dishes ({count})".
  - **Vault Management:** "Clear Vault" button with confirmation alert.
* **States:**
  - *Empty State:* Distinct visual graphics with direct calls-to-action ("Explore Delhi Cafes" or "Discover Dishes").

---

### 8. Cafe Self-Onboarding (`/list-cafe` & `/create-cafe`)
* **Source Component:** `src/pages/ListCafe.tsx`
* **Primary Purpose:** Public acquisition portal for Delhi NCR cafe owners and managers to list their eatery for free with 0% commission.
* **Intended User:** Independent cafe owners, food truck operators, and restaurant managers.
* **How Reached:** Footer "List Your Cafe (Free)", Hero owner banners, or direct URL.
* **Content & Form Flow:**
  1. Value Proposition Overview (0% commission, direct WhatsApp customer orders, custom table QR standee).
  2. Storefront Onboarding Form:
     - Venue Name, Address, Locality / District, Landmark, Nearest Metro Station.
     - Cuisine types, Cost for two, Pure veg toggle.
     - WhatsApp Business Number & Phone Number.
     - Photo upload (storefront & physical menu images).
  3. Submission creates a pending verified record and provides owner credentials.

---

### 9. Cafe Ownership Claim & Verify (`/claim-verify`)
* **Source Component:** `src/pages/ClaimVerify.tsx`
* **Primary Purpose:** Verification portal allowing rightful cafe owners to claim an existing listing on Menu Maps.
* **Intended User:** Owners of existing indexed venues looking to take control of their counter prices and menus.
* **How Reached:** "Claim this Page" link on `RestaurantDetail.tsx` or `/claim-verify?restaurant_id=...`.

---

### 10. Public Static Pages
* **Source Component:** `src/pages/StaticPages.tsx`
* **Sub-routes:**
  - `/about`: Independent directory charter, counter price verification methodology, and zero-commission philosophy.
  - `/contact`: Direct support channels (email: `support@menumaps.in`, direct WhatsApp support line), feedback form, and free QR standee requests.
  - `/terms`: Terms of service, public storefront disclaimer, and dining guidelines.
  - `/privacy`: Privacy charter, confirming local device storage and zero personal tracking.

---

### 11. 404 Page Not Found (`*`)
* **Source Component:** `src/pages/NotFound.tsx`
* **Primary Purpose:** Graceful error recovery for invalid or expired URLs.
* **Controls:** "Explore Restaurants", "Search Dishes", and "Return Home".

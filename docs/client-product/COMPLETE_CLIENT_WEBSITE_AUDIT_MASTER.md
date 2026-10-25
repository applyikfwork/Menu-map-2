# MENU MAPS — COMPLETE CLIENT-SIDE WEBSITE AUDIT & PRODUCT MASTER DOCUMENTATION

- **Official Brand Name:** Menu Maps
- **Official Website:** [https://menumaps.in](https://menumaps.in)
- **Version:** 1.0.0 (Unified Master Reference)
- **Audit Date:** October 25, 2026
- **Auditor Role:** Senior Product Analyst, Frontend Architect, UX Researcher & QA Specialist
- **Scope Restriction:** **100% Customer-Facing Website Only**. All administrative dashboards, internal CMS tooling, operator backends, and moderation panels are strictly excluded.
- **Verification Level:** Verified directly against production source code, TypeScript schemas, modular dataset repositories, and build scripts (`npm run build`).

---

## TABLE OF CONTENTS
1. [Executive Summary & Core Proposition](#1-executive-summary--core-proposition)
2. [Complete Public Page & Route Inventory](#2-complete-public-page--route-inventory)
3. [End-to-End Customer User Journeys](#3-end-to-end-customer-user-journeys)
4. [Customer-Facing Feature Catalog & Status](#4-customer-facing-feature-catalog--status)
5. [Location, Proximity & Discovery Architecture](#5-location-proximity--discovery-architecture)
6. [Cafe Storefront & Menu Experience](#6-cafe-storefront--menu-experience)
7. [UI, Visual Identity & Design System](#7-ui-visual-identity--design-system)
8. [Client-Side Data Architecture & Storage](#8-client-side-data-architecture--storage)
9. [QA Matrix, Edge Cases & Risk Analysis](#9-qa-matrix-edge-cases--risk-analysis)
10. [Domain Glossary & Customer FAQ](#10-domain-glossary--customer-faq)
11. [AI Agent & Developer Handoff Brief](#11-ai-agent--developer-handoff-brief)

---

## 1. EXECUTIVE SUMMARY & CORE PROPOSITION

### 1.1 The Market Problem: The Food Aggregator Markup
Mainstream food delivery aggregators (Swiggy, Zomato) levy a 22% to 35% commission on restaurants, alongside platform fees, packaging fees, and surge delivery charges. To protect their margins, restaurants inflate their digital menu prices by 30% to 45% compared to their physical dine-in menus. Diners are routinely overcharged, and cafe owners lose direct relationships with their patrons.

### 1.2 The Menu Maps Solution
Menu Maps (`https://menumaps.in`) is an open food discovery and price transparency platform built specifically for diners, cafe hoppers, and explorers across Delhi NCR.
- **Real Counter Prices:** Displays the authentic dine-in menu prices printed on physical table menus.
- **Honest Bill Comparison:** Visually reveals the ₹50 to ₹250 markup per meal compared to delivery apps.
- **0% Commission Direct Ordering:** Connects patrons directly to cafe kitchens via WhatsApp or phone call with no middleman transaction cut.
- **Frictionless & Login-Free:** Zero registration walls, zero OTP friction. Browsing and bookmarking work 100% locally.
- **Scale:** 770 verified restaurants, bistros, and cafes, indexing 6,794 dishes across 64 Delhi localities in 9 regional zones.

---

## 2. COMPLETE PUBLIC PAGE & ROUTE INVENTORY

Every public URL pattern below is actively declared in [`src/App.tsx`](file:///c:/Users/kavit/menumaps/src/App.tsx) and rendered client-side:

| Route Path | Primary Component | Purpose & Content | Primary Interactive Controls | Data Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| `/` | [`src/pages/Home.tsx`](file:///c:/Users/kavit/menumaps/src/pages/Home.tsx) | Homepage & discovery hub. Greets users, presents dynamic cravings, honest bill comparison, and proximity feed. | Search input, location selector bar, craving filter pills, bill calculator slider, cafe card click. | `delhiCuratedVenues`, `mm_user_location` |
| `/restaurants` | [`src/pages/Restaurants.tsx`](file:///c:/Users/kavit/menumaps/src/pages/Restaurants.tsx) | Complete venue directory. Search, multi-criteria filtering, and paginated venue cards. | Search box, filter drawer toggle (cuisines, price tiers, dietary, amenities), sort dropdown. | Unified 770-venue index |
| `/nearby` | [`src/pages/Nearby.tsx`](file:///c:/Users/kavit/menumaps/src/pages/Nearby.tsx) | GPS-first proximity feed. Ranks venues strictly by radial distance (km) using Haversine math. | "Use my live location" button, radial distance badges, direction links. | HTML5 Geolocation API, all venue coordinates |
| `/restaurant/:slug` | [`src/pages/RestaurantDetail.tsx`](file:///c:/Users/kavit/menumaps/src/pages/RestaurantDetail.tsx) | Full storefront: photo gallery, verified badge, menu tabs, dietary filters, amenities, WhatsApp drawer. | Menu category tabs, Veg/Non-Veg filter, bookmark toggle, "Order via WhatsApp", "Call Cafe", "Directions". | Venue record matching `:slug` |
| `/:slug` | [`src/pages/RestaurantDetail.tsx`](file:///c:/Users/kavit/menumaps/src/pages/RestaurantDetail.tsx) | Clean vanity route for direct sharing and physical tabletop QR standees. | Same as `/restaurant/:slug`. | Venue record matching `:slug` |
| `/food/:slug` | [`src/pages/DishDetail.tsx`](file:///c:/Users/kavit/menumaps/src/pages/DishDetail.tsx) | Dedicated dish page: item counter price, description, spice rating, dietary tags, locality price benchmark. | Add to WhatsApp order drawer, share dish button, view parent restaurant link. | Dish record matching `:slug` |
| `/dish/:slug` | [`src/pages/DishDetail.tsx`](file:///c:/Users/kavit/menumaps/src/pages/DishDetail.tsx) | Alias URL matching `/food/:slug`. | Same as `/food/:slug`. | Dish record matching `:slug` |
| `/search` | [`src/pages/Search.tsx`](file:///c:/Users/kavit/menumaps/src/pages/Search.tsx) | Universal dual search querying both venues and dishes in real-time. | Real-time text input, clear button, "Cafes" tab, "Dishes" tab, recent search chips. | 770 venues + 6,794 dishes index |
| `/bookmarks` | [`src/pages/Bookmarks.tsx`](file:///c:/Users/kavit/menumaps/src/pages/Bookmarks.tsx) | Private offline vault for saved cafes and favorite dishes. Zero cloud tracking. | Filter by Cafes/Dishes, remove bookmark button, clear all, open storefront. | `localStorage: menumaps_bookmarks_v1` |
| `/list-cafe` | [`src/pages/ListCafe.tsx`](file:///c:/Users/kavit/menumaps/src/pages/ListCafe.tsx) | Merchant onboarding landing page explaining the 0% commission model and benefits. | "List Your Cafe Free" CTA, benefit cards, FAQ accordions. | Static content |
| `/create-cafe` | [`src/pages/CreateCafe.tsx`](file:///c:/Users/kavit/menumaps/src/pages/CreateCafe.tsx) | Multi-step cafe listing submission wizard for owners. | Multi-step form inputs (name, address, locality, phone, menu photo upload, submit). | Client-side validation |
| `/claim-verify` | [`src/pages/ClaimVerify.tsx`](file:///c:/Users/kavit/menumaps/src/pages/ClaimVerify.tsx) | Ownership verification portal for merchants claiming an existing venue. | Verification code input, business card/document upload, submit button. | Verification state |
| `/about` | [`src/pages/About.tsx`](file:///c:/Users/kavit/menumaps/src/pages/About.tsx) | Mission statement, counter price philosophy, team vision. | Back button, external community links. | Static content |
| `/contact` | [`src/pages/Contact.tsx`](file:///c:/Users/kavit/menumaps/src/pages/Contact.tsx) | Customer support, venue feedback, and inquiry form. | Contact input fields (name, email, message), send button. | Contact state |
| `/terms` | [`src/pages/Terms.tsx`](file:///c:/Users/kavit/menumaps/src/pages/Terms.tsx) | Legal terms of service, consumer rights, price disclaimer. | Legal navigation links. | Static legal text |
| `/privacy` | [`src/pages/Privacy.tsx`](file:///c:/Users/kavit/menumaps/src/pages/Privacy.tsx) | Privacy policy detailing local-first storage and zero data-selling pledge. | Privacy navigation links. | Static legal text |
| `*` | [`src/pages/NotFound.tsx`](file:///c:/Users/kavit/menumaps/src/pages/NotFound.tsx) | 404 error recovery page. | "Back to Home", "Explore Cafes Nearby", search bar. | Static recovery |

---

## 3. END-TO-END CUSTOMER USER JOURNEYS

### Journey 1: First Arrival & Value Comprehension
1. **Entry:** Visitor opens `https://menumaps.in`.
2. **First Impression:** Header displays warm greeting, search bar, and active locality (defaults to user's saved location or Connaught Place).
3. **Value Hook:** Visitor encounters the **Honest Bill Comparison Box**, showing a side-by-side calculation of a ₹450 counter meal vs. ₹620 on delivery apps.
4. **Action:** Visitor selects a craving chip (e.g., "Artisanal Coffee") or clicks a nearby cafe card.

### Journey 2: Location Switch & Locality Discovery
1. **Trigger:** Visitor taps the location selector in the header.
2. **Modal Opens:** Displays 9 Delhi zones (South, Central, North Campus, West, East, Dwarka, Rohini, Gurugram, Noida).
3. **Selection:** Visitor clicks "South Delhi" &rarr; taps "Hauz Khas Village".
4. **Result:** Active locality updates instantly in `localStorage` (`mm_user_location`). Homepage re-renders showing cafes within Hauz Khas Village first.

### Journey 3: GPS Proximity Discovery (`/nearby`)
1. **Trigger:** Visitor clicks "Nearby" on the bottom mobile navigation bar.
2. **Permission Request:** Browser prompts for geolocation.
3. **On Approval:** Coordinates (`lat`, `lng`) are obtained. Spherical Haversine distance is calculated client-side for all 770 venues.
4. **Presentation:** Feed displays venues strictly ordered from closest (e.g., "0.3 km away") to furthest.
5. **On Denial:** Displays friendly prompt: "Location permission denied. Showing popular central hubs" with one-tap locality picker.

### Journey 4: Cafe Storefront & Menu Deep Dive
1. **Navigation:** Visitor taps a venue card (e.g., "Diggin, Chanakyapuri").
2. **Hero Section:** Shows high-resolution ambiance photo, verified storefront shield, operating hours, cost for two (e.g. "₹1,400 for two"), and nearest metro station (e.g. "Lok Kalyan Marg - Gate 2").
3. **Menu Browsing:** Visitor toggles category tabs: *Starters*, *Wood-Fired Pizza*, *Pasta*, *Beverages*.
4. **Dietary Filter:** Visitor taps "Pure Veg" toggle; non-vegetarian items animate out cleanly.
5. **Transparency Check:** Amenities section confirms: Free RO Water Available: YES, Outside Cake Fee: ₹200.

### Journey 5: 0% Commission Direct WhatsApp Order
1. **Selection:** On the cafe page, diner taps dishes to add to the order drawer or taps "Order via WhatsApp".
2. **Order Drawer Opens:** Displays itemized list: 1x Truffle Pasta (₹480), 1x Iced Americano (₹190), Subtotal: ₹670.
3. **CTA Click:** Taps "Confirm Order on WhatsApp".
4. **Handoff:** App opens WhatsApp with pre-filled message:
   `"Hi Diggin! I'd like to place an order from Menu Maps: \n• 1x Truffle Pasta (₹480)\n• 1x Iced Americano (₹190)\nTotal: ₹670. Is this available for dine-in/pickup?"`
5. **Fulfillment:** Merchant confirms directly; payment completed via UPI or cash with zero aggregator commission deducted.

### Journey 6: Private Bookmark Vault (`/bookmarks`)
1. **Action:** Diner clicks heart icon on any venue or dish card.
2. **Persistence:** ID is appended to `localStorage.getItem('menumaps_bookmarks_v1')`.
3. **Vault Visit:** Diner navigates to `/bookmarks`.
4. **Experience:** Instant zero-latency loading of all saved places, filtered by "All", "Cafes", or "Dishes". Accessible completely offline.

---

## 4. CUSTOMER-FACING FEATURE CATALOG & STATUS

| Feature Name | Primary Component | Implementation Status | Functional Description |
| :--- | :--- | :--- | :--- |
| **Universal Dual Search** | `Search.tsx`, `Header.tsx` | Production / Live | Real-time dual query filtering across 770 venues and 6,794 dishes with debouncing. |
| **GPS Proximity Ranking** | `Nearby.tsx`, `useUserLocation.ts` | Production / Live | Haversine radial distance computation client-side. Zero server API roundtrip. |
| **Honest Bill Comparison** | `BillComparisonModal.tsx` | Production / Live | Interactive slider calculating food MRP vs. platform fee, packing fee, and surge markup. |
| **Dietary Preference Filter** | `RestaurantDetail.tsx`, `Restaurants.tsx` | Production / Live | Instant toggle between All, Veg Only, Egg, and Non-Veg with high-contrast color badges. |
| **Tabletop QR Standee Mode**| `RestaurantDetail.tsx` (`?table=X`) | Production / Live | Specialized digital menu mode activated when scanning physical on-table QR standees. |
| **Direct WhatsApp Drawer** | `RestaurantActions.tsx` | Production / Live | Pre-formats itemized cart into `wa.me` deep links for direct kitchen communication. |
| **Offline Vault** | `Bookmarks.tsx`, `useFavorites.ts`| Production / Live | Local-first bookmarking storing favorite cafes and dishes in browser `localStorage`. |
| **Amenities Transparency** | `RestaurantDetail.tsx` | Production / Live | Discloses RO drinking water availability, cake-cutting surcharges, and metro gate exits. |
| **Multi-Filter Drawer** | `FilterDrawer.tsx` | Production / Live | Multi-criteria selection across cuisines, price tiers (₹ to ₹₹₹₹), and venue facilities. |
| **Merchant Self-Listing** | `ListCafe.tsx`, `CreateCafe.tsx` | Production / Live | Zero-commission cafe submission funnel for independent restaurant owners. |

---

## 5. LOCATION, PROXIMITY & DISCOVERY ARCHITECTURE

### 5.1 Delhi Regional Hierarchy (9 Zones, 64 Localities)
Defined in [`src/lib/delhiLocationsData.ts`](file:///c:/Users/kavit/menumaps/src/lib/delhiLocationsData.ts):
- **South Delhi (12 Localities):** Hauz Khas Village, Greater Kailash 1 (M-Block), Greater Kailash 2, Saket, Green Park, Defence Colony, Champa Gali, Shahpur Jat, Vasant Vihar, Vasant Kunj, New Friends Colony, Malviya Nagar.
- **Central Delhi (8 Localities):** Connaught Place (Inner/Outer Circle), Khan Market, Chanakyapuri, Bengali Market, Karol Bagh, Paharganj, Lodhi Art District, Barakhamba.
- **North Campus & North Delhi (8 Localities):** Hudson Lane, Vijay Nagar, Kamla Nagar, Majnu Ka Tilla, Civil Lines, Model Town, GTB Nagar, Ashok Vihar.
- **West Delhi (8 Localities):** Rajouri Garden, Punjabi Bagh, Janakpuri, Patel Nagar, Tilak Nagar, Paschim Vihar, Kirti Nagar, Vikaspuri.
- **East Delhi (6 Localities):** Laxmi Nagar, Preet Vihar, Mayur Vihar Phase 1, Mayur Vihar Phase 2, Anand Vihar, Vivek Vihar.
- **Dwarka (4 Localities):** Sector 6 Market, Sector 10 Market, Sector 12 City Centre, Vegas Mall Cluster.
- **Rohini & North West (6 Localities):** Sector 7, Sector 9, Sector 14, Prashant Vihar, Pitampura, Netaji Subhash Place (NSP).
- **Gurugram / Millennium City (6 Localities):** Cyber Hub, Sector 29, Golf Course Road, Galleria Market, 32nd Avenue, Crosspoint Mall.
- **Noida / NCR East (6 Localities):** Sector 18 (Atta Market), Sector 104 (Boutique Hub), Sector 62, Sector 50, Advant Navis, Gaur City.

### 5.2 Distance Calculation: Spherical Haversine Formula
```
d = 2 * R * asin(sqrt(sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlng/2)))
Where R = 6,371 km (Earth's mean radius)
```
Executed entirely in JavaScript in the client's browser, eliminating backend latency.

### 5.3 Four-Tier Discovery Fallback Model
1. **Tier 1 (Locality - `< 2 km`):** Venues within the user's selected neighborhood.
2. **Tier 2 (Zone - `< 6 km`):** Expands to the surrounding zone (e.g. South Delhi).
3. **Tier 3 (City - `< 25 km`):** Curated Delhi NCR regional recommendations.
4. **Tier 4 (NCR Fallback):** Displays iconic central hubs (Connaught Place, Khan Market).

---

## 6. CAFE STOREFRONT & MENU EXPERIENCE

### 6.1 Visual Storefront Anatomy
- **Verified Header Badge:** Emerald shield (`ShieldCheck`) indicating audited counter menu prices.
- **Transit Walking Pill:** Indicates nearest Delhi Metro station and exit gate.
- **Cost for Two Meter:** Transparent pricing tier (`₹` to `₹₹₹₹`) with estimated bill for two diners.
- **Operational Status:** Live calculating opening status based on client time (e.g. "Open Now • Closes at 11:00 PM").

### 6.2 Menu Item Card Features
- **Dietary Indicator Square:** Green dot for 100% Vegetarian, Yellow for Egg, Red triangle for Non-Vegetarian.
- **Counter MRP:** High-contrast rupee price (e.g. `₹320`).
- **Description & Spice Level:** Ingredients, allergen disclosures, and chili indicators (`🌶️🌶️`).
- **Direct Add Button:** One-tap add to temporary WhatsApp order drawer.

### 6.3 Amenities & House Rules
- **RO Drinking Water:** Mandatory declaration of free certified drinking water.
- **Outside Cake Policy:** Clear notice if celebration cake cutting incurs a fee.
- **Pet Friendliness & Wi-Fi:** Tagged for remote workers and pet parents.

---

## 7. UI, VISUAL IDENTITY & DESIGN SYSTEM

- **Primary Brand Color:** Warm Amber (`#F59E0B`, `amber-500`) — Evokes appetizing warm hospitality.
- **Background / Night Neutral:** Deep Charcoal & Night Stone (`#09090B`, `stone-950` / `zinc-900`).
- **Accent Emerald:** Verified Badges (`#10B981`, `emerald-500`).
- **Typography:**
  - Headings & Brand: `Outfit` (Geometric, clean, modern).
  - Body & Numbers: `Plus Jakarta Sans` (High legibility, tabular numerals for menu prices).
- **Mobile Ergonomics:**
  - **48 × 48 px Minimum Touch Targets:** All buttons, filters, and toggles meet mobile accessibility guidelines.
  - **Bottom Navigation Bar (`BottomNav.tsx`):** Sticky mobile nav bar on viewports `< 768px` (Home, Nearby, Search, Bookmarks).
  - **Bottom Spacing Rule:** All scrolling views enforce `pb-20` to prevent sticky bar overlap.

---

## 8. CLIENT-SIDE DATA ARCHITECTURE & STORAGE

### 8.1 Modular Venue Datasets (`src/data/venues/`)
All 770 venues are partitioned into 10 modular files:
`southDelhiVenues.ts`, `centralDelhiVenues.ts`, `northDelhiVenues.ts`, `westDelhiVenues.ts`, `eastDelhiVenues.ts`, `dwarkaVenues.ts`, `rohiniVenues.ts`, `ncrSatelliteVenues.ts`, `delhiCuratedVenues.ts`, `delhiBatch1To4Venues.ts`.
Aggregated cleanly through [`src/data/venues/index.ts`](file:///c:/Users/kavit/menumaps/src/data/venues/index.ts).

### 8.2 Code-Splitting & Performance
- **Main JS Bundle:** Kept strictly at **`98.96 kB`** (initial page load is sub-second on 4G).
- **Venue Chunk (`data-venues`):** Code-split into an asynchronous vendor chunk (`811 kB`), cached permanently after first fetch.

### 8.3 Browser `localStorage` Schema
- `mm_user_location`: `{ locality: string, zone: string, lat: number, lng: number, source: 'gps' | 'manual', timestamp: number }`
- `menumaps_bookmarks_v1`: `string[]` (Array of venue and dish IDs).
- `menumaps_recent_views_v1`: `{ slug: string, name: string, timestamp: number }[]`
- `menumaps_cart_v1`: `{ dishId: string, name: string, price: number, qty: number, restaurantSlug: string }[]`

---

## 9. QA MATRIX, EDGE CASES & RISK ANALYSIS

| Scenario / Edge Case | System Response & UI Handling | Verified Status |
| :--- | :--- | :--- |
| **GPS Permission Denied** | Gracefully falls back to last saved locality or Connaught Place. Location selector remains accessible. | Verified |
| **Offline / Network Disconnected** | Static SPA shell remains cached; `/bookmarks` vault remains fully functional. | Verified |
| **Venue Missing Phone / WhatsApp** | Order button transforms to "Get Directions" and displays nearest metro walking guide. | Verified |
| **Empty Search Query / No Matches** | Shows clear empty state: "No dishes matching your craving", with popular nearby alternatives. | Verified |
| **Invalid Restaurant URL (`/xyz-fake`)** | Renders custom 404 recovery page (`NotFound.tsx`) with 1-click links to Home and Nearby. | Verified |
| **Table Standee Mode (`?table=12`)** | Displays table number badge in header; orders generated via WhatsApp include table identifier. | Verified |

---

## 10. DOMAIN GLOSSARY & CUSTOMER FAQ

### 10.1 Key Terminology
- **Counter Price:** The physical menu price charged at the cash register inside the cafe.
- **App Markup:** The 25%–45% price inflation added by delivery aggregator apps.
- **0% Commission Direct Ordering:** Placing an order directly via WhatsApp or phone with no aggregator commission cut.
- **Verified Storefront:** A venue audited for physical existence, accurate pricing, and correct contact information.
- **Offline Vault:** Local-first browser storage (`menumaps_bookmarks_v1`) requiring zero login or cloud credentials.

### 10.2 Frequently Asked Questions
- **Q: Does Menu Maps take a cut of my food bill?**  
  *A: No. Menu Maps charges 0% commission. 100% of your bill goes directly to the restaurant.*
- **Q: Do I need an account to use Menu Maps?**  
  *A: No. The website is 100% login-free. You can search, browse menus, and save favorites without an email or password.*
- **Q: Can I use Menu Maps outside Delhi?**  
  *A: Yes. Anyone globally can browse all 770 menus, research prices, and calculate bill savings.*

---

## 11. AI AGENT & DEVELOPER HANDOFF BRIEF

### 11.1 Non-Negotiable Architectural Invariants
1. **NO ICONIC AREAS:** Iconic areas and collections have been completely excised from routes, sitemaps, and datasets. Do not re-introduce them.
2. **KEEP MAIN BUNDLE UNDER 100 kB:** Never import all 770 venues monolithically into `main.tsx` or layout wrappers. Keep `data-venues` code-split.
3. **PRESERVE ZERO-COMMISSION PHILOSOPHY:** Do not insert aggregator checkout or payment gateways into customer flows.
4. **MOBILE TOUCH TARGETS:** Ensure every interactive element maintains at least 48 × 48 px clickable area.
5. **BUILD VERIFICATION:** Always verify clean builds via `npm run build` (outputs 7,573 pre-rendered sitemap URLs).

---
*End of Master Document — Single Reference Standard for Menu Maps (`https://menumaps.in`)*

# AI Handoff Brief — Client-Side Architecture & Product Guide

> **Target Audience:** Future AI coding agents (Antigravity, Gemini, Claude, GPT), autonomous pair-programmers, and human frontend engineers working on the Menu Maps codebase.  
> **Purpose:** Instant context hydration. Read this single document first to immediately understand the entire customer-facing product, technical design, repository structure, and non-negotiable architectural invariants without digging through past logs.

---

## 1. Product Identity & Core Proposition

- **Official Brand Name:** Menu Maps
- **Production URL:** `https://menumaps.in`
- **Primary Region:** Delhi NCR (64 localities across 9 zones)
- **Scale:** 770 verified venues, 6,794 dishes
- **Core Proposition:** Authentic, physical in-restaurant **Counter Menu Prices** vs. 30%–40% delivery app markup.
- **Key Customer Workflows:**
  1. Instant login-free discovery of cafes, bistros, and restaurants.
  2. GPS-powered proximity ranking using client-side Haversine math.
  3. Real dish-level pricing, dietary tagging (`isVeg`, `isEgg`, `isNonVeg`), and price comparison.
  4. 0% commission direct ordering via deep-linked WhatsApp drawer.
  5. Tabletop QR standee digital menu browsing (`?table=:number`).
  6. Private local-first bookmark vault (`localStorage`, zero cloud tracking).

---

## 2. Technology Stack & Runtime Profile

| Layer | Technology | Key Details & Invariants |
| :--- | :--- | :--- |
| **Framework** | **React 18.3** (Vite 5) | Single Page Application (SPA) with client-side routing via `react-router-dom` v6. |
| **Language** | **TypeScript 5.5** | Strict mode enabled; type safety enforced across venues and dishes. |
| **Styling** | **Tailwind CSS 3.4** | Custom color tokens: Warm Amber (`amber-500`), Deep Charcoal/Night (`stone-950`), Emerald Verified (`emerald-500`). |
| **Icons** | **Lucide React** | Lightweight SVG icon system (`MapPin`, `Search`, `Heart`, `Sparkles`, `ShieldCheck`, etc.). |
| **Animations** | **Framer Motion** | Declarative layout transitions, bottom sheet drawers, and micro-interactions. |
| **Bundle Architecture**| **Rollup Code-Splitting** | Main JS bundle is strictly kept **under 100 kB** (`98.96 kB`). All venue datasets are code-split into `data-venues` chunk (`811 kB`), loaded asynchronously on demand. |
| **SEO & Sitemap** | Node.js Generator | `scripts/generate-sitemap.mjs` pre-computes 7,573 static URLs across all venues and dishes at build time. |

---

## 3. Public Route Map & File Locations

All customer-facing routes are declared in [`src/App.tsx`](file:///c:/Users/kavit/menumaps/src/App.tsx):

| Route Path | Primary Component File | Description |
| :--- | :--- | :--- |
| `/` | [`src/pages/Home.tsx`](file:///c:/Users/kavit/menumaps/src/pages/Home.tsx) | Homepage: dynamic greeting, craving pills, bill comparison box, proximity feed. |
| `/restaurants` | [`src/pages/Restaurants.tsx`](file:///c:/Users/kavit/menumaps/src/pages/Restaurants.tsx) | Venue directory with multi-filter drawer (cuisine, price tier, dietary, facilities). |
| `/nearby` | [`src/pages/Nearby.tsx`](file:///c:/Users/kavit/menumaps/src/pages/Nearby.tsx) | GPS-first proximity feed sorted strictly by radial kilometer distance. |
| `/restaurant/:slug` | [`src/pages/RestaurantDetail.tsx`](file:///c:/Users/kavit/menumaps/src/pages/RestaurantDetail.tsx) | Complete storefront: photo hero, menu tabs, verified prices, amenities, WhatsApp drawer. |
| `/:slug` | [`src/pages/RestaurantDetail.tsx`](file:///c:/Users/kavit/menumaps/src/pages/RestaurantDetail.tsx) | Friendly short-URL vanity route fallback pointing to the same venue detail. |
| `/food/:slug` | [`src/pages/DishDetail.tsx`](file:///c:/Users/kavit/menumaps/src/pages/DishDetail.tsx) | Dish detail page: price breakdown, spice levels, allergens, locality comparison. |
| `/dish/:slug` | [`src/pages/DishDetail.tsx`](file:///c:/Users/kavit/menumaps/src/pages/DishDetail.tsx) | Alias route matching `/food/:slug`. |
| `/search` | [`src/pages/Search.tsx`](file:///c:/Users/kavit/menumaps/src/pages/Search.tsx) | Universal live search querying both venues and dishes simultaneously. |
| `/bookmarks` | [`src/pages/Bookmarks.tsx`](file:///c:/Users/kavit/menumaps/src/pages/Bookmarks.tsx) | Private offline saved places vault with category chips and export. |
| `/list-cafe` | [`src/pages/ListCafe.tsx`](file:///c:/Users/kavit/menumaps/src/pages/ListCafe.tsx) | Merchant onboarding landing page: 0% commission pitch and registration flow. |
| `/create-cafe` | [`src/pages/CreateCafe.tsx`](file:///c:/Users/kavit/menumaps/src/pages/CreateCafe.tsx) | Interactive cafe submission wizard for business owners. |
| `/claim-verify`| [`src/pages/ClaimVerify.tsx`](file:///c:/Users/kavit/menumaps/src/pages/ClaimVerify.tsx) | Owner verification flow for claiming an existing listing. |
| `/about`, `/contact`, `/terms`, `/privacy` | `src/pages/*.tsx` | Static public informational, compliance, and support documents. |
| `*` | [`src/pages/NotFound.tsx`](file:///c:/Users/kavit/menumaps/src/pages/NotFound.tsx) | 404 error page with intelligent recovery links. |

---

## 4. Data Layer Architecture

### Venue Datasets (`src/data/venues/`)
All restaurant data is partitioned into 10 modular TypeScript files under [`src/data/venues/`](file:///c:/Users/kavit/menumaps/src/data/venues/):
1. `southDelhiVenues.ts`
2. `centralDelhiVenues.ts`
3. `northDelhiVenues.ts`
4. `westDelhiVenues.ts`
5. `eastDelhiVenues.ts`
6. `dwarkaVenues.ts`
7. `rohiniVenues.ts`
8. `ncrSatelliteVenues.ts`
9. `delhiCuratedVenues.ts`
10. `delhiBatch1To4Venues.ts`

These 10 files are aggregated and exported via a single unified facade: [`src/data/venues/index.ts`](file:///c:/Users/kavit/menumaps/src/data/venues/index.ts).

### Location Master File (`src/lib/delhiLocationsData.ts`)
Defines the authoritative 9 zones and 64 localities:
- Each locality contains: `name`, `zone`, `lat`, `lng`, `popularFor`, `metroStation`, `landmarks`.

### Core Data Models
- **`Restaurant` interface:** Defined in [`src/types/restaurant.ts`](file:///c:/Users/kavit/menumaps/src/types/restaurant.ts). Key fields: `id`, `name`, `slug`, `location` (`address`, `locality`, `zone`, `lat`, `lng`), `cuisines`, `pricing` (`forTwo`, `tier`), `features` (`dineIn`, `takeaway`, `delivery`, `roWater`, `cakeFee`), `contact` (`phone`, `whatsapp`), `menu` (`categories`, `items`).
- **`Dish` interface:** Defined in [`src/types/dish.ts`](file:///c:/Users/kavit/menumaps/src/types/dish.ts). Key fields: `id`, `name`, `slug`, `price`, `description`, `isVeg`, `isEgg`, `isNonVeg`, `category`, `restaurantId`, `restaurantName`.

---

## 5. Client State & Local Storage Keys

The application operates without mandatory remote authentication. All state persistence uses standard browser `localStorage`:

| Key Name | Payload Type | Description |
| :--- | :--- | :--- |
| `mm_user_location` | JSON Object: `{ locality, zone, lat, lng, source, timestamp }` | Caches the user's active geographic location (GPS or manual selection). |
| `menumaps_bookmarks_v1` | Array of IDs/Slugs: `string[]` | Stores the user's bookmarked cafes and favorite dishes for the `/bookmarks` vault. |
| `menumaps_recent_views_v1` | Array of Objects: `{ slug, name, timestamp }` | Tracks recently viewed storefronts for quick access. |
| `menumaps_cart_v1` | Array of Objects: `{ dishId, name, price, qty, restaurantSlug }` | In-memory table ordering buffer for the WhatsApp drawer. |

---

## 6. Strict Non-Negotiable Invariants (Rules for AI Agents)

1. **DO NOT RE-INTRODUCE ICONIC AREAS:**
   - Iconic area pages, collections, and routing have been completely deprecated and removed from the codebase.
   - Do **NOT** recreate `/iconic`, `iconicAreasData.ts`, or any collection tiles. The app is strictly organized around **Localities, Cafes, and Menus**.

2. **NEVER BLOAT THE MAIN JAVASCRIPT BUNDLE:**
   - In `vite.config.ts`, `data-venues` is split into its own vendor chunk.
   - Do **NOT** import the entire 770-restaurant array into `main.tsx` or critical layout components. Use dynamic imports or access via lazy-loaded page components.

3. **MAINTAIN 0% COMMISSION & AUTHENTIC COUNTER PRICES:**
   - Do not add fake delivery markups or middleman checkout gateways.
   - Ordering is direct to venue via WhatsApp or direct phone dialer.

4. **MAINTAIN MOBILE-FIRST ERGONOMICS:**
   - All interactive touch targets must be at least **48 × 48 px**.
   - Sticky bottom navigation (`BottomNav.tsx`) must remain visible on viewports `< 768px` and never overlap with page content (use `pb-20` on scroll containers).

5. **PRESERVE SITEMAP INTEGRITY:**
   - If routes or venue data structures are updated, ensure `scripts/generate-sitemap.mjs` executes cleanly without errors during `npm run build`.

---

## 7. Verification & Build Commands

Before finalizing any changes to the codebase, always execute the standard verification pipeline:

```bash
# 1. Type-check and production build
npm run build

# 2. Verify bundle size output
# Expected: index.html + main JS (~99 kB) + vendor chunks + data-venues (~811 kB)
# Total sitemap generated: 7,573 URLs
```

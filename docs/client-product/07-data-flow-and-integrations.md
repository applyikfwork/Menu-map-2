# Customer-Facing Data Flow & Integrations: Menu Maps

This document details how data reaches the public interface, how client state is managed, how local storage enables offline usage, and how third-party integrations (WhatsApp, Google Maps, Geolocation) operate on Menu Maps ([https://menumaps.in](https://menumaps.in)).

---

## 1. End-to-End Customer Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. VISITOR ACTION                                                      │
│    Customer taps a craving, selects a locality, or opens a cafe page   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ 2. CLIENT-SIDE ROUTER & CONTEXT DISPATCH                               │
│    App router updates URL state; LocationContext & DiscoveryContext    │
│    evaluate current coordinates, time-of-day, and dietary filters      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ 3. HYBRID DATA RETRIEVAL (Cache-First Architecture)                    │
│    ├── Tier A: In-Memory Central Discovery Engine (instant < 5ms)      │
│    ├── Tier B: Code-Split Data Chunk (data-venues bundle)              │
│    └── Tier C: Supabase Live API (for claimed cafes & fresh reviews)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ 4. REVERSE GEOSPATIAL & METRIC ENRICHMENT                              │
│    Haversine formula calculates walking distance;                      │
│    Markup calculator simulates counter savings vs food delivery apps   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ 5. VISIBLE CUSTOMER PRESENTATION                                       │
│    Cards render with exact counter prices, metro tags, & order actions │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Customer-Facing Data Sources

Menu Maps employs a **high-resilience hybrid data architecture**. The public website operates flawlessly even during network drops, API downtimes, or offline subway commutes.

### A. The 10 Compiled Venue Datasets (`src/data/venues/`)
All 770 verified cafes and 6,794 dishes are organized across 10 modular files:
1. `modelTownVenues.ts` — Model Town & Gujranwala Town.
2. `vijayNagarVenues.ts` — Vijay Nagar & Hudson Lane periphery.
3. `gk1Venues.ts` — Greater Kailash 1 (M & N Block Markets).
4. `gk2Venues.ts` — Greater Kailash 2 & Savitri Market.
5. `defColVenues.ts` — Defence Colony Main Market.
6. `delhiBatch2Venues.ts` — Punjabi Bagh, Rajouri Garden, Satya Niketan, Karol Bagh, etc.
7. `delhiBatch3Venues.ts` — Shahpur Jat, Champa Gali, Netaji Subhash Place (NSP), Rohini, Dwarka, etc.
8. `northCampusDuVenues.ts` — Central Hudson Lane & North Campus DU student addas.
9. `newDelhiVenues.ts` — Connaught Place, Janpath, Bengali Market, Khan Market.
10. `extraZoneVenues.ts` — Major transit hubs and historic heritage eateries.

* **Code-Splitting:** These files are bundled into a dedicated asynchronous browser-cached chunk (`dist/assets/data-venues-*.js`), keeping the initial application bundle at a lightweight **98 kB**.

### B. In-Memory Central Discovery Engine (`src/lib/engine/discoveryEngine.ts`)
* On app initialization, `CentralDiscoveryEngine` indexes venues and dishes in memory.
* Powers sub-millisecond search suggestions, proximity ranking, and category lookups without making repeated network roundtrips.

### C. Live Remote Database API (`src/lib/supabase.ts`)
* Connects to Supabase for dynamic user-generated content:
  - Fresh community reviews and photo ratings.
  - Restaurant owner claims and verifications.
  - Newly self-onboarded cafes submitted via `/list-cafe`.
* **Fallback Guarantee:** If the remote API fails, is blocked by ad-blockers, or the user is offline, the client seamlessly falls back to the in-memory master dataset.

---

## 3. Client-Side Storage & Offline Vault

Menu Maps respects user privacy. It does not track personal browsing history across external trackers or require mandatory user login to save favorites.

| Storage Key | Storage Mechanism | Data Stored | Customer Purpose |
|---|---|---|---|
| `menumaps_global_location_v2` | `localStorage` | Serialized `ActiveLocation` object | Remembers selected neighborhood or GPS setting across visits |
| `menumap_bookmarks` | `localStorage` | Array of restaurant IDs & dish IDs | Powers the private, offline Bookmarks Vault (`/bookmarks`) |
| `menumaps_user_diet` | `localStorage` | `'all'`, `'veg'`, or `'non_veg'` | Remembers customer dietary preference |
| `menumaps_recent_views` | `localStorage` | Array of last 10 viewed cafes & dishes | Powers personal discovery recommendations |
| `menumap_user_coords` | `localStorage` | Last valid latitude & longitude | Prevents unnecessary GPS re-prompts |

---

## 4. External Integrations

### 1. Direct WhatsApp Kitchen Dispatch
* **Protocol:** Standard Web Intent / URI Scheme (`https://api.whatsapp.com/send`).
* **Behavior:** When a customer clicks *"Send WhatsApp Order"* from `WhatsAppOrderDrawer.tsx`, the client formats an itemized text message and launches WhatsApp Web on desktop or the native WhatsApp mobile app on Android/iOS.
* **Security & Transparency:** No payment details or credentials are exchanged. The order is delivered directly to the restaurant's phone number.

### 2. Google Maps Navigation & Directions
* **Protocol:** HTTPS Direction Universal Links (`https://www.google.com/maps/dir/?api=1&destination=lat,lng`).
* **Behavior:** Clicking "Directions" on any cafe card opens Google Maps with the destination preset to the venue's exact verified storefront coordinates.

### 3. Native Browser Geolocation API
* **Protocol:** `navigator.geolocation.getCurrentPosition()`.
* **Options:** `{ enableHighAccuracy: true, timeout: 8000, maximumAge: 120000 }`.
* **Privacy:** Coordinates are processed purely client-side within the user's browser. Coordinates are never sold or sent to third-party ad networks.

### 4. Native Web Share API
* **Protocol:** `navigator.share()`.
* **Behavior:** On supporting mobile browsers, clicking "Share" triggers the native OS sharing sheet. On unsupported desktop browsers, it cleanly falls back to copying the direct clean link to the system clipboard.

---

## 5. Static Pre-Rendering & Search Engine Layer

To ensure optimal SEO indexation and instant first-paint times, Menu Maps includes a static pre-rendering build pipeline:
1. `scripts/export_prerender_data.ts`: Exports deduplicated restaurant and dish records into `dist/prerender_data.json`.
2. `scripts/prerender_static_pages.py`: Generates complete, static HTML snapshots for all 770 cafes, 6,794 dishes, and core directories.
3. `scripts/build_sitemap.py`: Automatically generates `public/sitemap.xml` indexing 7,573 high-intent URLs for Google Search Console.

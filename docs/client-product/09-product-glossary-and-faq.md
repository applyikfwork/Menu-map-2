# Product Glossary & Customer FAQ

## 1. Domain Terminology & Product Concepts

This glossary defines the foundational concepts, terminology, and domain-specific vocabulary used throughout Menu Maps (`https://menumaps.in`).

| Term | Definition | Context / Usage in Menu Maps |
| :--- | :--- | :--- |
| **Counter Price (Dine-in MRP)** | The exact physical menu price printed on the venue's table menu or billed at the payment cash register. | Menu Maps is built around displaying genuine counter prices, highlighting the 30% to 40% difference compared to marked-up delivery aggregator menus. |
| **App Markup (Aggregator Inflation)** | The hidden 20%–45% price inflation applied to dishes on food delivery apps (Zomato, Swiggy) to offset platform commission charges. | Highlighted across the **Honest Bill Comparison Box** on the homepage and restaurant pages to show diner savings. |
| **0% Commission Direct Ordering** | An ordering workflow where the diner communicates their table or pickup order directly to the cafe owner via WhatsApp or phone call without intermediary aggregator cut. | Promoted through the **WhatsApp Direct Order Drawer** (`RestaurantActions.tsx`), allowing 100% of the customer's payment to reach the venue. |
| **Verified Storefront** | A cafe or restaurant page whose physical location, counter menu, operational hours, and contact details have been field-inspected or confirmed directly with the merchant. | Represented by the emerald badge (`ShieldCheck` icon) on the venue card and header. |
| **Offline Vault (Private Bookmarks)** | A client-side storage mechanism (`localStorage` key `menumaps_bookmarks_v1`) allowing diners to save favorite cafes and dishes locally on their device with zero cloud tracking, zero login friction, and full offline availability. | Accessed via `/bookmarks` or the bottom mobile bar heart icon. Operates with sub-millisecond responsiveness. |
| **Proximity Ranking** | A distance-first ordering algorithm using the spherical **Haversine formula** calculated client-side in the diner's browser against the venue's geographic coordinates (`lat`, `lng`). | Powers the `/nearby` GPS feed and the "Within 3 km of your location" discovery tier on the homepage. |
| **Dine-in QR Standee Experience** | The mobile web experience loaded when a customer physically sits at a restaurant table and scans an on-table QR code pointing to `https://menumaps.in/restaurant/:slug?table=5`. | Renders an ultra-fast, high-contrast digital table menu with category filters, dietary toggles, and direct kitchen communication. |
| **Honest Bill Box** | An interactive psychological comparison widget that calculates the counter bill vs. typical delivery app bill (including platform fees, packaging fees, delivery charges, and surge taxes). | Demonstrates the tangible rupee savings (e.g. "Save ₹180 on this order by ordering direct"). |
| **Granular Locality** | A specific neighborhood, commercial market, or dining cluster within Delhi NCR (e.g., *Hauz Khas Village*, *Hudson Lane*, *Connaught Place Inner Circle*, *Champa Gali*). | Menu Maps indexes 64 distinct localities grouped across 9 geographic zones, avoiding generic city-level aggregation. |
| **Discovery Tier** | One of the four progressive spatial fallback zones used when querying cafes: Locality (Tier 1: < 2 km) &rarr; Zone (Tier 2: < 6 km) &rarr; City (Tier 3: < 25 km) &rarr; NCR Fallback (Tier 4). | Ensures the user never sees a blank screen, even when searching from an edge location. |
| **RO Water Available** | An explicit venue amenity indicator stating whether the establishment provides clean, certified RO drinking water free of charge, as mandated by consumer protection norms. | Displayed in the **Amenities & House Rules** section of `/restaurant/:slug`. |
| **Cake Cutting Fee** | A transparent house rule indicator informing patrons whether bringing an outside birthday cake incurs a surcharge. | Prevents awkward bill disputes for celebrating diners. |
| **Metro Gate Proximity** | Clear transit walking directions indicating the nearest Delhi Metro station and exact exit gate number (e.g., *Gate 2, Hauz Khas Metro*). | Displayed in venue headers to facilitate easy pedestrian navigation. |

---

## 2. Frequently Asked Questions (FAQ)

### Commercial & Operational Model

#### Q1: How does Menu Maps make money if there is 0% commission on orders?
**Answer:** Menu Maps operates as an open discovery and price transparency utility. Unlike delivery aggregators that charge 25% to 35% commission on every order plus customer delivery fees, Menu Maps does not clip diner tickets. Future monetization is based on value-added merchant SaaS tools (such as customized tabletop QR standees, premium analytics dashboards, and sponsored placement clearly marked as promoted) rather than taxing food transactions.

#### Q2: Why are prices on Menu Maps often 30% to 40% cheaper than Swiggy or Zomato?
**Answer:** Food delivery platforms charge restaurants high commissions (typically 22%–32%), payment gateway fees, and mandatory platform marketing fees. To survive these deductions without losing margin, restaurants increase their online item prices by ₹30 to ₹120 per dish. Menu Maps displays the authentic **in-restaurant counter menu price**. When dining in or picking up directly, you pay the original price without aggregator markups, packaging surcharges, or surge delivery fees.

#### Q3: How does the WhatsApp direct ordering feature work?
**Answer:** When a user selects dishes from a restaurant's menu or clicks "Order via WhatsApp", Menu Maps generates an itemized text summary (dish names, quantities, unit prices, subtotal) and formats it into a secure `https://wa.me/{phone}?text=...` URI. Clicking the button opens WhatsApp directly on the user's mobile device or WhatsApp Web on desktop with the message pre-filled. The customer sends the message directly to the cafe owner or manager to confirm availability and payment (via UPI or cash on pickup). No middleman touches the transaction.

---

### Location, Search & Coverage

#### Q4: Can users outside of Delhi use Menu Maps?
**Answer:** Yes. While the current dataset of 770 verified venues is concentrated in the National Capital Region (South Delhi, Central Delhi, North Campus, West Delhi, East Delhi, Dwarka, Rohini, Gurugram, and Noida), any user globally can browse the website, view menus, search dishes, and calculate bill savings. If a user outside Delhi opens the GPS `/nearby` feed, the system gracefully detects that the nearest venue is beyond local dining range and displays popular Delhi dining hubs with clear distance indicators.

#### Q5: What happens if a user denies GPS location permission?
**Answer:** Menu Maps never blocks the user or displays a modal wall if GPS is denied. If geolocation fails or is declined:
1. The app checks `localStorage` for a previously selected locality.
2. If no saved locality exists, it smoothly defaults to **Connaught Place, Central Delhi** (`lat: 28.6315`, `lng: 77.2167`).
3. An inline location selector bar remains available at the top of the screen, allowing one-tap manual selection from 64 Delhi localities.

#### Q6: How does the multi-criterion search work?
**Answer:** Universal search (`/search` or the homepage search bar) queries both **venues** and **dishes** in real time:
- Matches venue name, locality name, and regional zone.
- Matches specific dish names (e.g., "Butter Chicken", "Cold Brew", "Truffle Pasta"), category names, and dietary preferences (`isVeg`, `isEgg`, `isNonVeg`).
- Results are partitioned into two distinct visual tabs: **Matching Cafes & Restaurants** and **Dishes & Prices**, showing counter prices immediately.

---

### Data Accuracy, Privacy & User Accounts

#### Q7: How are menu prices and cafe details verified?
**Answer:** The core database of 770 venues and 6,794 dishes is curated and maintained directly in version-controlled data modules (`src/data/venues/`). Venue information is gathered through direct physical menu audits, merchant onboarding submissions via `/list-cafe`, and photo verification of physical standees. Verified venues display the green `Verified Storefront` badge.

#### Q8: Do customers need to create an account or log in to use Menu Maps?
**Answer:** **No.** Customer-facing discovery on Menu Maps is 100% login-free and frictionless. Visitors can browse all menus, compare prices, search dishes, use geolocation, and bookmark favorite spots without ever being prompted to enter an email, password, or OTP. Bookmarks are securely stored in the browser's `localStorage` (`menumaps_bookmarks_v1`).

#### Q9: What happens if a cafe's WhatsApp number is missing or unverified?
**Answer:** The UI applies defensive rendering:
- If a verified phone number is present, primary calling and WhatsApp buttons are rendered.
- If a phone number is unavailable, the WhatsApp order drawer falls back to displaying the venue's physical address, nearest metro station gate, and Google Maps walking directions (`Get Directions`).

#### Q10: How does Menu Maps ensure fast loading on slow 4G/3G mobile networks?
**Answer:** Several architectural performance optimizations are in place:
1. **Aggressive Code-Splitting:** The venue dataset is split into an independent asynchronous chunk (`data-venues`), keeping the initial JavaScript bundle under **100 kB**.
2. **Native System Fonts:** High-performance typography using Google Fonts `Outfit` and `Plus Jakarta Sans` with `font-display: swap`.
3. **No Heavy Map SDKs:** Leaflet and Mapbox heavy tiles are deferred; proximity calculations use lightweight native math (`Math.sin`, `Math.cos`, `Math.atan2`).
4. **Client-Side Caching:** Previously resolved venues and coordinates are retained in memory, enabling instant page transitions via React Router without network latency.

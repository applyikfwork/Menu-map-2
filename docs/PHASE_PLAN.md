# MenuMap UI Consistency Master Implementation Plan (Client-Side Only)

This document serves as the permanent reference and roadmap for bringing 100% visual and structural consistency across the client-facing application, matching the editorial design system established in `asset provide/MenuMap Redesign (1).html`.

> [!IMPORTANT]
> **Strict Scope Boundary**:
> * **Admin Panel** (`src/pages/AdminPanel.tsx`): **100% UNTOUCHED** — absolutely no design or functional modifications.
> * **Owner Portal** (`src/pages/OwnerDashboard.tsx`, `src/pages/OwnerLogin.tsx`): **100% UNTOUCHED**.
> * **All Existing Functions**: All data fetching, local storage bookmarks, cart quantities, WhatsApp ordering logic, geolocation calculations, and navigation must be 100% preserved and fully functional.

---

## Design System Tokens & Foundations

| Token Family | Specifications |
| :--- | :--- |
| **Typography** | **Display / Headings / Numbers**: `Outfit`, sans-serif (800–900 weight, tight tracking `-0.025em`)<br/>**Body / Meta / Labels**: `Plus Jakarta Sans`, sans-serif (400–600 weight) |
| **Color Palette** | **Obsidian Slate**: `#1C1917` / `#14110F` (Dark headers, high-contrast containers)<br/>**Warm Cream Base**: `#FAF8F5` (Global page background)<br/>**Rust Coral**: `#FF5A36` / `#D8350F` (Primary accents, fire tags, ratings)<br/>**Trust Evergreen**: `#0F766E` / `#0D9488` (WhatsApp orders, 0% markup guarantees)<br/>**Card Borders**: `#EFEAE2` and `#E7E2DA` |
| **Micro-Motifs** | **Ticket Notches (`.ph`)**: Perforated counter receipt slips with subtle radial punch-out illusion<br/>**Hover Physics (`.lift`)**: Smooth cubic-bezier `-4px` to `-8px` lift with warm shadow drop<br/>**Pill Chips (`.chipl` / `.chip`)**: Fully rounded badges for filters, zones, and status |

---

## Completed in Round 1 (Foundation)

- [x] **Global Setup**: Fonts (`Outfit` + `Plus Jakarta Sans`) & CSS tokens in `src/index.css`
- [x] **Global Navigation**: `src/components/Navbar.tsx` & `src/components/MobileBottomNav.tsx`
- [x] **Branding & Footer**: `src/components/Logo.tsx` & `src/components/Footer.tsx`
- [x] **Core Discovery Hubs**:
  - `src/pages/Home.tsx` (Hero, Marquee, Bento Grids, Counter Price Manifesto)
  - `src/pages/RestaurantsList.tsx` (Filter chips, counter badges, list views)
  - `src/pages/RestaurantDetail.tsx` (Menu sections, counter savings banner, `.item` cards)
  - `src/pages/CollectionsList.tsx` & `src/pages/CollectionDetail.tsx` (Curated Delhi hubs)
  - `src/pages/Search.tsx` (Real-time dish & cafe counter search)
  - `src/components/RestaurantCard.tsx` (Punch-out ticket `.ph` + `.lift` physics)

---

## Multi-Phase Roadmap (Remaining Client Surfaces)

### Phase 1: Shared Core Cards (Completed)
- [x] **`src/components/FoodItemCard.tsx`**:
  * Adopt the `.item` and `.lift` card structure matching `RestaurantDetail.tsx`.
  * Exact Veg/Non-Veg pip indicator with crisp rounded border and center dot.
  * Punchy Outfit typography for dish names and price tags with "0% App Markup" micro-pill.
  * Dynamic "+ Add" button with counter increment (`- [ qty ] +`) and instant WhatsApp cart synchronization.
  * Preserved bookmark toggle with coral active state.
  * Compact horizontal list variant for search drawers and sidebars.
- [x] **`src/components/CollectionCard.tsx`**:
  * Rich gradient overlay on food imagery with Outfit display typography.
  * Zone pill (`North Delhi • X Cafes`), nearest Delhi Metro badge, and vibe tag.
  * Preserved bookmark button and link navigation to iconic area guide.

---

### Phase 2: Client-Facing Discovery Pages (Completed)
- [x] **`src/pages/FoodDetail.tsx`**:
  * Perforated Counter Slip Hero layout (`.ph`).
  * Price transparency box comparing counter cost vs. food delivery app markups.
  * One-touch WhatsApp ordering CTA in Trust Evergreen (`#0F766E`).
  * Context Bento Card showing parent cafe details, live status, and full menu link.
  * "Similar Dishes" carousel using the new `FoodItemCard`.
- [x] **`src/pages/Bookmarks.tsx`**:
  * Private Vault Header with live stat badges (`Saved Cafes`, `Saved Dishes`, `Saved Guides`).
  * Segmented `.chipl` filter pills.
  * Empty states styled with Outfit headings and quick discovery CTAs.
- [x] **`src/pages/Nearby.tsx`**:
  * GPS / Metro station proximity header with accuracy badge.
  * Distance radius filter chips (`1 km`, `3 km`, `5 km`, `10 km`).
  * High-contrast obsidian toggle between card grid and interactive map.

---

### Phase 3: Order Drawer & Restaurant Overlays (Completed)
- [x] **`src/components/WhatsAppOrderDrawer.tsx`**:
  * Physical printed register receipt styling with perforated top/bottom borders.
  * Live markup savings banner (*"You saved ₹X vs food delivery apps"*).
  * Dine-in / Takeaway / Direct Delivery segmented selector.
  * High-contrast Evergreen WhatsApp checkout button.
- [x] **`src/components/RestaurantQrModal.tsx`**:
  * Visual acrylic/wooden table standee preview with counter QR code and instant print/download action.
- [x] **`src/components/ClaimRestaurantModal.tsx`**:
  * Cafe Partner Onboarding modal with dark obsidian header and 0% commission calculator.
- [x] **`src/components/TableReservationModal.tsx` & `src/components/SocialShareModal.tsx`**:
  * 28px rounded sheets with Outfit typography, date/guest selectors, and Instagram/WhatsApp share passes.

---

### Phase 4: Gamified Interactive Discovery Suite (Completed)
- [x] **`src/components/interactive/FoodQuizModal.tsx` (Craving Matcher)**:
  * 3-step interactive questionnaire (Mood, Budget tier, Dietary preference) using interactive card buttons.
- [x] **`src/components/interactive/DayPlannerModal.tsx` (1-Day Food Crawl Generator)**:
  * Itinerary builder generating Breakfast, Lunch, and Evening stops with cumulative counter costs.
- [x] **`src/components/interactive/SpinWheelModal.tsx` (Decide For Me)**:
  * Interactive spinning wheel with brand colors (Coral, Obsidian, Evergreen, Cream).

---

### Phase 5: Brand & Static Pages (Completed)
- [x] **`src/pages/StaticPages.tsx`**:
  * **About Page (`/about`)**: Counter price manifesto & 3-card trust bento grid.
  * **Contact Page (`/contact`)**: Direct email & WhatsApp partner hotline cards.
  * **Terms & Privacy (`/terms`, `/privacy`)**: Two-column legal layout with sticky navigation.
- [x] **`src/components/DirectoryDisclaimer.tsx`**:
  * Upgraded community disclaimer card to warm cream & obsidian tokens.

---

### Phase 6: System Polish & Verification (Completed)
- [x] Verification of all micro-interactions, Toasts, Skeletons, and responsive mobile layouts.
- [x] Full TypeScript build check (`npm run build`). All client-facing surfaces 100% consistent with Claude Code theme (`MenuMap Redesign (1).html`).
- [x] Admin Panel & Owner Portals strictly preserved and untouched.

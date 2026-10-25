# QA, Edge Cases & Known Issues: Menu Maps

This document provides a quality-assurance assessment, edge-case audit, and risk analysis for the customer-facing Menu Maps application ([https://menumaps.in](https://menumaps.in)).

---

## 1. Verified QA Test Scenarios

| Area / Component | Scenario | Expected Behavior | Actual Implementation Finding | Status |
|---|---|---|---|---|
| **Location Detection** | Geolocation denied by user | App falls back gracefully to "All Delhi NCR" | Handled in `LocationContext.tsx` catch block; shows toast | PASS |
| **Location Detection** | Coordinates outside Delhi (> 40 km) | Defaults to "All Delhi NCR" with alert | Verified: assigns `ALL_DELHI_LOCATION` and shows notice | PASS |
| **Search Engine** | Search query with zero matches | Shows helpful suggestions and reset button | Verified: `Search.tsx` displays "No matching cafes or dishes" with "Clear Filters" button | PASS |
| **Bookmarks Vault** | User clears all saved items | Vault displays empty state illustrations | Verified: `Bookmarks.tsx` renders dedicated empty-state cards with discovery CTAs | PASS |
| **WhatsApp Ordering** | User clicks WhatsApp order with 0 items | Drawer prompts item addition | Button disabled when cart length is 0 | PASS |
| **Restaurant Slug Route** | Visitor navigates to invalid slug | Renders 404 recovery page | Handled by `RESERVED_ROUTES` check and `NotFound.tsx` | PASS |
| **Legacy Iconic Area Routes** | Visitor opens historical `/iconic-area` link | Client redirect to `/restaurants` | Handled by `App.tsx` routing dispatcher; redirects seamlessly | PASS |
| **Offline Performance** | Network disconnected after initial load | All 770 cafes & menus remain browsable | Verified: in-memory cache and `data-venues` chunk serve all content locally | PASS |

---

## 2. Edge Case Handling Analysis

### A. Missing or Incomplete Venue Data
1. **Missing Phone Number:**
   - If a venue has no phone or WhatsApp number, the "Order via WhatsApp" button is disabled or hidden, and the venue card displays "Storefront Visit Only".
2. **Missing Storefront Image:**
   - Implements a resilient image fallback ladder:
     `venue.cover_image_url` -> `category_preset` -> `https://menumaps.in/logo.jpg`.
3. **Missing Metro Station:**
   - If `metro_station` is null, the transit badge is safely omitted without breaking the flex layout.
4. **Missing Opening Hours:**
   - Displays "Operating hours verified on walk-in" rather than throwing undefined property errors.

### B. Viewport & Small Screen Behavior
* **Ultra-Narrow Devices (`< 360px`):**
  - Text sizes use responsive clamp utilities (e.g. `clamp(26px, 4.8vw, 62px)`).
  - Horizontal tab bars use `overflow-x-auto no-scrollbar` to allow smooth finger swiping without horizontal viewport blowout.
* **iOS Safe Area Insets:**
  - `MobileBottomNav.tsx` uses `paddingBottom: max(8px, env(safe-area-inset-bottom))` ensuring the navigation bar never conflicts with iPhone home indicators.

---

## 3. Confirmed Issues & Areas for Improvement

### 1. External WhatsApp Number Formatting
* **Finding:** Certain smaller street food stalls may list landline numbers or numbers without country codes (`+91`).
* **Current Handling:** The code strips non-numeric characters and prepends `91`. However, if a 10-digit number is missing or incorrect in community data, the WhatsApp web link may prompt that the number is not registered on WhatsApp.
* **Recommendation:** Add a pre-flight phone validation check in `WhatsAppOrderDrawer.tsx` that notifies the user if a venue only accepts direct phone calls.

### 2. Static Menu Price Drift
* **Finding:** While Menu Maps records are verified against storefront counter price lists, physical restaurants occasionally alter prices (e.g. inflation adjustments of ₹10–20).
* **Current Mitigation:** The footer, about page, and venue cards feature clear disclaimers:
  *"Counter prices are verified from public storefront records, community patrons, and direct submissions."*
* **Recommendation:** Implement a 1-tap "Report Price Update" link on dish cards allowing diners to upload a photo of an updated counter bill.

---

## 4. Potential Risks & Mitigation

| Potential Risk | Severity | Mitigation Currently in Place |
|---|---|---|
| **Aggressive Browser Ad-Blockers** | Low | In-memory `CentralDiscoveryEngine` operates entirely independently of external tracking or cloud APIs. The site works even if `supabase.co` is blocked. |
| **High Latency 3G Mobile Connections** | Low | Initial application code chunk is only **98 kB** (25 kB gzip). Static pre-rendered HTML snapshots ensure immediate first paint before JavaScript hydrates. |
| **Accidental Local Storage Clearing** | Low | Bookmarks are saved in `localStorage`. If a user clears their browser cache, bookmarks reset; an export/import bookmark feature could be considered for future roadmap. |

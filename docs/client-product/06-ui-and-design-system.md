# UI & Design System: Menu Maps

This document provides a technical and design-system reference for the visual identity, tokens, typography, component patterns, responsive behaviors, and accessibility standards implemented on Menu Maps ([https://menumaps.in](https://menumaps.in)).

---

## 1. Visual Identity & Color Palette

Menu Maps uses an editorial, warm-dining aesthetic characterized by rich parchment backgrounds, deep espresso text, energetic paprika/coral accents, and clean teal verification badges.

```
┌────────────────────────────────────────────────────────────────────────┐
│ PRIMARY BRAND ACCENTS                                                  │
│  [ #FF5A36 ] Paprika / Zesty Coral  ──  Primary Brand CTA & Highlights │
│  [ #D8350F ] Deep Coral / Burnt     ──  Hover States, Headings, Badges │
│  [ #FF8A6B ] Peach / Soft Coral     ──  Secondary Highlights & Accents │
├────────────────────────────────────────────────────────────────────────┤
│ VERIFICATION & TRUST ACCENTS                                           │
│  [ #0F766E ] Deep Teal / Pine       ──  Verified Badges & Savings Pill │
│  [ #2DD4BF ] Mint / Cyan            ──  Pulsing Indicators & Radiance  │
│  [ #10B981 ] Emerald Green          ──  Open Status & Live GPS Beacon  │
├────────────────────────────────────────────────────────────────────────┤
│ BACKGROUNDS & SURFACES                                                 │
│  [ #FAF8F5 ] Warm Cream / Pearl     ──  Primary Application Canvas     │
│  [ #FFFFFF ] Pure White             ──  Elevated Cards, Sheets, Modals │
│  [ #1C1917 ] Espresso / Dark Stone  ──  Inverted Banners, Bottom Tabs  │
│  [ #14110F ] Night Black            ──  Footer Surface                 │
├────────────────────────────────────────────────────────────────────────┤
│ BORDERS & DIVIDERS                                                     │
│  [ #E7E2DA ] Warm Parchment Border  ──  Standard Card & Header Divider │
│  [ #E7E5E4 ] Stone 200              ──  Subtle Dividers & Sliders      │
└────────────────────────────────────────────────────────────────────────┘
```

### Color Token Reference:
* **Canvas Background:** `#FAF8F5` (`bg-[#FAF8F5]`) — Creates an editorial culinary warmth compared to sterile clinical white.
* **Primary Text:** `#1C1917` (`text-[#1C1917]`) — Deep stone-charcoal ensuring WCAG AAA contrast against cream and white surfaces.
* **Muted / Subtitle Text:** `#78716C` (`text-stone-500` / `#78716C`) and `#57534E` (`text-stone-600`).
* **Brand Coral Accent:** `#FF5A36` — Used for primary action buttons, active navigation indicators, and price tags.
* **Deep Brand Accent:** `#D8350F` — Used for high-emphasis pricing and hover states.
* **Trust & Transparency Teal:** `#0F766E` — Highlights verified counter badges, receipt tickets, and Metro connections.

---

## 2. Typography Hierarchy

The typography system pairs **Outfit** (a bold, geometric display sans) for headings with **Plus Jakarta Sans** (a clean, legible sans) for interface text and numerical prices.

```
Heading Font:  'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif
Body Font:     'Plus Jakarta Sans', system-ui, -apple-system, sans-serif
```

### Type Scale & Hierarchy:

| Element / Class | Font Family | Size (Desktop / Mobile) | Weight | Letter Spacing | Usage |
|---|---|---|---|---|---|
| **Display H1** | Outfit | `56px` / `32px` | Black (`900`) | `-0.025em` | Homepage Hero Headline |
| **Section H2** (`.h2`) | Outfit | `36px` / `26px` | Black (`900`) | `-0.025em` | Directory & Section Titles |
| **Card H3** (`.hd`) | Outfit | `22px` / `18px` | ExtraBold (`800`) | `-0.02em` | Restaurant Card Names |
| **Eyebrow Label** (`.eyebrow`) | Plus Jakarta Sans | `13px` / `11px` | Black (`900`) | `+0.16em` | Uppercase Section Badges |
| **Body Large** | Plus Jakarta Sans | `18px` / `16px` | Normal (`400`) | Normal | Subheadings & Intros |
| **Body Standard** | Plus Jakarta Sans | `15px` / `14px` | Medium (`500`) | Normal | Descriptions & Menu Copy |
| **Price Callout** | Plus Jakarta Sans | `20px` / `18px` | Black (`900`) | `-0.01em` | Bold Counter Rates (₹) |
| **Meta / Badge** | Plus Jakarta Sans | `12px` / `11px` | Bold (`700`) | `+0.05em` | Metro Gates & Distance |

---

## 3. Layout Grid & Spacing Standards

* **Maximum Container Width:** Standardized to `1280px` (`max-w-[1280px] mx-auto`) with responsive horizontal gutters (`px-4 sm:px-6 md:px-8`).
* **Section Padding (`.sec`):**
  - Desktop: `padding: 104px 32px 0`
  - Mobile: `padding: 56px 16px 0`
* **Card Corner Radii:**
  - Modern Soft Curves: `rounded-2xl` (`16px`), `rounded-3xl` (`24px`), and `rounded-[32px]` / `rounded-[36px]` on major modal sheets and hero cards.
  - Buttons and Chips: `rounded-full` (`9999px`) pill shape.

---

## 4. Reusable UI Components & Tokens

### A. Buttons (`.btn`)
Defined in `src/index.css`:
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
  padding: 0 20px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 15px;
  border: 0;
  cursor: pointer;
  transition: transform 0.25s, box-shadow 0.25s;
}
.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 32px -14px rgba(0, 0, 0, 0.45);
}
```

### B. Filter Chips (`.chip` & `.chipl`)
* `.chip`: Inverted semi-transparent chip for dark backgrounds (`bg-white/8 text-white`).
* `.chipl`: Crisp light-theme chip for standard feeds (`bg-white text-stone-900 border-[#E7E2DA]`).
* Active State (`.on`): Solid dark background (`bg-[#1C1917] text-white`) or brand coral.

### C. Hover Lift Utility (`.lift`)
Provides a smooth cubic-bezier lift effect on card hovers:
```css
.lift {
  transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.35s;
}
.lift:hover {
  transform: translateY(-8px);
  box-shadow: 0 30px 56px -24px rgba(28, 25, 23, 0.38);
}
```

### D. Perforated Receipt Styling (`.ph`)
Applied to the Counter Bill Ticket in `Home.tsx` and `HonestBillBox.tsx` with circular notch cutouts on left and right borders simulating a real physical cash counter slip.

---

## 5. Responsive Breakpoints & Mobile Adaptations

Menu Maps is built **mobile-first**, recognizing that 80%+ of food and cafe discoveries occur on smartphones.

```
Breakpoint Scale:
  xs: 380px   ── Small smartphones
  sm: 640px   ── Large phones / phablets
  md: 768px   ── Tablets & iPad viewports (Desktop navbar switches on)
  lg: 1024px  ── Laptops & small desktops
  xl: 1280px  ── Max-width container boundary
```

### Mobile-Specific Adaptations (`< 768px`):
1. **Mobile Bottom Navigation Bar (`MobileBottomNav.tsx`):**
   - Fixed to the bottom of the viewport with safe-area padding:
     `paddingBottom: max(8px, env(safe-area-inset-bottom))`
   - 4 primary tabs: **Home**, **Restaurants**, **Search**, **Saved**.
   - Active indicator dot and badge counters for saved items.
2. **Compact Header Cluster:**
   - On mobile, the desktop nav links hide. The header displays the Menu Maps logo, a compact location pill, and a direct search icon.
3. **Bottom Sheet Modals:**
   - Filters and Location Selectors render as slide-up bottom sheets with swipe-down dismiss handles (`rounded-t-[32px]`), maximizing thumb ergonomics.
4. **Touch Targets:**
   - All interactive controls maintain minimum touch targets of `44px x 44px` or `48px x 48px` to prevent mis-clicks.

---

## 6. Accessibility & Usability Standards

* **Keyboard Dismissal:** All dialogs and popups (`LocationPickerModal`, `DishRouletteModal`, `SpinWheelModal`, etc.) listen for the `Escape` key to immediately close.
* **Scroll-Locking:** Modals apply `overflow: hidden` to `document.body` while mounted, preventing background scroll jank.
* **Dialog ARIA Compliance:** Modals use `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`.
* **High-Contrast Text:** Text contrast ratios exceed 7:1 for body copy (`#1C1917` on `#FAF8F5`) and 4.5:1 for accents.
* **Icon Sizing:** Icons from `lucide-react` are explicitly sized (typically `16px`, `18px`, or `20px`) with consistent stroke weights (`1.8` to `2.2`).

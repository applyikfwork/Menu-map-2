# Menu Maps — Client-Side Product Documentation Package

## Project Metadata & Audit Overview

- **Official Brand Name:** Menu Maps
- **Production URL:** [https://menumaps.in](https://menumaps.in)
- **Documentation Suite Version:** 1.0.0
- **Audit Date:** October 25, 2026
- **Scope Restriction:** **Customer-Facing Public Website Only**. Administrative dashboards, internal CMS tooling, and operator controls are strictly excluded.
- **Verification Status:** Fully verified against the active source code, TypeScript schemas, modular dataset repositories, and the production build pipeline (`npm run build`).

---

## Master Table of Contents

This comprehensive documentation suite provides an end-to-end blueprint of the customer-facing Menu Maps application. Navigate through the documents below based on your role and objectives.

| Document | Title | Purpose & Content Summary |
| :--- | :--- | :--- |
| [**00-product-overview.md**](file:///c:/Users/kavit/menumaps/docs/client-product/00-product-overview.md) | **Product Overview & Mission** | High-level synthesis of Menu Maps: market problem statement (delivery markups vs. dining truth), brand positioning, value proposition, scale metrics (770 cafes, 6,794 dishes), target personas, and competitive landscape. |
| [**01-public-page-inventory.md**](file:///c:/Users/kavit/menumaps/docs/client-product/01-public-page-inventory.md) | **Public Page Inventory** | Detailed audit of all 16 customer-facing routes and page types (`/`, `/restaurants`, `/nearby`, `/restaurant/:slug`, `/food/:slug`, `/search`, `/bookmarks`, etc.), detailing URL patterns, layout hierarchies, interactive controls, and states. |
| [**02-customer-journeys.md**](file:///c:/Users/kavit/menumaps/docs/client-product/02-customer-journeys.md) | **Customer Journeys & Flows** | Step-by-step numbered customer walkthroughs accompanied by Mermaid sequence and flow diagrams covering homepage arrival, location switching, GPS discovery, menu browsing, WhatsApp ordering, and offline saving. |
| [**03-feature-catalog.md**](file:///c:/Users/kavit/menumaps/docs/client-product/03-feature-catalog.md) | **Customer Feature Catalog** | Systematic matrix of every user-facing feature (Search, Proximity Feed, Honest Bill Calculator, Dietary Toggles, Table Standee QR Mode, Offline Vault), including verification status, limitations, and component links. |
| [**04-location-and-discovery-system.md**](file:///c:/Users/kavit/menumaps/docs/client-product/04-location-and-discovery-system.md) | **Location & Discovery Architecture** | Deep architectural breakdown of the Delhi location system: 9 zones, 64 granular localities, Haversine spherical distance formula, progressive 4-tier discovery fallbacks, and geolocation permission handling. |
| [**05-cafe-pages-and-menu-experience.md**](file:///c:/Users/kavit/menumaps/docs/client-product/05-cafe-pages-and-menu-experience.md) | **Cafe Pages & Menu Experience** | Granular teardown of the storefront experience (`RestaurantDetail.tsx`), menu categorization, dietary pill indicators, price transparency widgets, amenities display, and direct WhatsApp drawer integration. |
| [**06-ui-and-design-system.md**](file:///c:/Users/kavit/menumaps/docs/client-product/06-ui-and-design-system.md) | **UI, Design System & Tokens** | Complete design system audit: color tokens (Warm Amber, Deep Night, Emerald Verified), typography scale (Outfit + Plus Jakarta Sans), spacing conventions, mobile breakpoint rules, and 48px touch targets. |
| [**07-data-flow-and-integrations.md**](file:///c:/Users/kavit/menumaps/docs/client-product/07-data-flow-and-integrations.md) | **Data Flow, Storage & Integrations** | Analysis of client-side data resolution, localStorage keys (`mm_user_location`, `menumaps_bookmarks_v1`), third-party integrations (WhatsApp, Google Maps, HTML5 Geolocation), and the static pre-rendering build pipeline. |
| [**08-qa-and-known-issues.md**](file:///c:/Users/kavit/menumaps/docs/client-product/08-qa-and-known-issues.md) | **QA Matrix & Edge Case Handling** | Exhaustive quality assurance audit documenting tested user scenarios, permission edge cases (GPS blocked/offline), defensive UI fallbacks for incomplete data, and an operational risk mitigation matrix. |
| [**09-product-glossary-and-faq.md**](file:///c:/Users/kavit/menumaps/docs/client-product/09-product-glossary-and-faq.md) | **Product Glossary & Customer FAQ** | Authoritative vocabulary definitions (Counter Price, App Markup, 0% Commission, Verified Storefront, Proximity Ranking) and customer/business FAQs clarifying commercial models and operational rules. |
| [**10-ai-handoff-brief.md**](file:///c:/Users/kavit/menumaps/docs/client-product/10-ai-handoff-brief.md) | **AI Agent Handoff Brief** | High-density context hydration document designed for future autonomous AI coding agents and frontend engineers to rapidly understand code architecture, file locations, build commands, and critical code invariants. |

---

## Suggested Reading Paths by Persona

### 1. For Autonomous AI Agents & New Developers
1. Start with [**10-ai-handoff-brief.md**](file:///c:/Users/kavit/menumaps/docs/client-product/10-ai-handoff-brief.md) for instant context hydration and invariant rules.
2. Read [**01-public-page-inventory.md**](file:///c:/Users/kavit/menumaps/docs/client-product/01-public-page-inventory.md) to understand routing and component mapping.
3. Review [**07-data-flow-and-integrations.md**](file:///c:/Users/kavit/menumaps/docs/client-product/07-data-flow-and-integrations.md) before making data model or caching modifications.

### 2. For Product Managers & Business Strategists
1. Read [**00-product-overview.md**](file:///c:/Users/kavit/menumaps/docs/client-product/00-product-overview.md) to understand value positioning, market differentiation, and unit economics.
2. Read [**02-customer-journeys.md**](file:///c:/Users/kavit/menumaps/docs/client-product/02-customer-journeys.md) to inspect user funnels and ordering workflows.
3. Review [**09-product-glossary-and-faq.md**](file:///c:/Users/kavit/menumaps/docs/client-product/09-product-glossary-and-faq.md) for commercial clarity and competitive messaging.

### 3. For UI/UX & Interaction Designers
1. Read [**06-ui-and-design-system.md**](file:///c:/Users/kavit/menumaps/docs/client-product/06-ui-and-design-system.md) for design tokens, typography, and spacing.
2. Read [**05-cafe-pages-and-menu-experience.md**](file:///c:/Users/kavit/menumaps/docs/client-product/05-cafe-pages-and-menu-experience.md) for storefront layout and menu interaction patterns.
3. Review [**03-feature-catalog.md**](file:///c:/Users/kavit/menumaps/docs/client-product/03-feature-catalog.md) for active micro-interactions and modal behaviors.

### 4. For QA Engineers & Testers
1. Read [**08-qa-and-known-issues.md**](file:///c:/Users/kavit/menumaps/docs/client-product/08-qa-and-known-issues.md) for edge cases, missing data fallbacks, and risk matrix.
2. Cross-reference test scripts against [**02-customer-journeys.md**](file:///c:/Users/kavit/menumaps/docs/client-product/02-customer-journeys.md).

---

## Documentation Maintenance Rules

When extending the Menu Maps codebase, update the documentation package according to these guidelines:
- **New Public Routes:** Add an entry to `01-public-page-inventory.md` and update `scripts/generate-sitemap.mjs`.
- **Venue / Locality Additions:** Update counts in `00-product-overview.md` and locality tables in `04-location-and-discovery-system.md`.
- **Component or Token Changes:** Update typography and color references in `06-ui-and-design-system.md`.
- **Admin Isolation:** Under no circumstances should internal administration pages or private credentials be committed to this public client documentation directory.

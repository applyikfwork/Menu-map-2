# 🗺️ MenuMaps Delhi Restaurant & Menu Scouting Master AI Prompt

Use this prompt with **ChatGPT (GPT-4o)**, **Google Gemini (1.5 Pro / 2.0 Flash)**, or **Claude 3.5 Sonnet** to automatically generate 30 to 40 verified restaurants with 250+ authentic menu items for any locality in Delhi NCR (or any other city).

---

## 📋 The Copy-Paste AI Prompt Template

> **Copy everything inside the box below and fill in the bracketed `[YOUR LOCALITY]` before sending to the AI:**

```text
Act as a senior Delhi food curator and restaurant scout for MenuMaps.
I need a comprehensive, high-quality dataset of 30 to 40 of the best, most popular, and iconic restaurants, cafes, bakeries, and street food legends in: [INSERT LOCALITY HERE, e.g., "Rajouri Garden, West Delhi" or "Hauz Khas Village & SDA, South Delhi" or "Chandni Chowk, Old Delhi"].

Follow these strict data quality rules:
1. CURATION MIX: Include a balanced mix:
   - Top aesthetic cafes & specialty coffee roasters
   - Heritage/iconic eateries and famous street food counters
   - Pure-vegetarian family dining halls & thali joints
   - Popular fast-food, momo, roll, and burger hotspots
   - Premium bakeries, waffle joints, and dessert parlors
2. RESTAURANTS COUNT: Exactly 30 to 40 distinct restaurants.
3. DISHES PER RESTAURANT: Provide 8 to 10 signature dishes across diverse menu categories (e.g., Starters, Mains, Breads/Rice, Beverages, Desserts).
4. REALISTIC PRICING: Provide authentic in-store dine-in/counter prices in INR (do NOT inflate with 30-40% food delivery app markups).
5. FORMAT: Output ONLY clean, valid CSV format with standard headers and RFC-4180 quotation marks around any text with commas. Do not include markdown preamble or conversational text.

CSV HEADER (MUST MATCH EXACTLY):
Restaurant Name,Locality,Zone,Landmark,Nearest Metro,Avg Cost for 2,Cuisine Types,Category Name,Dish Name,Price,Description,Is Veg,Is Must Try

COLUMN SPECIFICATIONS:
- Restaurant Name: Official business name (e.g. "Suchali's Artisan Bakehouse")
- Locality: Specific neighborhood/market (e.g. "Model Town", "GK 1", "Defence Colony")
- Zone: One of "North Delhi", "South Delhi", "West Delhi", "East Delhi", "Central Delhi"
- Landmark: Main market or prominent spot (e.g. "M-Block Market", "Naini Lake")
- Nearest Metro: Nearest Delhi Metro station & line (e.g. "Model Town Metro", "GTB Nagar Metro")
- Avg Cost for 2: Approximate meal for two in INR integer (e.g. 500, 750, 1400)
- Cuisine Types: Comma-separated in quotes (e.g. "Bakery, Cafe, Desserts")
- Category Name: Menu section name (e.g. "Artisan Bakery & Viennoiserie", "Gourmet Pizzas", "Beverages")
- Dish Name: Exact dish name (e.g. "Twice Baked Almond Croissant")
- Price: In-store price in INR integer (e.g. 240)
- Description: 1 enticing sentence describing ingredients, crust, preparation, or serving style
- Is Veg: true or false (lowercase)
- Is Must Try: true for 2-3 signature specialties per venue, false otherwise

Now generate the complete CSV dataset:
```

---

## 📁 File Organization: Where Everything Is Stored

To make sure you always know where files are located:

```
c:\Users\kavit\menumaps\
├── src/
│   ├── data/
│   │   ├── raw_csv/                      <-- 📂 Raw CSV files for each Delhi hub
│   │   │   ├── model_town.csv            (35 restaurants, 295 dishes)
│   │   │   ├── vijay_nagar.csv           (35 restaurants, 329 dishes)
│   │   │   ├── gk1.csv                   (35 restaurants, 280 dishes)
│   │   │   ├── gk2.csv                   (32 restaurants, 300 dishes)
│   │   │   └── def_col.csv               (32 restaurants, 288 dishes)
│   │   │
│   │   └── venues/                       <-- 📂 Modular auto-generated TypeScript files
│   │       ├── modelTownVenues.ts        (Export: MODEL_TOWN_RESTAURANTS, etc.)
│   │       ├── vijayNagarVenues.ts       (Export: VIJAY_NAGAR_RESTAURANTS, etc.)
│   │       ├── gk1Venues.ts              (Export: GK1_RESTAURANTS, etc.)
│   │       ├── gk2Venues.ts              (Export: GK2_RESTAURANTS, etc.)
│   │       ├── defColVenues.ts           (Export: DEF_COL_RESTAURANTS, etc.)
│   │       └── index.ts                  (Central export for all 5 hubs)
│   │
│   ├── lib/
│   │   ├── seedData.ts                   <-- 📂 Global seed dataset merging all venues
│   │   ├── supabase.ts                   <-- 📂 Data versioning & remote DB sync
│   │   ├── areaGuidesData.ts             <-- 📂 Curated Area Guides for Delhi hubs
│   │   ├── delhiLocationsData.ts         <-- 📂 Delhi GPS coordinates, metro & zones
│   │   └── dishImageRegistry.ts          <-- 📂 Zero-mismatch smart food photo registry
│   │
│   └── scripts/
│       └── build5Locations.js            <-- 📂 Fast compiler script: Raw CSV -> TypeScript
```

---

## 🚀 How to Add Another New Locality in 2 Minutes

1. **Get the CSV**: Use the AI prompt above to get your new locality's CSV.
2. **Save the CSV**: Save it to `src/data/raw_csv/<locality_name>.csv`.
3. **Run the builder**: In terminal, run:
   ```bash
   node scripts/build5Locations.js
   ```
4. **Build & Verify**:
   ```bash
   npm run build
   ```
5. **Done!** The restaurants, categories, and dishes are immediately live on the website, discoverable via search, map, and filters with 0% delivery markup badges!

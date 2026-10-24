import re
import os
import glob
import json
from datetime import datetime

DOMAIN = "https://menumaps.in"
TODAY = datetime.now().strftime("%Y-%m-%d")
PRERENDER_DATA = "dist/prerender_data.json"

restaurant_slugs = set()
dish_slugs = set()

# Prefer dist/prerender_data.json if present
if os.path.exists(PRERENDER_DATA):
    print(f"Loading slugs directly from {PRERENDER_DATA}...")
    with open(PRERENDER_DATA, 'r', encoding='utf-8') as f:
        pdata = json.load(f)
    for r in pdata.get("restaurants", []):
        if r.get("slug"):
            restaurant_slugs.add(r["slug"])
    for d in pdata.get("dishes", []):
        if d.get("slug"):
            dish_slugs.add(d["slug"])
else:
    venue_files = [
        'src/lib/northCampusDuVenues.ts',
        'src/lib/extraZoneVenues.ts',
        'src/lib/newDelhiVenues.ts',
    ]
    venue_files.extend(glob.glob('src/data/venues/*.ts'))

    for vf in set(venue_files):
        if not os.path.exists(vf):
            continue
        with open(vf, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        # Extract RESTAURANTS blocks
        rest_blocks = re.findall(r'(?:export\s+const\s+[A-Za-z0-9_]*RESTAURANTS\b[^=]*=\s*\[)(.*?)(\];\s*(?:export|\Z))', content, re.DOTALL)
        for rb, _ in rest_blocks:
            found = re.findall(r'[\'"]slug[\'"]\s*:\s*[\'"]([a-zA-Z0-9_-]+)[\'"]', rb)
            for s in found:
                restaurant_slugs.add(s)

        # Extract MENU_ITEMS blocks
        item_blocks = re.findall(r'(?:export\s+const\s+[A-Za-z0-9_]*MENU_ITEMS\b[^=]*=\s*\[)(.*?)(\];\s*(?:export|\Z))', content, re.DOTALL)
        for ib, _ in item_blocks:
            found = re.findall(r'[\'"]slug[\'"]\s*:\s*[\'"]([a-zA-Z0-9_-]+)[\'"]', ib)
            for s in found:
                dish_slugs.add(s)

    # Also check seedData.ts specifically
    if os.path.exists('src/lib/seedData.ts'):
        with open('src/lib/seedData.ts', 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        rest_blocks = re.findall(r'(?:export\s+const\s+SEED_RESTAURANTS\b[^=]*=\s*\[)(.*?)(\];\s*(?:export|\Z))', content, re.DOTALL)
        for rb, _ in rest_blocks:
            found = re.findall(r'[\'"]slug[\'"]\s*:\s*[\'"]([a-zA-Z0-9_-]+)[\'"]', rb)
            for s in found:
                restaurant_slugs.add(s)
        
        item_blocks = re.findall(r'(?:export\s+const\s+SEED_MENU_ITEMS\b[^=]*=\s*\[)(.*?)(\];\s*(?:export|\Z))', content, re.DOTALL)
        for ib, _ in item_blocks:
            found = re.findall(r'[\'"]slug[\'"]\s*:\s*[\'"]([a-zA-Z0-9_-]+)[\'"]', ib)
            for s in found:
                dish_slugs.add(s)

core_pages = [
    ("", "daily", "1.0"),
    ("restaurants", "daily", "0.9"),
    ("nearby", "daily", "0.9"),
    ("list-cafe", "weekly", "0.85"),
    ("search", "daily", "0.8"),
    ("about", "monthly", "0.6"),
    ("contact", "monthly", "0.6"),
    ("terms", "monthly", "0.4"),
    ("privacy", "monthly", "0.4"),
]

lines = ['<?xml version="1.0" encoding="UTF-8"?>']
lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

# 1. Core Pages
lines.append('  <!-- Core Pages -->')
for path, freq, prio in core_pages:
    loc = f"{DOMAIN}/{path}" if path else f"{DOMAIN}/"
    lines.append('  <url>')
    lines.append(f'    <loc>{loc}</loc>')
    lines.append(f'    <lastmod>{TODAY}</lastmod>')
    lines.append(f'    <changefreq>{freq}</changefreq>')
    lines.append(f'    <priority>{prio}</priority>')
    lines.append('  </url>')

# 2. Verified Restaurants (/restaurant/:slug)
lines.append('\n  <!-- Verified Restaurant Menus -->')
for slug in sorted(list(restaurant_slugs)):
    lines.append('  <url>')
    lines.append(f'    <loc>{DOMAIN}/restaurant/{slug}</loc>')
    lines.append(f'    <lastmod>{TODAY}</lastmod>')
    lines.append('    <changefreq>weekly</changefreq>')
    lines.append('    <priority>0.80</priority>')
    lines.append('  </url>')

# 3. Verified Dishes (/food/:slug)
lines.append('\n  <!-- Individual Verified Dishes -->')
for slug in sorted(list(dish_slugs)):
    lines.append('  <url>')
    lines.append(f'    <loc>{DOMAIN}/food/{slug}</loc>')
    lines.append(f'    <lastmod>{TODAY}</lastmod>')
    lines.append('    <changefreq>weekly</changefreq>')
    lines.append('    <priority>0.70</priority>')
    lines.append('  </url>')

lines.append('</urlset>\n')

output_path = 'public/sitemap.xml'
sitemap_xml = '\n'.join(lines)
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(sitemap_xml)

if os.path.exists('dist'):
    dist_sitemap_path = 'dist/sitemap.xml'
    with open(dist_sitemap_path, 'w', encoding='utf-8') as f:
        f.write(sitemap_xml)
    print(f"Also synced sitemap to {dist_sitemap_path}")

print(f"Sitemap successfully generated at {output_path}:")
print(f"  - Core Pages: {len(core_pages)}")
print(f"  - Verified Restaurants: {len(restaurant_slugs)}")
print(f"  - Verified Dishes: {len(dish_slugs)}")
print(f"  - Total URLs: {len(core_pages) + len(restaurant_slugs) + len(dish_slugs)}")

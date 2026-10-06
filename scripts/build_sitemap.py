import re
import os

DOMAIN = "https://menumaps.online"

def get_slugs_from_file(filepath):
    if not os.path.exists(filepath):
        return []
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()
    # Match slug: 'abc' or "slug": "abc"
    found = re.findall(r'slug[\'"]?\s*:\s*[\'"]([a-zA-Z0-9_-]+)[\'"]', text)
    return found

rest_files = [
    'src/lib/sample50Cafes.ts',
    'src/lib/northCampusDuVenues.ts',
    'src/lib/extraZoneVenues.ts',
    'src/lib/newDelhiVenues.ts'
]

restaurant_slugs = set()
for rf in rest_files:
    for s in get_slugs_from_file(rf):
        if s and not s.startswith('http'):
            restaurant_slugs.add(s)

area_guide_slugs = set(get_slugs_from_file('src/lib/areaGuidesData.ts'))

# Core pages
core_pages = [
    ("", "daily", "1.0"),
    ("restaurants", "daily", "0.9"),
    ("iconic-area", "weekly", "0.9"),
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
    lines.append(f'    <changefreq>{freq}</changefreq>')
    lines.append(f'    <priority>{prio}</priority>')
    lines.append('  </url>')

# 2. Area Guides
lines.append('\n  <!-- Iconic Area Food Guides -->')
for slug in sorted(list(area_guide_slugs)):
    lines.append('  <url>')
    lines.append(f'    <loc>{DOMAIN}/iconic-area/{slug}</loc>')
    lines.append('    <changefreq>weekly</changefreq>')
    lines.append('    <priority>0.85</priority>')
    lines.append('  </url>')

# 3. Verified Restaurants
lines.append('\n  <!-- Verified Restaurant Menus -->')
for slug in sorted(list(restaurant_slugs)):
    lines.append('  <url>')
    lines.append(f'    <loc>{DOMAIN}/{slug}</loc>')
    lines.append('    <changefreq>weekly</changefreq>')
    lines.append('    <priority>0.8</priority>')
    lines.append('  </url>')

lines.append('</urlset>\n')

output_path = 'public/sitemap.xml'
with open(output_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print(f"Sitemap generated successfully at {output_path} with {len(core_pages)} core pages, {len(area_guide_slugs)} area guides, and {len(restaurant_slugs)} cafes.")

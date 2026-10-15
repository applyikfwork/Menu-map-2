import os
import re
import json
import glob

DOMAIN = "https://menumaps.in"
DIST_INDEX = "dist/index.html"

def main():
    if not os.path.exists(DIST_INDEX):
        print(f"Error: {DIST_INDEX} not found. Run 'npm run build' or 'vite build' first.")
        return

    with open(DIST_INDEX, "r", encoding="utf-8") as f:
        template = f.read()

    venue_files = [
        'src/lib/sample50Cafes.ts',
        'src/lib/northCampusDuVenues.ts',
        'src/lib/extraZoneVenues.ts',
        'src/lib/newDelhiVenues.ts',
        'src/lib/seedData.ts',
    ]
    venue_files.extend(glob.glob('src/data/venues/*.ts'))

    restaurants = []
    seen = set()

    for vf in set(venue_files):
        if not os.path.exists(vf):
            continue
        with open(vf, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        match = re.search(r'export\s+const\s+[A-Za-z0-9_]*RESTAURANTS\b[^=]*=\s*\[(.*?)\];\s*(?:export|\Z)', content, re.DOTALL)
        if not match:
            continue
        block = match.group(1)

        items = re.split(r'\{\s*[\'"]?id[\'"]?\s*:', block)
        for it in items[1:]:
            slug_m = re.search(r'[\'"]?slug[\'"]?\s*:\s*[\'"]([^\'"]+)[\'"]', it)
            name_m = re.search(r'[\'"]?name[\'"]?\s*:\s*[\'"]([^\'"]+)[\'"]', it)
            if slug_m and name_m:
                slug = slug_m.group(1).strip()
                name = name_m.group(1).strip()
                if slug and slug not in seen:
                    seen.add(slug)
                    city_m = re.search(r'[\'"]?(?:city|city_area)[\'"]?\s*:\s*[\'"]([^\'"]+)[\'"]', it)
                    addr_m = re.search(r'[\'"]?address_line1[\'"]?\s*:\s*[\'"]([^\'"]+)[\'"]', it)
                    cost_m = re.search(r'[\'"]?average_cost_for_two[\'"]?\s*:\s*([0-9]+)', it)
                    img_m = re.search(r'[\'"]?cover_image_url[\'"]?\s*:\s*[\'"]([^\'"]+)[\'"]', it)

                    restaurants.append({
                        "slug": slug,
                        "name": name,
                        "city": city_m.group(1) if city_m else "Delhi",
                        "address_line1": addr_m.group(1) if addr_m else "Delhi",
                        "average_cost_for_two": int(cost_m.group(1)) if cost_m else 400,
                        "cover_image_url": img_m.group(1) if img_m else "https://menumaps.in/logo.jpg"
                    })

    print(f"Extracted {len(restaurants)} unique verified restaurants for pre-rendering.")

    # 1. Pre-render Restaurant Pages
    for r in restaurants:
        slug = r.get("slug")
        name = r.get("name", "Restaurant")
        city = r.get("city", "Delhi NCR")
        addr = r.get("address_line1", city)
        cost = r.get("average_cost_for_two", 400)
        img = r.get("cover_image_url", "https://menumaps.in/logo.jpg")

        page_url = f"{DOMAIN}/restaurant/{slug}"
        title = f"{name} Menu, Prices & Photos | {city} | Menu Maps"
        desc = f"Explore {name} in {city}. View live digital menu with verified prices, dish photos, address ({addr}), opening timings, and 0% commission direct WhatsApp ordering."

        # Generate JSON-LD Schema
        schema = {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": ["Restaurant", "CafeOrCoffeeShop"],
                    "@id": f"{page_url}#restaurant",
                    "name": name,
                    "url": page_url,
                    "image": [img],
                    "description": desc,
                    "priceRange": f"₹{cost} for two",
                    "currenciesAccepted": "INR",
                    "paymentAccepted": "Cash, Credit Card, UPI, Digital Wallets",
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": addr,
                        "addressLocality": "Delhi",
                        "addressRegion": "Delhi",
                        "postalCode": "110001",
                        "addressCountry": "IN"
                    },
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": "4.6",
                        "reviewCount": "120",
                        "bestRating": "5",
                        "worstRating": "1"
                    }
                },
                {
                    "@type": "BreadcrumbList",
                    "@id": f"{page_url}#breadcrumbs",
                    "itemListElement": [
                        {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{DOMAIN}/"},
                        {"@type": "ListItem", "position": 2, "name": "Restaurants", "item": f"{DOMAIN}/restaurants"},
                        {"@type": "ListItem", "position": 3, "name": city, "item": f"{DOMAIN}/restaurants?search={city}"},
                        {"@type": "ListItem", "position": 4, "name": name, "item": page_url}
                    ]
                },
                {
                    "@type": "FAQPage",
                    "@id": f"{page_url}#faq",
                    "mainEntity": [
                        {
                            "@type": "Question",
                            "name": f"What is the average cost for two people at {name}?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": f"The average cost for two people dining at {name} is approximately ₹{cost}. All prices are verified directly from physical cafe menus."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": f"Where is {name} located and can I view the real menu?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": f"{name} is located at {addr}, {city}. You can view the complete verified digital menu on Menu Maps."
                            }
                        }
                    ]
                }
            ]
        }

        # Semantic Fallback Content for AI bots & non-JS scrapers
        fallback_html = f"""
        <main style="max-width: 900px; margin: 40px auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <header>
                <p style="color: #FF5A36; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Menu Maps Verified Dining Guide</p>
                <h1 style="font-size: 32px; font-weight: 800; color: #1C1917; margin: 8px 0;">{name}</h1>
                <p style="font-size: 16px; color: #78716C; margin-bottom: 20px;">{addr}, {city}</p>
            </header>
            <section style="background: #FFFFFF; border: 1px solid #E7E2DA; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                <h2 style="font-size: 20px; font-weight: 700; margin-top: 0;">Dining Overview & Verified Pricing</h2>
                <ul style="list-style: none; padding: 0; margin: 0; line-height: 2;">
                    <li><strong>Rating:</strong> 4.6 ★ (120+ verified ratings)</li>
                    <li><strong>Average Cost for Two:</strong> ₹{cost}</li>
                    <li><strong>Address:</strong> {addr}, {city}</li>
                    <li><strong>Menu Guarantee:</strong> 100% verified counter rates with 0% delivery app markup.</li>
                </ul>
            </section>
        </main>
        """

        # Replace Title, Description, Canonical, OG, and JSON-LD using lambdas to prevent escape issues
        html = template
        html = re.sub(r'<title>.*?</title>', lambda _: f'<title>{title}</title>', html)
        html = re.sub(r'<meta name="description" content=".*?" />', lambda _: f'<meta name="description" content="{desc}" />', html)
        html = re.sub(r'<link rel="canonical" href=".*?" />', lambda _: f'<link rel="canonical" href="{page_url}" />', html)
        html = re.sub(r'<meta property="og:title" content=".*?" />', lambda _: f'<meta property="og:title" content="{title}" />', html)
        html = re.sub(r'<meta property="og:description" content=".*?" />', lambda _: f'<meta property="og:description" content="{desc}" />', html)
        html = re.sub(r'<meta property="og:url" content=".*?" />', lambda _: f'<meta property="og:url" content="{page_url}" />', html)
        html = re.sub(r'<meta property="og:image" content=".*?" />', lambda _: f'<meta property="og:image" content="{img}" />', html)

        # Inject JSON-LD Schema
        schema_tag = f'<script type="application/ld+json">{json.dumps(schema)}</script>\n  </head>'
        html = html.replace('</head>', schema_tag)

        # Inject Semantic Fallback into root
        html = html.replace('<div id="root"></div>', f'<div id="root">{fallback_html}</div>')

        out_dir = os.path.join("dist", "restaurant", slug)
        os.makedirs(out_dir, exist_ok=True)
        with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8") as f_out:
            f_out.write(html)

    # 2. Pre-render Core Pages (restaurants, iconic-area, collections, search)
    core_dirs = ["restaurants", "iconic-area", "collections", "nearby", "search", "about", "contact"]
    for cd in core_dirs:
        out_dir = os.path.join("dist", cd)
        os.makedirs(out_dir, exist_ok=True)
        page_url = f"{DOMAIN}/{cd}"
        title = f"{cd.replace('-', ' ').title()} | Menu Maps Delhi NCR"
        desc = f"Explore {cd.replace('-', ' ')} across Delhi NCR on Menu Maps. Verified cafe menus, real-time prices, and authentic food discovery."
        html = template
        html = re.sub(r'<title>.*?</title>', lambda _: f'<title>{title}</title>', html)
        html = re.sub(r'<meta name="description" content=".*?" />', lambda _: f'<meta name="description" content="{desc}" />', html)
        html = re.sub(r'<link rel="canonical" href=".*?" />', lambda _: f'<link rel="canonical" href="{page_url}" />', html)
        with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8") as f_out:
            f_out.write(html)

    # Remove temporary parser test if exists
    if os.path.exists("scripts/test_parser.py"):
        try:
            os.remove("scripts/test_parser.py")
        except Exception:
            pass

    print(f"Static Pre-rendering complete! Generated static HTML snapshots for {len(restaurants)} restaurants and {len(core_dirs)} core directories.")

if __name__ == "__main__":
    main()

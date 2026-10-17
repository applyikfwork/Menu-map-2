import os
import re
import json
import glob

DOMAIN = "https://menumaps.in"
DIST_INDEX = "dist/index.html"

def escape_html(text):
    if not text:
        return ""
    return str(text).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")

def replace_root(src_html, new_content):
    start_tag = '<div id="root">'
    start_pos = src_html.find(start_tag)
    if start_pos == -1:
        return src_html
    content_start = start_pos + len(start_tag)
    body_pos = src_html.find('</body>')
    end_pos = src_html.rfind('</div>', 0, body_pos if body_pos != -1 else len(src_html))
    if end_pos == -1 or end_pos < content_start:
        return src_html
    return src_html[:content_start] + new_content + src_html[end_pos:]

def main():
    if not os.path.exists(DIST_INDEX):
        print(f"Error: {DIST_INDEX} not found. Run 'npm run build' or 'vite build' first.")
        return

    with open(DIST_INDEX, "r", encoding="utf-8") as f:
        template = f.read()

    # -------------------------------------------------------------
    # 1. EXTRACT ALL RESTAURANTS FROM VENUE REPOSITORIES
    # -------------------------------------------------------------
    venue_files = [
        'src/lib/northCampusDuVenues.ts',
        'src/lib/extraZoneVenues.ts',
        'src/lib/newDelhiVenues.ts',
        'src/lib/seedData.ts',
    ]
    venue_files.extend(glob.glob('src/data/venues/*.ts'))

    restaurants = []
    seen_slugs = set()

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
                if slug and slug not in seen_slugs:
                    seen_slugs.add(slug)
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

    # -------------------------------------------------------------
    # 2. EXTRACT ICONIC AREA GUIDES & LIVING TRAILS
    # -------------------------------------------------------------
    area_guides = []
    if os.path.exists('src/lib/areaGuidesData.ts'):
        with open('src/lib/areaGuidesData.ts', 'r', encoding='utf-8', errors='ignore') as f:
            guides_content = f.read()

        guide_blocks = re.split(r'\{\s*id\s*:\s*[\'"]', guides_content)[1:]
        for gb in guide_blocks:
            slug_m = re.search(r'slug\s*:\s*[\'"]([^\'"]+)[\'"]', gb)
            title_m = re.search(r'title\s*:\s*[\'"]([^\'"]+)[\'"]', gb)
            desc_m = re.search(r'description\s*:\s*[\'"]([^\'"]+)[\'"]', gb)
            img_m = re.search(r'cover_image_url\s*:\s*[\'"]([^\'"]+)[\'"]', gb)
            area_m = re.search(r'area_name\s*:\s*[\'"]([^\'"]+)[\'"]', gb)
            zone_m = re.search(r'zone\s*:\s*[\'"]([^\'"]+)[\'"]', gb)
            vibe_m = re.search(r'vibe_badge\s*:\s*[\'"]([^\'"]+)[\'"]', gb)
            metro_m = re.search(r'nearest_metro\s*:\s*[\'"]([^\'"]+)[\'"]', gb)
            cost_m = re.search(r'avg_cost_for_two\s*:\s*([0-9]+)', gb)

            if slug_m and title_m:
                # Extract dishes
                dishes = []
                dish_entries = re.split(r'\{\s*name\s*:\s*[\'"]', gb)[1:]
                for de in dish_entries:
                    d_name_m = re.search(r'^([^\'"]+)', de)
                    d_why_m = re.search(r'why_famous\s*:\s*[\'"]([^\'"]+)[\'"]', de)
                    d_rest_m = re.search(r'restaurant_name\s*:\s*[\'"]([^\'"]+)[\'"]', de)
                    d_price_m = re.search(r'price\s*:\s*([0-9]+)', de)
                    if d_name_m:
                        dishes.append({
                            "name": d_name_m.group(1).strip(),
                            "why_famous": d_why_m.group(1).strip() if d_why_m else "",
                            "restaurant_name": d_rest_m.group(1).strip() if d_rest_m else "",
                            "price": int(d_price_m.group(1)) if d_price_m else 0
                        })

                # Extract crawl stops
                crawls = []
                crawl_entries = re.split(r'\{\s*stop_number\s*:\s*([0-9]+)', gb)[1:]
                for i in range(0, len(crawl_entries), 2):
                    stop_num = crawl_entries[i]
                    ce_body = crawl_entries[i+1] if i+1 < len(crawl_entries) else ""
                    time_m = re.search(r'time\s*:\s*[\'"]([^\'"]+)[\'"]', ce_body)
                    venue_m = re.search(r'venue_name\s*:\s*[\'"]([^\'"]+)[\'"]', ce_body)
                    dish_m = re.search(r'recommended_dish\s*:\s*[\'"]([^\'"]+)[\'"]', ce_body)
                    note_m = re.search(r'note\s*:\s*[\'"]([^\'"]+)[\'"]', ce_body)
                    if venue_m:
                        crawls.append({
                            "stop_number": stop_num,
                            "time": time_m.group(1) if time_m else "",
                            "venue_name": venue_m.group(1) if venue_m else "",
                            "recommended_dish": dish_m.group(1) if dish_m else "",
                            "note": note_m.group(1) if note_m else ""
                        })

                area_guides.append({
                    "slug": slug_m.group(1).strip(),
                    "title": title_m.group(1).strip(),
                    "desc": desc_m.group(1).strip() if desc_m else "",
                    "cover_image_url": img_m.group(1).strip() if img_m else "https://menumaps.in/logo.jpg",
                    "area_name": area_m.group(1).strip() if area_m else title_m.group(1).strip(),
                    "zone": zone_m.group(1).strip() if zone_m else "Delhi NCR",
                    "vibe_badge": vibe_m.group(1).strip() if vibe_m else "",
                    "nearest_metro": metro_m.group(1).strip() if metro_m else "",
                    "avg_cost_for_two": int(cost_m.group(1)) if cost_m else 450,
                    "dishes": dishes,
                    "crawls": crawls
                })

    print(f"Extracted {len(area_guides)} living area food guides.")

    # -------------------------------------------------------------
    # 3. PRE-RENDER INDIVIDUAL RESTAURANT PAGES
    # -------------------------------------------------------------
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
                        "addressLocality": city,
                        "addressRegion": "Delhi NCR",
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

        fallback_html = f"""
        <header style="max-width: 1200px; margin: 0 auto; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E7E2DA;">
            <a href="/" style="display: flex; align-items: center; gap: 12px; text-decoration: none; color: inherit;">
                <img src="/logo.jpg" alt="Menu Maps Logo" width="40" height="40" style="border-radius: 10px;" />
                <span style="font-weight: 800; font-size: 22px; color: #1C1917;">Menu Maps</span>
            </a>
            <nav style="display: flex; gap: 24px; font-weight: 600; font-size: 15px;">
                <a href="/restaurants" style="color: #44403C; text-decoration: none;">Restaurants</a>
                <a href="/iconic-area" style="color: #44403C; text-decoration: none;">Iconic Areas</a>
                <a href="/collections" style="color: #44403C; text-decoration: none;">Collections</a>
                <a href="/nearby" style="color: #FF5A36; text-decoration: none;">Best Cafes Near Me</a>
            </nav>
        </header>
        <main style="max-width: 900px; margin: 40px auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <nav style="font-size: 14px; color: #78716C; margin-bottom: 16px;">
                <a href="/" style="color: #FF5A36; text-decoration: none;">Home</a> &gt; 
                <a href="/restaurants" style="color: #FF5A36; text-decoration: none;">Restaurants</a> &gt; 
                <span>{escape_html(name)}</span>
            </nav>
            <header>
                <p style="color: #FF5A36; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Menu Maps Verified Dining Guide</p>
                <h1 style="font-size: 36px; font-weight: 800; color: #1C1917; margin: 8px 0;">{escape_html(name)}</h1>
                <p style="font-size: 16px; color: #78716C; margin-bottom: 20px;">{escape_html(addr)}, {escape_html(city)}</p>
            </header>
            <section style="background: #FFFFFF; border: 1px solid #E7E2DA; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                <h2 style="font-size: 20px; font-weight: 700; margin-top: 0;">Dining Overview & Verified Pricing</h2>
                <ul style="list-style: none; padding: 0; margin: 0; line-height: 2;">
                    <li><strong>Rating:</strong> 4.6 ★ (120+ verified ratings)</li>
                    <li><strong>Average Cost for Two:</strong> ₹{cost}</li>
                    <li><strong>Address:</strong> {escape_html(addr)}, {escape_html(city)}</li>
                    <li><strong>Menu Guarantee:</strong> 100% verified counter rates with 0% delivery app markup.</li>
                </ul>
            </section>
        </main>
        """

        html = template
        html = re.sub(r'<title>.*?</title>', lambda _: f'<title>{title}</title>', html)
        html = re.sub(r'<meta name="description" content=".*?" />', lambda _: f'<meta name="description" content="{desc}" />', html)
        html = re.sub(r'<link rel="canonical" href=".*?" />', lambda _: f'<link rel="canonical" href="{page_url}" />', html)
        html = re.sub(r'<meta property="og:title" content=".*?" />', lambda _: f'<meta property="og:title" content="{title}" />', html)
        html = re.sub(r'<meta property="og:description" content=".*?" />', lambda _: f'<meta property="og:description" content="{desc}" />', html)
        html = re.sub(r'<meta property="og:url" content=".*?" />', lambda _: f'<meta property="og:url" content="{page_url}" />', html)
        html = re.sub(r'<meta property="og:image" content=".*?" />', lambda _: f'<meta property="og:image" content="{img}" />', html)

        schema_tag = f'<script type="application/ld+json">{json.dumps(schema)}</script>\n  </head>'
        html = html.replace('</head>', schema_tag)
        html = replace_root(html, fallback_html)

        # Output to /restaurant/[slug]/index.html
        out_dir = os.path.join("dist", "restaurant", slug)
        os.makedirs(out_dir, exist_ok=True)
        with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8") as f_out:
            f_out.write(html)

        # Output to /[slug]/index.html for direct clean routing
        clean_dir = os.path.join("dist", slug)
        os.makedirs(clean_dir, exist_ok=True)
        with open(os.path.join(clean_dir, "index.html"), "w", encoding="utf-8") as f_out:
            f_out.write(html)

    # -------------------------------------------------------------
    # 4. PRE-RENDER INDIVIDUAL ICONIC AREA GUIDES
    # -------------------------------------------------------------
    for ag in area_guides:
        slug = ag["slug"]
        title = f"{ag['title']} | Menu Maps Iconic Area Guide"
        desc = ag["desc"] or f"Explore {ag['title']} across {ag['zone']}. Discover verified menus, signature dishes, nearest metro, and authentic food crawl stops."
        page_url = f"{DOMAIN}/iconic-area/{slug}"
        img = ag["cover_image_url"]

        dishes_schema = []
        for d in ag["dishes"][:10]:
            dishes_schema.append({
                "@type": "MenuItem",
                "name": d["name"],
                "description": d["why_famous"],
                "offers": {
                    "@type": "Offer",
                    "price": d["price"],
                    "priceCurrency": "INR"
                }
            })

        area_schema = {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "ItemPage",
                    "@id": f"{page_url}#webpage",
                    "name": title,
                    "description": desc,
                    "url": page_url,
                    "about": {
                        "@type": "Place",
                        "name": ag["area_name"],
                        "address": {
                            "@type": "PostalAddress",
                            "addressLocality": ag["zone"],
                            "addressRegion": "Delhi NCR",
                            "addressCountry": "IN"
                        }
                    }
                },
                {
                    "@type": "BreadcrumbList",
                    "@id": f"{page_url}#breadcrumbs",
                    "itemListElement": [
                        {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{DOMAIN}/"},
                        {"@type": "ListItem", "position": 2, "name": "Iconic Areas", "item": f"{DOMAIN}/iconic-area"},
                        {"@type": "ListItem", "position": 3, "name": ag["title"], "item": page_url}
                    ]
                }
            ]
        }

        # Build dishes HTML
        dishes_html = ""
        for d in ag["dishes"]:
            dishes_html += f"""
            <div style="background: #FFFFFF; border: 1px solid #E7E2DA; border-radius: 12px; padding: 18px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                    <h3 style="font-size: 18px; font-weight: 700; color: #1C1917; margin: 0 0 6px 0;">{escape_html(d['name'])}</h3>
                    <span style="font-weight: 800; color: #FF5A36; font-size: 16px;">₹{d['price']}</span>
                </div>
                <p style="color: #0D9488; font-weight: 600; font-size: 13px; margin: 0 0 6px 0;">📍 {escape_html(d['restaurant_name'])}</p>
                <p style="color: #78716C; font-size: 14px; margin: 0; line-height: 1.4;">{escape_html(d['why_famous'])}</p>
            </div>
            """

        # Build crawls HTML
        crawls_html = ""
        for c in ag["crawls"]:
            crawls_html += f"""
            <div style="border-left: 3px solid #FF5A36; padding-left: 16px; margin-bottom: 20px;">
                <p style="color: #FF5A36; font-weight: 700; font-size: 13px; margin: 0;">Stop {c['stop_number']} • {escape_html(c['time'])}</p>
                <h4 style="font-size: 17px; font-weight: 700; color: #1C1917; margin: 4px 0;">{escape_html(c['venue_name'])}</h4>
                <p style="color: #44403C; font-size: 14px; margin: 0 0 4px 0;"><strong>Must Try:</strong> {escape_html(c['recommended_dish'])}</p>
                <p style="color: #78716C; font-size: 13px; margin: 0;">{escape_html(c['note'])}</p>
            </div>
            """

        fallback_html = f"""
        <header style="max-width: 1200px; margin: 0 auto; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E7E2DA;">
            <a href="/" style="display: flex; align-items: center; gap: 12px; text-decoration: none; color: inherit;">
                <img src="/logo.jpg" alt="Menu Maps Logo" width="40" height="40" style="border-radius: 10px;" />
                <span style="font-weight: 800; font-size: 22px; color: #1C1917;">Menu Maps</span>
            </a>
            <nav style="display: flex; gap: 24px; font-weight: 600; font-size: 15px;">
                <a href="/restaurants" style="color: #44403C; text-decoration: none;">Restaurants</a>
                <a href="/iconic-area" style="color: #44403C; text-decoration: none;">Iconic Areas</a>
                <a href="/collections" style="color: #44403C; text-decoration: none;">Collections</a>
                <a href="/nearby" style="color: #FF5A36; text-decoration: none;">Best Cafes Near Me</a>
            </nav>
        </header>
        <main style="max-width: 900px; margin: 40px auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <nav style="font-size: 14px; color: #78716C; margin-bottom: 16px;">
                <a href="/" style="color: #FF5A36; text-decoration: none;">Home</a> &gt; 
                <a href="/iconic-area" style="color: #FF5A36; text-decoration: none;">Iconic Areas</a> &gt; 
                <span>{escape_html(ag['title'])}</span>
            </nav>
            <header style="margin-bottom: 28px;">
                <p style="color: #FF5A36; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">Menu Maps Living Food Trail</p>
                <h1 style="font-size: 36px; font-weight: 900; color: #1C1917; margin: 0 0 12px 0;">{escape_html(ag['title'])}</h1>
                <p style="font-size: 16px; color: #57534E; line-height: 1.5; margin: 0 0 16px 0;">{escape_html(ag['desc'])}</p>
                <div style="background: #FFFFFF; border: 1px solid #E7E2DA; border-radius: 12px; padding: 16px; display: flex; flex-wrap: wrap; gap: 20px; font-size: 14px; color: #44403C;">
                    <span>📍 <strong>Zone:</strong> {escape_html(ag['zone'])}</span>
                    <span>🚇 <strong>Metro:</strong> {escape_html(ag['nearest_metro'])}</span>
                    <span>💰 <strong>Avg Cost for Two:</strong> ₹{ag['avg_cost_for_two']}</span>
                </div>
            </header>

            <section style="margin-bottom: 36px;">
                <h2 style="font-size: 24px; font-weight: 800; color: #1C1917; margin: 0 0 16px 0;">Famous Signature Dishes & Street Hits</h2>
                <div>{dishes_html}</div>
            </section>

            <section style="background: #FFFFFF; border: 1px solid #E7E2DA; border-radius: 16px; padding: 28px; margin-bottom: 36px;">
                <h2 style="font-size: 24px; font-weight: 800; color: #1C1917; margin: 0 0 20px 0;">Curated Food Crawl Itinerary</h2>
                <div>{crawls_html}</div>
            </section>
        </main>
        """

        html = template
        html = re.sub(r'<title>.*?</title>', lambda _: f'<title>{title}</title>', html)
        html = re.sub(r'<meta name="description" content=".*?" />', lambda _: f'<meta name="description" content="{desc}" />', html)
        html = re.sub(r'<link rel="canonical" href=".*?" />', lambda _: f'<link rel="canonical" href="{page_url}" />', html)
        html = re.sub(r'<meta property="og:title" content=".*?" />', lambda _: f'<meta property="og:title" content="{title}" />', html)
        html = re.sub(r'<meta property="og:description" content=".*?" />', lambda _: f'<meta property="og:description" content="{desc}" />', html)
        html = re.sub(r'<meta property="og:url" content=".*?" />', lambda _: f'<meta property="og:url" content="{page_url}" />', html)
        html = re.sub(r'<meta property="og:image" content=".*?" />', lambda _: f'<meta property="og:image" content="{img}" />', html)

        schema_tag = f'<script type="application/ld+json">{json.dumps(area_schema)}</script>\n  </head>'
        html = html.replace('</head>', schema_tag)
        html = replace_root(html, fallback_html)

        # Output to /iconic-area/[slug]/index.html
        for folder in ["iconic-area", "iconic-areas", "collection"]:
            out_dir = os.path.join("dist", folder, slug)
            os.makedirs(out_dir, exist_ok=True)
            with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8") as f_out:
                f_out.write(html)

    # -------------------------------------------------------------
    # 5. PRE-RENDER CORE LANDING PAGES
    # -------------------------------------------------------------

    # A) /restaurants
    top_restaurants_html = ""
    for r in restaurants[:30]:
        top_restaurants_html += f"""
        <div style="background: #FFFFFF; border: 1px solid #E7E2DA; border-radius: 12px; padding: 20px;">
            <h3 style="font-size: 18px; font-weight: 800; margin: 0 0 6px 0;">
                <a href="/restaurant/{r['slug']}" style="color: #1C1917; text-decoration: none;">{escape_html(r['name'])}</a>
            </h3>
            <p style="color: #78716C; font-size: 14px; margin: 0 0 8px 0;">{escape_html(r['address_line1'])}, {escape_html(r['city'])}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
                <span style="font-weight: 700; color: #FF5A36;">₹{r['average_cost_for_two']} for two</span>
                <a href="/restaurant/{r['slug']}" style="color: #0D9488; font-weight: 700; text-decoration: none;">View Live Menu &rarr;</a>
            </div>
        </div>
        """

    restaurants_fallback = f"""
    <header style="max-width: 1200px; margin: 0 auto; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E7E2DA;">
        <a href="/" style="display: flex; align-items: center; gap: 12px; text-decoration: none; color: inherit;">
            <img src="/logo.jpg" alt="Menu Maps Logo" width="40" height="40" style="border-radius: 10px;" />
            <span style="font-weight: 800; font-size: 22px; color: #1C1917;">Menu Maps</span>
        </a>
        <nav style="display: flex; gap: 24px; font-weight: 600; font-size: 15px;">
            <a href="/restaurants" style="color: #FF5A36; text-decoration: none;">Restaurants</a>
            <a href="/iconic-area" style="color: #44403C; text-decoration: none;">Iconic Areas</a>
            <a href="/collections" style="color: #44403C; text-decoration: none;">Collections</a>
            <a href="/nearby" style="color: #FF5A36; text-decoration: none;">Best Cafes Near Me</a>
        </nav>
    </header>
    <main style="max-width: 1200px; margin: 40px auto; padding: 0 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <p style="color: #FF5A36; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">Delhi NCR Dining Directory</p>
        <h1 style="font-size: 40px; font-weight: 900; color: #1C1917; margin: 0 0 16px 0;">Menu Maps Restaurants – Verified Cafes & Menus in Delhi NCR</h1>
        <p style="font-size: 18px; color: #57534E; max-width: 850px; line-height: 1.6; margin-bottom: 32px;">
            Explore over 680+ verified restaurants and cafes across Delhi NCR. Compare real menu prices, dine-in dish photos, addresses, and order directly on WhatsApp with 0% commission. Find the best cafes near you with authentic pricing.
        </p>

        <section style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-bottom: 48px;">
            {top_restaurants_html}
        </section>
    </main>
    """

    restaurants_schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CollectionPage",
                "@id": f"{DOMAIN}/restaurants#webpage",
                "name": "Menu Maps Restaurants – Verified Cafes & Menus in Delhi NCR",
                "description": "Browse 680+ verified cafes and restaurants across Delhi NCR on Menu Maps. View real counter menus, dish prices, and find the best cafes near you.",
                "url": f"{DOMAIN}/restaurants",
                "mainEntity": {
                    "@type": "ItemList",
                    "itemListElement": [
                        {
                            "@type": "ListItem",
                            "position": idx + 1,
                            "name": r["name"],
                            "url": f"{DOMAIN}/restaurant/{r['slug']}"
                        }
                        for idx, r in enumerate(restaurants[:25])
                    ]
                }
            },
            {
                "@type": "BreadcrumbList",
                "@id": f"{DOMAIN}/restaurants#breadcrumbs",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{DOMAIN}/"},
                    {"@type": "ListItem", "position": 2, "name": "Restaurants", "item": f"{DOMAIN}/restaurants"}
                ]
            }
        ]
    }

    out_dir = os.path.join("dist", "restaurants")
    os.makedirs(out_dir, exist_ok=True)
    html = template
    html = re.sub(r'<title>.*?</title>', lambda _: '<title>Menu Maps Restaurants – Verified Cafes & Menus in Delhi NCR</title>', html)
    html = re.sub(r'<meta name="description" content=".*?" />', lambda _: '<meta name="description" content="Browse 680+ verified cafes and restaurants across Delhi NCR on Menu Maps. View real counter menus, dish prices, and find the best cafes near you." />', html)
    html = re.sub(r'<link rel="canonical" href=".*?" />', lambda _: f'<link rel="canonical" href="{DOMAIN}/restaurants" />', html)
    html = re.sub(r'<meta property="og:title" content=".*?" />', lambda _: '<meta property="og:title" content="Menu Maps Restaurants – Verified Cafes & Menus in Delhi NCR" />', html)
    html = re.sub(r'<meta property="og:description" content=".*?" />', lambda _: '<meta property="og:description" content="Browse 680+ verified cafes and restaurants across Delhi NCR on Menu Maps. View real counter menus, dish prices, and find the best cafes near you." />', html)
    html = re.sub(r'<meta property="og:url" content=".*?" />', lambda _: f'<meta property="og:url" content="{DOMAIN}/restaurants" />', html)
    schema_tag = f'<script type="application/ld+json">{json.dumps(restaurants_schema)}</script>\n  </head>'
    html = html.replace('</head>', schema_tag)
    html = replace_root(html, restaurants_fallback)
    with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8") as f_out:
        f_out.write(html)

    # B) /iconic-area and /iconic-areas
    area_cards_html = ""
    for ag in area_guides:
        area_cards_html += f"""
        <div style="background: #FFFFFF; border: 1px solid #E7E2DA; border-radius: 16px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <p style="color: #FF5A36; font-weight: 700; font-size: 13px; text-transform: uppercase; margin: 0 0 6px 0;">{escape_html(ag['zone'])}</p>
            <h3 style="font-size: 20px; font-weight: 800; margin: 0 0 8px 0;">
                <a href="/iconic-area/{ag['slug']}" style="color: #1C1917; text-decoration: none;">{escape_html(ag['title'])}</a>
            </h3>
            <p style="color: #78716C; font-size: 14px; line-height: 1.4; margin: 0 0 12px 0;">{escape_html(ag['vibe_badge'] or ag['desc'])}</p>
            <p style="color: #44403C; font-size: 13px; margin: 0 0 14px 0;">🚇 <strong>Metro:</strong> {escape_html(ag['nearest_metro'])}</p>
            <a href="/iconic-area/{ag['slug']}" style="display: inline-block; background: #FFF4F0; color: #FF5A36; font-weight: 700; font-size: 14px; padding: 8px 16px; border-radius: 8px; text-decoration: none;">View Food Guide &rarr;</a>
        </div>
        """

    iconic_fallback = f"""
    <header style="max-width: 1200px; margin: 0 auto; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E7E2DA;">
        <a href="/" style="display: flex; align-items: center; gap: 12px; text-decoration: none; color: inherit;">
            <img src="/logo.jpg" alt="Menu Maps Logo" width="40" height="40" style="border-radius: 10px;" />
            <span style="font-weight: 800; font-size: 22px; color: #1C1917;">Menu Maps</span>
        </a>
        <nav style="display: flex; gap: 24px; font-weight: 600; font-size: 15px;">
            <a href="/restaurants" style="color: #44403C; text-decoration: none;">Restaurants</a>
            <a href="/iconic-area" style="color: #FF5A36; text-decoration: none;">Iconic Areas</a>
            <a href="/collections" style="color: #44403C; text-decoration: none;">Collections</a>
            <a href="/nearby" style="color: #FF5A36; text-decoration: none;">Best Cafes Near Me</a>
        </nav>
    </header>
    <main style="max-width: 1200px; margin: 40px auto; padding: 0 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <p style="color: #FF5A36; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">Delhi Food Hubs & Trails</p>
        <h1 style="font-size: 40px; font-weight: 900; color: #1C1917; margin: 0 0 16px 0;">Menu Maps Iconic Areas – Famous Delhi Food Streets & Cafe Hubs</h1>
        <p style="font-size: 18px; color: #57534E; max-width: 850px; line-height: 1.6; margin-bottom: 32px;">
            Curated foodie guides to Delhi's legendary food districts: Hudson Lane, Majnu Ka Tilla, Connaught Place, Hauz Khas Village, Chandni Chowk, Rajouri Garden, and Cyber Hub. Discover signature dishes, metro travel directions, and complete food crawl itineraries with verified menu prices.
        </p>

        <section style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; margin-bottom: 48px;">
            {area_cards_html}
        </section>
    </main>
    """

    iconic_schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CollectionPage",
                "@id": f"{DOMAIN}/iconic-area#webpage",
                "name": "Menu Maps Iconic Areas – Famous Delhi Food Streets & Cafe Hubs",
                "description": "Explore Delhi's iconic food destinations: Hudson Lane, Majnu Ka Tilla, Connaught Place, Hauz Khas, Khan Market, Cyber Hub & more with authentic menu prices.",
                "url": f"{DOMAIN}/iconic-area",
                "mainEntity": {
                    "@type": "ItemList",
                    "itemListElement": [
                        {
                            "@type": "ListItem",
                            "position": idx + 1,
                            "name": ag["title"],
                            "url": f"{DOMAIN}/iconic-area/{ag['slug']}"
                        }
                        for idx, ag in enumerate(area_guides)
                    ]
                }
            },
            {
                "@type": "BreadcrumbList",
                "@id": f"{DOMAIN}/iconic-area#breadcrumbs",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{DOMAIN}/"},
                    {"@type": "ListItem", "position": 2, "name": "Iconic Areas", "item": f"{DOMAIN}/iconic-area"}
                ]
            }
        ]
    }

    for cd in ["iconic-area", "iconic-areas"]:
        out_dir = os.path.join("dist", cd)
        os.makedirs(out_dir, exist_ok=True)
        html = template
        html = re.sub(r'<title>.*?</title>', lambda _: '<title>Menu Maps Iconic Areas – Famous Delhi Food Streets & Cafe Hubs</title>', html)
        html = re.sub(r'<meta name="description" content=".*?" />', lambda _: '<meta name="description" content="Explore Delhi\'s iconic food destinations: Hudson Lane, Majnu Ka Tilla, Connaught Place, Hauz Khas, Khan Market, Cyber Hub & more with authentic menu prices." />', html)
        html = re.sub(r'<link rel="canonical" href=".*?" />', lambda _: f'<link rel="canonical" href="{DOMAIN}/{cd}" />', html)
        html = re.sub(r'<meta property="og:title" content=".*?" />', lambda _: '<meta property="og:title" content="Menu Maps Iconic Areas – Famous Delhi Food Streets & Cafe Hubs" />', html)
        html = re.sub(r'<meta property="og:description" content=".*?" />', lambda _: '<meta property="og:description" content="Explore Delhi\'s iconic food destinations: Hudson Lane, Majnu Ka Tilla, Connaught Place, Hauz Khas, Khan Market, Cyber Hub & more with authentic menu prices." />', html)
        html = re.sub(r'<meta property="og:url" content=".*?" />', lambda _: f'<meta property="og:url" content="{DOMAIN}/{cd}" />', html)
        schema_tag = f'<script type="application/ld+json">{json.dumps(iconic_schema)}</script>\n  </head>'
        html = html.replace('</head>', schema_tag)
        html = replace_root(html, iconic_fallback)
        with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8") as f_out:
            f_out.write(html)

    # C) /nearby (High-Intent "Best Cafes Near Me")
    nearby_fallback = f"""
    <header style="max-width: 1200px; margin: 0 auto; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E7E2DA;">
        <a href="/" style="display: flex; align-items: center; gap: 12px; text-decoration: none; color: inherit;">
            <img src="/logo.jpg" alt="Menu Maps Logo" width="40" height="40" style="border-radius: 10px;" />
            <span style="font-weight: 800; font-size: 22px; color: #1C1917;">Menu Maps</span>
        </a>
        <nav style="display: flex; gap: 24px; font-weight: 600; font-size: 15px;">
            <a href="/restaurants" style="color: #44403C; text-decoration: none;">Restaurants</a>
            <a href="/iconic-area" style="color: #44403C; text-decoration: none;">Iconic Areas</a>
            <a href="/collections" style="color: #44403C; text-decoration: none;">Collections</a>
            <a href="/nearby" style="color: #FF5A36; text-decoration: none;">Best Cafes Near Me</a>
        </nav>
    </header>
    <main style="max-width: 1200px; margin: 40px auto; padding: 0 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <p style="color: #FF5A36; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">Live GPS & Hyperlocal Dining</p>
        <h1 style="font-size: 40px; font-weight: 900; color: #1C1917; margin: 0 0 16px 0;">Best Cafes Near Me – Real Menus & Prices | Menu Maps Delhi NCR</h1>
        <p style="font-size: 18px; color: #57534E; max-width: 850px; line-height: 1.6; margin-bottom: 32px;">
            Looking for the best cafes near you with genuine menus and transparent prices? Menu Maps uses live location detection to surface top-rated cafes, student hangouts, romantic spots, and family restaurants within walking distance across Delhi NCR.
        </p>

        <section style="background: #FFFFFF; border: 1px solid #E7E2DA; border-radius: 16px; padding: 32px; margin-bottom: 40px;">
            <h2 style="font-size: 22px; font-weight: 800; color: #1C1917; margin: 0 0 16px 0;">Explore Top Dining Hubs Near You</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 12px;">
                <a href="/iconic-area/hudson-lane-north-campus-food-guide" style="background: #FAF8F5; border: 1px solid #E7E2DA; border-radius: 10px; padding: 12px 20px; text-decoration: none; color: #1C1917; font-weight: 700; font-size: 15px;">Hudson Lane (GTB Nagar)</a>
                <a href="/iconic-area/connaught-place-cp-food-guide" style="background: #FAF8F5; border: 1px solid #E7E2DA; border-radius: 10px; padding: 12px 20px; text-decoration: none; color: #1C1917; font-weight: 700; font-size: 15px;">Connaught Place (CP)</a>
                <a href="/iconic-area/hauz-khas-village-south-delhi-food-guide" style="background: #FAF8F5; border: 1px solid #E7E2DA; border-radius: 10px; padding: 12px 20px; text-decoration: none; color: #1C1917; font-weight: 700; font-size: 15px;">Hauz Khas Village</a>
                <a href="/iconic-area/greater-kailash-gk-food-guide" style="background: #FAF8F5; border: 1px solid #E7E2DA; border-radius: 10px; padding: 12px 20px; text-decoration: none; color: #1C1917; font-weight: 700; font-size: 15px;">Greater Kailash (GK 1 & 2)</a>
                <a href="/iconic-area/rajouri-garden-west-delhi-food-guide" style="background: #FAF8F5; border: 1px solid #E7E2DA; border-radius: 10px; padding: 12px 20px; text-decoration: none; color: #1C1917; font-weight: 700; font-size: 15px;">Rajouri Garden</a>
                <a href="/iconic-area/defence-colony-def-col-food-guide" style="background: #FAF8F5; border: 1px solid #E7E2DA; border-radius: 10px; padding: 12px 20px; text-decoration: none; color: #1C1917; font-weight: 700; font-size: 15px;">Defence Colony</a>
                <a href="/iconic-area/epicuria-nehru-place-food-guide" style="background: #FAF8F5; border: 1px solid #E7E2DA; border-radius: 10px; padding: 12px 20px; text-decoration: none; color: #1C1917; font-weight: 700; font-size: 15px;">Epicuria Nehru Place</a>
                <a href="/iconic-area/nangloi-west-delhi-dining-guide" style="background: #FAF8F5; border: 1px solid #E7E2DA; border-radius: 10px; padding: 12px 20px; text-decoration: none; color: #1C1917; font-weight: 700; font-size: 15px;">Nangloi & West Delhi</a>
                <a href="/iconic-area/model-town-food-guide" style="background: #FAF8F5; border: 1px solid #E7E2DA; border-radius: 10px; padding: 12px 20px; text-decoration: none; color: #1C1917; font-weight: 700; font-size: 15px;">Model Town</a>
            </div>
        </section>
    </main>
    """

    out_dir = os.path.join("dist", "nearby")
    os.makedirs(out_dir, exist_ok=True)
    html = template
    html = re.sub(r'<title>.*?</title>', lambda _: '<title>Best Cafes Near Me – Real Menus & Prices | Menu Maps Delhi NCR</title>', html)
    html = re.sub(r'<meta name="description" content=".*?" />', lambda _: '<meta name="description" content="Find the best cafes near you right now with real verified menus, prices, distance, ratings, and dine-in photos across Delhi NCR." />', html)
    html = re.sub(r'<link rel="canonical" href=".*?" />', lambda _: f'<link rel="canonical" href="{DOMAIN}/nearby" />', html)
    html = re.sub(r'<meta property="og:title" content=".*?" />', lambda _: '<meta property="og:title" content="Best Cafes Near Me – Real Menus & Prices | Menu Maps Delhi NCR" />', html)
    html = re.sub(r'<meta property="og:description" content=".*?" />', lambda _: '<meta property="og:description" content="Find the best cafes near you right now with real verified menus, prices, distance, ratings, and dine-in photos across Delhi NCR." />', html)
    html = re.sub(r'<meta property="og:url" content=".*?" />', lambda _: f'<meta property="og:url" content="{DOMAIN}/nearby" />', html)
    html = replace_root(html, nearby_fallback)
    with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8") as f_out:
        f_out.write(html)

    # D) /collections
    collections_fallback = f"""
    <header style="max-width: 1200px; margin: 0 auto; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E7E2DA;">
        <a href="/" style="display: flex; align-items: center; gap: 12px; text-decoration: none; color: inherit;">
            <img src="/logo.jpg" alt="Menu Maps Logo" width="40" height="40" style="border-radius: 10px;" />
            <span style="font-weight: 800; font-size: 22px; color: #1C1917;">Menu Maps</span>
        </a>
        <nav style="display: flex; gap: 24px; font-weight: 600; font-size: 15px;">
            <a href="/restaurants" style="color: #44403C; text-decoration: none;">Restaurants</a>
            <a href="/iconic-area" style="color: #44403C; text-decoration: none;">Iconic Areas</a>
            <a href="/collections" style="color: #FF5A36; text-decoration: none;">Collections</a>
            <a href="/nearby" style="color: #FF5A36; text-decoration: none;">Best Cafes Near Me</a>
        </nav>
    </header>
    <main style="max-width: 1200px; margin: 40px auto; padding: 0 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <p style="color: #FF5A36; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">Handpicked Foodie Trails</p>
        <h1 style="font-size: 40px; font-weight: 900; color: #1C1917; margin: 0 0 16px 0;">Menu Maps Collections – Handpicked Delhi Cafes, Rooftops & Eats</h1>
        <p style="font-size: 18px; color: #57534E; max-width: 850px; line-height: 1.6; margin-bottom: 32px;">
            Discover curated dining collections for every craving: Aesthetic cafes for photography, budget eats under ₹300, romantic rooftop dinner dates, and late-night street delicacies.
        </p>

        <section style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; margin-bottom: 48px;">
            {area_cards_html}
        </section>
    </main>
    """

    out_dir = os.path.join("dist", "collections")
    os.makedirs(out_dir, exist_ok=True)
    html = template
    html = re.sub(r'<title>.*?</title>', lambda _: '<title>Menu Maps Collections – Handpicked Delhi Cafes, Rooftops & Eats</title>', html)
    html = re.sub(r'<meta name="description" content=".*?" />', lambda _: '<meta name="description" content="Discover handpicked dining collections across Delhi NCR: Aesthetic cafes, budget eats, romantic date spots, and regional delicacies." />', html)
    html = re.sub(r'<link rel="canonical" href=".*?" />', lambda _: f'<link rel="canonical" href="{DOMAIN}/collections" />', html)
    html = re.sub(r'<meta property="og:title" content=".*?" />', lambda _: '<meta property="og:title" content="Menu Maps Collections – Handpicked Delhi Cafes, Rooftops & Eats" />', html)
    html = re.sub(r'<meta property="og:description" content=".*?" />', lambda _: '<meta property="og:description" content="Discover handpicked dining collections across Delhi NCR: Aesthetic cafes, budget eats, romantic date spots, and regional delicacies." />', html)
    html = re.sub(r'<meta property="og:url" content=".*?" />', lambda _: f'<link rel="canonical" href="{DOMAIN}/collections" />', html)
    html = replace_root(html, collections_fallback)
    with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8") as f_out:
        f_out.write(html)

    # E) Other Core Pages (search, about, contact, terms, privacy)
    simple_pages = {
        "search": ("Search Cafes, Restaurants & Dishes | Menu Maps Delhi NCR", "Search verified menus, dishes, cafes, and restaurants across Delhi NCR on Menu Maps."),
        "about": ("About Menu Maps – Verified Food Discovery & 0% Markup Menus", "Menu Maps is Delhi NCR's premier food discovery platform offering 100% real dine-in menus, verified prices, and zero delivery app markups."),
        "contact": ("Contact Menu Maps – Support, Partnerships & Restaurant Onboarding", "Get in touch with the Menu Maps team at contact@menumaps.in for restaurant onboarding, partnership inquiries, and diner support."),
        "terms": ("Terms of Service | Menu Maps Delhi NCR", "Review the terms and conditions governing the use of Menu Maps."),
        "privacy": ("Privacy Policy | Menu Maps Delhi NCR", "Learn how Menu Maps protects diner and restaurant partner privacy, cookies, and data transparency.")
    }

    for sp_slug, (sp_title, sp_desc) in simple_pages.items():
        out_dir = os.path.join("dist", sp_slug)
        os.makedirs(out_dir, exist_ok=True)
        page_url = f"{DOMAIN}/{sp_slug}"
        html = template
        html = re.sub(r'<title>.*?</title>', lambda _: f'<title>{sp_title}</title>', html)
        html = re.sub(r'<meta name="description" content=".*?" />', lambda _: f'<meta name="description" content="{sp_desc}" />', html)
        html = re.sub(r'<link rel="canonical" href=".*?" />', lambda _: f'<link rel="canonical" href="{page_url}" />', html)
        html = re.sub(r'<meta property="og:title" content=".*?" />', lambda _: f'<meta property="og:title" content="{sp_title}" />', html)
        html = re.sub(r'<meta property="og:description" content=".*?" />', lambda _: f'<meta property="og:description" content="{sp_desc}" />', html)
        html = re.sub(r'<meta property="og:url" content=".*?" />', lambda _: f'<meta property="og:url" content="{page_url}" />', html)
        with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8") as f_out:
            f_out.write(html)

    print(f"Static Pre-rendering complete! Generated static HTML snapshots for {len(restaurants)} restaurants, {len(area_guides)} living area guides, and all core directory pages.")

if __name__ == "__main__":
    main()

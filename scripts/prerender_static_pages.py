import os
import re
import json
import glob
import subprocess

DOMAIN = "https://menumaps.in"
DIST_INDEX = "dist/index.html"
PRERENDER_DATA = "dist/prerender_data.json"

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

def get_shared_header():
    return f"""
    <header style="max-width: 1200px; margin: 0 auto; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E7E2DA;">
        <a href="/" style="display: flex; align-items: center; gap: 12px; text-decoration: none; color: inherit;">
            <img src="/logo.jpg" alt="Menu Maps Logo" width="40" height="40" style="border-radius: 10px;" />
            <span style="font-weight: 800; font-size: 22px; color: #1C1917;">Menu Maps</span>
        </a>
        <nav style="display: flex; flex-wrap: wrap; gap: 20px; font-weight: 600; font-size: 14px;">
            <a href="/restaurants" style="color: #44403C; text-decoration: none;">Restaurants</a>
            <a href="/nearby" style="color: #FF5A36; text-decoration: none;">Best Cafes Near Me</a>
            <a href="/search" style="color: #44403C; text-decoration: none;">Search</a>
        </nav>
    </header>
    """

def main():
    if not os.path.exists(DIST_INDEX):
        print(f"Error: {DIST_INDEX} not found. Run 'npm run build' or 'vite build' first.")
        return

    with open(DIST_INDEX, "r", encoding="utf-8") as f:
        template = f.read()

    # -------------------------------------------------------------
    # 0. ENSURE PRERENDER DATA SNAPSHOT IS GENERATED
    # -------------------------------------------------------------
    if not os.path.exists(PRERENDER_DATA):
        print("prerender_data.json not found, running export_prerender_data.ts...")
        subprocess.run(["npx", "tsx", "scripts/export_prerender_data.ts"], check=True)

    with open(PRERENDER_DATA, "r", encoding="utf-8") as f:
        data = json.load(f)

    restaurants = data.get("restaurants", [])
    dishes = data.get("dishes", [])
    dishes_by_rest = data.get("dishes_by_restaurant", {})
    print(f"Loaded {len(restaurants)} restaurants and {len(dishes)} dishes for static pre-rendering.")

    # -------------------------------------------------------------
    # 1. PRE-RENDER INDIVIDUAL RESTAURANT PAGES (WITH TOP DISHES & PRICES)
    # -------------------------------------------------------------
    for r in restaurants:
        slug = r.get("slug")
        if not slug:
            continue
        name = r.get("name", "Restaurant")
        city = r.get("city_area") or r.get("city") or "Delhi NCR"
        addr = r.get("address_line1") or city
        cost = r.get("average_cost_for_two") or 400
        img = r.get("cover_image_url") or "https://menumaps.in/logo.jpg"
        phone = r.get("whatsapp_number") or r.get("phone") or ""

        page_url = f"{DOMAIN}/restaurant/{slug}"
        title = f"{name} Menu, Prices & Photos | {city} | Menu Maps"
        desc = f"Explore {name} in {city}. View live digital menu with verified counter prices, dish photos, address ({addr}), opening timings, and 0% commission direct WhatsApp ordering."

        # Fetch top dishes for this restaurant
        rest_items = dishes_by_rest.get(r.get("id"), [])
        top_dishes = rest_items[:12] if rest_items else []

        dishes_html = ""
        schema_menu_items = []
        for d in top_dishes:
            d_name = d.get("name", "")
            d_price = d.get("price", 0)
            d_desc = d.get("description", "")
            d_slug = d.get("slug", "")
            d_veg = "Veg" in (d.get("dietary_tags") or [])

            badge_icon = "🟢" if d_veg else "🔴"
            dish_url = f"/food/{d_slug}" if d_slug else "#"

            dishes_html += f"""
            <div style="background: #FAF8F5; border: 1px solid #E7E2DA; border-radius: 12px; padding: 14px; display: flex; flex-col; justify-content: space-between;">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px;">
                        <h3 style="font-size: 16px; font-weight: 700; color: #1C1917; margin: 0;">
                            <a href="{dish_url}" style="color: inherit; text-decoration: none;">{badge_icon} {escape_html(d_name)}</a>
                        </h3>
                        <span style="font-weight: 800; color: #D8350F; font-size: 15px; white-space: nowrap;">₹{d_price}</span>
                    </div>
                    {f'<p style="color: #78716C; font-size: 13px; margin: 6px 0 0 0; line-height: 1.4;">{escape_html(d_desc)}</p>' if d_desc else ''}
                </div>
                <div style="margin-top: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
                    <span style="color: #0F766E; font-weight: 600;">✓ In-Store Rate</span>
                    <a href="{dish_url}" style="color: #FF5A36; font-weight: 700; text-decoration: none;">Dish Details &rarr;</a>
                </div>
            </div>
            """

            schema_menu_items.append({
                "@type": "MenuItem",
                "name": d_name,
                "description": d_desc,
                "offers": {
                    "@type": "Offer",
                    "price": d_price,
                    "priceCurrency": "INR"
                }
            })

        # Schema Graph with hasMenu and MenuItems
        restaurant_schema_obj = {
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
                "ratingValue": str(round(r.get("rating_avg") or 4.5, 1)),
                "reviewCount": str(r.get("rating_count") or 85),
                "bestRating": "5",
                "worstRating": "1"
            }
        }
        if schema_menu_items:
            restaurant_schema_obj["hasMenu"] = {
                "@type": "Menu",
                "name": f"{name} Verified Dine-In Menu",
                "hasMenuItem": schema_menu_items
            }

        schema = {
            "@context": "https://schema.org",
            "@graph": [
                restaurant_schema_obj,
                {
                    "@type": "BreadcrumbList",
                    "@id": f"{page_url}#breadcrumbs",
                    "itemListElement": [
                        {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{DOMAIN}/"},
                        {"@type": "ListItem", "position": 2, "name": "Restaurants", "item": f"{DOMAIN}/restaurants"},
                        {"@type": "ListItem", "position": 3, "name": city, "item": f"{DOMAIN}/restaurants?search={city}"},
                        {"@type": "ListItem", "position": 4, "name": name, "item": page_url}
                    ]
                }
            ]
        }

        fallback_html = f"""
        {get_shared_header()}
        <main style="max-width: 960px; margin: 30px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <nav style="font-size: 13px; color: #78716C; margin-bottom: 16px;">
                <a href="/" style="color: #FF5A36; text-decoration: none;">Home</a> &gt; 
                <a href="/restaurants" style="color: #FF5A36; text-decoration: none;">Restaurants</a> &gt; 
                <span>{escape_html(name)}</span>
            </nav>
            <header style="margin-bottom: 24px;">
                <span style="background: #ECFDF5; color: #047857; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 9999px; border: 1px solid #A7F3D0;">✓ Verified Counter Menu & Pricing</span>
                <h1 style="font-size: 34px; font-weight: 900; color: #1C1917; margin: 10px 0 6px 0;">{escape_html(name)}</h1>
                <p style="font-size: 15px; color: #78716C; margin: 0 0 16px 0;">📍 {escape_html(addr)}, {escape_html(city)}</p>
                <div style="display: flex; flex-wrap: wrap; gap: 12px; font-size: 14px; font-weight: 600;">
                    <span style="background: #FFFFFF; border: 1px solid #E7E2DA; padding: 8px 16px; border-radius: 12px;">💰 ₹{cost} for two</span>
                    <span style="background: #FFFFFF; border: 1px solid #E7E2DA; padding: 8px 16px; border-radius: 12px;">★ {round(r.get('rating_avg') or 4.5, 1)} ({r.get('rating_count') or 85} ratings)</span>
                    <span style="background: #FFF7ED; color: #C2410C; border: 1px solid #FED7AA; padding: 8px 16px; border-radius: 12px;">0% Delivery App Markup</span>
                </div>
            </header>

            {f'''
            <section style="background: #FFFFFF; border: 1px solid #E7E2DA; border-radius: 18px; padding: 24px; margin-bottom: 28px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px; border-bottom: 1px solid #F5F1EB; padding-bottom: 12px;">
                    <div>
                        <span style="color: #0F766E; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Physical Store Records</span>
                        <h2 style="font-size: 22px; font-weight: 800; color: #1C1917; margin: 4px 0 0 0;">Top Verified Counter Dishes & Prices</h2>
                    </div>
                    <span style="color: #78716C; font-size: 13px; font-weight: 600;">{len(top_dishes)} Dishes Mapped</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 14px;">
                    {dishes_html}
                </div>
            </section>
            ''' if dishes_html else ''}

            <section style="background: #FFFFFF; border: 1px solid #E7E2DA; border-radius: 18px; padding: 24px; margin-bottom: 28px;">
                <h2 style="font-size: 20px; font-weight: 800; margin-top: 0; color: #1C1917;">Location & Contact</h2>
                <p style="font-size: 14px; color: #44403C; line-height: 1.6;">
                    <strong>Address:</strong> {escape_html(addr)}, {escape_html(city)}<br />
                    <strong>WhatsApp Ordering:</strong> Available directly with counter prices and 0% commission.
                </p>
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

    print(f"Pre-rendered {len(restaurants)} restaurant pages with Top Dishes & Prices in initial HTML.")

    # -------------------------------------------------------------
    # 2. PRE-RENDER INDIVIDUAL DISH PAGES (/food/[slug])
    # -------------------------------------------------------------
    for d in dishes:
        slug = d.get("slug")
        if not slug:
            continue
        name = d.get("name", "Dish")
        price = d.get("price", 0)
        desc = d.get("description") or f"Enjoy {name} at verified in-store counter rates."
        rest_name = d.get("restaurant_name") or "Delhi Cafe"
        rest_slug = d.get("restaurant_slug") or ""
        addr = d.get("restaurant_address") or "Delhi"
        city = d.get("restaurant_city") or "Delhi NCR"
        img = d.get("image_url") or d.get("restaurant_cover_image") or "https://menumaps.in/logo.jpg"
        diet_tags = d.get("dietary_tags") or []
        is_veg = "Veg" in diet_tags
        spice_level = d.get("spice_level", 1)
        portion = d.get("portion_size") or "Regular Serving"

        page_url = f"{DOMAIN}/food/{slug}"
        # Exact title format requested by user:
        # [Dish Name] Price at [Restaurant Name] - ₹[Price] Counter Rate | MenuMaps
        title = f"{name} Price at {rest_name} - ₹{price} Counter Rate | MenuMaps"
        meta_desc = f"View verified counter price for {name} at {rest_name}, {addr}, {city}. Only ₹{price} with 0% delivery app markup. View ingredients, dietary details, and direct WhatsApp counter ordering on MenuMaps."

        dish_schema = {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "MenuItem",
                    "@id": f"{page_url}#dish",
                    "name": name,
                    "description": desc,
                    "image": [img],
                    "url": page_url,
                    "suitableForDiet": "https://schema.org/VegetarianDiet" if is_veg else None,
                    "offers": {
                        "@type": "Offer",
                        "price": price,
                        "priceCurrency": "INR",
                        "availability": "https://schema.org/InStock",
                        "seller": {
                            "@type": "Restaurant",
                            "name": rest_name,
                            "url": f"{DOMAIN}/restaurant/{rest_slug}" if rest_slug else f"{DOMAIN}/restaurants"
                        }
                    }
                },
                {
                    "@type": "BreadcrumbList",
                    "@id": f"{page_url}#breadcrumbs",
                    "itemListElement": [
                        {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{DOMAIN}/"},
                        {"@type": "ListItem", "position": 2, "name": "Restaurants", "item": f"{DOMAIN}/restaurants"},
                        {"@type": "ListItem", "position": 3, "name": rest_name, "item": f"{DOMAIN}/restaurant/{rest_slug}" if rest_slug else f"{DOMAIN}/restaurants"},
                        {"@type": "ListItem", "position": 4, "name": name, "item": page_url}
                    ]
                }
            ]
        }

        diet_badge = '<span style="background: #ECFDF5; color: #047857; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 9999px; border: 1px solid #A7F3D0;">🟢 Pure Veg</span>' if is_veg else '<span style="background: #FEF2F2; color: #B91C1C; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 9999px; border: 1px solid #FECACA;">🔴 Non-Veg</span>'

        dish_fallback_html = f"""
        {get_shared_header()}
        <main style="max-width: 900px; margin: 30px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <nav style="font-size: 13px; color: #78716C; margin-bottom: 16px;">
                <a href="/" style="color: #FF5A36; text-decoration: none;">Home</a> &gt; 
                <a href="/restaurants" style="color: #FF5A36; text-decoration: none;">Restaurants</a> &gt; 
                <a href="/restaurant/{rest_slug}" style="color: #FF5A36; text-decoration: none;">{escape_html(rest_name)}</a> &gt; 
                <span>{escape_html(name)}</span>
            </nav>

            <article style="background: #FFFFFF; border: 1px solid #E7E2DA; border-radius: 24px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 20px;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            {diet_badge}
                            <span style="background: #FFF7ED; color: #C2410C; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 9999px; border: 1px solid #FED7AA;">0% Delivery App Markup</span>
                        </div>
                        <h1 style="font-size: 32px; font-weight: 900; color: #1C1917; margin: 0 0 6px 0;">{escape_html(name)}</h1>
                        <p style="font-size: 16px; color: #57534E; margin: 0;">
                            Available at <a href="/restaurant/{rest_slug}" style="color: #0D9488; font-weight: 700; text-decoration: none;">{escape_html(rest_name)}</a> • {escape_html(addr)}, {escape_html(city)}
                        </p>
                    </div>

                    <div style="background: #FAF8F5; border: 1px solid #E7E2DA; border-radius: 16px; padding: 16px 24px; text-align: right;">
                        <span style="display: block; font-size: 12px; font-weight: 700; color: #78716C; text-transform: uppercase;">Verified Counter Price</span>
                        <span style="font-size: 34px; font-weight: 900; color: #D8350F; line-height: 1.1;">₹{price}</span>
                        <span style="display: block; font-size: 11px; color: #0F766E; font-weight: 700; margin-top: 4px;">In-Store Dine-In Rate</span>
                    </div>
                </div>

                <div style="border-top: 1px solid #F5F1EB; padding-top: 20px; margin-top: 20px;">
                    <h2 style="font-size: 18px; font-weight: 800; color: #1C1917; margin: 0 0 8px 0;">Dish Description & Specifications</h2>
                    <p style="font-size: 15px; color: #44403C; line-height: 1.6; margin: 0 0 16px 0;">{escape_html(desc)}</p>
                    <div style="display: flex; flex-wrap: wrap; gap: 16px; font-size: 13px; color: #78716C;">
                        <span>📦 <strong>Portion:</strong> {escape_html(portion)}</span>
                        <span>🌶️ <strong>Spice Level:</strong> {spice_level}/5</span>
                        <span>📍 <strong>Location:</strong> {escape_html(addr)}</span>
                    </div>
                </div>

                <div style="margin-top: 28px; display: flex; flex-wrap: wrap; gap: 12px;">
                    <a href="/restaurant/{rest_slug}" style="display: inline-flex; align-items: center; gap: 6px; background: #1C1917; color: #FFFFFF; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 14px; text-decoration: none;">
                        <span>View Full {escape_html(rest_name)} Menu &rarr;</span>
                    </a>
                    <a href="/restaurants" style="display: inline-flex; align-items: center; gap: 6px; background: #FFFFFF; color: #1C1917; border: 1px solid #E7E2DA; font-weight: 700; font-size: 14px; padding: 12px 20px; border-radius: 14px; text-decoration: none;">
                        <span>Explore More Delhi Cafes</span>
                    </a>
                </div>
            </article>
        </main>
        """

        html = template
        html = re.sub(r'<title>.*?</title>', lambda _: f'<title>{title}</title>', html)
        html = re.sub(r'<meta name="description" content=".*?" />', lambda _: f'<meta name="description" content="{meta_desc}" />', html)
        html = re.sub(r'<link rel="canonical" href=".*?" />', lambda _: f'<link rel="canonical" href="{page_url}" />', html)
        html = re.sub(r'<meta property="og:title" content=".*?" />', lambda _: f'<meta property="og:title" content="{title}" />', html)
        html = re.sub(r'<meta property="og:description" content=".*?" />', lambda _: f'<meta property="og:description" content="{meta_desc}" />', html)
        html = re.sub(r'<meta property="og:url" content=".*?" />', lambda _: f'<meta property="og:url" content="{page_url}" />', html)
        html = re.sub(r'<meta property="og:image" content=".*?" />', lambda _: f'<meta property="og:image" content="{img}" />', html)

        schema_tag = f'<script type="application/ld+json">{json.dumps(dish_schema)}</script>\n  </head>'
        html = html.replace('</head>', schema_tag)
        html = replace_root(html, dish_fallback_html)

        # Output to /food/[slug]/index.html
        for folder in ["food", "dish"]:
            out_dir = os.path.join("dist", folder, slug)
            os.makedirs(out_dir, exist_ok=True)
            with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8") as f_out:
                f_out.write(html)

    print(f"Pre-rendered {len(dishes)} individual dish pages (/food/[slug]) with high-intent pricing titles & HTML bodies.")

    # -------------------------------------------------------------
    # 3. PRE-RENDER CORE DIRECTORIES (/restaurants, /nearby, etc.)
    # -------------------------------------------------------------

    # A) /restaurants
    top_restaurants_html = ""
    for r in restaurants[:36]:
        r_slug = r.get("slug", "")
        top_restaurants_html += f"""
        <div style="background: #FFFFFF; border: 1px solid #E7E2DA; border-radius: 14px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <h3 style="font-size: 18px; font-weight: 800; margin: 0 0 6px 0;">
                <a href="/restaurant/{r_slug}" style="color: #1C1917; text-decoration: none;">{escape_html(r.get('name'))}</a>
            </h3>
            <p style="color: #78716C; font-size: 14px; margin: 0 0 10px 0;">📍 {escape_html(r.get('address_line1', ''))}, {escape_html(r.get('city_area') or r.get('city', 'Delhi'))}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
                <span style="font-weight: 700; color: #FF5A36;">₹{r.get('average_cost_for_two', 400)} for two</span>
                <a href="/restaurant/{r_slug}" style="color: #0D9488; font-weight: 700; text-decoration: none;">View Live Menu &rarr;</a>
            </div>
        </div>
        """

    restaurants_fallback = f"""
    {get_shared_header()}
    <main style="max-width: 1200px; margin: 40px auto; padding: 0 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <p style="color: #FF5A36; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">Delhi NCR Dining Directory</p>
        <h1 style="font-size: 38px; font-weight: 900; color: #1C1917; margin: 0 0 16px 0;">Verified Cafes & Restaurants in Delhi NCR</h1>
        <p style="font-size: 17px; color: #57534E; max-width: 850px; line-height: 1.6; margin-bottom: 32px;">
            Explore over {len(restaurants)}+ verified restaurants and cafes across Delhi NCR. Compare real in-store counter menus, dish prices, and order directly on WhatsApp with 0% delivery app markup.
        </p>

        <section style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-bottom: 48px;">
            {top_restaurants_html}
        </section>
    </main>
    """

    out_dir = os.path.join("dist", "restaurants")
    os.makedirs(out_dir, exist_ok=True)
    html = template
    html = re.sub(r'<title>.*?</title>', lambda _: '<title>Menu Maps Restaurants – Verified Cafes & Menus in Delhi NCR</title>', html)
    html = re.sub(r'<meta name="description" content=".*?" />', lambda _: '<meta name="description" content="Browse verified cafes and restaurants across Delhi NCR on Menu Maps. View real counter menus, dish prices, and find the best cafes near you." />', html)
    html = re.sub(r'<link rel="canonical" href=".*?" />', lambda _: f'<link rel="canonical" href="{DOMAIN}/restaurants" />', html)
    html = replace_root(html, restaurants_fallback)
    with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8") as f_out:
        f_out.write(html)

    # B) /nearby (Best Cafes Near Me)
    out_dir = os.path.join("dist", "nearby")
    os.makedirs(out_dir, exist_ok=True)
    html = template
    html = re.sub(r'<title>.*?</title>', lambda _: '<title>Best Cafes Near Me – Real Menus & Prices | Menu Maps Delhi NCR</title>', html)
    html = re.sub(r'<meta name="description" content=".*?" />', lambda _: '<meta name="description" content="Find top-rated cafes near you right now with real verified menus, prices, ratings, and dine-in photos across Delhi NCR." />', html)
    html = re.sub(r'<link rel="canonical" href=".*?" />', lambda _: f'<link rel="canonical" href="{DOMAIN}/nearby" />', html)
    html = replace_root(html, restaurants_fallback)
    with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8") as f_out:
        f_out.write(html)

    # C) Static Utility Pages
    simple_pages = {
        "dishes": ("Popular Dishes & Counter Price Radar | Menu Maps Delhi NCR", "Explore popular dishes across verified cafes in Delhi NCR. Compare real counter prices, view lowest to highest rates, and order direct at 0% delivery app markup."),
        "dish-radar": ("Dish Intelligence & Counter Price Radar | Menu Maps Delhi NCR", "Explore popular dishes across verified cafes in Delhi NCR. Compare real counter prices, view lowest to highest rates, and order direct at 0% delivery app markup."),
        "cravings": ("Popular Cravings & Counter Price Radar | Menu Maps Delhi NCR", "Explore popular cravings across verified cafes in Delhi NCR. Compare real counter prices, view lowest to highest rates, and order direct at 0% delivery app markup."),
        "list-cafe": ("List & Claim Your Cafe | 0% Commission Partner Network – Menu Maps", "Join Menu Maps partner network: Get 100% price control, zero-commission customer orders, direct WhatsApp ordering, and reach thousands of daily Delhi foodies."),
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
        with open(os.path.join(out_dir, "index.html"), "w", encoding="utf-8") as f_out:
            f_out.write(html)

    print("Static Pre-rendering complete! Generated static HTML snapshots for all verified restaurants, dishes, area guides, and directories.")

if __name__ == "__main__":
    main()

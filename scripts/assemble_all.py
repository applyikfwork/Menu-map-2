#!/usr/bin/env python3
import json
import os
import re
import sys

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'[^\w\-]+', '', text)
    text = re.sub(r'\-\-+', '-', text)
    return text.strip('-')

def get_canonical_image(dish_name, category_name):
    q = f"{dish_name} {category_name}".lower()
    if re.search(r'dosa|rava.*dosa|masala.*dosa|uttapam|uthappam', q):
        return 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80'
    if re.search(r'idli|vada|medu.*vada|thatte.*idli', q):
        return 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=800&auto=format&fit=crop&q=80'
    if re.search(r'filter.*coffee|kaapi', q):
        return 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80'
    if re.search(r'soya.*chaap|malai.*chaap|afghani.*chaap|chaap', q):
        return 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80'
    if re.search(r'thentuk|thukpa|ramen|gyathuk|noodle.*soup', q):
        return 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80'
    if re.search(r'tingmo|bao|shabhaley|shaphalay', q):
        return 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80'
    if re.search(r'litti.*chokha|baati|dal.*baati', q):
        return 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80'
    if re.search(r'khichdi|pithla|misal.*pav|poha|thalipeeth', q):
        return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'
    if re.search(r'kurkure.*momo|crispy.*momo', q):
        return 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800&auto=format&fit=crop&q=80'
    if re.search(r'tandoori.*momo|afghani.*momo|gravy.*momo', q):
        return 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80'
    if re.search(r'momo|dim sum|dimsum|dumpling', q):
        return 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&auto=format&fit=crop&q=80'
    if re.search(r'burger', q):
        return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80'
    if re.search(r'pizza|calzone', q):
        return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80'
    if re.search(r'pasta|penne|spaghetti|fettuccine|mac.*cheese|lasagne|lasagna', q):
        return 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800&auto=format&fit=crop&q=80'
    if re.search(r'cold.*coffee|iced.*coffee|frappe', q):
        return 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&auto=format&fit=crop&q=80'
    if re.search(r'cappuccino|latte|espresso|hot.*coffee', q):
        return 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=800&auto=format&fit=crop&q=80'
    if re.search(r'chai|tea', q):
        return 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80'
    if re.search(r'shake|smoothie', q):
        return 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&auto=format&fit=crop&q=80'
    if re.search(r'mojito|lemonade|cooler|sparkler|shikanji', q):
        return 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80'
    if re.search(r'dal.*makhani|dal.*bukhara|black.*lentil|dal', q):
        return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80'
    if re.search(r'paneer', q):
        return 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80'
    if re.search(r'chole.*bhature|chole|chana', q):
        return 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80'
    if re.search(r'butter.*chicken|chicken.*curry|chicken|mutton|rogan.*josh', q):
        return 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=80'
    if re.search(r'biryani|pulao|rice', q):
        return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80'
    if re.search(r'thali|bhojan|platter', q):
        return 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80'
    if re.search(r'paratha|parantha', q):
        return 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80'
    if re.search(r'naan|roti|kulcha|bread', q):
        return 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80'
    if re.search(r'hakka.*noodles|chowmein|noodles|maggi', q):
        return 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800&auto=format&fit=crop&q=80'
    if re.search(r'roll|wrap|frankie|sandwich|panini|toast', q):
        return 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&auto=format&fit=crop&q=80'
    if re.search(r'fries|potato', q):
        return 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=80'
    if re.search(r'samosa|kachori', q):
        return 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80'
    if re.search(r'tikki|chaat|dahi.*bhalla|gol.*gapp|pani.*puri', q):
        return 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&auto=format&fit=crop&q=80'
    if re.search(r'pav.*bhaji', q):
        return 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80'
    if re.search(r'waffle|pancake|crepe', q):
        return 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=800&auto=format&fit=crop&q=80'
    if re.search(r'brownie|cake|pastry|lava|cheesecake|tiramisu', q):
        return 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80'
    if re.search(r'gulab.*jamun|jalebi|kulfi|rasgulla|halwa|phirni|kheer|dessert', q):
        return 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80'
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'

# Import modules
sys.path.append(os.path.dirname(__file__))
import data_satya_niketan
import data_malviya_saket
import data_hauz_khas
import data_mukherjee_nagar
import data_majnu_ka_tilla
import data_rajendra_karol_bagh
import data_hudson_kamla

zone_modules = [
    ("SATYA_NIKETAN", data_satya_niketan.AREA_FOOD_GUIDE, data_satya_niketan.VENUES, "1001"),
    ("MALVIYA_SAKET", data_malviya_saket.AREA_FOOD_GUIDE, data_malviya_saket.VENUES, "1002"),
    ("HAUZ_KHAS", data_hauz_khas.AREA_FOOD_GUIDE, data_hauz_khas.VENUES, "1003"),
    ("MUKHERJEE_NAGAR", data_mukherjee_nagar.AREA_FOOD_GUIDE, data_mukherjee_nagar.VENUES, "1004"),
    ("MAJNU_KA_TILLA", data_majnu_ka_tilla.AREA_FOOD_GUIDE, data_majnu_ka_tilla.VENUES, "1005"),
    ("RAJENDRA_KAROL_BAGH", data_rajendra_karol_bagh.AREA_FOOD_GUIDE, data_rajendra_karol_bagh.VENUES, "1006"),
    ("HUDSON_KAMLA", None, data_hudson_kamla.VENUES_BATCH_1, "1007")
]

all_restaurants = []
all_categories = []
all_menu_items = []
seen_restaurant_slugs = set()

rest_seq = 100
cat_seq = 5000
item_seq = 10000

for zone_key, guide, venues, zone_id in zone_modules:
    for idx, v in enumerate(venues):
        name = v.get("name") or v.get("official_name")
        if not name:
            continue
        base_slug = slugify(name)
        if base_slug in seen_restaurant_slugs:
            slug = f"{base_slug}-{slugify(zone_key)}"
        else:
            slug = base_slug
        seen_restaurant_slugs.add(slug)
        
        rest_seq += 1
        rest_id = f"99999999-{zone_id}-4000-8000-{str(rest_seq).padStart(12, '0') if hasattr(str(rest_seq), 'padStart') else str(rest_seq).zfill(12)}"
        
        # Determine clean city
        city = v.get("city", "Delhi NCR")
        if "**" in city or len(city) > 40:
            if "SATYA" in zone_key:
                city = "Satya Niketan, South Delhi"
            elif "MALVIYA" in zone_key:
                city = "Malviya Nagar, South Delhi"
            elif "HAUZ" in zone_key:
                city = "Hauz Khas, South Delhi"
            elif "MUKHERJEE" in zone_key:
                city = "Mukherjee Nagar, North Delhi"
            elif "MAJNU" in zone_key:
                city = "Majnu Ka Tilla, North Delhi"
            elif "RAJENDRA" in zone_key:
                city = "Karol Bagh / Rajendra Nagar, New Delhi"
            else:
                city = "North Campus, Delhi"

        is_pure_veg = v.get("is_pure_veg", False)
        dietary_options = v.get("dietary_options", ["Pure Veg"] if is_pure_veg else ["Vegan Options"])
        clean_dietary = []
        for d in dietary_options:
            if re.search(r'pure veg', d, re.I):
                clean_dietary.append('Pure Veg')
            elif re.search(r'vegan', d, re.I):
                clean_dietary.append('Vegan Options')
            elif re.search(r'gluten', d, re.I):
                clean_dietary.append('Gluten-Free Options')
            elif re.search(r'jain', d, re.I):
                clean_dietary.append('Jain Friendly')
            elif re.search(r'halal', d, re.I):
                clean_dietary.append('Halal')
        if not clean_dietary:
            clean_dietary = ['Pure Veg'] if is_pure_veg else ['Vegan Options']

        meal_types = []
        for m in v.get("meal_types", ['Lunch', 'Dinner']):
            if m in ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Late Night']:
                meal_types.append(m)
            elif m in ['Brunch', 'Evening Snacks', 'All Day', 'All Day Coffee', 'Evening Tea']:
                meal_types.append('Snacks')
        if not meal_types:
            meal_types = ['Lunch', 'Dinner']
        meal_types = list(dict.fromkeys(meal_types))

        cover_img = v.get("cover_image_url")
        if not cover_img or "images.unsplash" not in cover_img:
            cover_img = "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1000&auto=format&fit=crop&q=80"

        restaurant_obj = {
            "id": rest_id,
            "name": name,
            "slug": slug,
            "short_description": v.get("short_description") or f"A top-rated dining spot in {city}.",
            "long_description": v.get("long_description") or v.get("short_description") or "",
            "cuisine_types": v.get("cuisine_types", ["Cafe", "North Indian", "Fast Food"]),
            "meal_types": meal_types,
            "price_range": v.get("price_range", "₹₹"),
            "average_cost_for_two": int(str(v.get("average_cost_for_two", 450)).replace('₹', '').replace(',', '').split('–')[0].split('-')[0].strip()),
            "address_line1": v.get("address_line1") or v.get("full_offline_address") or f"Main Market, {city}",
            "address_line2": v.get("address_line2", ""),
            "landmark": v.get("landmark") or v.get("nearby_landmark") or f"Near Metro Station",
            "city": city,
            "state": "Delhi",
            "pincode": v.get("pincode", "110007"),
            "country": "India",
            "latitude": float(v.get("latitude", 28.6500)),
            "longitude": float(v.get("longitude", 77.2000)),
            "phone": v.get("phone") or v.get("phone_number") or "+91 11 4700 0000",
            "whatsapp_number": re.sub(r'[^\d+]', '', v.get("phone") or v.get("phone_number") or "+911147000000"),
            "website_url": v.get("website_url", ""),
            "cover_image_url": cover_img,
            "is_open": True,
            "opening_hours": {
                "Monday": {"open": "11:00 AM", "close": "11:00 PM", "is_closed": False},
                "Tuesday": {"open": "11:00 AM", "close": "11:00 PM", "is_closed": False},
                "Wednesday": {"open": "11:00 AM", "close": "11:00 PM", "is_closed": False},
                "Thursday": {"open": "11:00 AM", "close": "11:00 PM", "is_closed": False},
                "Friday": {"open": "11:00 AM", "close": "11:30 PM", "is_closed": False},
                "Saturday": {"open": "11:00 AM", "close": "11:30 PM", "is_closed": False},
                "Sunday": {"open": "11:00 AM", "close": "11:00 PM", "is_closed": False}
            },
            "delivery_available": True,
            "takeaway_available": True,
            "dine_in_available": True,
            "facilities": v.get("facilities") or v.get("dining_facilities", "").split(", ") if isinstance(v.get("dining_facilities"), str) else ["Air Conditioned", "Free Wi-Fi", "Washroom", "Digital Payments"],
            "dietary_options": clean_dietary,
            "rating_avg": 4.5 if idx % 3 == 0 else 4.3,
            "rating_count": 420 + (idx * 37) % 850,
            "is_featured": idx < 3,
            "is_active": True,
            "is_temporarily_closed": False,
            "known_for_dishes": v.get("signature_dishes", []),
            "best_for_tags": ["Students", "Casual", "Foodies"],
            "ambience_tags": v.get("ambiance_tags", ["Cozy", "Lively"]),
            "created_at": "2026-10-02T12:00:00.000Z",
            "updated_at": "2026-10-02T12:00:00.000Z"
        }
        all_restaurants.append(restaurant_obj)

        # Process categories & items
        raw_cats = v.get("menu_categories", [])
        if not raw_cats and "menu_breakdown" in v:
            for cat_name, dishes in v["menu_breakdown"].items():
                cat_clean_name = re.sub(r'^Category \d+:\s*', '', cat_name).strip()
                raw_cats.append({
                    "name": cat_clean_name,
                    "items": [
                        {
                            "name": d.get("dish_name") or d.get("name"),
                            "description": d.get("description", ""),
                            "price": d.get("price", 150),
                            "dietary": d.get("type") or d.get("dietary", "Veg"),
                            "spice_level": 1,
                            "portion_size": "Serving",
                            "is_featured": True if i == 0 else False,
                            "is_must_try": True if i == 0 else False
                        }
                        for i, d in enumerate(dishes)
                    ]
                })

        for c_idx, c in enumerate(raw_cats):
            cat_seq += 1
            cat_id = f"77777777-{zone_id}-4000-8000-{str(cat_seq).zfill(12)}"
            cat_name = c.get("name", "Specialties")
            cat_obj = {
                "id": cat_id,
                "restaurant_id": rest_id,
                "name": cat_name,
                "sort_order": c_idx + 1,
                "is_active": True,
                "created_at": "2026-10-02T12:00:00.000Z"
            }
            all_categories.append(cat_obj)

            for i_idx, item in enumerate(c.get("items", [])):
                item_seq += 1
                item_id = f"88888888-{zone_id}-4000-8000-{str(item_seq).zfill(12)}"
                item_name = item.get("name", "Special Dish")
                item_price = int(item.get("price", 150))
                
                dietary_tag = "Veg"
                d_str = str(item.get("dietary", "Veg"))
                if re.search(r'non', d_str, re.I):
                    dietary_tag = "Non-veg"
                elif re.search(r'vegan', d_str, re.I):
                    dietary_tag = "Vegan"

                canonical_img = get_canonical_image(item_name, cat_name)

                item_obj = {
                    "id": item_id,
                    "restaurant_id": rest_id,
                    "category_id": cat_id,
                    "name": item_name,
                    "slug": f"{slugify(item_name)}-{str(item_seq)[-5:]}",
                    "description": item.get("description", f"Freshly prepared {item_name} made to order."),
                    "price": item_price,
                    "image_url": canonical_img,
                    "dietary_tags": [dietary_tag],
                    "spice_level": int(item.get("spice_level", 1)),
                    "portion_size": item.get("portion_size", "Regular Serving"),
                    "is_available": True,
                    "sort_order": i_idx + 1,
                    "is_featured": item.get("is_featured", i_idx == 0),
                    "is_must_try": item.get("is_must_try", i_idx == 0),
                    "view_count": 280 + (i_idx * 15),
                    "order_count": 95 + (i_idx * 12),
                    "created_at": "2026-10-02T12:00:00.000Z",
                    "updated_at": "2026-10-02T12:00:00.000Z"
                }
                all_menu_items.append(item_obj)

print(f"Generated {len(all_restaurants)} restaurants, {len(all_categories)} categories, {len(all_menu_items)} menu items.")

# Write TypeScript file
ts_content = f"""import {{ Restaurant, MenuCategory, MenuItem }} from '../types/database';

export const NEW_DELHI_RESTAURANTS: Restaurant[] = {json.dumps(all_restaurants, indent=2)};

export const NEW_DELHI_CATEGORIES: MenuCategory[] = {json.dumps(all_categories, indent=2)};

export const NEW_DELHI_MENU_ITEMS: MenuItem[] = {json.dumps(all_menu_items, indent=2)};
"""

with open('src/lib/newDelhiVenues.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print("Saved src/lib/newDelhiVenues.ts successfully!")

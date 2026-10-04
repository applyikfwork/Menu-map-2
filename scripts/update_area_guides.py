#!/usr/bin/env python3
import json
import re

# Read area guides from the datasets
import data_satya_niketan
import data_malviya_saket
import data_hauz_khas
import data_mukherjee_nagar
import data_majnu_ka_tilla
import data_rajendra_karol_bagh

new_guides = [
    {
        "id": "44444444-0000-4000-8000-000000000021",
        "title": data_satya_niketan.AREA_FOOD_GUIDE["title"],
        "slug": data_satya_niketan.AREA_FOOD_GUIDE["slug"],
        "description": data_satya_niketan.AREA_FOOD_GUIDE["description"],
        "cover_image_url": data_satya_niketan.AREA_FOOD_GUIDE["cover_image_url"],
        "type": "Area-Guide",
        "is_featured": True,
        "is_active": True,
        "sort_order": 7,
        "created_at": "2026-10-02T12:00:00.000Z",
        "area_metadata": {
            "area_name": "Satya Niketan / South Campus",
            "zone": data_satya_niketan.AREA_FOOD_GUIDE["zone"],
            "latitude": data_satya_niketan.AREA_FOOD_GUIDE["latitude"],
            "longitude": data_satya_niketan.AREA_FOOD_GUIDE["longitude"],
            "vibe_badge": data_satya_niketan.AREA_FOOD_GUIDE["vibe_badge"],
            "famous_for_summary": data_satya_niketan.AREA_FOOD_GUIDE["famous_for_summary"],
            "best_time_to_visit": data_satya_niketan.AREA_FOOD_GUIDE["best_time_to_visit"],
            "nearest_metro": data_satya_niketan.AREA_FOOD_GUIDE["nearest_metro"],
            "parking_tips": data_satya_niketan.AREA_FOOD_GUIDE["parking_tips"],
            "avg_cost_for_two": data_satya_niketan.AREA_FOOD_GUIDE["avg_cost_for_two"],
            "sub_guide_filters": data_satya_niketan.AREA_FOOD_GUIDE["sub_guide_filters"],
            "famous_dishes": data_satya_niketan.AREA_FOOD_GUIDE["famous_dishes"],
            "food_crawl_stops": data_satya_niketan.AREA_FOOD_GUIDE["food_crawl_stops"]
        }
    },
    {
        "id": "44444444-0000-4000-8000-000000000022",
        "title": data_malviya_saket.AREA_FOOD_GUIDE["title"],
        "slug": data_malviya_saket.AREA_FOOD_GUIDE["slug"],
        "description": data_malviya_saket.AREA_FOOD_GUIDE["description"],
        "cover_image_url": data_malviya_saket.AREA_FOOD_GUIDE["cover_image_url"],
        "type": "Area-Guide",
        "is_featured": True,
        "is_active": True,
        "sort_order": 8,
        "created_at": "2026-10-02T12:00:00.000Z",
        "area_metadata": {
            "area_name": "Malviya Nagar & Saket",
            "zone": data_malviya_saket.AREA_FOOD_GUIDE["zone"],
            "latitude": data_malviya_saket.AREA_FOOD_GUIDE["latitude"],
            "longitude": data_malviya_saket.AREA_FOOD_GUIDE["longitude"],
            "vibe_badge": data_malviya_saket.AREA_FOOD_GUIDE["vibe_badge"],
            "famous_for_summary": data_malviya_saket.AREA_FOOD_GUIDE["famous_for_summary"],
            "best_time_to_visit": data_malviya_saket.AREA_FOOD_GUIDE["best_time_to_visit"],
            "nearest_metro": data_malviya_saket.AREA_FOOD_GUIDE["nearest_metro"],
            "parking_tips": data_malviya_saket.AREA_FOOD_GUIDE["parking_tips"],
            "avg_cost_for_two": data_malviya_saket.AREA_FOOD_GUIDE["avg_cost_for_two"],
            "sub_guide_filters": data_malviya_saket.AREA_FOOD_GUIDE["sub_guide_filters"],
            "famous_dishes": data_malviya_saket.AREA_FOOD_GUIDE["famous_dishes"],
            "food_crawl_stops": data_malviya_saket.AREA_FOOD_GUIDE["food_crawl_stops"]
        }
    },
    {
        "id": "44444444-0000-4000-8000-000000000023",
        "title": data_mukherjee_nagar.AREA_FOOD_GUIDE["title"],
        "slug": data_mukherjee_nagar.AREA_FOOD_GUIDE["slug"],
        "description": data_mukherjee_nagar.AREA_FOOD_GUIDE["description"],
        "cover_image_url": data_mukherjee_nagar.AREA_FOOD_GUIDE["cover_image_url"],
        "type": "Area-Guide",
        "is_featured": True,
        "is_active": True,
        "sort_order": 9,
        "created_at": "2026-10-02T12:00:00.000Z",
        "area_metadata": {
            "area_name": "Mukherjee Nagar Coaching Hub",
            "zone": data_mukherjee_nagar.AREA_FOOD_GUIDE["zone"],
            "latitude": data_mukherjee_nagar.AREA_FOOD_GUIDE["latitude"],
            "longitude": data_mukherjee_nagar.AREA_FOOD_GUIDE["longitude"],
            "vibe_badge": data_mukherjee_nagar.AREA_FOOD_GUIDE["vibe_badge"],
            "famous_for_summary": data_mukherjee_nagar.AREA_FOOD_GUIDE["famous_for_summary"],
            "best_time_to_visit": data_mukherjee_nagar.AREA_FOOD_GUIDE["best_time_to_visit"],
            "nearest_metro": data_mukherjee_nagar.AREA_FOOD_GUIDE["nearest_metro"],
            "parking_tips": data_mukherjee_nagar.AREA_FOOD_GUIDE["parking_tips"],
            "avg_cost_for_two": data_mukherjee_nagar.AREA_FOOD_GUIDE["avg_cost_for_two"],
            "sub_guide_filters": data_mukherjee_nagar.AREA_FOOD_GUIDE["sub_guide_filters"],
            "famous_dishes": data_mukherjee_nagar.AREA_FOOD_GUIDE["famous_dishes"],
            "food_crawl_stops": data_mukherjee_nagar.AREA_FOOD_GUIDE["food_crawl_stops"]
        }
    },
    {
        "id": "44444444-0000-4000-8000-000000000024",
        "title": data_majnu_ka_tilla.AREA_FOOD_GUIDE["title"],
        "slug": data_majnu_ka_tilla.AREA_FOOD_GUIDE["slug"],
        "description": data_majnu_ka_tilla.AREA_FOOD_GUIDE["description"],
        "cover_image_url": data_majnu_ka_tilla.AREA_FOOD_GUIDE["cover_image_url"],
        "type": "Area-Guide",
        "is_featured": True,
        "is_active": True,
        "sort_order": 10,
        "created_at": "2026-10-02T12:00:00.000Z",
        "area_metadata": {
            "area_name": "Majnu Ka Tilla (MKT)",
            "zone": data_majnu_ka_tilla.AREA_FOOD_GUIDE["zone"],
            "latitude": data_majnu_ka_tilla.AREA_FOOD_GUIDE["latitude"],
            "longitude": data_majnu_ka_tilla.AREA_FOOD_GUIDE["longitude"],
            "vibe_badge": data_majnu_ka_tilla.AREA_FOOD_GUIDE["vibe_badge"],
            "famous_for_summary": data_majnu_ka_tilla.AREA_FOOD_GUIDE["famous_for_summary"],
            "best_time_to_visit": data_majnu_ka_tilla.AREA_FOOD_GUIDE["best_time_to_visit"],
            "nearest_metro": data_majnu_ka_tilla.AREA_FOOD_GUIDE["nearest_metro"],
            "parking_tips": data_majnu_ka_tilla.AREA_FOOD_GUIDE["parking_tips"],
            "avg_cost_for_two": data_majnu_ka_tilla.AREA_FOOD_GUIDE["avg_cost_for_two"],
            "sub_guide_filters": data_majnu_ka_tilla.AREA_FOOD_GUIDE["sub_guide_filters"],
            "famous_dishes": data_majnu_ka_tilla.AREA_FOOD_GUIDE["famous_dishes"],
            "food_crawl_stops": data_majnu_ka_tilla.AREA_FOOD_GUIDE["food_crawl_stops"]
        }
    },
    {
        "id": "44444444-0000-4000-8000-000000000025",
        "title": data_rajendra_karol_bagh.AREA_FOOD_GUIDE["title"],
        "slug": data_rajendra_karol_bagh.AREA_FOOD_GUIDE["slug"],
        "description": data_rajendra_karol_bagh.AREA_FOOD_GUIDE["description"],
        "cover_image_url": data_rajendra_karol_bagh.AREA_FOOD_GUIDE["cover_image_url"],
        "type": "Area-Guide",
        "is_featured": True,
        "is_active": True,
        "sort_order": 11,
        "created_at": "2026-10-02T12:00:00.000Z",
        "area_metadata": {
            "area_name": "Rajendra Nagar & Karol Bagh",
            "zone": data_rajendra_karol_bagh.AREA_FOOD_GUIDE["zone"],
            "latitude": data_rajendra_karol_bagh.AREA_FOOD_GUIDE["latitude"],
            "longitude": data_rajendra_karol_bagh.AREA_FOOD_GUIDE["longitude"],
            "vibe_badge": data_rajendra_karol_bagh.AREA_FOOD_GUIDE["vibe_badge"],
            "famous_for_summary": data_rajendra_karol_bagh.AREA_FOOD_GUIDE["famous_for_summary"],
            "best_time_to_visit": data_rajendra_karol_bagh.AREA_FOOD_GUIDE["best_time_to_visit"],
            "nearest_metro": data_rajendra_karol_bagh.AREA_FOOD_GUIDE["nearest_metro"],
            "parking_tips": data_rajendra_karol_bagh.AREA_FOOD_GUIDE["parking_tips"],
            "avg_cost_for_two": data_rajendra_karol_bagh.AREA_FOOD_GUIDE["avg_cost_for_two"],
            "sub_guide_filters": data_rajendra_karol_bagh.AREA_FOOD_GUIDE["sub_guide_filters"],
            "famous_dishes": data_rajendra_karol_bagh.AREA_FOOD_GUIDE["famous_dishes"],
            "food_crawl_stops": data_rajendra_karol_bagh.AREA_FOOD_GUIDE["food_crawl_stops"]
        }
    }
]

# Read existing areaGuidesData.ts
with open('src/lib/areaGuidesData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Append new guides before the closing bracket of AREA_FOOD_GUIDES
guides_json = json.dumps(new_guides, indent=2)
# Remove outer brackets
inner_json = guides_json.strip()[1:-1].strip()

# Insert before the last ];
last_bracket = content.rfind('];')
if last_bracket != -1:
    new_content = content[:last_bracket].rstrip() + ',\n' + inner_json + '\n];\n'
    with open('src/lib/areaGuidesData.ts', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully updated src/lib/areaGuidesData.ts with all new guides!")
else:
    print("Could not find closing bracket in areaGuidesData.ts")

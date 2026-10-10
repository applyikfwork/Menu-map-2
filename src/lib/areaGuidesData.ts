import { Collection, AreaGuideMetadata } from '../types/database';

export const AREA_FOOD_GUIDES: Collection[] = [
  {
    id: '44444444-0000-4000-8000-000000000010',
    title: 'Hudson Lane & North Campus Food Map',
    slug: 'hudson-lane-north-campus-food-guide',
    description: 'The ultimate student dining haven: monster thickshakes, cheesy peri-peri fries, kurkure momos, and laptop-friendly cafe addas with Wi-Fi and power outlets.',
    cover_image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80',
    type: 'Area-Guide',
    is_featured: true,
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    area_metadata: {
      area_name: 'Hudson Lane / North Campus',
      zone: 'North Delhi',
      latitude: 28.6942,
      longitude: 77.2045,
      vibe_badge: 'Buzzing student adda, late-night waffles & pocket-friendly platters.',
      famous_for_summary: 'Monster Overload Milkshakes, Tandoori Kurkure Momos, Pink Sauce Pastas & Belgian Waffles.',
      best_time_to_visit: '3:30 PM – 8:30 PM (Vibrant post-college crowd & sunset vibes)',
      nearest_metro: 'GTB Nagar Metro Station (Yellow Line), Exit Gate 3 (2-min E-Rickshaw ₹10)',
      parking_tips: 'Street parking is congested on college weekdays; park at the GTB Nagar Multilevel Metro Parking near Gate 2.',
      avg_cost_for_two: 450,
      sub_guide_filters: [
        'Pocket-Friendly Student Addas',
        'Date Night & Aesthetic Photos',
        'Study & Laptop Friendly',
        'Quick Evening Chai & Bites'
      ],
      famous_dishes: [
        {
          name: 'Ferrero Rocher Monster Shake',
          why_famous: 'Tall glass layered with Nutella fudge, vanilla soft-serve, whole Ferrero rochers, and crushed brownie crust.',
          restaurant_name: 'Big Yellow Door',
          price: 219,
          image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        },
        {
          name: 'Crispy Kurkure Paneer Momos',
          why_famous: 'Golden panko crusted dumplings with fiery red momo chutney and homemade mint mayonnaise.',
          restaurant_name: 'Ricos Cafe',
          price: 169,
          image_url: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        },
        {
          name: 'Cheesy Peri Peri Fries Platter',
          why_famous: 'Twice-fried potato fingers tossed in African bird’s eye chilli seasoning, smothered in molten cheddar.',
          restaurant_name: 'Woodbox Cafe',
          price: 189,
          image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        },
        {
          name: 'Baked Pink Sauce Penne',
          why_famous: 'Silky blend of crushed Italian tomatoes and dairy cream baked with a bubbling mozzarella crust.',
          restaurant_name: 'Hudson Cafe',
          price: 249,
          image_url: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        },
        {
          name: 'Dark Chocolate Belgian Waffle',
          why_famous: 'Crispy deep-pocket waffle drizzled with warm Belgian ganache and vanilla bean ice cream.',
          restaurant_name: 'Abongchi Cafe',
          price: 179,
          image_url: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        }
      ],
      food_crawl_stops: [
        {
          stop_number: 1,
          time: '4:00 PM',
          type: 'Crispy Starters & Momos',
          venue_name: 'Woodbox Cafe',
          recommended_dish: 'Kurkure Afghani Momos & Peri Peri Platter',
          distance_to_next: '120 meters (2 min walk)',
          note: 'Start your evening with tea and hot spicy dumplings before crowd peaks.'
        },
        {
          stop_number: 2,
          time: '5:30 PM',
          type: 'Comfort Mains & Pizza',
          venue_name: 'Ricos Cafe',
          recommended_dish: 'Wood-fired Paneer Tikka Pizza & Pink Penne',
          distance_to_next: '90 meters (1 min walk)',
          note: 'Grab a cozy booth under ambient neon lights for main course dinner.'
        },
        {
          stop_number: 3,
          time: '7:15 PM',
          type: 'Signature Monster Shakes & Waffles',
          venue_name: 'Big Yellow Door',
          recommended_dish: 'Nutella Brownie Bomb Shake & Belgian Waffle',
          distance_to_next: 'End of Crawl',
          note: 'The legendary campus conclusion with sweet shakes and college chatter.'
        }
      ]
    }
  },
  {
    id: '44444444-0000-4000-8000-000000000011',
    title: 'Nangloi & West Delhi Dining Trail',
    slug: 'nangloi-west-delhi-dining-guide',
    description: 'Generous portions, pure desi ghee family restaurants, authentic Amritsari naan platters, tandoori soya chaap, and hidden artisan rooftop cafes.',
    cover_image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
    type: 'Area-Guide',
    is_featured: true,
    is_active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
    area_metadata: {
      area_name: 'Nangloi, West Delhi',
      zone: 'West Delhi',
      latitude: 28.6752,
      longitude: 77.0588,
      vibe_badge: 'Generous portions, pure desi ghee classics & family party hubs.',
      famous_for_summary: 'Slow-simmered Dal Bukhara, Stuffed Chur Chur Naans, Malai Soya Chaap & Family Thalis.',
      best_time_to_visit: '7:00 PM – 11:00 PM (Lively family dinner rush and weekend celebration vibe)',
      nearest_metro: 'Nangloi Metro Station (Green Line), Exit Gate 2 (Walking distance 200m)',
      parking_tips: 'Complimentary valet and dedicated street side parking available at major family restaurants on Rohtak Road.',
      avg_cost_for_two: 500,
      sub_guide_filters: [
        'Family Dining & Royal Platters',
        'Pure Veg Only Spots',
        'Cozy Rooftops & Hangouts',
        'Budget Evening Bites'
      ],
      famous_dishes: [
        {
          name: 'Slow-Simmered Dal Bukhara',
          why_famous: 'Cooked overnight for 16 hours over slow embers with vine-ripened tomatoes and generous churned butter.',
          restaurant_name: 'Green Apple Restaurant',
          price: 270,
          image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        },
        {
          name: 'Stuffed Amritsari Chur Chur Naan Thali',
          why_famous: 'Crushed crispy whole-wheat tandoori bread served with pindi chole, creamy raita, and sliced sirka onions.',
          restaurant_name: 'The Pizza Family & Dining',
          price: 220,
          image_url: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        },
        {
          name: 'Tandoori Afghani Malai Chaap',
          why_famous: 'Juicy soybean chunks roasted in the clay tandoor and tossed in thick dairy malai and roasted cashews.',
          restaurant_name: 'Royal Feast Family Restaurant',
          price: 190,
          image_url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        },
        {
          name: 'Maharaja Royal Deluxe Thali',
          why_famous: 'Feast of Shahi Paneer, Dal Makhani, Mixed Vegetable, Jeera Rice, 2 Butter Naans, Raita, and Hot Gulab Jamun.',
          restaurant_name: 'Delhi 41 Restro',
          price: 280,
          image_url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        }
      ],
      food_crawl_stops: [
        {
          stop_number: 1,
          time: '6:30 PM',
          type: 'Appetizers & Soya Chaap',
          venue_name: 'The Pizza Family & Dining',
          recommended_dish: 'Stuffed Tandoori Chaap & Crispy Spring Rolls',
          distance_to_next: '180 meters (2 min walk)',
          note: 'Start with piping hot tandoori bites fresh from the clay oven.'
        },
        {
          stop_number: 2,
          time: '8:00 PM',
          type: 'Family Royal Dinner',
          venue_name: 'Green Apple Restaurant',
          recommended_dish: 'Dal Bukhara with Garlic Naan & Paneer Lababdar',
          distance_to_next: '220 meters (3 min walk)',
          note: 'Full-course rich North Indian dinner in comfortable air-conditioned family hall.'
        },
        {
          stop_number: 3,
          time: '9:45 PM',
          type: 'Dessert & Thick Shakes',
          venue_name: 'Cafe Rooftop Nangloi',
          recommended_dish: 'Hot Gulab Jamun with Ice Cream & Hazelnut Frappe',
          distance_to_next: 'End of Crawl',
          note: 'Wind down your foodie tour with open terrace night breeze.'
        }
      ]
    }
  },
  {
    id: '44444444-0000-4000-8000-000000000012',
    title: 'Connaught Place (CP) Heritage & Rooftops',
    slug: 'connaught-place-cp-food-guide',
    description: 'Iconic British colonial colonnades, secret sunlit rooftop cafes, legendary bakeries, high-tea terraces, and classic Mughlai dining rooms.',
    cover_image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
    type: 'Area-Guide',
    is_featured: true,
    is_active: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
    area_metadata: {
      area_name: 'Connaught Place',
      zone: 'Central Delhi',
      latitude: 28.6304,
      longitude: 77.2177,
      vibe_badge: 'Historic colonial cafes, high-tea rooftops & business lunches.',
      famous_for_summary: 'Keventers Cold Shakes, Wenger’s Patties, Artisanal Coffee Brews & Rooftop Pasta Platters.',
      best_time_to_visit: '12:30 PM – 4:30 PM for relaxed lunch & coffee, or 7:00 PM onwards for lively inner-circle lights.',
      nearest_metro: 'Rajiv Chowk Metro Station (Blue & Yellow Interchange), Exit Gate 7 or 8',
      parking_tips: 'Inner Circle parking fills fast; prefer the underground multi-level parking at Shivaji Stadium or Palika.',
      avg_cost_for_two: 800,
      sub_guide_filters: [
        'Colonial & Heritage Cafes',
        'Rooftops with Central Park Views',
        'Fast Bites & Iconic Bakeries',
        'Date Night & Romantic'
      ],
      famous_dishes: [
        {
          name: 'Heritage Mutton Rogan Josh & Naan',
          why_famous: 'Kashmiri red chilies, ratanjot infusion, and melt-in-mouth lamb shank slow cooked in aromatic gravy.',
          restaurant_name: 'United Coffee House',
          price: 490,
          image_url: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=800&auto=format&fit=crop&q=80',
          is_veg: false,
        },
        {
          name: 'Classic Chicken Mushroom Patty',
          why_famous: 'Flaky golden puff pastry stuffed with creamy roasted chicken and button mushrooms since 1926.',
          restaurant_name: 'Wengers Bakery',
          price: 85,
          image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
          is_veg: false,
        },
        {
          name: 'Wood-fired Quattro Formaggi Pizza',
          why_famous: 'Hand-stretched sourdough crust with mozzarella, gorgonzola, parmesan, and ricotta.',
          restaurant_name: 'Caffe Tonino',
          price: 440,
          image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        }
      ],
      food_crawl_stops: [
        {
          stop_number: 1,
          time: '3:00 PM',
          type: 'Bakery & Quick Bites',
          venue_name: 'Wengers A-Block',
          recommended_dish: 'Chicken Patty & Shammi Kebab',
          distance_to_next: '150 meters',
          note: 'Iconic grab-and-go pastry start.'
        },
        {
          stop_number: 2,
          time: '5:00 PM',
          type: 'Colonial High-Tea & Coffee',
          venue_name: 'United Coffee House',
          recommended_dish: 'Cona Coffee & Paneer Pakora Platter',
          distance_to_next: '200 meters',
          note: 'Chandeliers, Victorian interiors, and timeless coffee brewing.'
        },
        {
          stop_number: 3,
          time: '7:30 PM',
          type: 'Rooftop Dinner & Drinks',
          venue_name: 'The Vault Cafe',
          recommended_dish: 'Wood-Fired Pizza & Mocktails',
          distance_to_next: 'End of Crawl',
          note: 'Panoramic views of the Central Park circular garden.'
        }
      ]
    }
  },
  {
    id: '44444444-0000-4000-8000-000000000013',
    title: 'Chandni Chowk & Old Delhi Heritage Trail',
    slug: 'chandni-chowk-old-delhi-heritage-trail',
    description: 'A 200-year-old culinary labyrinth: golden deep-fried stuffed parathas, slow-churned desi ghee jalebis, Bedmi Aloo Poori, and royal Jama Masjid Mughlai feasts.',
    cover_image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&auto=format&fit=crop&q=80',
    type: 'Area-Guide',
    is_featured: true,
    is_active: true,
    sort_order: 4,
    created_at: new Date().toISOString(),
    area_metadata: {
      area_name: 'Old Delhi / Chandni Chowk',
      zone: 'Central/North Delhi',
      latitude: 28.6506,
      longitude: 77.2334,
      vibe_badge: '200-year-old culinary heritage, historic desi ghee halwais & legendary chaat lanes.',
      famous_for_summary: 'Desi Ghee Jalebi with Rabri, Paranthe Wali Gali, Daulat ki Chaat, Natraj Dahi Bhalla & Karim’s Mutton Nihari.',
      best_time_to_visit: 'Morning 9:00 AM for Bedmi Poori breakfast, or 5:00 PM – 9:30 PM for festive evening street feasts.',
      nearest_metro: 'Chandni Chowk Metro Station (Yellow Line), Exit Gate 1 (directly faces the pedestrian promenade)',
      parking_tips: 'No vehicular traffic allowed inside the heritage corridor. Park strictly at Gandhi Maidan underground parking.',
      avg_cost_for_two: 350,
      sub_guide_filters: [
        'Historic Desi Ghee Halwais',
        'Legendary Chaat Addas',
        'Paranthe Wali Gali Pioneers',
        'Jama Masjid Mughlai Trail'
      ],
      famous_dishes: [
        {
          name: 'Old Famous Desi Ghee Jalebi with Rabri',
          why_famous: 'Thick, juicy jalebis deep-fried in pure desi ghee over charcoal since 1884, topped with thick malai rabri.',
          restaurant_name: 'Old Famous Jalebi Wala',
          price: 100,
          image_url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        },
        {
          name: 'Bedmi Poori with Spiced Fenugreek Aloo',
          why_famous: 'Crispy urad dal stuffed poori served with slow-cooked potato curry and sweet-sour pumpkin sabzi.',
          restaurant_name: 'Shyam Sweets Chawri Bazar',
          price: 90,
          image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        },
        {
          name: 'Natraj Dahi Bhalla & Aloo Tikki',
          why_famous: 'Melt-in-mouth lentil dumplings submerged in sweetened curd, roasted cumin, and heirloom saunth chutney.',
          restaurant_name: 'Natraj Dahi Bhalla Corner',
          price: 70,
          image_url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        },
        {
          name: 'Mutton Nihari with Khameeri Roti',
          why_famous: 'Overnight simmered shank broth flavored with 32 royal spices, finished with fresh ginger juliennes and lime.',
          restaurant_name: 'Karims Jama Masjid',
          price: 360,
          image_url: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=800&auto=format&fit=crop&q=80',
          is_veg: false,
        }
      ],
      food_crawl_stops: [
        {
          stop_number: 1,
          time: '4:30 PM',
          type: 'Famous Chaat Trail',
          venue_name: 'Natraj Dahi Bhalla Corner',
          recommended_dish: 'Dahi Bhalla & Crisp Aloo Tikki',
          distance_to_next: '100 meters',
          note: 'The benchmark of Delhi street food since 1940.'
        },
        {
          stop_number: 2,
          time: '5:45 PM',
          type: 'Paranthe Wali Gali',
          venue_name: 'Pandit Gaya Prasad Shiv Charan',
          recommended_dish: 'Rabri Paratha & Mixed Veg Paratha',
          distance_to_next: '350 meters',
          note: 'Wander through the narrow lanes of history.'
        },
        {
          stop_number: 3,
          time: '7:30 PM',
          type: 'Historic Sweet Finish',
          venue_name: 'Old Famous Jalebi Wala',
          recommended_dish: 'Piping Hot Jalebi with Creamy Rabri',
          distance_to_next: 'End of Trail',
          note: 'Corner of Dariba Kalan; pure nostalgic bliss.'
        }
      ]
    }
  },
  {
    id: '44444444-0000-4000-8000-000000000014',
    title: 'Hauz Khas Village & South Delhi Cafes',
    slug: 'hauz-khas-village-south-delhi-food-guide',
    description: 'Bohemian graffiti corridors, 14th-century lake views, indie specialty roasteries, sourdough bakeries, and Mediterranean dining terraces.',
    cover_image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&auto=format&fit=crop&q=80',
    type: 'Area-Guide',
    is_featured: true,
    is_active: true,
    sort_order: 5,
    created_at: new Date().toISOString(),
    area_metadata: {
      area_name: 'Hauz Khas Village',
      zone: 'South Delhi',
      latitude: 28.5494,
      longitude: 77.1932,
      vibe_badge: 'Bohemian art alleys, lake-view rooftops & indie artisan roasteries.',
      famous_for_summary: 'Lake-view Sunset Coffees, Mezze Platters, Sourdough Pizzas & Artisan Gelato.',
      best_time_to_visit: '4:00 PM – 7:30 PM for sunset over the lake, or late night for acoustic lounges.',
      nearest_metro: 'IIT Delhi or Hauz Khas Metro (Magenta / Yellow Line), Exit Gate 1 (5-min auto ₹50)',
      parking_tips: 'No car entry inside the village pedestrian zone. Use the automated multi-level parking at the HKV barrier.',
      avg_cost_for_two: 850,
      sub_guide_filters: [
        'Lake-View Rooftops',
        'Specialty Coffee & Sourdough',
        'Romantic Date Spots',
        'Artisan Bakeries'
      ],
      famous_dishes: [
        {
          name: 'Truffle Mushroom Sourdough Toast',
          why_famous: 'Wild sauteed mushrooms on 48-hour fermented rustic sourdough with aged parmesan and truffle oil.',
          restaurant_name: 'Coast Cafe',
          price: 320,
          image_url: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        },
        {
          name: 'Manual Pour-Over Single Origin Coffee',
          why_famous: 'Freshly roasted Chikmagalur Arabica beans brewed using V60 pour-over with citrus and cocoa notes.',
          restaurant_name: 'Blue Tokai Roastery',
          price: 210,
          image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        },
        {
          name: 'Lebanese Mezze Platter with Fresh Pita',
          why_famous: 'Classic creamy hummus, baba ganoush, falafel balls, and warm zaatar seasoned pita pockets.',
          restaurant_name: 'Social HKV',
          price: 380,
          image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        }
      ]
    }
  },
  {
    id: '44444444-0000-4000-8000-000000000015',
    title: 'Rajouri Garden & West Delhi Celebration Hub',
    slug: 'rajouri-garden-west-delhi-food-guide',
    description: 'Grand family dining lounges, sizzling tandoori chaap feasts, artisanal cocktail bars, multi-level restrobars, and vibrant market street bites.',
    cover_image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
    type: 'Area-Guide',
    is_featured: true,
    is_active: true,
    sort_order: 6,
    created_at: new Date().toISOString(),
    area_metadata: {
      area_name: 'Rajouri Garden',
      zone: 'West Delhi',
      latitude: 28.6475,
      longitude: 77.1215,
      vibe_badge: 'Grand multi-level dining, sizzling chaap feasts & celebration lounges.',
      famous_for_summary: 'Sizzling Tandoori Soya Chaap, Amritsari Kulcha, Royal Thalis & Festive Lounges.',
      best_time_to_visit: '6:30 PM – 11:30 PM (Peak dinner celebrations & weekend market bustle)',
      nearest_metro: 'Rajouri Garden Metro Station (Blue & Pink Line interchange), Exit Gate 4 or 5',
      parking_tips: 'Valet available at most Main Market and Ring Road restaurants. Dedicated Shivaji Enclave parking nearby.',
      avg_cost_for_two: 700,
      sub_guide_filters: [
        'Celebration Lounges',
        'Tandoori Chaap Specialists',
        'Family Dining Halls',
        'Street Food Addas'
      ],
      famous_dishes: [
        {
          name: 'Sizzling Afghani Stuffed Chaap',
          why_famous: 'Paneer stuffed soybean chaap skewers smothered in thick cashew cream, served on a smoking hot iron platter.',
          restaurant_name: 'Wah Ji Wah Rajouri',
          price: 240,
          image_url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        },
        {
          name: 'Butter Chicken with Tandoori Garlic Naan',
          why_famous: 'Creamy tomato-based fenugreek gravy with tender clay-oven roasted chicken pieces and dairy butter.',
          restaurant_name: 'Pind Balluchi Rajouri',
          price: 380,
          image_url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=80',
          is_veg: false,
        }
      ]
    }
  },
{
    "id": "44444444-0000-4000-8000-000000000021",
    "title": "Satya Niketan (South Campus) Food Map & Living Neighborhood Guide",
    "slug": "satya-niketan-south-campus-food-guide",
    "description": "South DU's ultimate student adda \u2014 buzzing post-lecture hangout, affordable pure-veg platters, killer tandoori momos, and creamy thick shakes.",
    "cover_image_url": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80",
    "type": "Area-Guide",
    "is_featured": true,
    "is_active": true,
    "sort_order": 7,
    "created_at": "2026-10-02T12:00:00.000Z",
    "area_metadata": {
      "area_name": "Satya Niketan / South Campus",
      "zone": "South Delhi",
      "latitude": 28.5882,
      "longitude": 77.1678,
      "vibe_badge": "South DU's ultimate student adda \u2014 buzzing post-lecture hangout, affordable pure-veg platters, killer tandoori momos & creamy thick shakes.",
      "famous_for_summary": "Tandoori Veg Momos, Rich Malai Soya Chaap, Crispy Butter Masala Dosa, Overloaded Cheesy Fries & KitKat Thick Shakes.",
      "best_time_to_visit": "3:30 PM \u2013 9:00 PM (Lively post-class student buzz, cool evening breezes & vibrant streetlights)",
      "nearest_metro": "Durgabai Deshmukh South Campus Metro Station (Pink Line, Exit Gate 2) & Sir M. Vishweshwaraiah Moti Bagh Metro Station (Pink Line, Exit Gate 1)",
      "parking_tips": "Vehicular entry into Satya Niketan inner lanes is heavily congested during peak college hours. Park at the Durgabai Deshmukh South Campus Metro Multilevel Parking or Benito Juarez Marg surface parking lots and take a 3-minute stroll across the footbridge.",
      "avg_cost_for_two": 500,
      "sub_guide_filters": [
        "Budget Student Addas",
        "Pure Veg Classics",
        "Crispy Dosas & Filter Kaapi",
        "Late-Night Chai & Shakes"
      ],
      "famous_dishes": [
        {
          "name": "Tandoori Paneer & Veg Momos",
          "why_famous": "Charcoal-roasted dumplings marinated in spiced curd and mustard oil, served piping hot with fiery mint-garlic chutney and sliced onions.",
          "restaurant_name": "The Veg Spicy Tadka",
          "price": 160,
          "is_veg": true
        },
        {
          "name": "Afghani Malai Soya Chaap",
          "why_famous": "Juicy charcoal-smoked soya chaap chunks bathed in whipped fresh cream, butter, cashew paste, and freshly cracked black pepper.",
          "restaurant_name": "Indian Grills Pure Veg Restaurant",
          "price": 220,
          "is_veg": true
        },
        {
          "name": "Special Dal Makhani with Garlic Butter Naan",
          "why_famous": "Black lentils slow-cooked overnight for 14 hours over a low charcoal flame, finished with churned white butter and aromatic kasuri methi.",
          "restaurant_name": "Shri Balaji Dhaba & Family Restaurant",
          "price": 210,
          "is_veg": true
        },
        {
          "name": "Ghee Roast Masala Dosa & Mysore Filter Coffee",
          "why_famous": "Paper-thin crispy fermented rice crepe roasted in aromatic desi ghee, stuffed with spiced potato mash, paired with frothy decoction filter coffee.",
          "restaurant_name": "Mysore Cafe (Opposite Venky College)",
          "price": 170,
          "is_veg": true
        }
      ],
      "food_crawl_stops": [
        {
          "stop_number": 1,
          "time": "4:00 PM",
          "type": "Appetizers / Crispy Dosas & South Indian Filter Coffee",
          "venue_name": "Mysore Cafe (Opposite Venky College)",
          "recommended_dish": "Special Ghee Roast Masala Dosa with Frothy Filter Coffee",
          "distance_to_next": "110 meters (2 min walk)",
          "note": "Grab a window seat facing Sri Venkateswara College right after afternoon lectures."
        },
        {
          "stop_number": 2,
          "time": "5:30 PM",
          "type": "Evening Street-Style Starters / Tandoori Chaap & Momos",
          "venue_name": "Indian Grills Pure Veg Restaurant",
          "recommended_dish": "Afghani Malai Soya Chaap & Charcoal Tandoori Veg Momos",
          "distance_to_next": "90 meters (1.5 min walk)",
          "note": "Indulge in sizzling tandoori plates during the peak evening student rush."
        },
        {
          "stop_number": 3,
          "time": "7:00 PM",
          "type": "Main Meal & Desserts / Overloaded Four-Cheese Pizza & Shake",
          "venue_name": "Uncle Cheese Veg Lounge",
          "recommended_dish": "Overloaded Four-Cheese Blast Pizza & Ferrero Rocher Blast Thick Shake",
          "distance_to_next": "End of Crawl",
          "note": "Chill in cozy air-conditioned seating with upbeat ambient music to wrap up your South Campus food crawl."
        }
      ]
    }
  },
  {
    "id": "44444444-0000-4000-8000-000000000022",
    "title": "Malviya Nagar & Saket Food Map & Living Neighborhood Guide",
    "slug": "malviya-nagar-saket-food-guide",
    "description": "Energetic South Delhi college corridor, student budget feasts, bustling market dhabas & leafy cafe nooks.",
    "cover_image_url": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80",
    "type": "Area-Guide",
    "is_featured": true,
    "is_active": true,
    "sort_order": 8,
    "created_at": "2026-10-02T12:00:00.000Z",
    "area_metadata": {
      "area_name": "Malviya Nagar & Saket",
      "zone": "South Delhi",
      "latitude": 28.5358,
      "longitude": 77.2085,
      "vibe_badge": "Energetic South Delhi college corridor, student budget feasts, bustling market dhabas & leafy cafe nooks.",
      "famous_for_summary": "Crispy Amritsari Chur Chur Naan Thalis, buttery slow-simmered Dal Makhani, giant Mysore Masala Dosas, and artisanal wood-fired veg pizzas.",
      "best_time_to_visit": "12:30 PM \u2013 3:30 PM for lunch thalis & 5:30 PM \u2013 10:30 PM for lively market street eats and evening dining.",
      "nearest_metro": "Malviya Nagar Metro Station (Yellow Line, Exit Gate 3) & Saket Metro Station (Yellow Line, Exit Gate 2)",
      "parking_tips": "Market lanes are narrow and congested with pedestrian shoppers. Park at Malviya Nagar Metro Multilevel Parking or the Saket PVR Anupam complex basement.",
      "avg_cost_for_two": 450,
      "sub_guide_filters": [
        "Budget Student Addas",
        "Amritsari Chur Chur Naans",
        "South Indian Dosas & Kaapi",
        "Cozy Study Cafes"
      ],
      "famous_dishes": [
        {
          "name": "Special Amritsari Chur Chur Naan Thali",
          "why_famous": "Crushed by hand with dollops of white butter, accompanied by spiced pindi chole, dal makhani, boondi raita, and pickled onions.",
          "restaurant_name": "Prem Di Rasoi Shuddh Shakahari",
          "price": 190,
          "is_veg": true
        },
        {
          "name": "Paneer Butter Masala & Garlic Naan Combo",
          "why_famous": "Creamy tomato cashewnut gravy loaded with fresh malai paneer cubes, served piping hot from the clay tandoor.",
          "restaurant_name": "Kesar Pure Veg Restaurant",
          "price": 260,
          "is_veg": true
        },
        {
          "name": "Special Ghee Mysore Masala Dosa",
          "why_famous": "Roasted golden brown in pure desi ghee with spicy red podi chutney smear, spiced potato filling, and freshly ground coconut chutney.",
          "restaurant_name": "Udupi Krishna Pure Veg",
          "price": 170,
          "is_veg": true
        },
        {
          "name": "Wood-Fired Quattro Formaggi & Veggie Farm Pizza",
          "why_famous": "Crisp sourdough base baked in a stone deck oven topped with fresh bocconcini, bell peppers, olives, and jalapenos.",
          "restaurant_name": "Go Veggie Cafe",
          "price": 320,
          "is_veg": true
        }
      ],
      "food_crawl_stops": [
        {
          "stop_number": 1,
          "time": "4:00 PM",
          "type": "Crispy Evening Tiffin & Filter Coffee",
          "venue_name": "Udupi Krishna Pure Veg",
          "recommended_dish": "Ghee Roast Masala Dosa with Steaming Degree Filter Kaapi",
          "distance_to_next": "600 meters (7 min walk to Saket J-Block / Main Road)",
          "note": "Kickstart your exploration before the evening market shopping crowd peaks."
        },
        {
          "stop_number": 2,
          "time": "6:30 PM",
          "type": "Hearty Pure Veg North Indian Feast",
          "venue_name": "Kesar Pure Veg Restaurant",
          "recommended_dish": "Signature Dal Makhani, Paneer Lababdar & Butter Tandoori Rotis",
          "distance_to_next": "450 meters (5 min walk into Malviya Nagar Main Market)",
          "note": "Spacious family dining room with comfortable booth seating and chilled AC."
        },
        {
          "stop_number": 3,
          "time": "8:45 PM",
          "type": "Dessert, Hot Jalebi, Rabri & Gulab Jamun",
          "venue_name": "Moti Sweets & Vegetarian Restaurant",
          "recommended_dish": "Desi Ghee Kesari Jalebi with Chilled Laccha Rabri",
          "distance_to_next": "End of Crawl (Malviya Nagar Metro Exit 3 is 400m away)",
          "note": "Wind down amidst the iconic market buzz with South Delhi's timeless sweet tradition."
        }
      ]
    }
  },
  {
    "id": "44444444-0000-4000-8000-000000000023",
    "title": "Mukherjee Nagar Coaching Hub Food Map & Living Neighborhood Guide",
    "slug": "mukherjee-nagar-coaching-hub-food-guide",
    "description": "High-octane aspirant energy, late-night library study breaks, piping-hot tandoors, and wholesome desi ghee pure-veg comfort.",
    "cover_image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1200&auto=format&fit=crop&q=80",
    "type": "Area-Guide",
    "is_featured": true,
    "is_active": true,
    "sort_order": 9,
    "created_at": "2026-10-02T12:00:00.000Z",
    "area_metadata": {
      "area_name": "Mukherjee Nagar Coaching Hub",
      "zone": "North Delhi",
      "latitude": 28.7065,
      "longitude": 77.2085,
      "vibe_badge": "High-octane aspirant energy, late-night library study breaks, piping-hot tandoors, and wholesome desi ghee pure-veg comfort.",
      "famous_for_summary": "Charcoal-smoked Soya Malai Chaap, Slow-cooked Urad Dal Makhani, Desi Ghee Mysore Masala Dosa, and Homestyle Unlimited Student Thalis.",
      "best_time_to_visit": "4:00 PM \u2013 9:30 PM (Evening post-coaching tea sessions, chaap discussions, and late-night dinner rush)",
      "nearest_metro": "GTB Nagar Metro Station, Yellow Line, Exit Gate 2 (Mukherjee Nagar Auto-rickshaw stand)",
      "parking_tips": "Banda Bahadur Marg and Commercial Complex lanes are heavily congested with e-rickshaws and two-wheelers. Use the MCD Multi-Level Car Parking near Batra Cinema or park at GTB Nagar Metro Station.",
      "avg_cost_for_two": 320,
      "sub_guide_filters": [
        "Budget Student Thalis",
        "Tandoori Chaap & Momos",
        "South Indian Tiffin & Kaapi",
        "Coaching Addas & Study Cafes"
      ],
      "famous_dishes": [
        {
          "name": "Chadha Special Dal Makhani & Laccha Paratha",
          "why_famous": "Black lentils simmered overnight over slow charcoal embers with dairy butter, paired with flaky multi-layered tandoori paratha.",
          "restaurant_name": "Chadha Bhojnalaya",
          "price": 165,
          "is_veg": true
        },
        {
          "name": "Special Udupi Mysore Masala Dosa",
          "why_famous": "Golden fermented crepe coated with fiery roasted garlic-chili paste and stuffed with seasoned potato masala.",
          "restaurant_name": "Udupi Krishna Restaurant",
          "price": 180,
          "is_veg": true
        },
        {
          "name": "Amritsari Paneer Bhurji & Butter Naan",
          "why_famous": "Fresh cottage cheese scrambled with juicy tomatoes, green chilies, and whole Punjabi spices on a smoking tawa.",
          "restaurant_name": "Amritsari Dhaba",
          "price": 190,
          "is_veg": true
        }
      ],
      "food_crawl_stops": [
        {
          "stop_number": 1,
          "time": "4:30 PM",
          "type": "Evening Chai & South Indian Tiffin",
          "venue_name": "Udupi Krishna Restaurant",
          "recommended_dish": "Crispy Medu Vada & Degree Filter Coffee",
          "distance_to_next": "350 meters (4 min walk)",
          "note": "Recharge after afternoon lecture hours before the coaching libraries empty out."
        },
        {
          "stop_number": 2,
          "time": "6:30 PM",
          "type": "Mid-Evening Appetizer & Group Discussion",
          "venue_name": "Benam Cafe",
          "recommended_dish": "Grilled Paneer Tikka Sandwich & Cold Brew Frappe",
          "distance_to_next": "200 meters (2 min walk)",
          "note": "Aesthetic study cafe vibe inside Batra Complex with laptop power outlets."
        },
        {
          "stop_number": 3,
          "time": "8:15 PM",
          "type": "Hearty Main Dinner / Iconic Punjabi Thali",
          "venue_name": "Chadha Bhojnalaya",
          "recommended_dish": "Chadha Special Veg Thali & Dal Makhani",
          "distance_to_next": "End of Crawl",
          "note": "Classic sit-down dinner with piping-hot tandoori rotis to wrap up the Mukherjee Nagar food trail."
        }
      ]
    }
  },
  {
    "id": "44444444-0000-4000-8000-000000000024",
    "title": "Majnu Ka Tilla (MKT) Food Map & Living Neighborhood Guide",
    "slug": "majnu-ka-tilla-mkt-food-guide",
    "description": "Delhi's vibrant Himalayan enclave: fluttering prayer flags, rooftop river vistas, steaming momo baskets & bohemian student study addas.",
    "cover_image_url": "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80",
    "type": "Area-Guide",
    "is_featured": true,
    "is_active": true,
    "sort_order": 10,
    "created_at": "2026-10-02T12:00:00.000Z",
    "area_metadata": {
      "area_name": "Majnu Ka Tilla (MKT)",
      "zone": "North Delhi",
      "latitude": 28.7036,
      "longitude": 77.2284,
      "vibe_badge": "Delhi's vibrant Himalayan enclave: prayer flags, rooftop river vistas, steaming momo baskets & bohemian student study addas.",
      "famous_for_summary": "Hand-rolled Tibetan Tingmo & Thentuk, crispy pan-fried Kothey Momos, cold spicy Laphing, and rooftop riverfront cafes overlooking the Signature Bridge.",
      "best_time_to_visit": "3:30 PM \u2013 8:30 PM (Vibrant golden hour rooftop breeze, alleyway shopping & evening cafe buzz)",
      "nearest_metro": "Vidhan Sabha Metro Station (Yellow Line, Exit Gate 2) \u2013 1.8 km (5-7 min by e-rickshaw for \u20b915\u201320)",
      "parking_tips": "Internal alleys are strictly pedestrian-only with zero car access. Park personal vehicles at the Outer Ring Road paid municipal parking lot near Majnu Ka Tilla Gurudwara footbridge, or take the Yellow Line Metro to Vidhan Sabha and ride a local e-rickshaw.",
      "avg_cost_for_two": 650,
      "sub_guide_filters": [
        "Riverfront Rooftops",
        "Tibetan & Bhutanese Classics",
        "Korean Street Bites & Boba",
        "Artisanal Coffee & Bakes"
      ],
      "famous_dishes": [
        {
          "name": "Pan-Fried Vegetable Kothey Momos",
          "why_famous": "Half-steamed, half-crisp pan-seared crescent dumplings stuffed with shredded cabbage, carrots, paneer, and ginger, served with fire-roasted Sichuan chili dip.",
          "restaurant_name": "Tee Dee restaurant",
          "price": 140,
          "is_veg": true
        },
        {
          "name": "Artisanal Tiramisu & Sweet Shiitake Sushi",
          "why_famous": "Layers of mascarpone espresso sponge paired with creative pan-Asian rolled sushi featuring caramelized shiitake mushrooms in sweet soy reduction.",
          "restaurant_name": "Wongdhen Cafe",
          "price": 240,
          "is_veg": true
        },
        {
          "name": "Devil Jhol Momos in Tangy Sesame Broth",
          "why_famous": "Steamed dumplings submerged in a warm, sour, and fiery Kathmandu-style sesame, tomato, and roasted cumin broth.",
          "restaurant_name": "Romeo and Juliet Cafe",
          "price": 180,
          "is_veg": true
        },
        {
          "name": "Tibetan Tingmo with Veg Shamu Gravy",
          "why_famous": "Fluffy, flower-shaped steamed wheat bread buns served alongside a comforting gravy of button mushrooms, tofu, and seasonal greens.",
          "restaurant_name": "MACHEN LA Tibet Kitchen",
          "price": 190,
          "is_veg": true
        },
        {
          "name": "Signature Blueberry Baked Cheesecake",
          "why_famous": "Velvety New York-style baked cream cheese base topped with a luscious mountain blueberry compote, celebrated across North Campus student circles.",
          "restaurant_name": "Kunga Cafe and Restaurant",
          "price": 195,
          "is_veg": true
        }
      ],
      "food_crawl_stops": [
        {
          "stop_number": 1,
          "time": "4:00 PM",
          "type": "Appetizers / Traditional Momos & Tibetan Butter Tea",
          "venue_name": "Tee Dee restaurant",
          "recommended_dish": "Steamed & Kothey Veg Momos with Salty Tibetan Butter Tea",
          "distance_to_next": "80 meters (1 min walk through Central Alley)",
          "note": "Soak in the old-world Tibetan heritage decor before the dinner rush fills the ground-floor booths."
        },
        {
          "stop_number": 2,
          "time": "5:30 PM",
          "type": "Main Course / Golden Hour Riverfront Dine-In",
          "venue_name": "Signature Cafe Delhi",
          "recommended_dish": "Wood-Fired Margherita Pizza, Crispy Spicy Potato Burger & Garlic Noodles",
          "distance_to_next": "110 meters (2 min walk toward Tsampa House)",
          "note": "Catch the sunset over the Yamuna River and brightly illuminated Signature Bridge from the breezy top-floor deck."
        },
        {
          "stop_number": 3,
          "time": "7:15 PM",
          "type": "Dessert, Artisanal Coffee & Student Chillout",
          "venue_name": "Wongdhen Cafe",
          "recommended_dish": "Classic Italian Tiramisu, Chocolate Mud Cake & Flat White Coffee",
          "distance_to_next": "End of Crawl (Exit toward Outer Ring Road footbridge)",
          "note": "Unwind amidst warm wooden aesthetics, ambient indie tunes, and bookshelves as night falls over the colony."
        }
      ]
    }
  },
  {
    "id": "44444444-0000-4000-8000-000000000025",
    "title": "Rajendra Nagar & Karol Bagh Food Map & Living Neighborhood Guide",
    "slug": "rajendra-nagar-karol-bagh-food-guide",
    "description": "High-octane civil services study hub meets heritage Punjabi food culture, packed with budget student thalis and late-night cutting chai addas.",
    "cover_image_url": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1200&auto=format&fit=crop&q=80",
    "type": "Area-Guide",
    "is_featured": true,
    "is_active": true,
    "sort_order": 11,
    "created_at": "2026-10-02T12:00:00.000Z",
    "area_metadata": {
      "area_name": "Rajendra Nagar & Karol Bagh",
      "zone": "Central Delhi",
      "latitude": 28.6441,
      "longitude": 77.1865,
      "vibe_badge": "Coaching corridor life meets hidden regional messes, satvik dining rooms, and budget tandoori feast addas.",
      "famous_for_summary": "Signature Desi Ghee Chole Bhature, Unlimited Regional Vegetarian Thalis (Rajasthani, Gujarati & Punjabi), Crisp South Indian Dosas & Filter Coffee, and Piping-Hot Tandoori Kulhad Chai.",
      "best_time_to_visit": "1:00 PM \u2013 3:30 PM (Peak student thali lunch hour) & 6:00 PM \u2013 10:30 PM (Evening street eats, tea discussions & dinner buzz)",
      "nearest_metro": "Karol Bagh Metro Station (Blue Line, Gate 4) & Rajendra Place Metro Station (Blue Line, Gate 2)",
      "parking_tips": "Bada Bazar Road and Ajmal Khan Road are heavily congested pedestrian zones with zero curbside parking; park strictly at the Karol Bagh Multilevel Car Parking on Gurudwara Road or use Delhi Metro.",
      "avg_cost_for_two": 350,
      "sub_guide_filters": [
        "Regional Student Messes",
        "Heritage Punjabi Dhabas",
        "Udupi Dosas & Kaapi",
        "Late-Night Study Lounges"
      ],
      "famous_dishes": [
        {
          "name": "Kesar Pista Kulfi Falooda",
          "why_famous": "Hand-churned dense malai kulfi infused with saffron and pistachios, topped with silky hand-pressed cornstarch falooda and fragrant rose syrup since 1956.",
          "restaurant_name": "Roshan Di Kulfi",
          "price": 180,
          "is_veg": true
        },
        {
          "name": "Unlimited Royal Gujarati & Rajasthani Thali",
          "why_famous": "Grand brass plate feast featuring 4 seasonal sabzis, Dal Baati Churma, sweet Gujarati Kadhi, steamed Dhokla, Phulkas with white butter, and Malpua.",
          "restaurant_name": "Suruchi Restaurant",
          "price": 499,
          "is_veg": true
        },
        {
          "name": "Ghee Podi Masala Dosa",
          "why_famous": "Stone-ground fermented crepe roasted crisp in pure A2 ghee, generously dusted with fiery Gunpowder chutney podi, served with three fresh chutneys.",
          "restaurant_name": "Padmanabham",
          "price": 210,
          "is_veg": true
        },
        {
          "name": "Special Amritsari Paneer Chur Chur Naan Thali",
          "why_famous": "Tandoor-blistered, heavily butter-crushed paneer kulcha served with slow-cooked pindi chole, boondi raita, and pickled onions.",
          "restaurant_name": "Amritsari Kulcha King",
          "price": 140,
          "is_veg": true
        },
        {
          "name": "Special Methi Chole Bhature",
          "why_famous": "Spiced chickpeas slow-simmered in an iron kadhai with whole dried gooseberries (amla) and topped with tangy fenugreek chutney and paneer-stuffed bhature.",
          "restaurant_name": "Om Corner",
          "price": 140,
          "is_veg": true
        }
      ],
      "food_crawl_stops": [
        {
          "stop_number": 1,
          "time": "4:30 PM",
          "type": "Evening Chai & Savory Tiffin",
          "venue_name": "M. Gopinath South Indian Cafe",
          "recommended_dish": "Ghee Butter Masala Dosa & Degree Filter Coffee",
          "distance_to_next": "250 meters (3 min walk)",
          "note": "Fuel up before study breaks end and evening crowds take over Bada Bazar Road."
        },
        {
          "stop_number": 2,
          "time": "7:30 PM",
          "type": "Hearty Main Dinner / Royal Vegetarian Thali",
          "venue_name": "Temple Street \u2013 South Indian & Multi Cuisine Restaurant",
          "recommended_dish": "Special Maharaja North Indian Thali with Dal Makhani & Shahi Paneer",
          "distance_to_next": "450 meters (6 min walk / e-rickshaw)",
          "note": "Spacious fully air-conditioned dine-in hall with fast service and comfortable seating."
        },
        {
          "stop_number": 3,
          "time": "9:30 PM",
          "type": "Iconic Heritage Dessert & Nightcap",
          "venue_name": "Roshan Di Kulfi",
          "recommended_dish": "Special Kesar Pista Falooda Kulfi",
          "distance_to_next": "End of Crawl (Adjacent to Karol Bagh Metro Gate 1)",
          "note": "The quintessential post-dinner sweet ritual of Central Delhi since 1956."
        }
      ]
    }
  },
  {
    id: '44444444-0000-4000-8000-000000000031',
    title: 'Model Town Food Map & Lake Dining Trail',
    slug: 'model-town-food-guide',
    description: 'North Delhi’s premier foodie destination: lakeside European bakeries, sizzling tandoori soya chaap joints, iconic street pav bhaji, and vibrant music restrobars.',
    cover_image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
    type: 'Area-Guide',
    is_featured: true,
    is_active: true,
    sort_order: 12,
    created_at: '2026-10-10T06:00:00.000Z',
    area_metadata: {
      area_name: 'Model Town (Phase 2 & 3)',
      zone: 'North Delhi',
      latitude: 28.7032,
      longitude: 77.1944,
      vibe_badge: 'North Delhi high-street dining, scenic lake strolls & legendary chaap hubs.',
      famous_for_summary: 'Artisan Almond Croissants, Tandoori Malai Soya Chaap, Mumbai Butter Pav Bhaji & Wood-Fired Pizzas.',
      best_time_to_visit: '5:00 PM – 11:30 PM (Lively family crowds, twinkling market lights & lake breeze)',
      nearest_metro: 'Model Town Metro Station (Yellow Line), Exit Gate 2 (3-min E-Rickshaw ₹10)',
      parking_tips: 'Model Town 2 & 3 markets have organized surface parking lots. Valet available at Parra by Imperfecto and Flos.',
      avg_cost_for_two: 650,
      sub_guide_filters: [
        'Artisan Bakeries & Cafes',
        'Soya Chaap Specialists',
        'Lakeside Dining & Chill',
        'Late Night Bites'
      ],
      famous_dishes: [
        {
          name: 'Twice Baked Almond Croissant',
          why_famous: 'Flaky butter croissant loaded with almond frangipane cream and toasted sliced almonds.',
          restaurant_name: "Suchali's Artisan Bakehouse",
          price: 240,
          image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        },
        {
          name: 'Original Malai Chaap Tikka',
          why_famous: 'Charcoal-grilled soya chaap drenched in heavy dairy cream, butter, and freshly ground chaat masala.',
          restaurant_name: 'Sardarji Malai Chaap Wale',
          price: 220,
          image_url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        },
        {
          name: 'Special Butter Pav Bhaji',
          why_famous: 'Iconic street style mashed bhaji loaded with Amul butter and fluffy griddled pavs.',
          restaurant_name: 'Arjun Bombay Pav Bhaji',
          price: 140,
          image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        }
      ]
    }
  },
  {
    id: '44444444-0000-4000-8000-000000000032',
    title: 'Greater Kailash (GK 1 & GK 2) Gourmet Food Map',
    slug: 'greater-kailash-gk-food-guide',
    description: 'South Delhi’s chicest lifestyle enclave: authentic Italian trattorias, artisanal coffee roasters, Tokyo ramen, and legendary whole-wheat chicken momos.',
    cover_image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
    type: 'Area-Guide',
    is_featured: true,
    is_active: true,
    sort_order: 13,
    created_at: '2026-10-10T06:00:00.000Z',
    area_metadata: {
      area_name: 'Greater Kailash (GK 1 & GK 2)',
      zone: 'South Delhi',
      latitude: 28.5450,
      longitude: 77.2420,
      vibe_badge: 'High-end European trattorias, artisanal roasteries & South Delhi iconic retail markets.',
      famous_for_summary: 'Steamed Wheat Momos, Burrata Pugliese, Tokyo Tonkotsu Ramen, Benne Dosas & New York Cheesecakes.',
      best_time_to_visit: '12:00 PM – 11:00 PM (Great for afternoon coffee dates and buzzing dinner nightlife)',
      nearest_metro: 'Greater Kailash Metro Station (Magenta Line) & Kailash Colony Metro Station (Violet Line)',
      parking_tips: 'GK1 and GK2 M-Block markets feature multilevel automated parking facilities. Valet available at fine-dine outlets.',
      avg_cost_for_two: 1400,
      sub_guide_filters: [
        'Fine Dining & Italian',
        'Specialty Coffee & Bakes',
        'Pan-Asian & Sushi',
        'Market Street Legends'
      ],
      famous_dishes: [
        {
          name: 'Steamed Wheat Chicken Momos',
          why_famous: 'Healthy whole wheat thin wrapper dumplings filled with juicy scallion chicken, paired with fiery red dip.',
          restaurant_name: 'Brown Sugar GK1',
          price: 180,
          image_url: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&auto=format&fit=crop&q=80',
          is_veg: false,
        },
        {
          name: 'Handcrafted Tagliolini al Tartufo',
          why_famous: 'Fresh homemade pasta ribbons tossed in aromatic black truffle butter emulsion and parmesan.',
          restaurant_name: 'Diva - The Italian Restaurant GK2',
          price: 890,
          image_url: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        },
        {
          name: 'Malleswaram 18th Cross Dosa',
          why_famous: 'Thick, crispy golden benne dosa smeared with aromatic red garlic chutney and white butter.',
          restaurant_name: 'Carnatic Cafe GK2',
          price: 240,
          image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        }
      ]
    }
  },
  {
    id: '44444444-0000-4000-8000-000000000033',
    title: 'Defence Colony (Def Col) Epicurean Food Trail',
    slug: 'defence-colony-def-col-food-guide',
    description: 'Classic South Delhi sophistication: decadent Italian pasta bakes, melt-in-mouth Awadhi mutton seekh kebabs, Mangalorean butter garlic crab, and French patisseries.',
    cover_image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&auto=format&fit=crop&q=80',
    type: 'Area-Guide',
    is_featured: true,
    is_active: true,
    sort_order: 14,
    created_at: '2026-10-10T06:00:00.000Z',
    area_metadata: {
      area_name: 'Defence Colony',
      zone: 'South Delhi',
      latitude: 28.5733,
      longitude: 77.2311,
      vibe_badge: 'Tree-lined avenues, retro-chic cafes & timeless culinary royalty.',
      famous_for_summary: 'Butter Garlic Mud Crab, Penne with Vodka Sauce, Kakori Kebabs, Mississippi Mud Pie & French Baguettes.',
      best_time_to_visit: '1:00 PM – 11:30 PM (Chic brunches, evening coffee, and late-night dinner cocktails)',
      nearest_metro: 'Lajpat Nagar Metro Station (Pink & Violet Lines, Exit 2) & Moolchand Metro Station (Violet Line)',
      parking_tips: 'Def Col Main Market has paid surface parking with attendants, though weekend evenings are crowded. Take metro/cab for ease.',
      avg_cost_for_two: 1200,
      sub_guide_filters: [
        'Continental & Italian Legends',
        'Mughlai & Kebab Institutions',
        'Coastal Seafood & Grills',
        'Artisanal Bakeries & Pies'
      ],
      famous_dishes: [
        {
          name: 'Penne with Vodka Sauce',
          why_famous: 'Tubular pasta tossed in signature silky pink tomato cream sauce flamed with vodka and parmesan.',
          restaurant_name: 'The Big Chill Cafe',
          price: 440,
          image_url: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        },
        {
          name: 'Mutton Seekh Kebab',
          why_famous: 'Finely minced spiced mutton skewers char-grilled on seekh over burning coal embers.',
          restaurant_name: "Colonel's Kababz",
          price: 320,
          image_url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
          is_veg: false,
        },
        {
          name: 'Butter Garlic Crab',
          why_famous: 'Fresh whole coastal mud crab sauteed in rich golden garlic butter emulsion with cracked pepper.',
          restaurant_name: 'Swagath',
          price: 650,
          image_url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
          is_veg: false,
        }
      ]
    }
  },
  {
    id: '44444444-0000-4000-8000-000000000015',
    title: 'CR Park Bengali Culinary Heritage Guide',
    slug: 'cr-park-food-guide',
    description: 'Mini Kolkata in the heart of South Delhi: steaming Basanti Pulao, melt-in-mouth Kosha Mangsho, crispy Bhetki Fish Fry, crumbly chops, and pure date palm jaggery sandesh.',
    cover_image_url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=1200&auto=format&fit=crop&q=80',
    type: 'Area-Guide',
    is_featured: true,
    is_active: true,
    sort_order: 15,
    created_at: '2026-10-10T08:00:00.000Z',
    area_metadata: {
      area_name: 'CR Park (Chittaranjan Park)',
      zone: 'South Delhi',
      latitude: 28.5395,
      longitude: 77.2472,
      vibe_badge: 'Aroma of mustard oil, evening cha addas & timeless Kolkata soul.',
      famous_for_summary: 'Kosha Mangsho, Bhetki Macher Paturi, Kolkata Fish Fry, Mughlai Paratha, Mishti Doi & Nolen Gurer Sandesh.',
      best_time_to_visit: '12:00 PM – 3:30 PM (Traditional Bengali lunch) & 5:30 PM – 10:30 PM (Evening street snacks and sweets)',
      nearest_metro: 'Nehru Enclave Metro Station (Magenta Line) & Greater Kailash Metro Station (Magenta Line)',
      parking_tips: 'Market 1 and Market 2 have dedicated municipal parking lots; Market 2 gets packed by 7:30 PM.',
      avg_cost_for_two: 550,
      sub_guide_filters: [
        'Authentic Bengali Curries & Rice',
        'Iconic Kolkata Cutlets & Chops',
        'Traditional Mishti & Sweets',
        'Evening Cha & Street Addas'
      ],
      famous_dishes: [
        {
          name: 'Kosha Mangsho with Basanti Pulao',
          why_famous: 'Slow-cooked rich Kolkata mutton curry with tender potatoes paired with fragrant sweet yellow basanti pulao.',
          restaurant_name: 'Maa Tara Restaurant',
          price: 280,
          image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80',
          is_veg: false,
        },
        {
          name: 'Pure Bhetki Kolkata Fish Fry',
          why_famous: 'Fresh sea-bass fillet marinated in green coriander-chili-ginger emulsion and crumb-fried crisp with mustard kasundi.',
          restaurant_name: 'City Cafe',
          price: 160,
          image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80',
          is_veg: false,
        },
        {
          name: 'Nolen Gurer Rasgulla & Mishti Doi',
          why_famous: 'Spongy winter date palm jaggery rasgullas and earthenware set fermented sweet curd.',
          restaurant_name: 'Annapurna Sweet House',
          price: 70,
          image_url: 'https://images.unsplash.com/photo-1560008581-09826d1de69e?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        }
      ]
    }
  },
  {
    id: '44444444-0000-4000-8000-000000000016',
    title: 'Epicuria Nehru Place Metro Transit Dining Guide',
    slug: 'epicuria-nehru-place-food-guide',
    description: 'Asias premier transit dining hub nestled right under Nehru Place Metro: high-energy brewpubs, Pan-Asian dim sum bars, artisanal bakeries, and gourmet coffee shops.',
    cover_image_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&auto=format&fit=crop&q=80',
    type: 'Area-Guide',
    is_featured: true,
    is_active: true,
    sort_order: 16,
    created_at: '2026-10-10T08:00:00.000Z',
    area_metadata: {
      area_name: 'Epicuria / Nehru Place',
      zone: 'South Delhi',
      latitude: 28.5492,
      longitude: 77.2528,
      vibe_badge: 'High-energy metro transit hub, neon gastropubs & corporate power lunches.',
      famous_for_summary: 'Loaded Death Wings, Truffle Mac & Cheese, Sushi Platters, Craft Brews & Gourmet Artisanal Gelato.',
      best_time_to_visit: '12:30 PM – 3:30 PM (Corporate Lunch) & 6:00 PM – 12:30 AM (Lively nightlife & live gigs)',
      nearest_metro: 'Nehru Place Metro Station (Violet Line, Direct Escalator to Concourse Level)',
      parking_tips: 'Epicuria has a massive automated multilevel basement parking facility with valet services available.',
      avg_cost_for_two: 1400,
      sub_guide_filters: [
        'Gastropubs & Craft Beers',
        'Pan-Asian Sushi & Dim Sum',
        'Quick Metro Takeaways',
        'Desserts & Specialty Coffee'
      ],
      famous_dishes: [
        {
          name: 'Butter Chicken Biryani Box',
          why_famous: 'Tender charbroiled chicken tikka layered with rich makhani gravy and spiced rice.',
          restaurant_name: 'Nehru Place Social',
          price: 445,
          image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
          is_veg: false,
        },
        {
          name: 'Classic Fish & Chips',
          why_famous: 'Beer-battered crispy bhetki served with mushy peas and house tartar sauce.',
          restaurant_name: 'The Chatter House',
          price: 525,
          image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80',
          is_veg: false,
        }
      ]
    }
  },
  {
    id: '44444444-0000-4000-8000-000000000017',
    title: 'Bengali Market & Mandi House Theatre Food Walk',
    slug: 'bengali-market-mandi-house-food-guide',
    description: 'The cultural heartbeat of New Delhi: century-old sweet shops, legendary Chole Bhature, open-air cultural cafe terraces, and state bhavan thalis.',
    cover_image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1200&auto=format&fit=crop&q=80',
    type: 'Area-Guide',
    is_featured: true,
    is_active: true,
    sort_order: 17,
    created_at: '2026-10-10T08:00:00.000Z',
    area_metadata: {
      area_name: 'Bengali Market & Mandi House',
      zone: 'Central Delhi',
      latitude: 28.6271,
      longitude: 77.2343,
      vibe_badge: 'Intellectual theatre crowd, heritage sweet shops & quiet cultural courtyards.',
      famous_for_summary: 'Raj Kachori, Special Chole Bhature, Apple Jalebi, Shami Kebabs, Masala Chai & State Bhavan Thalis.',
      best_time_to_visit: '10:00 AM – 2:00 PM (Fresh morning sweets & breakfast) & 5:00 PM – 9:30 PM (Post-theatre snacks)',
      nearest_metro: 'Mandi House Metro Station (Blue & Violet Interchange, Exit Gate 1)',
      parking_tips: 'Bengali Market circle has surface parking attendants; Mandi House complex has ample street parking.',
      avg_cost_for_two: 450,
      sub_guide_filters: [
        'Iconic Chaat & Sweets',
        'Chole Bhature & Thalis',
        'Theatre Terraces & Chai',
        'Regional State Bhavans'
      ],
      famous_dishes: [
        {
          name: 'Special Raj Kachori',
          why_famous: 'Giant golden crispy kachori stuffed with boiled potatoes, sprouted lentils, chilled curd, and tangy tamarind.',
          restaurant_name: "Nathu's Sweets",
          price: 130,
          image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        },
        {
          name: 'Desi Ghee Chole Bhature',
          why_famous: 'Fluffy balloon bhaturas served with robust black Punjabi chana, raw onion rings, and amla pickle.',
          restaurant_name: "Bhimsain's Bengali Sweet House",
          price: 150,
          image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        }
      ]
    }
  },
  {
    id: '44444444-0000-4000-8000-000000000018',
    title: 'Rajouri Garden Street Food & Dining Trail',
    slug: 'rajouri-garden-food-guide',
    description: 'The epicentre of West Delhi food culture: crunchy aloo tikkis, melt-in-mouth kulfi faloodas, fiery tandoori chicken, and buzzing family dining rooms.',
    cover_image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&auto=format&fit=crop&q=80',
    type: 'Area-Guide',
    is_featured: true,
    is_active: true,
    sort_order: 18,
    created_at: '2026-10-10T08:00:00.000Z',
    area_metadata: {
      area_name: 'Rajouri Garden',
      zone: 'West Delhi',
      latitude: 28.6472,
      longitude: 77.1212,
      vibe_badge: 'Bustling Punjabi street market, high-energy shopping crowds & decadent feasts.',
      famous_for_summary: 'Crispy Aloo Tikki, Tandoori Chicken, Kesar Pista Kulfi Falooda, Butter Chicken & Dal Makhani.',
      best_time_to_visit: '4:00 PM – 11:30 PM (Evening street shopping crowd & buzzing dinner scene)',
      nearest_metro: 'Rajouri Garden Metro Station (Blue & Pink Interchange, Exit Gate 4 or 5)',
      parking_tips: 'Park in the Shivaji Place multi-level parking complex near TDI Mall to avoid market jams.',
      avg_cost_for_two: 500,
      sub_guide_filters: [
        'Legendary Chaat & Tikkis',
        'Dhaba & Tandoori Masters',
        'Famous Kulfi & Mithai',
        'Trendy Cafes & Lounges'
      ],
      famous_dishes: [
        {
          name: 'Crispy Aloo Tikki Chaat',
          why_famous: 'Deep shallow-fried crunchy potato patties topped with sweet curd, spicy green chutney, and dried sonth.',
          restaurant_name: 'Atul Chaat Corner',
          price: 90,
          image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        },
        {
          name: 'Kesar Pista Kulfi Falooda',
          why_famous: 'Rich, dense, slow-reduced saffron milk kulfi sliced over chilled vermicelli falooda and rose syrup.',
          restaurant_name: 'Roshan Di Kulfi',
          price: 120,
          image_url: 'https://images.unsplash.com/photo-1560008581-09826d1de69e?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        }
      ]
    }
  },
  {
    id: '44444444-0000-4000-8000-000000000019',
    title: 'Punjabi Bagh Club Road Lounges & Culinary Avenue',
    slug: 'punjabi-bagh-food-guide',
    description: 'West Delhis premier fine dining strip on Club Road: rooftop terraces, artisan grills, modern Indian masterpieces, and chic bakery parlours.',
    cover_image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
    type: 'Area-Guide',
    is_featured: true,
    is_active: true,
    sort_order: 19,
    created_at: '2026-10-10T08:00:00.000Z',
    area_metadata: {
      area_name: 'Punjabi Bagh',
      zone: 'West Delhi',
      latitude: 28.6668,
      longitude: 77.1264,
      vibe_badge: 'Upscale dining promenade, glowing neon rooftops & gourmet family celebrations.',
      famous_for_summary: 'Dahi Ke Kebab, Tashan Butter Chicken, Wood-Fired Neapolitan Pizzas, Sizzlers & Decadent Milkshakes.',
      best_time_to_visit: '1:00 PM – 4:00 PM (Leisurely lunch) & 7:00 PM – 12:30 AM (Vibrant lounge dinner vibes)',
      nearest_metro: 'Punjabi Bagh West Metro Station (Pink Line) & Shivaji Park Metro (Green Line)',
      parking_tips: 'Club Road has designated valet parking at all major establishments; avoid double parking on the main road.',
      avg_cost_for_two: 1300,
      sub_guide_filters: [
        'Artisan North Indian & Mughlai',
        'Rooftops & Cocktail Lounges',
        'Italian & Wood-Fired Pizza',
        'Dessert Bars & Bakeries'
      ],
      famous_dishes: [
        {
          name: 'Artisan Dahi Ke Kebab',
          why_famous: 'Velvety hung curd patties spiced with green cardamom and fresh herbs crisped to a golden crunch.',
          restaurant_name: 'Tashan - Artisan Dine',
          price: 345,
          image_url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        },
        {
          name: 'Verandah Special Dal Makhani',
          why_famous: 'Slow-simmered over charcoal for 24 hours with fresh churned white butter.',
          restaurant_name: 'Verandah Moonshine',
          price: 395,
          image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80',
          is_veg: true,
        }
      ]
    }
  }
];

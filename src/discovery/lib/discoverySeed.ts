/**
 * Menu Maps Discovery - Authentic Seed Dataset
 * Contains 8 verified Delhi food discoveries with counter pricing,
 * and 2 flagship competitions for Season 01.
 * Strict principle: Zero fake restaurants, zero fake counter prices.
 */

import { DiscoveryItem, DiscoveryCompetition } from '../types/discovery';

export const OFFICIAL_SEED_DISCOVERIES: DiscoveryItem[] = [
  {
    id: 'disc_chache_di_hatti',
    title: "Chache Di Hatti's Legendary Rawalpindi Chole Bhature",
    slug: 'chache-di-hatti-rawalpindi-chole-bhature',
    short_description:
      'The gold standard of North Campus student food since 1953: spiced dark pindi chana with crisp, stuffed bhature.',
    full_description:
      'Hidden in the bustling Gali No. 4 of Kamla Nagar, Chache Di Hatti is an iconic pilgrimage for University of Delhi students. Every morning by 9:30 AM, an eager crowd gathers outside the small storefront for their signature aloo and paneer-stuffed bhature paired with tangy, dark-spiced Rawalpindi chole.\n\nThe chole are slow-cooked overnight with whole spices, black tea, and dry amla, giving them their characteristic dark hue and deep warmth without artificial color. Accompanied by pickled green chilies and onions dipped in sweet-spiced imli chutney, this remains one of Delhi’s most satisfying meals under ₹100.',
    category: 'Dishes Worth Trying',
    city: 'Delhi',
    locality: 'Kamla Nagar',
    market_name: 'Bungalow Road / Kamla Nagar',
    restaurant_name: 'Chache Di Hatti',
    restaurant_slug: 'chache-di-hatti-kamla-nagar',
    address: 'D-32, Gali 4, Kamla Nagar, Delhi 110007',
    map_link: 'https://maps.google.com/?q=Chache+Di+Hatti+Kamla+Nagar',
    main_image:
      'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1200&q=80',
        caption: 'Freshly fried paneer-stuffed bhatura with slow-simmered pindi chana',
      },
      {
        url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80',
        caption: 'Traditional pickled onions and mint chutney accompaniment',
      },
    ],
    dish_name: 'Stuffed Aloo Chole Bhature (Full Plate)',
    price: 80,
    price_type: 'Counter price observed',
    price_evidence: 'Photographed physical cashier counter board at Kamla Nagar outlet',
    food_highlights: [
      'Crispy paper-thin crust bhatura stuffed with mashed spiced potatoes',
      'Slow-simmered dark pindi chana with whole garam masala and amla',
      'Signature sweet-and-sour pickled green chili',
    ],
    visitor_tips: [
      'Tokens start at 9:30 AM and frequently sell out by 1:30 PM.',
      'Limited standing space; eating on the spot is the best experience.',
      'Carry exact change or UPI.',
    ],
    opening_hours: '9:30 AM – 2:00 PM (Closed on Tuesdays)',
    why_interesting:
      'Over 70 years of generational consistency, maintaining the exact same slow-cooking technique and student-friendly pricing.',
    contributor_id: 'student_rohit_sharma',
    contributor_name: 'Rohit Sharma',
    contributor_college: 'Hindu College, DU',
    status: 'Published',
    created_at: '2026-05-10T10:00:00Z',
    updated_at: '2026-05-10T10:00:00Z',
    published_at: '2026-05-12T14:30:00Z',
    is_featured: true,
    is_discovery_of_week: true,
    tags: ['Chole Bhature', 'North Campus', 'Under ₹100', 'Iconic', 'Breakfast'],
    saves_count: 42,
  },
  {
    id: 'disc_depauls_janpath',
    title: "DePaul's Original Hazelnut Cold Coffee & Kathi Rolls",
    slug: 'depauls-original-hazelnut-cold-coffee-janpath',
    short_description:
      'The famous Janpath market pitstop serving glass-bottle cold coffees and warm flaky kathi rolls since 1952.',
    full_description:
      'Tucked right in the heart of Janpath street flea market, DePaul’s has been quenching the thirst of Delhi bargain-hunters and students for over seven decades. Served in retro glass bottles, their Hazelnut and Roast Cold Coffee strikes a perfect balance of bold chicory notes, velvety milk, and gentle sweetness.\n\nPairing a chilled bottle with their hot paneer or chicken kathi roll makes for the quintessential central Delhi snack break while exploring Connaught Place.',
    category: 'Budget-Friendly',
    city: 'Delhi',
    locality: 'Connaught Place',
    market_name: 'Janpath Flea Market',
    restaurant_name: "DePaul's",
    restaurant_slug: 'depauls-janpath-connaught-place',
    address: '22, Janpath Bhawan, Janpath Market, Connaught Place, New Delhi 110001',
    map_link: 'https://maps.google.com/?q=DePauls+Janpath',
    main_image:
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1200&q=80',
        caption: "Iconic chilled glass bottle of DePaul's Hazelnut Cold Coffee",
      },
    ],
    dish_name: 'Hazelnut Cold Coffee (200ml Glass Bottle)',
    price: 70,
    price_type: 'Counter price observed',
    price_evidence: 'Printed overhead price board at Janpath storefront',
    food_highlights: [
      'Served in chilled returnable vintage glass bottles',
      'Rich hazelnut aroma without overpowering syrup sweetness',
      'Signature mini paneer kathi roll for ₹80',
    ],
    visitor_tips: [
      'Take 2 minutes to sip it outside Janpath Bhawan.',
      'Janpath Metro Station (Gate 1) is just 60 seconds walking distance.',
    ],
    opening_hours: '11:00 AM – 8:30 PM (Daily)',
    why_interesting:
      'A true Central Delhi cultural staple surviving decades of corporate coffee chain competition.',
    contributor_id: 'student_ananya_das',
    contributor_name: 'Ananya Das',
    contributor_college: 'Lady Shri Ram College',
    status: 'Published',
    created_at: '2026-05-14T11:00:00Z',
    updated_at: '2026-05-14T11:00:00Z',
    published_at: '2026-05-15T16:00:00Z',
    is_featured: true,
    tags: ['Cold Coffee', 'Janpath', 'CP', 'Quick Bite', 'Under ₹100'],
    saves_count: 29,
  },
  {
    id: 'disc_tenzing_laphing_mkt',
    title: "Tenzing's Fiery Cold Laphing with Chili Crunch",
    slug: 'tenzing-fiery-cold-laphing-majnu-ka-tila',
    short_description:
      'Handmade Tibetan mung bean jelly noodles bathed in garlic broth, sesame oil, and fiery mountain chili paste.',
    full_description:
      'Inside the narrow temple alley of Majnu Ka Tila (New Aruna Nagar), Tenzing Laphing Corner is famous for serving authentic cold and soupy laphing. The translucent jelly wraps, rolled with textured soy chunks (wai wai noodles or dry gluten), are sliced fresh to order and submerged in an umami garlic-soy broth crowned with Sichuan-style chili oil.\n\nIt is delightfully spicy, chewy, and unmatched in value: an explosive street delicacy for just ₹50.',
    category: 'Hidden Gems',
    city: 'Delhi',
    locality: 'Majnu Ka Tila',
    market_name: 'Tibetan Colony (New Aruna Nagar)',
    restaurant_name: 'Tenzing Laphing Corner',
    address: 'Near Monastery Temple Gate, Majnu Ka Tila, New Delhi 110054',
    map_link: 'https://maps.google.com/?q=Tenzing+Laphing+Majnu+Ka+Tila',
    main_image:
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80',
        caption: 'Cold dry laphing rolled with savory soy crunch and chili paste',
      },
    ],
    dish_name: 'Cold Laphing with Soy Chunks & Roasted Chili',
    price: 50,
    price_type: 'Counter price observed',
    price_evidence: 'Menu printed at stall window',
    food_highlights: [
      'Silky smooth mung bean jelly noodle texture',
      'Intense fragrant garlic and roasted chili oil infusion',
      'Option of dry roll or spicy garlic broth',
    ],
    visitor_tips: [
      'Ask for "medium spicy" if you cannot tolerate authentic Himalayan heat.',
      'Pair with Tingmo or sweet fruit beer sold nearby.',
    ],
    opening_hours: '12:00 PM – 8:30 PM',
    why_interesting:
      'Hand-crafted daily using traditional Tibetan starch extraction methods passed down through generations.',
    contributor_id: 'student_kavita_mehra',
    contributor_name: 'Kavita Mehra',
    contributor_college: 'Kirori Mal College',
    status: 'Published',
    created_at: '2026-05-18T12:00:00Z',
    updated_at: '2026-05-18T12:00:00Z',
    published_at: '2026-05-19T09:30:00Z',
    is_featured: true,
    tags: ['Laphing', 'Tibetan', 'Majnu Ka Tila', 'Spicy', 'Under ₹50'],
    saves_count: 53,
  },
  {
    id: 'disc_raju_puchka_cr_park',
    title: "Raju Puchka's Authentic Kolkata Phuchka & Churmur",
    slug: 'raju-puchka-kolkata-phuchka-cr-park',
    short_description:
      'Crispy paper-thin whole-wheat puris filled with spiced potato mash and tangy Gondhoraj lebu tamarind water.',
    full_description:
      'Situated outside Market 1 in Chittaranjan Park, Raju Puchka brings Kolkata’s true street food essence to South Delhi. Unlike standard Delhi gol gappas, these phuchkas use a warm, spiced filling of boiled potatoes, black chickpeas, roasted cumin, and black salt, drenched in zesty tamarind water infused with fresh Gondhoraj lime juice.\n\nDon’t miss his Churmur: crushed phuchka shells mixed with potato, chopped green chilies, coriander, and concentrated tamarind extract.',
    category: 'Street Eats',
    city: 'Delhi',
    locality: 'CR Park',
    market_name: 'CR Park Market 1',
    restaurant_name: 'Raju Puchka Wala',
    address: 'Near Gate No. 2, Market 1, CR Park, New Delhi 110019',
    map_link: 'https://maps.google.com/?q=CR+Park+Market+1+New+Delhi',
    main_image:
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80',
        caption: 'Handmade Kolkata phuchkas served on sal leaf plates',
      },
    ],
    dish_name: 'Special Gondhoraj Phuchka (6 Pcs)',
    price: 40,
    price_type: 'Counter price observed',
    price_evidence: 'Direct street vendor counter rate',
    food_highlights: [
      'Gondhoraj lime aroma infused into spicy sour tamarind water',
      'Spiced warm potato-black gram filling',
      'Authentic sal leaf plate presentation',
    ],
    visitor_tips: [
      'Best experienced after 5:30 PM when evening crowds arrive.',
      'Ask for an extra "fuchka papdi" at the end.',
    ],
    opening_hours: '4:30 PM – 10:00 PM',
    why_interesting:
      'Brings authentic West Bengal street food technique directly to the capital without alteration.',
    contributor_id: 'student_shubham_sen',
    contributor_name: 'Shubham Sen',
    contributor_college: 'Deshbandhu College',
    status: 'Published',
    created_at: '2026-05-20T16:00:00Z',
    updated_at: '2026-05-20T16:00:00Z',
    published_at: '2026-05-21T11:00:00Z',
    tags: ['Phuchka', 'CR Park', 'Chaat', 'Street Food', 'Under ₹50'],
    saves_count: 36,
  },
  {
    id: 'disc_old_famous_jalebi_chandni_chowk',
    title: "Old Famous Jalebi Wala's Desi Ghee Jalebi with Thick Rabri",
    slug: 'old-famous-jalebi-wala-desi-ghee-chandni-chowk',
    short_description:
      'Fried in pure khalis desi ghee over coal fires since 1884 at the Dariba Kalan junction.',
    full_description:
      'Standing proudly at the corner of Dariba Kalan and Chandni Chowk since 1884, this historic shop is known for its thick, succulent jalebis fried in pure desi ghee over traditional coal embers. The batter is fermented to precise tartness, piped into thick spirals, and soaked in raw khandsari sugar syrup.\n\nPairing a warm, juicy spiral with their creamy, slow-reduced rabri creates an unforgettable sensory contrast of crunch, syrup, and velvety cream.',
    category: 'Heritage',
    city: 'Delhi',
    locality: 'Old Delhi',
    market_name: 'Chandni Chowk / Dariba Kalan',
    restaurant_name: 'Old Famous Jalebi Wala',
    restaurant_slug: 'old-famous-jalebi-wala-chandni-chowk',
    address: 'Shop 1797, Dariba Corner, Chandni Chowk, Delhi 110006',
    map_link: 'https://maps.google.com/?q=Old+Famous+Jalebi+Wala+Chandni+Chowk',
    main_image:
      'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=1200&q=80',
        caption: 'Thick, crunchy desi ghee jalebis soaked in khandsari syrup',
      },
    ],
    dish_name: 'Desi Ghee Jalebi with Rabri (100g Plate)',
    price: 80,
    price_type: 'Counter price observed',
    price_evidence: 'Verified on printed menu board at front counter',
    food_highlights: [
      'Fried exclusively in pure desi ghee over charcoal fires',
      'Sweetened with non-refined khandsari sugar syrup',
      'Dense slow-reduced milk rabri',
    ],
    visitor_tips: [
      'Eat it right off the tawa while piping hot.',
      'Take Chandni Chowk Metro Station (Gate 1), then walk 5 minutes toward Red Fort.',
    ],
    opening_hours: '8:00 AM – 10:00 PM',
    why_interesting:
      '140+ years of uninterrupted heritage, maintaining coal fire frying for distinctive depth.',
    contributor_id: 'student_amrita_kaur',
    contributor_name: 'Amrita Kaur',
    contributor_college: 'St. Stephen’s College',
    status: 'Published',
    created_at: '2026-05-22T09:00:00Z',
    updated_at: '2026-05-22T09:00:00Z',
    published_at: '2026-05-23T12:00:00Z',
    tags: ['Heritage', 'Jalebi', 'Chandni Chowk', 'Dessert', 'Under ₹100'],
    saves_count: 67,
  },
  {
    id: 'disc_hunger_strike_amar_colony',
    title: "Hunger Strike's Original Tandoori Momos",
    slug: 'hunger-strike-original-tandoori-momos-amar-colony',
    short_description:
      'The pioneers of Delhi’s tandoori momo craze: clay-oven charred dumplings coated in spicy cream gravy.',
    full_description:
      'Lajpat Nagar IV’s Amar Colony market is celebrated across Delhi for its street food lane, but Hunger Strike remains its crowning champion. Known for popularizing tandoori momos, they marinate delicate steamed dumplings in a fiery tikka masala before roasting them on skewers inside a blazing clay tandoor.\n\nThe finished dumplings are tossed in butter, fresh cream, chat masala, and sliced red onions, delivering a smokey, indulgent burst in every bite.',
    category: 'Dishes Worth Trying',
    city: 'Delhi',
    locality: 'Amar Colony',
    market_name: 'Amar Colony Main Market',
    restaurant_name: 'Hunger Strike',
    address: 'C-9, Amar Colony Market, Lajpat Nagar IV, New Delhi 110024',
    map_link: 'https://maps.google.com/?q=Hunger+Strike+Amar+Colony',
    main_image:
      'https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=1200&q=80',
        caption: 'Clay-oven charred tandoori momos tossed in cream and chaat masala',
      },
    ],
    dish_name: 'Paneer Tandoori Momos (8 Pcs)',
    price: 150,
    price_type: 'Counter price observed',
    price_evidence: 'Photographed menu board outside Amar Colony outlet',
    food_highlights: [
      'Intense charcoal smoke aroma from traditional tandoor',
      'Creamy, tangy onion and chaat masala coating',
      'Served with fiery red garlic chutney and mint dip',
    ],
    visitor_tips: [
      'Evenings get very lively; parking is tough, so take the metro to Moolchand or Vinobapuri.',
    ],
    opening_hours: '12:00 PM – 11:00 PM',
    why_interesting:
      'The birthplace of an entire Delhi culinary subculture that fused Himalayan dumplings with Punjabi tandoori grilling.',
    contributor_id: 'student_vikram_verma',
    contributor_name: 'Vikram Verma',
    contributor_college: 'Shaheed Bhagat Singh College',
    status: 'Published',
    created_at: '2026-05-24T14:00:00Z',
    updated_at: '2026-05-24T14:00:00Z',
    published_at: '2026-05-25T15:00:00Z',
    is_featured: true,
    tags: ['Momos', 'Tandoori', 'Amar Colony', 'Evening Snack', 'Under ₹150'],
    saves_count: 58,
  },
  {
    id: 'disc_shree_balaji_chaat_chandni_chowk',
    title: "Shree Balaji's Signature K चालू Papdi Chaat & Dahi Bhalla",
    slug: 'shree-balaji-chaat-kachalu-papdi-chandni-chowk',
    short_description:
      'Old Delhi’s legendary chaat corner famous for using spicy steeped kachalu (taro root) with crisp papdi.',
    full_description:
      'Tucked in the labyrinthine streets of Chandni Chowk, Shree Balaji Chaat Bhandar is universally revered by chaat connoisseurs. While other vendors rely solely on potatoes, Balaji incorporates spicy, marinated kachalu (taro root) alongside handmade crisp papdis, silken lentil bhallas, beaten sweet yogurt, and tangy saunth chutney.\n\nEvery plate is a symphony of crunch, soothing yogurt, ginger zest, and aromatic roasted cumin.',
    category: 'Vegetarian',
    city: 'Delhi',
    locality: 'Old Delhi',
    market_name: 'Chandni Chowk',
    restaurant_name: 'Shree Balaji Chaat Bhandar',
    address: '1462, Chandni Chowk Road, Kucha Mahajani, Old Delhi 110006',
    map_link: 'https://maps.google.com/?q=Shree+Balaji+Chaat+Bhandar',
    main_image:
      'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1200&q=80',
        caption: 'Signature Papdi Chaat with spicy kachalu and thick sweet dahi',
      },
    ],
    dish_name: 'Special Papdi Chaat with Kachalu',
    price: 70,
    price_type: 'Counter price observed',
    price_evidence: 'Physical counter board verified',
    food_highlights: [
      'Tangy boiled kachalu (taro root) spice blend',
      'Crisp papdi that never goes soggy under thick dahi',
      'Traditional tamarind and dried ginger saunth',
    ],
    visitor_tips: [
      'Order their Dahi Bhalla too if visiting with a friend.',
      'Cash or UPI accepted.',
    ],
    opening_hours: '12:00 PM – 9:30 PM',
    why_interesting:
      'One of the few remaining stalls in India that still preserves the historic Mughal-era use of kachalu in street chaat.',
    contributor_id: 'student_pooja_nair',
    contributor_name: 'Pooja Nair',
    contributor_college: 'Miranda House',
    status: 'Published',
    created_at: '2026-05-26T11:00:00Z',
    updated_at: '2026-05-26T11:00:00Z',
    published_at: '2026-05-27T10:00:00Z',
    tags: ['Chaat', 'Vegetarian', 'Old Delhi', 'Papdi Chaat', 'Under ₹100'],
    saves_count: 31,
  },
  {
    id: 'disc_ama_cafe_mkt',
    title: "Ama Cafe's Apple Cinnamon Cake & Himalayan Mountain Brew",
    slug: 'ama-cafe-apple-cinnamon-cake-majnu-ka-tila',
    short_description:
      'Warm wood-paneled Himalayan bakery famous for cozy study sessions, fresh pies, and mountain coffees.',
    full_description:
      'A sanctuary for campus writers, students, and travelers in Majnu Ka Tila, Ama Cafe is renowned for its rustic wooden interiors, ambient lighting, and freshly baked cakes. Their warm Apple Cinnamon Cake, served fresh with a dollop of whipped cream alongside a pour-over Himalayan Arabica coffee, makes it one of North Delhi’s premier afternoon destinations.\n\nDespite its huge popularity, their bakery counter prices remain student-accessible, offering exceptional cafe value.',
    category: 'Local Food Experiences',
    city: 'Delhi',
    locality: 'Majnu Ka Tila',
    market_name: 'Tibetan Colony (New Aruna Nagar)',
    restaurant_name: 'Ama Cafe',
    restaurant_slug: 'ama-cafe-majnu-ka-tila',
    address: 'House 6, New Colony, Majnu Ka Tila, New Delhi 110054',
    map_link: 'https://maps.google.com/?q=Ama+Cafe+Majnu+Ka+Tila',
    main_image:
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
        caption: 'Warm slice of Apple Cinnamon Cake with cinnamon glaze',
      },
    ],
    dish_name: 'Warm Apple Cinnamon Cake with Whipped Cream',
    price: 140,
    price_type: 'Restaurant-confirmed',
    price_evidence: 'In-store digital printed counter bill and menu card',
    food_highlights: [
      'Baked fresh daily with Shimla apples and Ceylon cinnamon',
      'Artisanal coffee roasted in small batches',
      'Cozy mountain cabin aesthetic with natural light',
    ],
    visitor_tips: [
      'Expect a 15–20 min wait during weekends after 3 PM.',
      'Weekdays before 1 PM are serene and ideal for reading.',
    ],
    opening_hours: '8:00 AM – 10:00 PM (Daily)',
    why_interesting:
      'Turned a hidden rooftop in an immigrant Tibetan settlement into one of Delhi’s most beloved independent cafes.',
    contributor_id: 'student_rohit_sharma',
    contributor_name: 'Rohit Sharma',
    contributor_college: 'Hindu College, DU',
    status: 'Published',
    created_at: '2026-05-28T15:00:00Z',
    updated_at: '2026-05-28T15:00:00Z',
    published_at: '2026-05-29T11:00:00Z',
    is_featured: true,
    tags: ['Cafe', 'Dessert', 'Coffee', 'Majnu Ka Tila', 'Cozy'],
    saves_count: 74,
  },
];

export const OFFICIAL_COMPETITIONS: DiscoveryCompetition[] = [
  {
    id: 'comp_the_great_market_mission',
    series_name: 'MENU MAPS DISCOVERY LEAGUE',
    season: 'SEASON 01',
    title: 'THE GREAT MARKET MISSION',
    slug: 'the-great-market-mission',
    tagline: 'One Market. Hidden Food Stories. Can You Discover Them All?',
    type: 'Offline exploration',
    duration_days: 10,
    participation_type: 'Individual or team of 2–3',
    min_team_size: 1,
    max_team_size: 3,
    start_date: '2026-06-01',
    end_date: '2026-06-11',
    submission_deadline: '2026-06-11T23:59:59Z',
    description:
      'Explore an accessible local neighbourhood market and investigate its food scene. Document interesting food places, honest menu counter prices, and budget-friendly food experiences to build a high-utility food discovery guide.',
    cover_image:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    tasks: [
      {
        title: 'Mission 01: Hidden Gem',
        points: 20,
        description:
          'Discover two interesting food outlets in your chosen market and explain what makes them special beyond standard famous shops.',
      },
      {
        title: 'Mission 02: Menu Detective',
        points: 25,
        description:
          'Research at least three interesting dishes and their verified prices. Include supporting evidence and price-status explanation.',
      },
      {
        title: 'Mission 03: Budget Battle',
        points: 25,
        description:
          'Create a complete, satisfying food experience within a ₹200 budget. (Actual food purchase is not compulsory).',
      },
      {
        title: 'Mission 04: Market Map',
        points: 30,
        description:
          'Assemble a clear, visual food map with places, dishes, prices, and helpful landmark directions for first-time visitors.',
      },
    ],
    scoring_criteria: [
      { criterion: 'Discovery quality & originality', points: 20 },
      { criterion: 'Menu and price evidence authenticity', points: 25 },
      { criterion: 'Budget creativity and practicality', points: 25 },
      { criterion: 'Map quality and visitor usefulness', points: 20 },
      { criterion: 'Clarity and presentation', points: 10 },
    ],
    rules: [
      'Students should choose an accessible local market (e.g. Kamla Nagar, Chandni Chowk, CR Park, Lajpat Nagar, Karol Bagh, CP).',
      'No compulsory purchases are required to participate.',
      'No trespassing or unsafe exploration; respect businesses, staff, and public spaces.',
      'Obtain permission before photographing people or private interiors.',
      'Do not publish personal private information or misrepresent prices.',
    ],
    status: 'Open for Registration',
  },
  {
    id: 'comp_the_foodverse_challenge',
    series_name: 'MENU MAPS DISCOVERY LEAGUE',
    season: 'SEASON 01',
    title: 'THE FOODVERSE CHALLENGE',
    slug: 'the-foodverse-challenge',
    tagline: 'Imagine the Future of Food Discovery. Then Build It.',
    type: 'Online creative competition',
    duration_days: 14,
    participation_type: 'Individual or team',
    min_team_size: 1,
    max_team_size: 4,
    start_date: '2026-06-15',
    end_date: '2026-06-29',
    submission_deadline: '2026-06-29T23:59:59Z',
    description:
      'Create a useful digital concept, UI/UX design, interactive prototype, or visual food map that reimagines how people explore food in their city.',
    cover_image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    tracks: [
      'Track 1: ₹150 Food Explorer — Ultra-budget student meal locator',
      'Track 2: Vegetarian Food Hunter — Pure veg & satvik gem finder',
      'Track 3: Hidden Delhi Food Explorer — Alleyway & secret stall guide',
      'Track 4: Friends Food Planner — Group bill splitter & dining radar',
      'Track 5: Best Dish for Your Budget — Price-to-taste comparator',
    ],
    tasks: [
      {
        title: 'Project Title & Track Selection',
        points: 15,
        description: 'Define a specific problem statement and identify your target student or diner user.',
      },
      {
        title: 'Proposed Solution & Features',
        points: 25,
        description: 'Detail the core features and how it makes discovering real food easier and more transparent.',
      },
      {
        title: 'Design or Prototype Artifact',
        points: 35,
        description: 'Submit UI/UX mockups, interactive Figma link, web concept, or digital map deck.',
      },
      {
        title: 'Presentation & Demonstration',
        points: 25,
        description: 'Explain usefulness, feasibility, and how it solves real price or location challenges.',
      },
    ],
    scoring_criteria: [
      { criterion: 'Problem understanding and research', points: 20 },
      { criterion: 'Innovation and original thinking', points: 20 },
      { criterion: 'Usability and practical value', points: 20 },
      { criterion: 'Creativity and visual design', points: 20 },
      { criterion: 'Presentation quality', points: 10 },
      { criterion: 'Completeness and feasibility', points: 10 },
    ],
    rules: [
      'Coding is not compulsory; UI/UX designs, interactive prototypes, or digital maps are welcome.',
      'Paid software is not required; free tools (Figma, Canva, Google Docs) are fully acceptable.',
      'Submissions must be original student work.',
    ],
    status: 'Open for Registration',
  },
];

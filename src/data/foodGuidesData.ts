/**
 * High-Intent Food Decision Guides Catalog & Editorial Intelligence
 * Powers /guides and /guides/:slug with deep real-data backing,
 * rich SEO schema (Article, ItemList, FAQPage, BreadcrumbList),
 * and transparent counter-rate price tracking.
 */

export interface GuideFaq {
  q: string;
  a: string;
}

export interface GuideSection {
  heading: string;
  body: string;
  highlightPill?: string;
}

export interface FoodGuideItem {
  slug: string;
  title: string;
  shortTitle: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  heroImage: string;
  badge: string;
  badgeColor: string;
  readTime: string;
  publishedDate: string;
  updatedDate: string;
  summary: string;
  hookHeadline: string;
  introSections: GuideSection[];
  editorialTips: string[];
  filterTags: string[];
  queryCriteria: {
    categories?: string[];
    maxPrice?: number;
    diet?: 'all' | 'veg' | 'non_veg';
    keywords?: string[];
    dishSlugs?: string[];
    restaurantSlugs?: string[];
  };
  faqs: GuideFaq[];
}

export const FOOD_GUIDES: FoodGuideItem[] = [
  {
    slug: 'what-to-eat-today',
    title: 'What to Eat Today in Delhi NCR? The Ultimate Decision Guide (Real Menus & Counter Rates)',
    shortTitle: 'What to Eat Today',
    metaTitle: 'What to Eat Today in Delhi NCR? (50+ Real Dishes & Counter Rates) | Menu Maps',
    metaDescription: 'Stuck on what to eat today? Explore Delhi NCR’s best curated dishes with authentic in-store counter prices, direct WhatsApp ordering, and zero delivery app markups on Menu Maps.',
    keywords: [
      'what to eat today',
      'what should i eat today',
      'food ideas today',
      'what to eat in delhi',
      'food decision maker delhi',
      'lunch ideas delhi',
      'dinner ideas today'
    ],
    heroImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
    badge: 'Daily Decision',
    badgeColor: 'bg-emerald-500 text-white',
    readTime: '4 min read',
    publishedDate: '2026-11-16',
    updatedDate: '2026-11-16',
    summary: 'Decision fatigue is real. Here is your definitive mood-based roadmap to beat hunger today with authentic, verified counter rates across 770+ Delhi NCR cafes.',
    hookHeadline: 'Stop Scrolling Endlessly. Pick Your Craving & Eat Smarter Today.',
    introSections: [
      {
        heading: 'The 3:00 PM Dilemma: Why Deciding What to Eat Feels Exhausting',
        body: 'Whether it is lunch during a busy workday or an evening bite after college, everyone experiences meal decision fatigue. Delivery apps flood your screen with 500 options, 30% hidden markups, and ₹60 platform fees. On Menu Maps, we solve this by showing real, chef-crafted in-store dishes at genuine counter rates.',
        highlightPill: 'Zero Markup Direct Dining'
      },
      {
        heading: 'How to Choose Your Meal Based on Your Current Mood',
        body: 'If you want something quick and energizing, roll with steamed momos or loaded wraps under ₹140. If you are seeking comfort, dive into buttery dal makhani, creamy white sauce pasta, or crispy thin-crust pizzas. Use our interactive Craving Shuffler below to discover your perfect match instantly.',
        highlightPill: 'Interactive Decision Helper'
      }
    ],
    editorialTips: [
      'Always check the direct counter rate vs delivery app rates to save ₹50–₹90 per bill.',
      'For midday focus, opt for high-protein items like paneer tikka rolls or grilled chicken sandwiches.',
      'Traveling via Delhi Metro? Many of our featured spots are within 250 meters of Yellow and Blue line stations.'
    ],
    filterTags: ['All Cravings', 'Under ₹150', 'Comfort Carbs', 'Pure Veg', 'Spicy Street', 'Sweet Tooth'],
    queryCriteria: {
      maxPrice: 350,
      keywords: ['paneer', 'makhani', 'pasta', 'pizza', 'burger', 'momos', 'roll', 'shake', 'tikka', 'biryani']
    },
    faqs: [
      {
        q: 'How does Menu Maps help me decide what to eat today?',
        a: 'Menu Maps curates real dishes from 770+ verified Delhi NCR restaurants and cafes. You can filter by mood, budget, and dietary preference, and view the original counter price without 20-30% delivery app markups.'
      },
      {
        q: 'Can I order directly from the featured restaurants?',
        a: 'Yes! Menu Maps provides 0% commission direct WhatsApp ordering. You message the cafe counter directly to place pick-up, takeaway, or dine-in orders with zero extra fees.'
      },
      {
        q: 'What are the most popular quick meals under ₹200 in Delhi?',
        a: 'Crispy Kathi rolls, butter chicken/paneer kulcha platters, steamed dim sums, artisanal cold coffees, and stone-baked personal pizzas are the top-rated meals under ₹200 across Delhi NCR.'
      },
      {
        q: 'Are the menu prices shown 100% authentic?',
        a: 'Yes, Menu Maps conducts ground counter audits to record the exact in-store prices displayed on physical counter menus, ensuring complete transparency.'
      }
    ]
  },
  {
    slug: 'food-ideas-for-dinner',
    title: 'Top Food Ideas for Dinner in Delhi NCR (Cozy Dine-In, Quick Takeaways & Hearty Feasts)',
    shortTitle: 'Food Ideas for Dinner',
    metaTitle: 'Food Ideas for Dinner in Delhi NCR: 40+ Hearty Dishes & Counter Menus | Menu Maps',
    metaDescription: 'Looking for food ideas for dinner? Discover top dinner dishes across Delhi NCR: rich curries, biryanis, pastas, and bowls with transparent counter rates on Menu Maps.',
    keywords: [
      'food ideas for dinner',
      'dinner ideas delhi',
      'what to eat for dinner',
      'best dinner places in delhi',
      'family dinner food ideas',
      'budget dinner under 200'
    ],
    heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    badge: 'Dinner Cravings',
    badgeColor: 'bg-indigo-600 text-white',
    readTime: '5 min read',
    publishedDate: '2026-11-16',
    updatedDate: '2026-11-16',
    summary: 'Wrap up your day with satisfying dinner ideas that balance flavor, comfort, and real honest value across top Delhi neighborhoods.',
    hookHeadline: 'Dinner Ideas That Hit the Spot Without the 30% Delivery Surcharge.',
    introSections: [
      {
        heading: 'Why Dinner Demands Real Quality & Flavor',
        body: 'Dinner is when you unwind, catch up with friends or family, and reward yourself after a long day. Whether you prefer a peaceful dine-in experience or an easy counter pickup on your commute home, your dinner should be fresh, hot, and fairly priced.',
        highlightPill: 'Chef-Crafted Dinners'
      },
      {
        heading: 'Top Dinner Themes in Delhi NCR',
        body: 'North Indian feasts (like slow-simmered Dal Bukhara and soft garlic naans), aromatic Dum Biryani pots, Italian wood-fired sourdough pizzas, and Indo-Chinese sizzler platters are the most loved dinner choices across Delhi.',
        highlightPill: 'Feast by Vibe'
      }
    ],
    editorialTips: [
      'Order directly via WhatsApp 15 minutes before reaching the cafe to have your hot meal waiting at the counter.',
      'Sharing with family? Combo platters and handi biryanis save up to 25% compared to individual single portions.',
      'Look for restaurants with the "Smart Review Shield" badge to enjoy verified kitchen hygiene.'
    ],
    filterTags: ['All Dinners', 'North Indian Feast', 'Biryani Pots', 'Pasta & Pizza', 'Pure Veg', 'Late Night'],
    queryCriteria: {
      maxPrice: 450,
      keywords: ['biryani', 'dal', 'paneer', 'chicken', 'pasta', 'pizza', 'gravy', 'curry', 'thali', 'kebab']
    },
    faqs: [
      {
        q: 'What is a good lightweight dinner idea under ₹200 in Delhi?',
        a: 'Healthy options include grilled paneer or chicken wraps, clear noodle bowls, steamed Tibetan momos, and fresh Mediterranean mezze platters available across Hudson Lane, Satya Niketan, and CP.'
      },
      {
        q: 'Which areas in Delhi have the best family dinner dining spots?',
        a: 'Connaught Place, Khan Market, Rajouri Garden, and Greater Kailash offer exceptional family dining spots with verified in-store menus on Menu Maps.'
      },
      {
        q: 'How can I avoid overpaying for dinner delivery?',
        a: 'Order directly through Menu Maps WhatsApp integration to get the real store counter rate without delivery app commissions, surge pricing, or platform convenience charges.'
      }
    ]
  },
  {
    slug: 'best-food-near-me',
    title: 'Best Food Near Me in Delhi NCR: Top Neighborhood Cafes & Hidden Counter Gems',
    shortTitle: 'Best Food Near Me',
    metaTitle: 'Best Food Near Me in Delhi NCR: 770+ Verified Cafes & Counter Rates | Menu Maps',
    metaDescription: 'Find the best food near you in Delhi NCR. Explore top-rated neighborhood dining spots, original counter menus, walking directions, and honest prices on Menu Maps.',
    keywords: [
      'best food near me',
      'best cafes near me',
      'food places near me',
      'good restaurants near me delhi',
      'hidden food gems delhi',
      'best dining spots near me'
    ],
    heroImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    badge: 'Hyper-Local',
    badgeColor: 'bg-rose-500 text-white',
    readTime: '4 min read',
    publishedDate: '2026-11-16',
    updatedDate: '2026-11-16',
    summary: 'Discover hidden culinary gems right in your neighborhood. Real local cafes with authentic menus, metro walking directions, and transparent pricing.',
    hookHeadline: 'Explore Delhi NCR’s Real Neighborhood Gems Just Minutes from Your Location.',
    introSections: [
      {
        heading: 'Skip the Commercial Chains, Support Authentic Local Cafes',
        body: 'Delhi NCR is packed with extraordinary independent cafes, heritage bakeries, and mom-and-pop food counters that serve dishes far superior to mass-market chains. Menu Maps maps 770+ of these verified dining spots so you can discover amazing local food anywhere in the city.',
        highlightPill: 'Hyper-Local Discovery'
      },
      {
        heading: 'Real Walking Directions & Metro Station Proximity',
        body: 'Every venue on Menu Maps is enriched with walking directions, nearest metro gates, indoor air-conditioning tags, Wi-Fi availability, and counter photos so you know exactly what to expect before you walk through the door.',
        highlightPill: 'Walking & Metro Intel'
      }
    ],
    editorialTips: [
      'Enable location services on Menu Maps to automatically sort cafes by live walking distance.',
      'Look for the "Power Outlets & Wi-Fi" tag if you need a comfortable study or work-from-cafe spot.',
      'Check the Honest Bill Box to see the typical spend per person before heading out.'
    ],
    filterTags: ['All Localities', 'Hudson Lane', 'Majnu Ka Tilla', 'Connaught Place', 'Satya Niketan', 'Green Park', 'Noida'],
    queryCriteria: {
      maxPrice: 400,
      keywords: ['cafe', 'coffee', 'sandwich', 'pasta', 'shake', 'bowl', 'pizza', 'dimsum']
    },
    faqs: [
      {
        q: 'How does Menu Maps locate the best food near me?',
        a: 'Menu Maps uses your browser GPS or your chosen locality (like North Campus, CP, or GK) to calculate exact walking distances to 770+ audited cafes and dining counters.'
      },
      {
        q: 'Are the photos and menus on Menu Maps up to date?',
        a: 'Yes, Menu Maps performs regular ground verifications to capture authentic counter menus, physical store photos, and verified dish rate cards.'
      },
      {
        q: 'Can I find cafes suitable for working or studying?',
        a: 'Absolutely. Look for spots tagged with Wi-Fi, power outlets, and peaceful seating in student addas like GTB Nagar, Vijay Nagar, and Satya Niketan.'
      }
    ]
  },
  {
    slug: 'best-food-under-200',
    title: 'Best Food Under ₹200 in Delhi NCR: 30+ Budget Steals with Zero Delivery Markup',
    shortTitle: 'Food Under ₹200',
    metaTitle: 'Best Food Under ₹200 in Delhi NCR (30+ Pocket-Friendly Steals) | Menu Maps',
    metaDescription: 'Eat lavishly on a student budget. Explore the best food under ₹200 in Delhi NCR with verified counter prices, full meal combos, and zero markup on Menu Maps.',
    keywords: [
      'best food under 200',
      'cheap food in delhi',
      'budget food delhi',
      'pocket friendly food delhi',
      'student food under 150',
      'best budget cafes delhi'
    ],
    heroImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80',
    badge: 'Budget Steals',
    badgeColor: 'bg-amber-500 text-white',
    readTime: '3 min read',
    publishedDate: '2026-11-16',
    updatedDate: '2026-11-16',
    summary: 'Great food doesn’t have to drain your wallet. Feast on authentic Kathi rolls, loaded burgers, creamy pastas, and shakes — all strictly under ₹200.',
    hookHeadline: 'Feast Big on a Student Budget. Delicious Food for Under ₹200 Counter Rate.',
    introSections: [
      {
        heading: 'The Secret to Eating Great on a Budget in Delhi',
        body: 'Delhi NCR is arguably the street food and student cafe capital of the world. In iconic areas like North Campus, South Campus, and CR Park, ₹150 to ₹200 buys you a wholesome, delicious meal that rivals high-end restaurants. The only catch? Delivery apps often push these same ₹150 meals to ₹240 with surge fees.',
        highlightPill: 'Honest Counter Pricing'
      },
      {
        heading: 'What You Can Enjoy for Under ₹200 on Menu Maps',
        body: 'From giant cheese burst burgers and tandoori momos to refreshing cold brews, double egg rolls, and artisanal waffles, our database contains over 2,200 dishes priced under ₹200.',
        highlightPill: '2,200+ Budget Items'
      }
    ],
    editorialTips: [
      'Order directly at the counter or via direct WhatsApp to avoid 25% delivery markups.',
      'Check student combos: many cafes offer burger + fries + beverage deals under ₹199.',
      'Save dishes to your Menu Maps offline bookmarks to browse even without mobile data.'
    ],
    filterTags: ['All Under ₹200', 'Under ₹100', 'Under ₹150', 'Rolls & Wraps', 'Burgers & Fries', 'Shakes & Drinks'],
    queryCriteria: {
      maxPrice: 200,
      keywords: ['roll', 'burger', 'momos', 'fries', 'sandwich', 'shake', 'coffee', 'chaat', 'kulcha', 'maggi']
    },
    faqs: [
      {
        q: 'Where can I find the cheapest and best cafe food in Delhi?',
        a: 'North Campus (Hudson Lane, GTB Nagar) and South Campus (Satya Niketan) offer the highest concentration of high-quality student cafe meals under ₹150–₹200.'
      },
      {
        q: 'How much money do I save ordering directly on Menu Maps vs Zomato/Swiggy?',
        a: 'On a ₹200 meal, customers save approximately ₹50 to ₹75 by ordering at direct counter rates without restaurant markup percentages, delivery fees, and platform convenience charges.'
      }
    ]
  },
  {
    slug: 'late-night-food-delhi',
    title: 'Late Night Food in Delhi NCR: Best Midnight Cravings, 24/7 Counters & Night Addas',
    shortTitle: 'Late Night Food Delhi',
    metaTitle: 'Late Night Food in Delhi NCR: Top Midnight Cafes & Open Counters | Menu Maps',
    metaDescription: 'Craving food past midnight? Explore late-night food in Delhi NCR with verified open hours, hot rolls, loaded burgers, midnight waffles, and counter rates on Menu Maps.',
    keywords: [
      'late night food delhi',
      'midnight food delhi',
      'food places open late night delhi',
      'night cafes in delhi ncr',
      'midnight cravings delhi',
      '24 hours food delhi'
    ],
    heroImage: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80',
    badge: 'Midnight Cravings',
    badgeColor: 'bg-purple-600 text-white',
    readTime: '4 min read',
    publishedDate: '2026-11-16',
    updatedDate: '2026-11-16',
    summary: 'When midnight hunger strikes, don’t settle for cold chips. Discover hot parathas, loaded rolls, midnight burgers, and warm desserts open past 11 PM.',
    hookHeadline: 'Defeat Midnight Hunger with Real Open Counters Across Delhi NCR.',
    introSections: [
      {
        heading: 'The Magic of Delhi NCR After Dark',
        body: 'Whether you are pulling an all-nighter for university exams, working late shifts, or returning from a road trip, Delhi’s late-night food culture has you covered. From 2 AM butter chicken and piping hot egg rolls to gourmet waffles and cold coffees, the city never sleeps hungry.',
        highlightPill: 'Late-Night Addas'
      },
      {
        heading: 'Real Open Timings & Night Menus',
        body: 'Never drive to a closed kitchen again. Menu Maps records verified operational hours so you can confirm which dining spots are serving food past midnight.',
        highlightPill: 'Verified Night Hours'
      }
    ],
    editorialTips: [
      'Night spots around Moolchand, Connaught Place, and Cyber Hub are among the most reliable after midnight.',
      'Check if the cafe offers drive-in counter service so you can collect your food without stepping out in the cold or rain.',
      'WhatsApp direct message the cafe to confirm kitchen closing before driving long distances.'
    ],
    filterTags: ['All Midnight', 'Loaded Rolls', 'Hot Burgers', 'Midnight Shakes', 'Parathas & Maggi', 'Desserts'],
    queryCriteria: {
      maxPrice: 350,
      keywords: ['roll', 'burger', 'paratha', 'maggi', 'shake', 'waffle', 'coffee', 'biryani', 'sandwich']
    },
    faqs: [
      {
        q: 'Which areas in Delhi have food spots open past midnight?',
        a: 'Connaught Place Outer Circle, Moolchand Flyover, Shivaji Stadium, Pandara Road, and DLF Cyber City (Gurgaon) feature several verified counters open late into the night.'
      },
      {
        q: 'Are midnight prices higher than regular daytime prices?',
        a: 'On Menu Maps, cafes display their true counter rates. Many places maintain standard menu pricing without late-night delivery gouging.'
      }
    ]
  }
];

export function getGuideBySlug(slug: string): FoodGuideItem | undefined {
  const norm = slug.toLowerCase().trim();
  return FOOD_GUIDES.find((g) => g.slug.toLowerCase() === norm);
}

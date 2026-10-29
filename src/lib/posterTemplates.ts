export interface PosterTemplate {
  id: string;
  name: string;
  tagline: string;
  category: 'delhi-heritage' | 'fast-food' | 'cafe-cozy' | 'festive';
  badge: string;
  isNew?: boolean;
  thumbnailUrl: string;
  imageUrl: string;
  dimensions: {
    width: number;
    height: number;
  };
  qrBox: {
    x: number;
    y: number;
    width: number;
    height: number;
    borderRadius?: number;
    padding?: number;
  };
  restaurantNameBox: {
    x: number;
    y: number;
    width: number;
    height: number;
    fontFamily: string;
    fontWeight: string | number;
    color: string;
    secondaryColor?: string;
    maxFontSize: number;
    minFontSize: number;
    align: 'center' | 'left' | 'right';
    textTransform?: 'uppercase' | 'capitalize' | 'none';
  };
  tableBadgeBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export const POSTER_TEMPLATES: PosterTemplate[] = [
  {
    id: 'diwali-festive-feast',
    name: 'Festive Diwali & Celebration',
    tagline: 'Traditional golden diyas, rangoli motifs & auspicious festive celebration',
    category: 'festive',
    badge: '🪔 FESTIVE SPECIAL',
    isNew: true,
    thumbnailUrl: '/posters/diwali-festive-feast.jpg',
    imageUrl: '/posters/diwali-festive-feast.jpg',
    dimensions: {
      width: 796,
      height: 1024,
    },
    qrBox: {
      x: 216,
      y: 436,
      width: 364,
      height: 350,
      borderRadius: 24,
      padding: 14,
    },
    restaurantNameBox: {
      x: 140,
      y: 155,
      width: 516,
      height: 120,
      fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif",
      fontWeight: 'bold',
      color: '#991B1B', // Rich regal deep red
      secondaryColor: '#D97706', // Warm festive gold
      maxFontSize: 32,
      minFontSize: 18,
      align: 'center',
      textTransform: 'none',
    },
  },
  {
    id: 'retro-diner-bite',
    name: 'Retro Diner & Fast Food',
    tagline: 'Classic American diner vibes with burgers, crispy fries & delicious shakes',
    category: 'fast-food',
    badge: '🍔 NEW',
    isNew: true,
    thumbnailUrl: '/posters/retro-diner-bite.jpg',
    imageUrl: '/posters/retro-diner-bite.jpg',
    dimensions: {
      width: 796,
      height: 1024,
    },
    qrBox: {
      x: 220,
      y: 348,
      width: 356,
      height: 342,
      borderRadius: 24,
      padding: 14,
    },
    restaurantNameBox: {
      x: 160,
      y: 125,
      width: 476,
      height: 100,
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      fontWeight: '900',
      color: '#C2410C', // Vibrant diner orange/red
      secondaryColor: '#0F766E',
      maxFontSize: 34,
      minFontSize: 18,
      align: 'center',
      textTransform: 'none',
    },
  },
  {
    id: 'comic-pop-cafe',
    name: 'Comic Pop & Kawaii Cafe',
    tagline: 'Playful pop-art cartoon styling with cute pizza, cupcake & smiling coffee',
    category: 'cafe-cozy',
    badge: '🍕 NEW',
    isNew: true,
    thumbnailUrl: '/posters/comic-pop-cafe.jpg',
    imageUrl: '/posters/comic-pop-cafe.jpg',
    dimensions: {
      width: 796,
      height: 1024,
    },
    qrBox: {
      x: 216,
      y: 308,
      width: 346,
      height: 346,
      borderRadius: 24,
      padding: 14,
    },
    restaurantNameBox: {
      x: 88,
      y: 78,
      width: 436,
      height: 130,
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      fontWeight: '900',
      color: '#1C1917',
      secondaryColor: '#D97706',
      maxFontSize: 32,
      minFontSize: 18,
      align: 'center',
      textTransform: 'none',
    },
  },
  {
    id: 'comic-sticker-vibe',
    name: 'Kawaii Pop & Coffee Treats',
    tagline: 'Vibrant comic stickers, latte art & sweet bakery cravings',
    category: 'cafe-cozy',
    badge: '⚡ POPULAR',
    isNew: false,
    thumbnailUrl: '/posters/comic-sticker-vibe.jpg',
    imageUrl: '/posters/comic-sticker-vibe.jpg',
    dimensions: {
      width: 796,
      height: 1024,
    },
    qrBox: {
      x: 222,
      y: 334,
      width: 352,
      height: 352,
      borderRadius: 24,
      padding: 14,
    },
    restaurantNameBox: {
      x: 136,
      y: 102,
      width: 440,
      height: 132,
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      fontWeight: '900',
      color: '#1C1917',
      secondaryColor: '#E11D48',
      maxFontSize: 32,
      minFontSize: 18,
      align: 'center',
      textTransform: 'none',
    },
  },
  {
    id: 'heritage-postcard-cafe',
    name: 'Heritage Postcard & Coffee',
    tagline: 'Vintage architectural postcard, flaky croissants & hot cappuccino',
    category: 'delhi-heritage',
    badge: '☕ NEW',
    isNew: true,
    thumbnailUrl: '/posters/heritage-postcard-cafe.jpg',
    imageUrl: '/posters/heritage-postcard-cafe.jpg',
    dimensions: {
      width: 796,
      height: 1024,
    },
    qrBox: {
      x: 236,
      y: 508,
      width: 324,
      height: 284,
      borderRadius: 22,
      padding: 12,
    },
    restaurantNameBox: {
      x: 110,
      y: 318,
      width: 576,
      height: 90,
      fontFamily: "'Playfair Display', Georgia, serif",
      fontWeight: 'bold',
      color: '#1C1917',
      secondaryColor: '#C25E20',
      maxFontSize: 32,
      minFontSize: 18,
      align: 'center',
      textTransform: 'none',
    },
  },
  {
    id: 'delhi-heritage-bite',
    name: 'Delhi Heritage & Cravings',
    tagline: 'Iconic Delhi culinary illustration with vintage name banner & Jama Masjid heritage',
    category: 'delhi-heritage',
    badge: '⭐ TOP RATED',
    isNew: false,
    thumbnailUrl: '/posters/delhi-heritage-bite.jpg',
    imageUrl: '/posters/delhi-heritage-bite.jpg',
    dimensions: {
      width: 796,
      height: 1024,
    },
    qrBox: {
      x: 248,
      y: 496,
      width: 300,
      height: 300,
      borderRadius: 20,
      padding: 14,
    },
    restaurantNameBox: {
      x: 204,
      y: 840,
      width: 388,
      height: 96,
      fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif",
      fontWeight: 'bold',
      color: '#0F3832', // Deep regal heritage teal
      secondaryColor: '#C25E20', // Warm spice ochre
      maxFontSize: 30,
      minFontSize: 16,
      align: 'center',
      textTransform: 'none',
    },
  },
];

export function getPosterTemplate(id: string): PosterTemplate {
  return POSTER_TEMPLATES.find((t) => t.id === id) || POSTER_TEMPLATES[0];
}

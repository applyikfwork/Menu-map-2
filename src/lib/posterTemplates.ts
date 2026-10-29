export interface PosterTemplate {
  id: string;
  name: string;
  tagline: string;
  category: 'delhi-heritage' | 'minimal-modern' | 'cafe-cozy' | 'street-food';
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
    id: 'delhi-heritage-bite',
    name: 'Delhi Heritage & Cravings',
    tagline: 'Iconic Delhi culinary illustration with vintage name banner & Jama Masjid heritage',
    category: 'delhi-heritage',
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

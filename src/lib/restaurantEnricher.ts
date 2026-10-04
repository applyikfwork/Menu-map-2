import { Restaurant, MenuItem } from '../types/database';

export const ALL_BEST_FOR_TAGS = [
  'Studying',
  'Date Night',
  'Groups',
  'Budget',
  'Coffee',
  'Breakfast',
  'Late Night',
  'Traditional Food',
  'Views',
] as const;

export type BestForTag = typeof ALL_BEST_FOR_TAGS[number];

export const ALL_AMBIENCE_TAGS = [
  'Cozy & Quiet',
  'Lively & Social',
  'Romantic & Intimate',
  'Modern & Trendy',
  'Traditional & Heritage',
  'Outdoor Seating Available',
] as const;

export type AmbienceTag = typeof ALL_AMBIENCE_TAGS[number];

export function enrichRestaurant(rest: Restaurant): Restaurant {
  const isHeritage = Boolean(
    rest.heritage_area ||
    rest.city?.toLowerCase().includes('old delhi') ||
    rest.city?.toLowerCase().includes('chandni') ||
    rest.city?.toLowerCase().includes('hauz khas') ||
    rest.address_line1?.toLowerCase().includes('chandni chowk') ||
    rest.address_line1?.toLowerCase().includes('jama masjid') ||
    rest.address_line1?.toLowerCase().includes('connaught')
  );

  const bestFor = new Set<string>(rest.best_for_tags || []);
  if (bestFor.size === 0) {
    if (rest.average_cost_for_two <= 350 || rest.price_range === '₹') {
      bestFor.add('Budget');
    }
    if (
      rest.facilities?.some((f) => /study|quiet|reading|books|coworking/i.test(f)) ||
      rest.short_description?.toLowerCase().includes('study') ||
      rest.short_description?.toLowerCase().includes('student') ||
      rest.long_description?.toLowerCase().includes('study')
    ) {
      bestFor.add('Studying');
    }
    if (rest.cuisine_types?.some((c) => /cafe|coffee|beverages/i.test(c))) {
      bestFor.add('Coffee');
    }
    if (
      (rest.rating_avg >= 4.4 && rest.cuisine_types?.some((c) => /italian|continental|cafe/i.test(c))) ||
      rest.facilities?.some((f) => /romantic|balcony/i.test(f))
    ) {
      bestFor.add('Date Night');
    }
    if (
      rest.facilities?.some((f) => /party|spacious|large|family/i.test(f)) ||
      rest.average_cost_for_two >= 400
    ) {
      bestFor.add('Groups');
    }
    if (
      rest.meal_types?.includes('Late Night') ||
      rest.short_description?.toLowerCase().includes('night') ||
      rest.long_description?.toLowerCase().includes('night')
    ) {
      bestFor.add('Late Night');
    }
    if (
      rest.meal_types?.includes('Breakfast') ||
      rest.cuisine_types?.some((c) => /breakfast|sweets|bakery/i.test(c))
    ) {
      bestFor.add('Breakfast');
    }
    if (
      isHeritage ||
      rest.cuisine_types?.some((c) => /mughlai|heritage|traditional|nihari|paratha/i.test(c))
    ) {
      bestFor.add('Traditional Food');
    }
    if (
      rest.facilities?.some((f) => /outdoor|view|balcony|terrace|rooftop|lake/i.test(f)) ||
      rest.long_description?.toLowerCase().includes('view') ||
      rest.long_description?.toLowerCase().includes('rooftop')
    ) {
      bestFor.add('Views');
    }
  }

  const ambience = new Set<string>(rest.ambience_tags || []);
  if (ambience.size === 0) {
    if (bestFor.has('Studying') || rest.facilities?.some((f) => /quiet|reading/i.test(f))) {
      ambience.add('Cozy & Quiet');
    }
    if (bestFor.has('Groups') || rest.cuisine_types?.some((c) => /fast food|street/i.test(c))) {
      ambience.add('Lively & Social');
    }
    if (bestFor.has('Date Night')) {
      ambience.add('Romantic & Intimate');
    }
    if (rest.cuisine_types?.some((c) => /cafe|italian|continental/i.test(c))) {
      ambience.add('Modern & Trendy');
    }
    if (isHeritage) {
      ambience.add('Traditional & Heritage');
    }
    if (rest.facilities?.some((f) => /outdoor|balcony|terrace/i.test(f))) {
      ambience.add('Outdoor Seating Available');
    }
  }

  const landmarks = rest.nearby_landmarks && rest.nearby_landmarks.length > 0
    ? rest.nearby_landmarks
    : [
        rest.landmark ? `Near ${rest.landmark}` : null,
        `${rest.city || 'Central Location'}`,
        rest.facilities?.includes('Takeout') ? 'Easy Walk-in Counter' : null,
      ].filter(Boolean) as string[];

  const specialty = rest.specialty_dishes && rest.specialty_dishes.length > 0
    ? rest.specialty_dishes
    : (rest.known_for_dishes || []).slice(0, 4);

  return {
    ...rest,
    best_for_tags: Array.from(bestFor),
    ambience_tags: Array.from(ambience),
    nearby_landmarks: landmarks,
    heritage_area: isHeritage,
    specialty_dishes: specialty,
  };
}

export function enrichMenuItem(item: MenuItem, restaurant?: Restaurant | null): MenuItem {
  const isMustTry = Boolean(
    item.is_must_try ||
    item.is_featured ||
    (restaurant?.known_for_dishes &&
      restaurant.known_for_dishes.some((kd) =>
        kd.toLowerCase().includes(item.name.toLowerCase()) ||
        item.name.toLowerCase().includes(kd.toLowerCase())
      ))
  );

  return {
    ...item,
    is_must_try: isMustTry,
  };
}

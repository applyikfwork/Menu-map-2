/**
 * Dynamic SEO & Automated Indexing Engine for Menu Map
 * Handles Page Titles, Meta Descriptions, OpenGraph, Twitter Cards,
 * Canonical URLs, Googlebot Indexing directives, and Schema.org JSON-LD Structured Data
 */

export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
  noIndex?: boolean;
}

function setMetaTag(selector: string, attributeName: string, attributeValue: string, content: string) {
  let element = document.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setCanonicalTag(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function setJsonLd(data?: Record<string, any> | Array<Record<string, any>>) {
  const SCRIPT_ID = 'menumap-schema-jsonld';
  let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

  if (!data) {
    if (script) script.remove();
    return;
  }

  if (!script) {
    script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(data);
}

export function updatePageSeo(config: SeoConfig) {
  // 1. Page Title (Optimal 45-65 characters)
  document.title = config.title;

  // 2. Meta Description
  setMetaTag('meta[name="description"]', 'name', 'description', config.description);

  // 3. Keywords
  if (config.keywords && config.keywords.length > 0) {
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', config.keywords.join(', '));
  }

  // 4. Googlebot & Search Engine Indexing Directives
  const robotsContent = config.noIndex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  setMetaTag('meta[name="robots"]', 'name', 'robots', robotsContent);
  setMetaTag('meta[name="googlebot"]', 'name', 'googlebot', robotsContent);

  // 5. Canonical URL
  const canonical = config.canonicalUrl || window.location.href.split('?')[0];
  setCanonicalTag(canonical);

  // 6. OpenGraph Social Tags
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', config.title);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', config.description);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonical);
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', config.ogType || 'website');
  setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'Menu Map');

  if (config.ogImage) {
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', config.ogImage);
  }

  // 7. Twitter / X Cards
  setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', config.title);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', config.description);

  if (config.ogImage) {
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', config.ogImage);
  }

  // 8. Schema.org JSON-LD Structured Data
  setJsonLd(config.jsonLd);
}

/**
 * Builds Schema.org Restaurant / FoodEstablishment structured data
 * enables Google Search Rich Snippets with menu items, rating, and address
 */
export function buildRestaurantSchema(
  restaurant: any,
  categories: any[] = [],
  menuItems: any[] = [],
  url: string
) {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': url,
    'name': restaurant.name,
    'image': [
      restaurant.cover_image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    ],
    'description': restaurant.short_description || restaurant.long_description || `${restaurant.name} in ${restaurant.city}`,
    ...(restaurant.phone || restaurant.whatsapp_number
      ? { telephone: restaurant.phone || restaurant.whatsapp_number }
      : {}),
    'servesCuisine': restaurant.cuisine_types || ['Multi-cuisine', 'Cafe', 'Fast Food'],
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': restaurant.address_line1,
      'addressLocality': restaurant.city || 'Delhi',
      'addressRegion': restaurant.state || 'Delhi',
      'postalCode': restaurant.pincode || '110041',
      'addressCountry': 'IN',
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': restaurant.latitude || 28.6833,
      'longitude': restaurant.longitude || 77.0667,
    },
    'openingHoursSpecification': Object.entries(restaurant.opening_hours || {}).map(
      ([day, hours]: [string, any]) => ({
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': day,
        'opens': hours.is_closed ? '00:00' : hours.open || '11:00',
        'closes': hours.is_closed ? '00:00' : hours.close || '23:00',
      })
    ),
  };

  // Add AggregateRating if available
  if (restaurant.rating_avg) {
    schema['aggregateRating'] = {
      '@type': 'AggregateRating',
      'ratingValue': restaurant.rating_avg.toFixed(1),
      'reviewCount': Math.max(1, restaurant.rating_count || 1),
      'bestRating': '5',
      'worstRating': '1',
    };
  }

  // Add Menu hierarchy if dishes exist
  if (menuItems && menuItems.length > 0) {
    schema['hasMenu'] = {
      '@type': 'Menu',
      'name': `${restaurant.name} Full Digital Menu`,
      'url': url,
      'hasMenuSection': categories.map((cat) => ({
        '@type': 'MenuSection',
        'name': cat.name,
        'hasMenuItem': menuItems
          .filter((item) => item.category_id === cat.id)
          .slice(0, 30) // include top 30 dishes per category for rich indexing
          .map((item) => ({
            '@type': 'MenuItem',
            'name': item.name,
            'description': item.description || `${item.name} at ${restaurant.name}`,
            'offers': {
              '@type': 'Offer',
              'price': item.price,
              'priceCurrency': 'INR',
              'availability': item.is_available
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            },
          })),
      })),
    };
  }

  return schema;
}

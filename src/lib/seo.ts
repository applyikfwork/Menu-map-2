/**
 * Dynamic SEO, AEO & GEO Engine for Menu Maps
 * Handles Page Titles, Meta Descriptions, OpenGraph, Twitter Cards,
 * Canonical URLs, Googlebot / AI Bot Indexing directives, and Schema.org Multi-Type JSON-LD Graphs
 */

import { APP_NAME } from './constants';

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
  setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', APP_NAME);

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
 * Builds connected Multi-Type Schema.org Graph for a Restaurant / Cafe
 * Enables Google Search Rich Snippets, AEO Direct Answers, and Generative Engine Grounding
 */
export function buildRestaurantSchema(
  restaurant: any,
  categories: any[] = [],
  menuItems: any[] = [],
  url: string
) {
  const isCafe = (restaurant.cuisine_types || []).some((c: string) => /cafe|coffee|bakery|dessert/i.test(c)) ||
    /cafe|coffee|roasters|bake/i.test(restaurant.name || '');

  const types = isCafe ? ['Restaurant', 'CafeOrCoffeeShop'] : ['Restaurant'];

  const sameAs: string[] = [];
  if (restaurant.website) sameAs.push(restaurant.website);
  if (restaurant.instagram_handle) {
    const handle = restaurant.instagram_handle.replace(/^@/, '');
    sameAs.push(`https://www.instagram.com/${handle}`);
  }
  if (restaurant.google_place_id) {
    sameAs.push(`https://www.google.com/maps/place/?q=place_id:${restaurant.google_place_id}`);
  }

  const primaryImage = restaurant.cover_image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4';
  const restaurantName = restaurant.name || 'Restaurant';
  const locality = restaurant.city_area || restaurant.city || 'Delhi';

  // 1. Restaurant Entity Node
  const restaurantNode: Record<string, any> = {
    '@type': types,
    '@id': `${url}#restaurant`,
    'name': restaurantName,
    'url': url,
    'image': [primaryImage],
    'description': restaurant.short_description || restaurant.long_description || `${restaurantName} in ${locality}, Delhi with verified digital menu and prices.`,
    ...(restaurant.phone || restaurant.whatsapp_number
      ? { telephone: restaurant.phone || restaurant.whatsapp_number }
      : {}),
    'servesCuisine': restaurant.cuisine_types || ['Multi-cuisine', 'Cafe', 'Fast Food'],
    'priceRange': restaurant.avg_cost_for_two ? `₹${restaurant.avg_cost_for_two} for two` : '₹₹',
    'currenciesAccepted': 'INR',
    'paymentAccepted': 'Cash, Credit Card, UPI, Digital Wallets',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': restaurant.address_line1 || locality,
      'addressLocality': restaurant.city || 'Delhi',
      'addressRegion': restaurant.state || 'Delhi',
      'postalCode': restaurant.pincode || '110001',
      'addressCountry': 'IN',
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': restaurant.latitude || 28.6139,
      'longitude': restaurant.longitude || 77.2090,
    },
    ...(sameAs.length > 0 ? { 'sameAs': sameAs } : {}),
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
    restaurantNode['aggregateRating'] = {
      '@type': 'AggregateRating',
      'ratingValue': restaurant.rating_avg.toFixed(1),
      'reviewCount': Math.max(1, restaurant.rating_count || 1),
      'bestRating': '5',
      'worstRating': '1',
    };
  }

  // Add Full Menu hierarchy
  if (menuItems && menuItems.length > 0) {
    restaurantNode['hasMenu'] = {
      '@type': 'Menu',
      'name': `${restaurantName} Full Digital Menu`,
      'url': url,
      'hasMenuSection': categories.map((cat) => ({
        '@type': 'MenuSection',
        'name': cat.name,
        'hasMenuItem': menuItems
          .filter((item) => item.category_id === cat.id)
          .slice(0, 30)
          .map((item) => ({
            '@type': 'MenuItem',
            'name': item.name,
            'description': item.description || `${item.name} at ${restaurantName}`,
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

  // 2. BreadcrumbList Node
  const breadcrumbNode = {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumbs`,
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://menumaps.in/',
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Restaurants',
        'item': 'https://menumaps.in/restaurants',
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': locality,
        'item': `https://menumaps.in/restaurants?search=${encodeURIComponent(locality)}`,
      },
      {
        '@type': 'ListItem',
        'position': 4,
        'name': restaurantName,
        'item': url,
      },
    ],
  };

  // 3. AEO FAQPage Node (Zero-Click Answer Optimization)
  const topDishesText = menuItems.slice(0, 5).map((m: any) => m.name).join(', ') || 'signature dishes';
  const faqNode = {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    'mainEntity': [
      {
        '@type': 'Question',
        'name': `What are the most popular must-try dishes at ${restaurantName}?`,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': `Must-order popular dishes at ${restaurantName} include ${topDishesText}. All dishes feature verified menu prices on Menu Maps.`,
        },
      },
      {
        '@type': 'Question',
        'name': `What is the average cost for two people at ${restaurantName}?`,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': restaurant.avg_cost_for_two
            ? `The average cost for two people dining at ${restaurantName} is approximately ₹${restaurant.avg_cost_for_two}. Prices are verified directly from physical cafe menus.`
            : `Dining at ${restaurantName} typically ranges between ₹800 to ₹1,500 for two people depending on selected dishes.`,
        },
      },
      {
        '@type': 'Question',
        'name': `Where is ${restaurantName} located and what are the opening hours?`,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': `${restaurantName} is situated at ${restaurant.address_line1 || locality}, ${restaurant.city || 'Delhi'}. Operating schedules vary by day; refer to the live hours schedule on this page for current timings.`,
        },
      },
      {
        '@type': 'Question',
        'name': `Can I view the real digital menu with prices for ${restaurantName}?`,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': `Yes, Menu Maps provides the complete, 100% verified digital menu for ${restaurantName} with up-to-date item-level pricing, dietary tags, and dish details.`,
        },
      },
    ],
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [restaurantNode, breadcrumbNode, faqNode],
  };
}

/**
 * Builds Schema.org for Individual Dish / Food Item (AEO & Long-tail Search Capture)
 */
export function buildDishSchema(dish: any, restaurant: any, url: string) {
  const dishName = dish.name || 'Dish';
  const restaurantName = restaurant?.name || 'Restaurant';

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['MenuItem', 'Product'],
        '@id': `${url}#dish`,
        'name': dishName,
        'description': dish.description || `${dishName} served fresh at ${restaurantName} in Delhi.`,
        'image': dish.image_url ? [dish.image_url] : [],
        'offers': {
          '@type': 'Offer',
          'price': dish.price || 0,
          'priceCurrency': 'INR',
          'availability': dish.is_available !== false
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          'seller': {
            '@type': 'Restaurant',
            'name': restaurantName,
          },
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumbs`,
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': 'https://menumaps.in/',
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': restaurantName,
            'item': `https://menumaps.in/restaurant/${restaurant?.slug || ''}`,
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': dishName,
            'item': url,
          },
        ],
      },
    ],
  };
}

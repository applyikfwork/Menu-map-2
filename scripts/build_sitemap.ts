import fs from 'node:fs';
import path from 'node:path';

const DOMAIN = 'https://menumaps.in';
const TODAY = new Date().toISOString().split('T')[0];
const PRERENDER_DATA = path.resolve('dist/prerender_data.json');

const restaurantSlugs = new Set<string>();
const dishSlugs = new Set<string>();
const guideSlugs = new Set<string>();

if (fs.existsSync(PRERENDER_DATA)) {
  console.log(`[build_sitemap] Loading slugs directly from ${PRERENDER_DATA}...`);
  try {
    const raw = fs.readFileSync(PRERENDER_DATA, 'utf-8');
    const pdata = JSON.parse(raw);
    for (const r of pdata.restaurants || []) {
      if (r?.slug) restaurantSlugs.add(r.slug);
    }
    for (const d of pdata.dishes || []) {
      if (d?.slug) dishSlugs.add(d.slug);
    }
    for (const g of pdata.food_guides || []) {
      if (g?.slug) guideSlugs.add(g.slug);
    }
  } catch (err) {
    console.error('[build_sitemap] Error reading prerender_data.json:', err);
  }
}

// Fallback guides if not populated yet
if (guideSlugs.size === 0) {
  [
    'what-to-eat-today',
    'food-ideas-for-dinner',
    'best-food-near-me',
    'best-food-under-200',
    'late-night-food-delhi'
  ].forEach(s => guideSlugs.add(s));
}

// Fallback if dist/prerender_data.json wasn't read
if (restaurantSlugs.size === 0) {
  console.log('[build_sitemap] Scanning src/data/venues/ as fallback...');
  const venuesDir = path.resolve('src/data/venues');
  if (fs.existsSync(venuesDir)) {
    const files = fs.readdirSync(venuesDir).filter(f => f.endsWith('.ts'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(venuesDir, file), 'utf-8');
      const slugMatches = content.matchAll(/['"]slug['"]\s*:\s*['"]([a-zA-Z0-9_-]+)['"]/g);
      for (const match of slugMatches) {
        restaurantSlugs.add(match[1]);
      }
    }
  }
}

const corePages = [
  { path: '', freq: 'daily', prio: '1.0' },
  { path: 'restaurants', freq: 'daily', prio: '0.9' },
  { path: 'guides', freq: 'daily', prio: '0.9' },
  { path: 'nearby', freq: 'daily', prio: '0.9' },
  { path: 'list-cafe', freq: 'weekly', prio: '0.85' },
  { path: 'search', freq: 'daily', prio: '0.8' },
  { path: 'about', freq: 'monthly', prio: '0.6' },
  { path: 'contact', freq: 'monthly', prio: '0.6' },
  { path: 'terms', freq: 'monthly', prio: '0.4' },
  { path: 'privacy', freq: 'monthly', prio: '0.4' },
];

function buildUrlSet(urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }>): string {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  ];
  for (const u of urls) {
    lines.push('  <url>');
    lines.push(`    <loc>${u.loc}</loc>`);
    lines.push(`    <lastmod>${u.lastmod}</lastmod>`);
    lines.push(`    <changefreq>${u.changefreq}</changefreq>`);
    lines.push(`    <priority>${u.priority}</priority>`);
    lines.push('  </url>');
  }
  lines.push('</urlset>\n');
  return lines.join('\n');
}

function writeSitemap(filename: string, content: string) {
  const publicPath = path.resolve('public', filename);
  fs.writeFileSync(publicPath, content, 'utf-8');

  const distDir = path.resolve('dist');
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.resolve(distDir, filename), content, 'utf-8');
  }
}

// 1. Core Pages Sitemap
const coreUrls = corePages.map(p => ({
  loc: p.path ? `${DOMAIN}/${p.path}` : `${DOMAIN}/`,
  lastmod: TODAY,
  changefreq: p.freq,
  priority: p.prio
}));
const coreXml = buildUrlSet(coreUrls);
writeSitemap('sitemap-core.xml', coreXml);

// 2. Guides Sitemap
const guideUrls = Array.from(guideSlugs).sort().map(slug => ({
  loc: `${DOMAIN}/guides/${slug}`,
  lastmod: TODAY,
  changefreq: 'weekly',
  priority: '0.85'
}));
const guidesXml = buildUrlSet(guideUrls);
writeSitemap('sitemap-guides.xml', guidesXml);

// 3. Restaurants Sitemap
const restaurantUrls = Array.from(restaurantSlugs).sort().map(slug => ({
  loc: `${DOMAIN}/restaurant/${slug}`,
  lastmod: TODAY,
  changefreq: 'weekly',
  priority: '0.80'
}));
const restaurantsXml = buildUrlSet(restaurantUrls);
writeSitemap('sitemap-restaurants.xml', restaurantsXml);

// 4. Dishes Sitemap
const dishUrls = Array.from(dishSlugs).sort().map(slug => ({
  loc: `${DOMAIN}/food/${slug}`,
  lastmod: TODAY,
  changefreq: 'weekly',
  priority: '0.70'
}));
const dishesXml = buildUrlSet(dishUrls);
writeSitemap('sitemap-dishes.xml', dishesXml);

// 5. Root Sitemap Index
const sitemapIndexLines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  '  <sitemap>',
  `    <loc>${DOMAIN}/sitemap-core.xml</loc>`,
  `    <lastmod>${TODAY}</lastmod>`,
  '  </sitemap>',
  '  <sitemap>',
  `    <loc>${DOMAIN}/sitemap-guides.xml</loc>`,
  `    <lastmod>${TODAY}</lastmod>`,
  '  </sitemap>',
  '  <sitemap>',
  `    <loc>${DOMAIN}/sitemap-restaurants.xml</loc>`,
  `    <lastmod>${TODAY}</lastmod>`,
  '  </sitemap>',
  '  <sitemap>',
  `    <loc>${DOMAIN}/sitemap-dishes.xml</loc>`,
  `    <lastmod>${TODAY}</lastmod>`,
  '  </sitemap>',
  '</sitemapindex>\n'
];
const sitemapIndexXml = sitemapIndexLines.join('\n');
writeSitemap('sitemap.xml', sitemapIndexXml);

console.log('✅ Google-Standard Split Sitemap & Sitemap Index generated successfully:');
console.log(`   - sitemap-core.xml: ${coreUrls.length} URLs`);
console.log(`   - sitemap-guides.xml: ${guideUrls.length} URLs`);
console.log(`   - sitemap-restaurants.xml: ${restaurantUrls.length} URLs`);
console.log(`   - sitemap-dishes.xml: ${dishUrls.length} URLs`);
console.log(`   - sitemap.xml: 4 sub-sitemaps linked in index (${coreUrls.length + guideUrls.length + restaurantUrls.length + dishUrls.length} total indexed URLs)`);

/**
 * Native Node.js / TypeScript Static Pre-Rendering Engine (SSG)
 * Replaces Python script to eliminate external runtime dependencies on Vercel.
 * Generates full static HTML snapshots with semantic content & Schema.org JSON-LD graphs.
 */

import fs from 'fs';
import path from 'path';

const DOMAIN = 'https://menumaps.in';
const DIST_INDEX = path.resolve('dist', 'index.html');
const PRERENDER_DATA = path.resolve('dist', 'prerender_data.json');

function escapeHtml(text: any): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function replaceRoot(srcHtml: string, newContent: string): string {
  const startTag = '<div id="root">';
  const startPos = srcHtml.indexOf(startTag);
  if (startPos === -1) return srcHtml;

  const contentStart = startPos + startTag.length;
  const bodyPos = srcHtml.indexOf('</body>');
  const endPos = srcHtml.lastIndexOf('</div>', bodyPos !== -1 ? bodyPos : srcHtml.length);
  if (endPos === -1 || endPos < contentStart) return srcHtml;

  return srcHtml.slice(0, contentStart) + newContent + srcHtml.slice(endPos);
}

function getSharedHeader(): string {
  return `
    <header style="max-width: 1200px; margin: 0 auto; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E7E2DA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <a href="/" style="display: flex; align-items: center; gap: 12px; text-decoration: none; color: inherit;">
        <img src="/logo.jpg" alt="Menu Maps Logo" width="40" height="40" style="border-radius: 10px;" />
        <span style="font-weight: 800; font-size: 22px; color: #1C1917;">Menu <span style="color: #FF5A36;">Maps</span></span>
      </a>
      <nav style="display: flex; flex-wrap: wrap; gap: 20px; font-weight: 600; font-size: 14px;">
        <a href="/restaurants" style="color: #44403C; text-decoration: none;">Restaurants</a>
        <a href="/guides" style="color: #FF5A36; text-decoration: none;">Food Guides</a>
        <a href="/nearby" style="color: #44403C; text-decoration: none;">Best Cafes Near Me</a>
        <a href="/search" style="color: #44403C; text-decoration: none;">Search</a>
      </nav>
    </header>
  `;
}

function writeHtmlSnapshot(relPathWithoutExt: string, htmlContent: string) {
  // 1. Write to /relPath/index.html (standard directory index)
  const dirPath = path.resolve('dist', relPathWithoutExt);
  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(path.join(dirPath, 'index.html'), htmlContent, 'utf-8');

  // 2. Write to /relPath.html (for Vercel cleanUrls direct match)
  const filePath = path.resolve('dist', `${relPathWithoutExt}.html`);
  fs.writeFileSync(filePath, htmlContent, 'utf-8');
}

export async function runPrerender() {
  if (!fs.existsSync(DIST_INDEX)) {
    console.error(`Error: ${DIST_INDEX} not found. Run 'vite build' first.`);
    process.exit(1);
  }

  const template = fs.readFileSync(DIST_INDEX, 'utf-8');

  if (!fs.existsSync(PRERENDER_DATA)) {
    console.error(`Error: ${PRERENDER_DATA} not found. Run export_prerender_data.ts first.`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(PRERENDER_DATA, 'utf-8'));
  const restaurants: any[] = data.restaurants || [];
  const dishes: any[] = data.dishes || [];
  const dishesByRest: Record<string, any[]> = data.dishes_by_restaurant || {};
  const foodGuides: any[] = data.food_guides || [];

  console.log(`[SSG Engine] Loaded ${restaurants.length} restaurants, ${dishes.length} dishes, and ${foodGuides.length} food guides.`);

  // -------------------------------------------------------------
  // 1. PRE-RENDER INDIVIDUAL RESTAURANT PAGES (/restaurant/[slug])
  // -------------------------------------------------------------
  for (const r of restaurants) {
    const slug = r.slug;
    if (!slug) continue;

    const name = r.name || 'Restaurant';
    const city = r.city_area || r.city || 'Delhi NCR';
    const addr = r.address_line1 || city;
    const cost = r.average_cost_for_two || 400;
    const img = r.cover_image_url || 'https://menumaps.in/logo.jpg';
    const pageUrl = `${DOMAIN}/restaurant/${slug}`;
    const title = `${name} Menu, Prices & Photos | ${city} | Menu Maps`;
    const desc = `Explore ${name} in ${city}. View live digital menu with verified counter prices, dish photos, address (${addr}), opening timings, and 0% commission direct WhatsApp ordering.`;

    const restItems = dishesByRest[r.id] || [];
    const topDishes = restItems.slice(0, 16);

    let dishesHtml = '';
    const schemaMenuItems: any[] = [];

    for (const d of topDishes) {
      const dName = d.name || '';
      const dPrice = d.price || 0;
      const dDesc = d.description || '';
      const dSlug = d.slug || '';
      const dVeg = (d.dietary_tags || []).includes('Veg');
      const badgeIcon = dVeg ? '🟢' : '🔴';
      const dishUrl = dSlug ? `/food/${dSlug}` : '#';

      dishesHtml += `
        <div style="background: #FAF8F5; border: 1px solid #E7E2DA; border-radius: 14px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px;">
              <h3 style="font-size: 15px; font-weight: 800; color: #1C1917; margin: 0;">
                <a href="${dishUrl}" style="color: inherit; text-decoration: none;">${badgeIcon} ${escapeHtml(dName)}</a>
              </h3>
              <span style="font-weight: 900; color: #D8350F; font-size: 15px; white-space: nowrap;">₹${dPrice}</span>
            </div>
            ${dDesc ? `<p style="color: #78716C; font-size: 12px; margin: 6px 0 0 0; line-height: 1.4;">${escapeHtml(dDesc)}</p>` : ''}
          </div>
          <div style="margin-top: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; border-top: 1px solid #EFEAE2; padding-top: 8px;">
            <span style="color: #0F766E; font-weight: 700;">✓ In-Store Rate</span>
            <a href="${dishUrl}" style="color: #FF5A36; font-weight: 700; text-decoration: none;">Dish Details &rarr;</a>
          </div>
        </div>
      `;

      schemaMenuItems.push({
        '@type': 'MenuItem',
        name: dName,
        description: dDesc || undefined,
        offers: {
          '@type': 'Offer',
          price: dPrice,
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
        },
      });
    }

    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Restaurant',
          '@id': `${pageUrl}#restaurant`,
          name,
          image: [img],
          url: pageUrl,
          priceRange: `₹${cost} for two`,
          address: {
            '@type': 'PostalAddress',
            streetAddress: addr,
            addressLocality: city,
            addressRegion: 'Delhi',
            addressCountry: 'IN',
          },
          hasMenu: {
            '@type': 'Menu',
            name: `${name} Counter Menu`,
            url: pageUrl,
            hasMenuItem: schemaMenuItems,
          },
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${pageUrl}#breadcrumbs`,
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${DOMAIN}/` },
            { '@type': 'ListItem', position: 2, name: 'Restaurants', item: `${DOMAIN}/restaurants` },
            { '@type': 'ListItem', position: 3, name, item: pageUrl },
          ],
        },
      ],
    };

    const fallbackHtml = `
      ${getSharedHeader()}
      <main style="max-width: 1000px; margin: 30px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <nav style="font-size: 13px; color: #78716C; margin-bottom: 16px;">
          <a href="/" style="color: #FF5A36; text-decoration: none;">Home</a> &gt; 
          <a href="/restaurants" style="color: #FF5A36; text-decoration: none;">Restaurants</a> &gt; 
          <span>${escapeHtml(name)}</span>
        </nav>

        <header style="background: #FFFFFF; border: 1px solid #E7E2DA; border-radius: 20px; padding: 24px; margin-bottom: 24px; display: flex; flex-wrap: wrap; gap: 20px; align-items: center;">
          <img src="${escapeHtml(img)}" alt="${escapeHtml(name)}" width="140" height="140" style="border-radius: 16px; object-fit: cover;" />
          <div style="flex: 1; min-width: 260px;">
            <span style="background: #ECFDF5; color: #047857; font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase;">
              ✓ 100% Counter Verified
            </span>
            <h1 style="font-size: 30px; font-weight: 900; color: #1C1917; margin: 8px 0 6px 0;">${escapeHtml(name)}</h1>
            <p style="color: #57534E; font-size: 14px; margin: 0 0 10px 0;">${escapeHtml(addr)}, ${escapeHtml(city)}</p>
            <div style="font-size: 13px; font-weight: 700; color: #D8350F;">Average ₹${cost} for two • 0% Delivery Markup</div>
          </div>
        </header>

        ${topDishes.length > 0 ? `
          <section style="background: #FFFFFF; border: 1px solid #E7E2DA; border-radius: 20px; padding: 24px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px; border-bottom: 1px solid #F5F1EB; padding-bottom: 12px;">
              <div>
                <span style="color: #0F766E; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Physical Store Records</span>
                <h2 style="font-size: 22px; font-weight: 800; color: #1C1917; margin: 4px 0 0 0;">Top Verified Counter Dishes & Prices</h2>
              </div>
              <span style="color: #78716C; font-size: 13px; font-weight: 600;">${topDishes.length} Dishes Mapped</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px;">
              ${dishesHtml}
            </div>
          </section>
        ` : ''}

        <section style="background: #FFFFFF; border: 1px solid #E7E2DA; border-radius: 20px; padding: 24px;">
          <h2 style="font-size: 20px; font-weight: 800; margin-top: 0; color: #1C1917;">Location & WhatsApp Ordering</h2>
          <p style="font-size: 14px; color: #44403C; line-height: 1.6;">
            <strong>Address:</strong> ${escapeHtml(addr)}, ${escapeHtml(city)}<br />
            <strong>Direct Ordering:</strong> Place direct takeaway or dine-in orders at original in-store rates with zero commission.
          </p>
        </section>
      </main>
    `;

    let html = template;
    html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
    html = html.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${desc}" />`);
    html = html.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${pageUrl}" />`);
    html = html.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`);
    html = html.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${desc}" />`);
    html = html.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${pageUrl}" />`);
    html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(schema)}</script>\n  </head>`);
    html = replaceRoot(html, fallbackHtml);

    writeHtmlSnapshot(`restaurant/${slug}`, html);
  }

  console.log(`[SSG Engine] Pre-rendered ${restaurants.length} restaurant pages (/restaurant/:slug).`);

  // -------------------------------------------------------------
  // 2. PRE-RENDER INDIVIDUAL DISH PAGES (/food/[slug])
  // -------------------------------------------------------------
  for (const d of dishes) {
    const slug = d.slug;
    if (!slug) continue;

    const name = d.name || 'Dish';
    const price = d.price || 0;
    const desc = d.description || `Enjoy ${name} at verified in-store counter rates.`;
    const restName = d.restaurant_name || 'Delhi Cafe';
    const restSlug = d.restaurant_slug || '';
    const addr = d.restaurant_address || 'Delhi';
    const city = d.restaurant_city || 'Delhi NCR';
    const img = d.image_url || d.restaurant_cover_image || 'https://menumaps.in/logo.jpg';
    const isVeg = (d.dietary_tags || []).includes('Veg');
    const deliveryEstimated = Math.round(price * 1.32 + 25);
    const savings = deliveryEstimated - price;

    const pageUrl = `${DOMAIN}/food/${slug}`;
    const title = `${name} Price at ${restName} - ₹${price} Counter Rate | Menu Maps`;
    const metaDesc = `View verified counter price for ${name} at ${restName}, ${addr}, ${city}. Only ₹${price} with 0% delivery app markup. View ingredients, dietary details, and direct WhatsApp counter ordering on Menu Maps.`;

    const dishSchema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'MenuItem',
          '@id': `${pageUrl}#dish`,
          name,
          description: desc,
          image: [img],
          url: pageUrl,
          suitableForDiet: isVeg ? 'https://schema.org/VegetarianDiet' : undefined,
          offers: {
            '@type': 'Offer',
            price,
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
            seller: {
              '@type': 'Restaurant',
              name: restName,
              url: restSlug ? `${DOMAIN}/restaurant/${restSlug}` : `${DOMAIN}/restaurants`,
            },
          },
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${pageUrl}#breadcrumbs`,
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${DOMAIN}/` },
            { '@type': 'ListItem', position: 2, name: 'Restaurants', item: `${DOMAIN}/restaurants` },
            { '@type': 'ListItem', position: 3, name: restName, item: restSlug ? `${DOMAIN}/restaurant/${restSlug}` : `${DOMAIN}/restaurants` },
            { '@type': 'ListItem', position: 4, name, item: pageUrl },
          ],
        },
      ],
    };

    const dietBadge = isVeg
      ? '<span style="background: #ECFDF5; color: #047857; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 9999px; border: 1px solid #A7F3D0;">🟢 Pure Veg</span>'
      : '<span style="background: #FEF2F2; color: #B91C1C; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 9999px; border: 1px solid #FECACA;">🔴 Non-Veg</span>';

    const dishFallbackHtml = `
      ${getSharedHeader()}
      <main style="max-width: 900px; margin: 30px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <nav style="font-size: 13px; color: #78716C; margin-bottom: 16px;">
          <a href="/" style="color: #FF5A36; text-decoration: none;">Home</a> &gt; 
          <a href="/restaurants" style="color: #FF5A36; text-decoration: none;">Restaurants</a> &gt; 
          <a href="/restaurant/${escapeHtml(restSlug)}" style="color: #FF5A36; text-decoration: none;">${escapeHtml(restName)}</a> &gt; 
          <span>${escapeHtml(name)}</span>
        </nav>

        <article style="background: #FFFFFF; border: 1px solid #E7E2DA; border-radius: 24px; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 30px;">
          <div style="display: flex; flex-wrap: wrap; gap: 24px; align-items: center; margin-bottom: 24px;">
            <div style="width: 180px; height: 180px; border-radius: 20px; overflow: hidden; background: #FAF8F5; shrink: 0;">
              <img src="${escapeHtml(img)}" alt="${escapeHtml(name)}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>

            <div style="flex: 1; min-width: 260px;">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                ${dietBadge}
                <span style="background: #EFF6FF; color: #1D4ED8; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 9999px;">Verified Counter Rate</span>
              </div>

              <h1 style="font-size: 32px; font-weight: 900; color: #1C1917; margin: 0 0 8px 0; line-height: 1.2;">
                ${escapeHtml(name)}
              </h1>

              <div style="font-size: 15px; color: #57534E; margin-bottom: 14px;">
                Served at <a href="/restaurant/${escapeHtml(restSlug)}" style="color: #FF5A36; font-weight: 700; text-decoration: none;">${escapeHtml(restName)}</a> (${escapeHtml(addr)}, ${escapeHtml(city)})
              </div>

              <div style="display: flex; align-items: baseline; gap: 14px;">
                <span style="font-size: 36px; font-weight: 900; color: #0F766E;">₹${price}</span>
                <span style="font-size: 16px; color: #A8A29E; text-decoration: line-through;">₹${deliveryEstimated} on delivery apps</span>
                <span style="background: #ECFDF5; color: #047857; font-weight: 800; font-size: 12px; padding: 4px 10px; border-radius: 8px; border: 1px solid #A7F3D0;">
                  Save ₹${savings}
                </span>
              </div>
            </div>
          </div>

          <div style="background: #FAF8F5; border: 1px solid #E7E2DA; border-radius: 16px; padding: 18px; margin-bottom: 24px;">
            <h3 style="font-size: 16px; font-weight: 800; color: #1C1917; margin: 0 0 6px 0;">Dish Overview & Pricing Intel</h3>
            <p style="font-size: 14px; color: #57534E; line-height: 1.6; margin: 0;">
              ${escapeHtml(desc)}
            </p>
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 14px;">
            <a href="/restaurant/${escapeHtml(restSlug)}" style="background: #FF5A36; color: #FFFFFF; font-weight: 800; font-size: 14px; padding: 12px 24px; border-radius: 14px; text-decoration: none;">
              View Full Menu at ${escapeHtml(restName)} &rarr;
            </a>
            <a href="/restaurants" style="background: #FAF8F5; color: #1C1917; border: 1px solid #E7E2DA; font-weight: 700; font-size: 14px; padding: 12px 20px; border-radius: 14px; text-decoration: none;">
              Explore More Cafes
            </a>
          </div>
        </article>
      </main>
    `;

    let html = template;
    html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
    html = html.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${metaDesc}" />`);
    html = html.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${pageUrl}" />`);
    html = html.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`);
    html = html.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${metaDesc}" />`);
    html = html.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${pageUrl}" />`);
    html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(dishSchema)}</script>\n  </head>`);
    html = replaceRoot(html, dishFallbackHtml);

    writeHtmlSnapshot(`food/${slug}`, html);
  }

  console.log(`[SSG Engine] Pre-rendered ${dishes.length} dish pages (/food/:slug).`);

  // -------------------------------------------------------------
  // 3. PRE-RENDER FOOD DECISION GUIDES (/guides and /guides/[slug])
  // -------------------------------------------------------------
  if (foodGuides.length > 0) {
    const hubUrl = `${DOMAIN}/guides`;
    const hubTitle = 'Food Decision Guides & What to Eat in Delhi NCR | Menu Maps';
    const hubDesc = 'Stuck on what to eat? Explore high-intent food decision guides across Delhi NCR. Discover real dishes, transparent counter rates, dinner ideas, budget meals, and late-night eats on Menu Maps.';

    let hubCardsHtml = '';
    const hubItemsSchema: any[] = [];

    foodGuides.forEach((g: any, i: number) => {
      const gSlug = g.slug;
      const gTitle = g.title;
      const gSummary = g.summary || '';
      const gBadge = g.badge || 'Guide';
      const gRead = g.readTime || '4 min read';
      const gImg = g.heroImage || 'https://menumaps.in/logo.jpg';
      const gUrl = `/guides/${gSlug}`;

      hubItemsSchema.push({
        '@type': 'ListItem',
        position: i + 1,
        name: gTitle,
        url: `${DOMAIN}${gUrl}`,
      });

      hubCardsHtml += `
        <article style="background: #FFFFFF; border: 1px solid #E7E2DA; border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <div>
            <div style="height: 180px; overflow: hidden; position: relative;">
              <img src="${escapeHtml(gImg)}" alt="${escapeHtml(gTitle)}" style="width: 100%; height: 100%; object-fit: cover;" />
              <span style="position: absolute; top: 12px; left: 12px; background: #FF5A36; color: #FFFFFF; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase;">${escapeHtml(gBadge)}</span>
              <span style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.6); color: #FFFFFF; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 9999px;">${escapeHtml(gRead)}</span>
            </div>
            <div style="padding: 20px;">
              <h2 style="font-size: 18px; font-weight: 800; color: #1C1917; margin: 0 0 8px 0; line-height: 1.3;">
                <a href="${gUrl}" style="color: inherit; text-decoration: none;">${escapeHtml(gTitle)}</a>
              </h2>
              <p style="font-size: 13px; color: #57534E; line-height: 1.5; margin: 0;">${escapeHtml(gSummary)}</p>
            </div>
          </div>
          <div style="padding: 14px 20px; background: #FAF8F5; border-top: 1px solid #E7E2DA; display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 700;">
            <span style="color: #0F766E;">✓ Real Dishes &amp; Menus</span>
            <a href="${gUrl}" style="color: #FF5A36; text-decoration: none;">Explore Guide &rarr;</a>
          </div>
        </article>
      `;
    });

    const hubSchema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          '@id': `${hubUrl}#collection`,
          name: hubTitle,
          description: hubDesc,
          url: hubUrl,
          publisher: {
            '@type': 'Organization',
            name: 'Menu Maps',
            url: DOMAIN,
            logo: `${DOMAIN}/logo.jpg`,
          },
        },
        {
          '@type': 'ItemList',
          '@id': `${hubUrl}#items`,
          name: 'Menu Maps Editorial Food Decision Guides',
          itemListElement: hubItemsSchema,
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${hubUrl}#breadcrumbs`,
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${DOMAIN}/` },
            { '@type': 'ListItem', position: 2, name: 'Food Guides', item: hubUrl },
          ],
        },
      ],
    };

    const hubFallback = `
      ${getSharedHeader()}
      <main style="max-width: 1100px; margin: 30px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <header style="text-align: center; max-width: 800px; margin: 0 auto 36px auto;">
          <span style="background: #FFF7ED; color: #C2410C; border: 1px solid #FED7AA; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase;">
            Menu Maps Editorial &amp; Decision Guides
          </span>
          <h1 style="font-size: 38px; font-weight: 900; color: #1C1917; margin: 12px 0 14px 0; line-height: 1.2;">
            Discover What to Eat at Real Counter Prices
          </h1>
          <p style="font-size: 16px; color: #57534E; line-height: 1.6; margin: 0;">
            Data-backed food decision guides powered by 770+ verified Delhi NCR cafes and 6,700+ authentic in-store menus. Zero delivery app markups.
          </p>
        </header>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; margin-bottom: 48px;">
          ${hubCardsHtml}
        </div>
      </main>
    `;

    let hubHtml = template;
    hubHtml = hubHtml.replace(/<title>.*?<\/title>/, `<title>${hubTitle}</title>`);
    hubHtml = hubHtml.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${hubDesc}" />`);
    hubHtml = hubHtml.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${hubUrl}" />`);
    hubHtml = hubHtml.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${hubTitle}" />`);
    hubHtml = hubHtml.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${hubDesc}" />`);
    hubHtml = hubHtml.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${hubUrl}" />`);
    hubHtml = hubHtml.replace('</head>', `<script type="application/ld+json">${JSON.stringify(hubSchema)}</script>\n  </head>`);
    hubHtml = replaceRoot(hubHtml, hubFallback);

    writeHtmlSnapshot('guides', hubHtml);

    // Pre-render individual guides
    for (const g of foodGuides) {
      const slug = g.slug;
      if (!slug) continue;

      const gTitle = g.title;
      const metaTitle = g.metaTitle || `${gTitle} | Menu Maps`;
      const metaDesc = g.metaDescription || '';
      const heroImg = g.heroImage || 'https://menumaps.in/logo.jpg';
      const pageUrl = `${DOMAIN}/guides/${slug}`;
      const faqs: any[] = g.faqs || [];
      const introSections: any[] = g.introSections || [];
      const crit = g.queryCriteria || {};
      const keywords: string[] = crit.keywords || [];
      const maxP = crit.maxPrice || 500;

      // Filter dishes matching this guide
      const guideDishes = dishes.filter((d: any) => {
        if (d.price > maxP) return false;
        if (keywords.length > 0) {
          const nameLower = (d.name || '').toLowerCase();
          const descLower = (d.description || '').toLowerCase();
          return keywords.some((kw: string) => nameLower.includes(kw) || descLower.includes(kw));
        }
        return true;
      }).slice(0, 15);

      let guideDishesHtml = '';
      const guideItemsSchema: any[] = [];

      guideDishes.forEach((gd: any, j: number) => {
        const gdName = gd.name || '';
        const gdPrice = gd.price || 0;
        const gdRest = gd.restaurant_name || 'Delhi Cafe';
        const gdRestSlug = gd.restaurant_slug || '';
        const gdSlug = gd.slug || '';
        const gdDesc = gd.description || '';
        const deliveryEst = Math.round(gdPrice * 1.32 + 25);
        const savings = deliveryEst - gdPrice;
        const dishLink = gdSlug ? `/food/${gdSlug}` : `/restaurant/${gdRestSlug}`;

        guideItemsSchema.push({
          '@type': 'ListItem',
          position: j + 1,
          name: `${gdName} at ${gdRest}`,
          url: `${DOMAIN}${dishLink}`,
        });

        guideDishesHtml += `
          <div style="background: #FFFFFF; border: 1px solid #E7E2DA; border-radius: 16px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
                <h3 style="font-size: 16px; font-weight: 800; color: #1C1917; margin: 0;">
                  <a href="${dishLink}" style="color: inherit; text-decoration: none;">#${j + 1} ${escapeHtml(gdName)}</a>
                </h3>
                <span style="font-weight: 900; color: #0F766E; font-size: 16px;">₹${gdPrice}</span>
              </div>
              <div style="font-size: 12px; color: #78716C; margin-bottom: 8px;">
                at <a href="/restaurant/${escapeHtml(gdRestSlug)}" style="color: #FF5A36; font-weight: 700; text-decoration: none;">${escapeHtml(gdRest)}</a>
              </div>
              ${gdDesc ? `<p style="font-size: 13px; color: #57534E; margin: 0 0 10px 0; line-height: 1.4;">${escapeHtml(gdDesc)}</p>` : ''}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid #F5F1EB; font-size: 12px;">
              <span style="color: #0F766E; font-weight: 700; background: #ECFDF5; padding: 2px 8px; border-radius: 9999px;">Save ₹${savings} vs apps</span>
              <a href="${dishLink}" style="color: #FF5A36; font-weight: 700; text-decoration: none;">View Counter Menu &rarr;</a>
            </div>
          </div>
        `;
      });

      let faqsHtml = '';
      const faqSchemaItems: any[] = [];
      faqs.forEach((fq: any) => {
        faqSchemaItems.push({
          '@type': 'Question',
          name: fq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: fq.a,
          },
        });
        faqsHtml += `
          <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #E7E2DA;">
            <h3 style="font-size: 16px; font-weight: 800; color: #1C1917; margin: 0 0 6px 0;">${escapeHtml(fq.q)}</h3>
            <p style="font-size: 14px; color: #57534E; line-height: 1.6; margin: 0;">${escapeHtml(fq.a)}</p>
          </div>
        `;
      });

      let sectionsHtml = '';
      introSections.forEach((sec: any) => {
        sectionsHtml += `
          <section style="margin-bottom: 24px;">
            <h2 style="font-size: 22px; font-weight: 800; color: #1C1917; margin: 0 0 8px 0;">${escapeHtml(sec.heading)}</h2>
            <p style="font-size: 15px; color: #44403C; line-height: 1.7; margin: 0;">${escapeHtml(sec.body)}</p>
          </section>
        `;
      });

      const guideSchema = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Article',
            '@id': `${pageUrl}#article`,
            headline: gTitle,
            description: metaDesc,
            image: [heroImg],
            datePublished: g.publishedDate || '2026-11-16',
            dateModified: g.updatedDate || '2026-11-16',
            author: {
              '@type': 'Organization',
              name: 'Menu Maps Editorial Team',
              url: `${DOMAIN}/about`,
            },
            publisher: {
              '@type': 'Organization',
              name: 'Menu Maps',
              url: DOMAIN,
              logo: `${DOMAIN}/logo.jpg`,
            },
            mainEntityOfPage: pageUrl,
          },
          {
            '@type': 'ItemList',
            '@id': `${pageUrl}#items`,
            name: `Top Real Dishes for ${g.shortTitle || ''}`,
            itemListElement: guideItemsSchema,
          },
          {
            '@type': 'FAQPage',
            '@id': `${pageUrl}#faq`,
            mainEntity: faqSchemaItems,
          },
          {
            '@type': 'BreadcrumbList',
            '@id': `${pageUrl}#breadcrumbs`,
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${DOMAIN}/` },
              { '@type': 'ListItem', position: 2, name: 'Food Guides', item: `${DOMAIN}/guides` },
              { '@type': 'ListItem', position: 3, name: g.shortTitle || 'Guide', item: pageUrl },
            ],
          },
        ],
      };

      const guideFallback = `
        ${getSharedHeader()}
        <main style="max-width: 900px; margin: 30px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <nav style="font-size: 13px; color: #78716C; margin-bottom: 16px;">
            <a href="/" style="color: #FF5A36; text-decoration: none;">Home</a> &gt; 
            <a href="/guides" style="color: #FF5A36; text-decoration: none;">Food Guides</a> &gt; 
            <span>${escapeHtml(g.shortTitle || 'Guide')}</span>
          </nav>
          <article>
            <header style="margin-bottom: 24px;">
              <span style="background: #FFF7ED; color: #C2410C; border: 1px solid #FED7AA; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase;">
                ${escapeHtml(g.badge || 'Food Guide')}
              </span>
              <h1 style="font-size: 34px; font-weight: 900; color: #1C1917; margin: 12px 0 10px 0; line-height: 1.25;">
                ${escapeHtml(gTitle)}
              </h1>
              <p style="font-size: 16px; color: #57534E; line-height: 1.6; margin: 0;">
                ${escapeHtml(g.summary || '')}
              </p>
            </header>

            <div style="margin-bottom: 30px; border-radius: 18px; overflow: hidden; max-height: 380px;">
              <img src="${escapeHtml(heroImg)}" alt="${escapeHtml(gTitle)}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>

            ${sectionsHtml}

            <section style="margin: 36px 0;">
              <div style="margin-bottom: 18px;">
                <span style="color: #0F766E; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Ground Verified Menus</span>
                <h2 style="font-size: 24px; font-weight: 800; color: #1C1917; margin: 4px 0 0 0;">Recommended Dishes &amp; Real Counter Rates</h2>
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
                ${guideDishesHtml}
              </div>
            </section>

            <section style="background: #FFFFFF; border: 1px solid #E7E2DA; border-radius: 18px; padding: 24px; margin: 36px 0;">
              <h2 style="font-size: 22px; font-weight: 800; color: #1C1917; margin: 0 0 18px 0;">Frequently Asked Questions</h2>
              ${faqsHtml}
            </section>
          </article>
        </main>
      `;

      let gHtml = template;
      gHtml = gHtml.replace(/<title>.*?<\/title>/, `<title>${metaTitle}</title>`);
      gHtml = gHtml.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${metaDesc}" />`);
      gHtml = gHtml.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${pageUrl}" />`);
      gHtml = gHtml.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${metaTitle}" />`);
      gHtml = gHtml.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${metaDesc}" />`);
      gHtml = gHtml.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${pageUrl}" />`);
      gHtml = gHtml.replace('</head>', `<script type="application/ld+json">${JSON.stringify(guideSchema)}</script>\n  </head>`);
      gHtml = replaceRoot(gHtml, guideFallback);

      writeHtmlSnapshot(`guides/${slug}`, gHtml);
    }

    console.log(`[SSG Engine] Pre-rendered /guides hub and ${foodGuides.length} food decision guides.`);
  }

  // -------------------------------------------------------------
  // 4. PRE-RENDER HOMEPAGE (dist/index.html)
  // -------------------------------------------------------------
  const topCafes = restaurants.slice(0, 12);
  let topCafesHtml = '';
  for (const c of topCafes) {
    const cName = c.name || 'Delhi Cafe';
    const cSlug = c.slug || '';
    const cCity = c.city_area || c.city || 'Delhi NCR';
    const cCost = c.average_cost_for_two || 350;
    const cImg = c.cover_image_url || 'https://menumaps.in/logo.jpg';

    topCafesHtml += `
      <article style="background: #FFFFFF; border: 1px solid #E7E2DA; border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
        <div>
          <div style="height: 180px; overflow: hidden; background: #FAF8F5;">
            <img src="${escapeHtml(cImg)}" alt="${escapeHtml(cName)}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <div style="padding: 16px;">
            <h3 style="font-size: 18px; font-weight: 800; color: #1C1917; margin: 0 0 4px 0;">
              <a href="/restaurant/${cSlug}" style="color: inherit; text-decoration: none;">${escapeHtml(cName)}</a>
            </h3>
            <p style="font-size: 13px; color: #78716C; margin: 0 0 10px 0;">${escapeHtml(cCity)} • ₹${cCost} for two</p>
          </div>
        </div>
        <div style="padding: 12px 16px; background: #FAF8F5; border-top: 1px solid #E7E2DA; display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 700;">
          <span style="color: #0F766E;">✓ 100% Counter Rate</span>
          <a href="/restaurant/${cSlug}" style="color: #FF5A36; text-decoration: none;">View Menu &rarr;</a>
        </div>
      </article>
    `;
  }

  const homeFallback = `
    ${getSharedHeader()}
    <main style="max-width: 1200px; margin: 36px auto; padding: 0 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <header style="max-width: 820px; margin-bottom: 36px;">
        <div style="display: inline-flex; align-items: center; gap: 8px; background: #FFF7ED; color: #C2410C; border: 1px solid #FED7AA; padding: 4px 14px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px;">
          ✓ 770+ Verified Delhi NCR Cafes &amp; 6,700+ Counter Dishes
        </div>
        <h1 style="font-size: 42px; font-weight: 900; color: #1C1917; margin: 0 0 16px 0; line-height: 1.15; letter-spacing: -0.5px;">
          Eat at <span style="color: #FF5A36;">exact counter prices.</span> Skip delivery app markups.
        </h1>
        <p style="font-size: 18px; color: #57534E; line-height: 1.6; margin: 0 0 24px 0;">
          Menu Maps gives you direct access to 100% verified in-store counter menus across Delhi NCR. Check genuine physical menu prices before walking in, or place direct orders straight to the kitchen over WhatsApp with 0% delivery app markup.
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 14px;">
          <a href="/restaurants" style="display: inline-flex; align-items: center; gap: 8px; background: #D8350F; color: #FFFFFF; font-weight: 800; font-size: 15px; padding: 14px 28px; border-radius: 16px; text-decoration: none; box-shadow: 0 2px 8px rgba(216,53,15,0.25);">
            Explore 770+ Verified Menus &rarr;
          </a>
          <a href="/guides" style="display: inline-flex; align-items: center; gap: 8px; background: #0F766E; color: #FFFFFF; font-weight: 800; font-size: 15px; padding: 14px 24px; border-radius: 16px; text-decoration: none;">
            Food Decision Guides
          </a>
          <a href="/nearby" style="display: inline-flex; align-items: center; gap: 8px; background: #FFFFFF; color: #1C1917; border: 1px solid #E7E2DA; font-weight: 700; font-size: 15px; padding: 14px 24px; border-radius: 16px; text-decoration: none;">
            Best Cafes Near Me
          </a>
        </div>
      </header>

      <section style="margin-bottom: 48px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 20px;">
          <div>
            <span style="color: #0F766E; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px;">Verified Counter Menus</span>
            <h2 style="font-size: 26px; font-weight: 800; color: #1C1917; margin: 4px 0 0 0;">Top Dining Spots &amp; Cafes in Delhi NCR</h2>
          </div>
          <a href="/restaurants" style="color: #FF5A36; font-weight: 700; font-size: 14px; text-decoration: none;">View All 770+ Cafes &rarr;</a>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
          ${topCafesHtml}
        </div>
      </section>
    </main>
  `;

  // Pre-render Core Pages so direct links NEVER 404 on any static host or direct browser navigation
  function prerenderCorePage(
    relPath: string,
    title: string,
    desc: string,
    h1: string,
    bodyContent: string
  ) {
    const pageUrl = `${DOMAIN}/${relPath}`;
    let html = template;
    html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
    html = html.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${desc}" />`);
    html = html.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${pageUrl}" />`);
    html = html.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`);
    html = html.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${desc}" />`);
    html = html.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${pageUrl}" />`);

    const mainFallback = `
      ${getSharedHeader()}
      <main style="max-width: 1200px; margin: 0 auto; padding: 32px 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <header style="margin-bottom: 32px;">
          <h1 style="font-size: 34px; font-weight: 900; color: #1C1917; margin: 0 0 12px 0;">${h1}</h1>
          <p style="font-size: 16px; color: #57534E; line-height: 1.6; margin: 0;">${desc}</p>
        </header>
        <section style="background: #FFFFFF; border: 1px solid #E7E2DA; border-radius: 20px; padding: 24px;">
          ${bodyContent}
        </section>
      </main>
    `;

    html = replaceRoot(html, mainFallback);
    writeHtmlSnapshot(relPath, html);
  }

  console.log('[SSG Engine] Pre-rendering core pages (/restaurants, /search, /nearby, /about, /contact, /terms, /privacy, /list-cafe, /bookmarks)...');

  // 1. /restaurants
  prerenderCorePage(
    'restaurants',
    'Verified Restaurants, Cafes & Menus in Delhi NCR | Menu Maps',
    'Explore 770+ verified dining spots, student cafes, and iconic restaurants across Delhi NCR with authentic in-store pricing and 0% markup.',
    'Verified Restaurants & Cafes in Delhi NCR',
    `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">${topCafesHtml}</div>`
  );

  // 2. /search
  prerenderCorePage(
    'search',
    'Search Cafes, Dishes & Real Counter Menus in Delhi NCR | Menu Maps',
    'Search over 6,700+ dishes and 770+ cafes across Delhi NCR. Instant verified in-store counter prices with 0% delivery app markup.',
    'Search Verified Menus & Dishes',
    `<p style="font-size: 15px; color: #57534E;">Use Menu Maps to search for dishes, cafes, and localities across Delhi NCR with 100% verified counter pricing.</p>
     <div style="margin-top: 20px; display: flex; gap: 12px; flex-wrap: wrap;">
       <a href="/restaurants" style="background: #1C1917; color: #FFF; padding: 10px 20px; border-radius: 12px; text-decoration: none; font-weight: 700;">Browse All Cafes</a>
       <a href="/guides" style="background: #FF5A36; color: #FFF; padding: 10px 20px; border-radius: 12px; text-decoration: none; font-weight: 700;">Food Decision Guides</a>
     </div>`
  );

  // 3. /nearby
  prerenderCorePage(
    'nearby',
    'Best Cafes & Restaurants Near Me in Delhi NCR | Menu Maps',
    'Find verified cafes, dining spots, and digital menus near your live location in Delhi NCR with authentic counter pricing.',
    'Best Cafes & Restaurants Near You',
    `<p style="font-size: 15px; color: #57534E;">Discover verified dining spots closest to your live ground GPS coordinates in Delhi NCR with walking time and metro transit directions.</p>
     <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; margin-top: 20px;">${topCafesHtml}</div>`
  );

  // 4. /about
  prerenderCorePage(
    'about',
    'About Menu Maps – 100% Real Counter Menus & Price Transparency',
    'Learn how Menu Maps brings honest, verified in-store counter pricing and zero-commission dining to Delhi NCR.',
    'About Menu Maps',
    `<p style="font-size: 15px; color: #44403C; line-height: 1.8;">
       Menu Maps is built to solve one core problem: <strong>delivery apps inflate food prices by 20% to 40%</strong> and keep diners in the dark about actual in-store rates.<br /><br />
       We photograph, verify, and digitize official in-store counter menus across 770+ cafes in Delhi NCR. Whether you are dining in, taking away, or ordering directly over WhatsApp, you pay the authentic counter price with 0% middleman markup.
     </p>`
  );

  // 5. /contact
  prerenderCorePage(
    'contact',
    'Contact Menu Maps – Support, Cafe Partnerships & Inquiries',
    'Get in touch with the Menu Maps team for cafe listings, partner support, menu corrections, and general inquiries.',
    'Contact Menu Maps',
    `<p style="font-size: 15px; color: #44403C; line-height: 1.8;">
       Have a question, feedback, or want to list your cafe? Reach out to our Delhi NCR operations team at <a href="mailto:contact@menumaps.in" style="color: #FF5A36; font-weight: 700;">contact@menumaps.in</a>.
     </p>`
  );

  // 6. /terms
  prerenderCorePage(
    'terms',
    'Terms of Service | Menu Maps',
    'Read the Terms of Service for using Menu Maps verified menu platform.',
    'Terms of Service',
    `<p style="font-size: 14px; color: #57534E; line-height: 1.8;">
       By accessing and using Menu Maps (https://menumaps.in), you agree to these Terms of Service. Menu Maps provides informational directory access to verified restaurant menus and direct communication channels.
     </p>`
  );

  // 7. /privacy
  prerenderCorePage(
    'privacy',
    'Privacy Policy | Menu Maps',
    'Privacy Policy and data practices for Menu Maps.',
    'Privacy Policy',
    `<p style="font-size: 14px; color: #57534E; line-height: 1.8;">
       Menu Maps respects your privacy. We do not sell user data. Location access is requested solely to calculate real-world walking and driving distances to nearby verified dining venues.
     </p>`
  );

  // 8. /list-cafe
  prerenderCorePage(
    'list-cafe',
    'List & Claim Your Cafe on Menu Maps – 0% Commission Digital Menus',
    'Add your cafe or restaurant to Menu Maps with 100% free digital menus and direct WhatsApp orders.',
    'List & Claim Your Cafe on Menu Maps',
    `<p style="font-size: 15px; color: #44403C; line-height: 1.8;">
       Own a cafe or restaurant in Delhi NCR? Join the Menu Maps partner network with zero onboarding fees and 0% commission on orders. Reach local college students and food lovers directly.
     </p>`
  );

  // 9. /bookmarks
  prerenderCorePage(
    'bookmarks',
    'Saved Cafes & Bookmarked Dishes | Menu Maps',
    'View your saved cafes and bookmarked dishes on Menu Maps.',
    'Your Bookmarks & Saved Menus',
    `<p style="font-size: 15px; color: #57534E;">Quickly access your favorite saved cafes, dishes, and curated dining spots across Delhi NCR.</p>`
  );

  const homeHtml = replaceRoot(template, homeFallback);
  fs.writeFileSync(DIST_INDEX, homeHtml, 'utf-8');
  console.log(`[SSG Engine] Pre-rendered homepage (dist/index.html) with top verified cafes.`);

  console.log(`[SSG Engine] Static pre-rendering successfully completed! Zero external python dependencies.`);
}

runPrerender().catch((err) => {
  console.error('[SSG Engine Fatal Error]:', err);
  process.exit(1);
});

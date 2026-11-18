import fs from 'node:fs';
import path from 'node:path';

const INDEXNOW_KEY = 'c7f6b92a184d41e2b5821c901e9e30a5';
const HOST = 'menumaps.in';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

async function submitIndexNow() {
  const PRERENDER_DATA = path.resolve('dist/prerender_data.json');
  const urls: string[] = [
    `https://${HOST}/`,
    `https://${HOST}/restaurants`,
    `https://${HOST}/guides`,
    `https://${HOST}/guides/what-to-eat-today`,
    `https://${HOST}/guides/food-ideas-for-dinner`,
    `https://${HOST}/guides/best-food-near-me`,
    `https://${HOST}/guides/best-food-under-200`,
    `https://${HOST}/guides/late-night-food-delhi`,
    `https://${HOST}/nearby`,
    `https://${HOST}/search`,
  ];

  if (fs.existsSync(PRERENDER_DATA)) {
    try {
      const data = JSON.parse(fs.readFileSync(PRERENDER_DATA, 'utf-8'));
      // Add up to top 200 restaurants and top 200 dishes to keep initial payload nimble
      for (const r of (data.restaurants || []).slice(0, 200)) {
        if (r.slug) urls.push(`https://${HOST}/restaurant/${r.slug}`);
      }
      for (const d of (data.dishes || []).slice(0, 200)) {
        if (d.slug) urls.push(`https://${HOST}/food/${d.slug}`);
      }
    } catch (e) {
      console.warn('Could not read prerender_data.json, submitting core URLs only:', e);
    }
  }

  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls
  };

  console.log(`[IndexNow] Submitting ${urls.length} URLs to api.indexnow.org...`);
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok || res.status === 200 || res.status === 202) {
      console.log(`✅ [IndexNow] Successfully submitted ${urls.length} URLs (Status: ${res.status}). Search engines notified for crawling.`);
    } else {
      const text = await res.text();
      console.warn(`⚠️ [IndexNow] Received status ${res.status}: ${text}`);
    }
  } catch (err) {
    console.warn(`[IndexNow] Network submission skipped (optional or sandboxed environment):`, err);
  }
}

submitIndexNow();

const fs = require('fs');

const originalSeed = fs.readFileSync('src/lib/seedData.ts', 'utf8');
const newCafes = JSON.parse(fs.readFileSync('scripts/new20Cafes.json', 'utf8'));

console.log('Original seed length:', originalSeed.length);
console.log('New cafes count:', newCafes.length);

const pad12 = (num) => String(num).padStart(12, '0');
const restUuid = (idx) => `11111111-0000-4000-8000-${pad12(idx)}`;
const catUuid = (idx) => `22222222-0000-4000-8000-${pad12(idx)}`;
const dishUuid = (idx) => `33333333-0000-4000-8000-${pad12(idx)}`;

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Extract original 10 restaurants
const restArrayMatch = originalSeed.match(/const restaurants: Restaurant\[\] = (\[[\s\S]*?\n  \];)\n\n  \/\/ Helper/);
if (!restArrayMatch) {
  console.error('Could not match restaurants array in seedData.ts');
  process.exit(1);
}

// Extract existing categories
const catArrayMatch = originalSeed.match(/const categories: MenuCategory\[\] = (\[[\s\S]*?\n  \];)\n\n  let itemIdx/);
if (!catArrayMatch) {
  console.error('Could not match categories array');
  process.exit(1);
}

// Extract existing menuItems
const itemArrayMatch = originalSeed.match(/const menuItems: MenuItem\[\] = (\[[\s\S]*?\n  \];)\n\n  \/\/ Collections/);
if (!itemArrayMatch) {
  console.error('Could not match menuItems array');
  process.exit(1);
}

console.log('Matches found successfully');

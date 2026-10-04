import { BookmarkStore } from '../types/database';

const BOOKMARK_STORAGE_KEY = 'menumap_bookmarks';

export function getBookmarks(): BookmarkStore {
  try {
    const raw = localStorage.getItem(BOOKMARK_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading bookmarks:', e);
  }
  return {
    restaurants: [],
    dishes: [],
    collections: [],
  };
}

export function saveBookmarks(store: BookmarkStore) {
  try {
    localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new Event('menumap_bookmarks_updated'));
  } catch (e) {
    console.error('Error saving bookmarks:', e);
  }
}

export function isBookmarked(type: 'restaurant' | 'dish' | 'collection', id: string): boolean {
  const store = getBookmarks();
  if (type === 'restaurant') return store.restaurants.includes(id);
  if (type === 'dish') return store.dishes.includes(id);
  if (type === 'collection') return store.collections.includes(id);
  return false;
}

export function toggleBookmark(type: 'restaurant' | 'dish' | 'collection', id: string): boolean {
  const store = getBookmarks();
  let nowBookmarked = false;

  if (type === 'restaurant') {
    const idx = store.restaurants.indexOf(id);
    if (idx >= 0) {
      store.restaurants.splice(idx, 1);
    } else {
      store.restaurants.push(id);
      nowBookmarked = true;
    }
  } else if (type === 'dish') {
    const idx = store.dishes.indexOf(id);
    if (idx >= 0) {
      store.dishes.splice(idx, 1);
    } else {
      store.dishes.push(id);
      nowBookmarked = true;
    }
  } else if (type === 'collection') {
    const idx = store.collections.indexOf(id);
    if (idx >= 0) {
      store.collections.splice(idx, 1);
    } else {
      store.collections.push(id);
      nowBookmarked = true;
    }
  }

  saveBookmarks(store);
  return nowBookmarked;
}

export function clearAllBookmarks() {
  saveBookmarks({
    restaurants: [],
    dishes: [],
    collections: [],
  });
}

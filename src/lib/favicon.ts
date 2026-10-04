/**
 * Browser Tab Favicon Utility
 * Dynamically updates the browser tab icon (Chrome, Safari, Edge, Firefox)
 * without altering the main website logo in headers or footers.
 */

export function applyBrowserFavicon(iconUrl?: string) {
  if (typeof document === 'undefined') return;
  const targetUrl = iconUrl && iconUrl.trim().length > 0 ? iconUrl.trim() : '/favicon.svg';

  // 1. Target all existing icon tags
  const existingIcons = document.querySelectorAll("link[rel*='icon']");
  if (existingIcons.length > 0) {
    existingIcons.forEach((el) => {
      const link = el as HTMLLinkElement;
      link.href = targetUrl;
    });
  } else {
    // 2. If no icon tag exists, create a new one
    const newIcon = document.createElement('link');
    newIcon.rel = 'icon';
    newIcon.type = targetUrl.endsWith('.svg') ? 'image/svg+xml' : 'image/x-icon';
    newIcon.href = targetUrl;
    document.head.appendChild(newIcon);
  }

  // 3. Update apple-touch-icon if present
  const appleIcon = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement | null;
  if (appleIcon) {
    appleIcon.href = targetUrl;
  }
}

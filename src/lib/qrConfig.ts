/**
 * Restaurant QR & In-Cafe Table Configuration
 * Persists cafe Wi-Fi, table buzzer routing, active perks, and table ranges
 */

export interface RestaurantQrConfig {
  wifiSsid: string;
  wifiPassword?: string;
  showWifiOnStandee: boolean;
  buzzerPhone?: string;
  enabledPerks: string[];
  customPerkNote?: string;
  tableCount: number;
}

export const DEFAULT_PERK_IDS = [
  'discount5',
  'freedip',
  'secretdeal',
  'chaiupgrade',
  'desserttreat',
  'extraportion',
];

const STORAGE_PREFIX = 'menumaps_qr_config_';

export function getRestaurantQrConfig(
  restaurantId: string,
  defaultPhone?: string
): RestaurantQrConfig {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${restaurantId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        wifiSsid: parsed.wifiSsid || '',
        wifiPassword: parsed.wifiPassword || '',
        showWifiOnStandee: parsed.showWifiOnStandee !== false,
        buzzerPhone: parsed.buzzerPhone || defaultPhone || '',
        enabledPerks: Array.isArray(parsed.enabledPerks) && parsed.enabledPerks.length > 0 
          ? parsed.enabledPerks 
          : DEFAULT_PERK_IDS,
        customPerkNote: parsed.customPerkNote || 'Valid on direct WhatsApp counter orders',
        tableCount: parsed.tableCount || 20,
      };
    }
  } catch (err) {
    console.warn('Failed to load QR config from storage:', err);
  }

  return {
    wifiSsid: '',
    wifiPassword: '',
    showWifiOnStandee: true,
    buzzerPhone: defaultPhone || '',
    enabledPerks: DEFAULT_PERK_IDS,
    customPerkNote: 'Valid on direct WhatsApp counter orders',
    tableCount: 20,
  };
}

export function saveRestaurantQrConfig(
  restaurantId: string,
  config: Partial<RestaurantQrConfig>
): RestaurantQrConfig {
  const current = getRestaurantQrConfig(restaurantId);
  const updated: RestaurantQrConfig = {
    ...current,
    ...config,
  };

  try {
    localStorage.setItem(`${STORAGE_PREFIX}${restaurantId}`, JSON.stringify(updated));
    // Dispatch custom event for real-time reactivity
    window.dispatchEvent(
      new CustomEvent('menumaps_qr_config_updated', {
        detail: { restaurantId, config: updated },
      })
    );
  } catch (err) {
    console.error('Failed to save QR config:', err);
  }

  return updated;
}

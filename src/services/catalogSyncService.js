// src/services/catalogSyncService.js
// Service for central cloud syncing of stock catalog text & photo mappings across all devices (Laptop, Mobile, Tablet).
// Uses Supabase Storage public CDN for 0.1s instant global reading on mobile devices.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const BUCKET = 'product-photos';
const STATE_FILENAME = 'catalog_state.json';

const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('xxxx') && !SUPABASE_ANON_KEY.includes('your-'));

/**
 * Save current stock catalog raw text and photo URL mappings to Supabase Cloud Storage.
 * @param {string} rawText - Raw WhatsApp catalog text
 * @param {Object} productPhotos - { [stableId]: [{ url, label }] }
 * @returns {Promise<boolean>} Success status
 */
export async function saveCatalogToCloud(rawText, productPhotos) {
  // Always update local cache first
  try {
    if (typeof rawText === 'string') localStorage.setItem('whatsapp_catalog_raw_text', rawText);
    if (productPhotos) localStorage.setItem('product_photos_v2', JSON.stringify(productPhotos));
  } catch (e) {
    console.warn('Local storage save warning:', e);
  }

  if (!isSupabaseConfigured) return false;

  try {
    const payload = {
      rawText: rawText || '',
      productPhotos: productPhotos || {},
      updatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });

    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${STATE_FILENAME}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'x-upsert': 'true'
      },
      body: blob
    });

    if (!res.ok) {
      console.warn('Supabase cloud sync upload failed:', res.statusText);
      return false;
    }

    console.log('✅ Catalog & photos synced to cloud!');
    return true;
  } catch (err) {
    console.warn('saveCatalogToCloud error:', err);
    return false;
  }
}

/**
 * Fetch central stock catalog text and photo URL mappings from Supabase Cloud Storage.
 * Enables Mobile to immediately load photos uploaded from Laptop!
 * @returns {Promise<{ rawText: string|null, productPhotos: Object|null }>}
 */
export async function fetchCatalogFromCloud() {
  let cloudState = null;

  if (isSupabaseConfigured) {
    try {
      const cdnUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${STATE_FILENAME}?t=${Date.now()}`;
      const res = await fetch(cdnUrl);
      if (res.ok) {
        cloudState = await res.json();
      }
    } catch (err) {
      console.warn('fetchCatalogFromCloud CDN error:', err);
    }
  }

  // Local storage cache fallback
  let localText = null;
  let localPhotos = null;

  try {
    localText = localStorage.getItem('whatsapp_catalog_raw_text');
    const photosStr = localStorage.getItem('product_photos_v2');
    if (photosStr) localPhotos = JSON.parse(photosStr);
  } catch (e) {}

  // Merge cloud state over local cache if cloud is available
  const rawText = cloudState?.rawText || localText;
  const productPhotos = { ...(localPhotos || {}), ...(cloudState?.productPhotos || {}) };

  // Update local cache with merged data
  try {
    if (rawText) localStorage.setItem('whatsapp_catalog_raw_text', rawText);
    if (productPhotos) localStorage.setItem('product_photos_v2', JSON.stringify(productPhotos));
  } catch (e) {}

  return {
    rawText,
    productPhotos
  };
}

// src/services/catalogSyncService.js
// Service for central cloud syncing of stock catalog text & photo mappings across all devices (Laptop, Mobile, Tablet).
// Syncs via backend API /api/catalog (Render / local Flask) for 100% reliable real-time cross-device loading.

import { getApiUrl } from '../config';

/**
 * Save current stock catalog raw text and photo URL mappings to central database.
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

  try {
    const res = await fetch(getApiUrl('/api/catalog'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        rawText: rawText || '',
        productPhotos: productPhotos || {}
      })
    });

    if (res.ok) {
      console.log('✅ Catalog & photos saved to central database!');
      return true;
    }
  } catch (err) {
    console.warn('saveCatalogToCloud backend sync error:', err);
  }

  return false;
}

/**
 * Fetch central stock catalog text and photo URL mappings from central database.
 * Enables Mobile to immediately load photos uploaded from Laptop!
 * @returns {Promise<{ rawText: string|null, productPhotos: Object|null }>}
 */
export async function fetchCatalogFromCloud() {
  let cloudState = null;

  try {
    const res = await fetch(getApiUrl('/api/catalog'));
    if (res.ok) {
      cloudState = await res.json();
    }
  } catch (err) {
    console.warn('fetchCatalogFromCloud error:', err);
  }

  // Local storage cache fallback
  let localText = null;
  let localPhotos = null;

  try {
    localText = localStorage.getItem('whatsapp_catalog_raw_text');
    const photosStr = localStorage.getItem('product_photos_v2');
    if (photosStr) localPhotos = JSON.parse(photosStr);
  } catch (e) {}

  // Merge cloud state over local cache if cloud state is available
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

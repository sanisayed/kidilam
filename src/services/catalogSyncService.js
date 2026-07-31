// src/services/catalogSyncService.js
// Service for central cloud syncing of stock catalog text & photo mappings across all devices (Laptop, Mobile, Tablet).
// Syncs via backend API /api/catalog (Render / local Flask) for 100% reliable real-time cross-device loading.
// Photos use dedicated /api/photos endpoint so they are always saved independent of rawText.

import { getApiUrl } from '../config';

/**
 * Save only photo URL mappings to the dedicated /api/photos backend endpoint.
 * This is the primary function for persisting uploaded photo Google Drive URLs.
 * Completely independent of rawText — always succeeds.
 * @param {Object} productPhotos - { [stableId]: [{ url, label }] }
 * @returns {Promise<boolean>} Success status
 */
export async function savePhotosToCloud(productPhotos) {
  if (!productPhotos || typeof productPhotos !== 'object') return false;

  // Always update local cache first
  try {
    localStorage.setItem('product_photos_v2', JSON.stringify(productPhotos));
  } catch (e) {
    console.warn('Local storage photo save warning:', e);
  }

  try {
    const res = await fetch(getApiUrl('/api/photos'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productPhotos })
    });

    if (res.ok) {
      const result = await res.json();
      console.log(`✅ Photos saved to cloud DB! (${result.totalAlbums} albums)`);
      return true;
    } else {
      console.warn('savePhotosToCloud failed:', res.status);
    }
  } catch (err) {
    console.warn('savePhotosToCloud backend sync error:', err);
  }

  return false;
}

/**
 * Fetch only the photo URL mappings from dedicated /api/photos endpoint.
 * @returns {Promise<Object>} productPhotos map
 */
export async function fetchPhotosFromCloud() {
  try {
    const res = await fetch(getApiUrl('/api/photos'));
    if (res.ok) {
      const data = await res.json();
      const photos = data.productPhotos || {};
      // Update local cache with cloud data
      try {
        if (Object.keys(photos).length > 0) {
          localStorage.setItem('product_photos_v2', JSON.stringify(photos));
        }
      } catch {}
      return photos;
    }
  } catch (err) {
    console.warn('fetchPhotosFromCloud error:', err);
  }

  // Fallback to localStorage
  try {
    const str = localStorage.getItem('product_photos_v2');
    return str ? JSON.parse(str) : {};
  } catch {
    return {};
  }
}

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

  // Save photos via dedicated endpoint (always succeeds regardless of rawText)
  if (productPhotos) {
    savePhotosToCloud(productPhotos).catch(console.warn);
  }

  // Also save rawText via /api/catalog if it has content
  if (rawText && rawText.trim().length > 0) {
    try {
      const res = await fetch(getApiUrl('/api/catalog'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: rawText || '', productPhotos: productPhotos || {} })
      });

      if (res.ok) {
        console.log('✅ Catalog text & photos saved to central database!');
        return true;
      }
    } catch (err) {
      console.warn('saveCatalogToCloud backend sync error:', err);
    }
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

  // Also fetch photos from dedicated endpoint to get most up-to-date
  let cloudPhotos = {};
  try {
    const photosRes = await fetch(getApiUrl('/api/photos'));
    if (photosRes.ok) {
      const photosData = await photosRes.json();
      cloudPhotos = photosData.productPhotos || {};
    }
  } catch {}

  // Local storage cache fallback
  let localText = null;
  let localPhotos = null;

  try {
    localText = localStorage.getItem('whatsapp_catalog_raw_text');
    const photosStr = localStorage.getItem('product_photos_v2');
    if (photosStr) localPhotos = JSON.parse(photosStr);
  } catch (e) {}

  // Merge: cloud photos from /api/photos takes priority (most up-to-date)
  const rawText = cloudState?.rawText || localText;
  const productPhotos = {
    ...(localPhotos || {}),
    ...(cloudState?.productPhotos || {}),
    ...cloudPhotos  // dedicated endpoint has highest priority
  };

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

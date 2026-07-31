// src/services/catalogSyncService.js
// Service for central cloud syncing of stock catalog text & photo mappings across all devices.
// Photos use dedicated /api/photos endpoint so they are always saved independent of rawText.
// All photo uploads go through /api/upload-photo (backend proxy using master's Drive token).

import { getApiUrl } from '../config';

/**
 * Save only photo URL mappings to the dedicated /api/photos backend endpoint.
 * @param {Object} productPhotos - { [stableId]: [{ url, label }] }
 * @returns {Promise<boolean>}
 */
export async function savePhotosToCloud(productPhotos) {
  if (!productPhotos || typeof productPhotos !== 'object') return false;

  // Always update local cache first
  try {
    localStorage.setItem('product_photos_v2', JSON.stringify(productPhotos));
  } catch (e) {}

  try {
    const res = await fetch(getApiUrl('/api/photos'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productPhotos })
    });
    if (res.ok) {
      console.log('✅ Photos saved to cloud DB!');
      return true;
    }
  } catch (err) {
    console.warn('savePhotosToCloud error:', err);
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
 * Delete a specific photo URL from both local state and the cloud DB.
 * This prevents the live poll from restoring deleted photos.
 * @param {string} albumKey - The productPhotos key (stableId)
 * @param {string} photoUrl - The photo URL to delete
 */
export async function deletePhotoFromCloud(albumKey, photoUrl) {
  // Remove from localStorage cache too
  try {
    const str = localStorage.getItem('product_photos_v2');
    if (str) {
      const photos = JSON.parse(str);
      if (photos[albumKey]) {
        photos[albumKey] = photos[albumKey].filter(p => p.url !== photoUrl);
        if (photos[albumKey].length === 0) delete photos[albumKey];
        localStorage.setItem('product_photos_v2', JSON.stringify(photos));
      }
    }
  } catch {}

  try {
    await fetch(getApiUrl('/api/photos'), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ albumKey, url: photoUrl })
    });
  } catch (err) {
    console.warn('deletePhotoFromCloud error:', err);
  }
}

/**
 * Save current stock catalog raw text and photo URL mappings to central database.
 * @param {string} rawText - Raw WhatsApp catalog text
 * @param {Object} productPhotos - { [stableId]: [{ url, label }] }
 * @returns {Promise<boolean>}
 */
export async function saveCatalogToCloud(rawText, productPhotos) {
  // Always update local cache first
  try {
    if (typeof rawText === 'string') localStorage.setItem('whatsapp_catalog_raw_text', rawText);
    if (productPhotos) localStorage.setItem('product_photos_v2', JSON.stringify(productPhotos));
  } catch (e) {}

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
        console.log('✅ Catalog saved to cloud!');
        return true;
      }
    } catch (err) {
      console.warn('saveCatalogToCloud error:', err);
    }
  }

  return false;
}

/**
 * Fetch central stock catalog text and photo URL mappings from central database.
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

  // Also fetch photos from dedicated endpoint (most up-to-date)
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

  const rawText = cloudState?.rawText || localText;

  // ADDITIVE merge only: cloud wins per-album, local kept if cloud doesn't have it
  // This ensures deleted photos (removed from cloud) aren't restored from local cache
  const productPhotos = {};
  // Start with local as base
  if (localPhotos) {
    Object.entries(localPhotos).forEach(([k, v]) => {
      if (Array.isArray(v) && v.length > 0) productPhotos[k] = v;
    });
  }
  // Cloud catalog photos override local
  if (cloudState?.productPhotos) {
    Object.entries(cloudState.productPhotos).forEach(([k, v]) => {
      if (Array.isArray(v) && v.length > 0) productPhotos[k] = v;
      else if (Array.isArray(v) && v.length === 0) delete productPhotos[k]; // respect cloud deletions
    });
  }
  // Dedicated /api/photos has highest priority (most up-to-date)
  if (cloudPhotos) {
    Object.entries(cloudPhotos).forEach(([k, v]) => {
      if (Array.isArray(v) && v.length > 0) productPhotos[k] = v;
      else if (Array.isArray(v) && v.length === 0) delete productPhotos[k]; // respect cloud deletions
    });
  }

  // Update local cache with merged data
  try {
    if (rawText) localStorage.setItem('whatsapp_catalog_raw_text', rawText);
    localStorage.setItem('product_photos_v2', JSON.stringify(productPhotos));
  } catch (e) {}

  return { rawText, productPhotos };
}

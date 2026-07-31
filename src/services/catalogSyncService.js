// src/services/catalogSyncService.js
// Service for central cloud syncing of stock catalog text & photo mappings across all devices.
// Photos use dedicated /api/photos endpoint so they are always saved independent of rawText.
// All photo uploads go through /api/upload-photo (backend proxy using master's Drive token).

import { getApiUrl } from '../config';

/**
 * Helper: Filter out any device-local Base64 data URLs from product photos map.
 * Base64 URLs cannot be shared across devices and break cross-device sync.
 * Only public Google Drive CDN URLs (https://lh3.googleusercontent.com/...) are valid.
 * @param {Object} map
 * @returns {Object} Cleaned photo map
 */
export function filterValidPhotosMap(map) {
  if (!map || typeof map !== 'object') return {};
  const cleanMap = {};
  Object.entries(map).forEach(([key, list]) => {
    if (Array.isArray(list)) {
      const seenUrls = new Set();
      const valid = [];
      list.forEach(item => {
        if (item && item.url && typeof item.url === 'string' && !item.url.startsWith('data:') && !seenUrls.has(item.url)) {
          seenUrls.add(item.url);
          valid.push(item);
        }
      });
      if (valid.length > 0) cleanMap[key] = valid;
    }
  });
  return cleanMap;
}

/**
 * Save only photo URL mappings to the dedicated /api/photos backend endpoint.
 * @param {Object} productPhotos - { [stableId]: [{ url, label }] }
 * @returns {Promise<boolean>}
 */
export async function savePhotosToCloud(productPhotos) {
  if (!productPhotos || typeof productPhotos !== 'object') return false;
  const cleanPhotos = filterValidPhotosMap(productPhotos);

  // Safely update local cache & backup — never wipe local photos with empty map
  if (Object.keys(cleanPhotos).length > 0) {
    try {
      const existingStr = localStorage.getItem('product_photos_v2') || localStorage.getItem('product_photos_backup_v2');
      const existing = existingStr ? (JSON.parse(existingStr) || {}) : {};
      const merged = { ...existing, ...cleanPhotos };
      localStorage.setItem('product_photos_v2', JSON.stringify(merged));
      localStorage.setItem('product_photos_backup_v2', JSON.stringify(merged));
    } catch (e) {}
  }

  try {
    const res = await fetch(getApiUrl('/api/photos'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productPhotos: cleanPhotos })
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
      const photos = filterValidPhotosMap(data.productPhotos || {});
      try {
        localStorage.setItem('product_photos_v2', JSON.stringify(photos));
      } catch {}
      return photos;
    }
  } catch (err) {
    console.warn('fetchPhotosFromCloud error:', err);
  }

  // Fallback to localStorage
  try {
    const str = localStorage.getItem('product_photos_v2');
    return str ? filterValidPhotosMap(JSON.parse(str)) : {};
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
  // Remove from localStorage cache and backup too
  try {
    ['product_photos_v2', 'product_photos_backup_v2'].forEach(storageKey => {
      const str = localStorage.getItem(storageKey);
      if (str) {
        const photos = JSON.parse(str);
        if (photos[albumKey]) {
          photos[albumKey] = photos[albumKey].filter(p => p.url !== photoUrl);
          if (photos[albumKey].length === 0) delete photos[albumKey];
          localStorage.setItem(storageKey, JSON.stringify(photos));
        }
      }
    });
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
 * Clear all uploaded product photos from both local storage cache and cloud DB.
 */
export async function clearAllPhotosFromCloud() {
  try {
    localStorage.removeItem('product_photos_v2');
  } catch {}

  try {
    await fetch(getApiUrl('/api/photos/clear-all'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('🧹 All photos cleared from cloud DB');
    return true;
  } catch (err) {
    console.warn('clearAllPhotosFromCloud error:', err);
    return false;
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
    if (productPhotos && Object.keys(productPhotos).length > 0) {
      localStorage.setItem('product_photos_v2', JSON.stringify(productPhotos));
      localStorage.setItem('product_photos_backup_v2', JSON.stringify(productPhotos));
    }
  } catch (e) {}

  // Save photos via dedicated endpoint (always succeeds regardless of rawText)
  if (productPhotos && Object.keys(productPhotos).length > 0) {
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

  // Local storage cache fallback (ground truth on browser)
  let localText = null;
  let localPhotos = {};
  try {
    localText = localStorage.getItem('whatsapp_catalog_raw_text');
    const photosStr = localStorage.getItem('product_photos_v2');
    if (photosStr) localPhotos = JSON.parse(photosStr) || {};
  } catch (e) {}

  const rawText = cloudState?.rawText || localText;

  // ADDITIVE MERGE: Preserve all local browser photos and merge cloud photos
  const productPhotos = { ...localPhotos };

  if (cloudState?.productPhotos) {
    Object.entries(cloudState.productPhotos).forEach(([k, v]) => {
      if (Array.isArray(v) && v.length > 0) {
        const existing = productPhotos[k] || [];
        const newCloud = v.filter(cp => !existing.some(lp => lp.url === cp.url));
        productPhotos[k] = [...existing, ...newCloud];
      }
    });
  }

  if (cloudPhotos) {
    Object.entries(cloudPhotos).forEach(([k, v]) => {
      if (Array.isArray(v) && v.length > 0) {
        const existing = productPhotos[k] || [];
        const newCloud = v.filter(cp => !existing.some(lp => lp.url === cp.url));
        productPhotos[k] = [...existing, ...newCloud];
      }
    });
  }

  const cleanPhotos = filterValidPhotosMap(productPhotos);

  // Save merged state back to local cache AND backend so new deployments auto-populate
  try {
    if (rawText) localStorage.setItem('whatsapp_catalog_raw_text', rawText);
    localStorage.setItem('product_photos_v2', JSON.stringify(cleanPhotos));
  } catch (e) {}

  if (Object.keys(cleanPhotos).length > 0) {
    savePhotosToCloud(cleanPhotos).catch(() => {});
  }

  return { rawText, productPhotos: cleanPhotos };
}

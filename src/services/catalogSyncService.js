// src/services/catalogSyncService.js
// ============================================================
// ALL DATA GOES TO SUPABASE POSTGRESQL — PERMANENT, NEVER RESETS
// Two tables:
//   catalog_list   → the WhatsApp stock text (1 row)
//   catalog_photos → each laptop's Cloudinary photo links
// ============================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isSupabaseReady = !!(SUPABASE_URL && SUPABASE_KEY && !SUPABASE_URL.includes('xxxx'));

function supabaseHeaders() {
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Prefer': 'return=representation'
  };
}


// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Filter out base64 data: URLs and soft-deleted photos from the photos map.
 * Only valid Cloudinary / CDN URLs that are NOT deleted are kept.
 */
export function filterValidPhotosMap(map) {
  if (!map || typeof map !== 'object') return {};
  const cleanMap = {};
  Object.entries(map).forEach(([key, list]) => {
    if (Array.isArray(list)) {
      const seenUrls = new Set();
      const valid = [];
      list.forEach(item => {
        if (
          item &&
          item.url &&
          typeof item.url === 'string' &&
          !item.url.startsWith('data:') &&
          !item.deleted &&
          !seenUrls.has(item.url)
        ) {
          seenUrls.add(item.url);
          valid.push(item);
        }
      });
      if (valid.length > 0) cleanMap[key] = valid;
    }
  });
  return cleanMap;
}


// ─── CATALOG TEXT ─────────────────────────────────────────────────────────────

export async function saveCatalogTextToSupabase(rawText) {
  if (!isSupabaseReady || !rawText || !rawText.trim()) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/catalog_list`, {
      method: 'POST',
      headers: {
        ...supabaseHeaders(),
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify({ id: 1, raw_text: rawText, updated_at: new Date().toISOString() })
    });
    if (res.ok || res.status === 201 || res.status === 204) {
      console.log('Catalog text saved to Supabase!');
      return true;
    }
  } catch (e) {
    console.warn('saveCatalogTextToSupabase error:', e);
  }
  return false;
}

export async function fetchCatalogTextFromSupabase() {
  if (!isSupabaseReady) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/catalog_list?id=eq.1&select=raw_text`, {
      headers: supabaseHeaders()
    });
    if (res.ok) {
      const rows = await res.json();
      if (rows && rows.length > 0 && rows[0].raw_text) return rows[0].raw_text;
    }
  } catch (e) {
    console.warn('fetchCatalogTextFromSupabase error:', e);
  }
  return null;
}


// ─── PHOTOS ───────────────────────────────────────────────────────────────────

export async function savePhotoAlbumToSupabase(albumKey, modelName, photos) {
  if (!isSupabaseReady || !albumKey || !Array.isArray(photos)) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/catalog_photos`, {
      method: 'POST',
      headers: {
        ...supabaseHeaders(),
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify({
        album_key: albumKey,
        model_name: modelName || albumKey,
        photos: photos,
        updated_at: new Date().toISOString()
      })
    });
    if (res.ok || res.status === 201 || res.status === 204) {
      console.log(`Photos for "${albumKey}" saved to Supabase!`);
      return true;
    }
  } catch (e) {
    console.warn('savePhotoAlbumToSupabase error:', e);
  }
  return false;
}

export async function fetchAllPhotoAlbumsFromSupabase() {
  if (!isSupabaseReady) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/catalog_photos?select=album_key,photos`, {
      headers: supabaseHeaders()
    });
    if (res.ok) {
      const rows = await res.json();
      const map = {};
      rows.forEach(row => {
        if (row.album_key && Array.isArray(row.photos)) {
          const active = row.photos.filter(p => p && p.url && !p.deleted);
          if (active.length > 0) map[row.album_key] = active;
        }
      });
      return map;
    }
  } catch (e) {
    console.warn('fetchAllPhotoAlbumsFromSupabase error:', e);
  }
  return null;
}

export async function softDeletePhotoInSupabase(albumKey, photoUrl) {
  if (!isSupabaseReady || !albumKey || !photoUrl) return false;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/catalog_photos?album_key=eq.${encodeURIComponent(albumKey)}&select=photos`,
      { headers: supabaseHeaders() }
    );
    if (!res.ok) return false;
    const rows = await res.json();
    if (!rows || rows.length === 0) return false;
    const updatedPhotos = (rows[0].photos || []).map(p =>
      p.url === photoUrl ? { ...p, deleted: true } : p
    );
    const updateRes = await fetch(
      `${SUPABASE_URL}/rest/v1/catalog_photos?album_key=eq.${encodeURIComponent(albumKey)}`,
      {
        method: 'PATCH',
        headers: supabaseHeaders(),
        body: JSON.stringify({ photos: updatedPhotos, updated_at: new Date().toISOString() })
      }
    );
    if (updateRes.ok || updateRes.status === 204) {
      console.log(`Photo soft-deleted from "${albumKey}" in Supabase`);
      return true;
    }
  } catch (e) {
    console.warn('softDeletePhotoInSupabase error:', e);
  }
  return false;
}

export async function restorePhotoInSupabase(albumKey, photoUrl = null) {
  if (!isSupabaseReady || !albumKey) return false;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/catalog_photos?album_key=eq.${encodeURIComponent(albumKey)}&select=photos`,
      { headers: supabaseHeaders() }
    );
    if (!res.ok) return false;
    const rows = await res.json();
    if (!rows || rows.length === 0) return false;
    const restoredPhotos = (rows[0].photos || []).map(p => {
      if (p.deleted && (photoUrl === null || p.url === photoUrl)) {
        const { deleted, ...rest } = p;
        return rest;
      }
      return p;
    });
    const updateRes = await fetch(
      `${SUPABASE_URL}/rest/v1/catalog_photos?album_key=eq.${encodeURIComponent(albumKey)}`,
      {
        method: 'PATCH',
        headers: supabaseHeaders(),
        body: JSON.stringify({ photos: restoredPhotos, updated_at: new Date().toISOString() })
      }
    );
    return updateRes.ok || updateRes.status === 204;
  } catch (e) {
    console.warn('restorePhotoInSupabase error:', e);
  }
  return false;
}


// ─── COMBINED FACADE (used by WhatsAppCatalogPanel) ────────────────────────────

export async function saveCatalogToCloud(rawText, productPhotos) {
  // Always update localStorage as fast local cache
  try {
    if (typeof rawText === 'string') localStorage.setItem('whatsapp_catalog_raw_text', rawText);
    if (productPhotos && Object.keys(productPhotos).length > 0) {
      localStorage.setItem('product_photos_v2', JSON.stringify(productPhotos));
    }
  } catch (e) {}

  if (!isSupabaseReady) {
    console.warn('Supabase not configured — data saved to localStorage only');
    return false;
  }

  if (rawText && rawText.trim().length > 0) {
    saveCatalogTextToSupabase(rawText).catch(console.warn);
  }

  if (productPhotos && typeof productPhotos === 'object') {
    Object.entries(productPhotos).forEach(([albumKey, photos]) => {
      if (Array.isArray(photos) && photos.length > 0) {
        savePhotoAlbumToSupabase(albumKey, albumKey, photos).catch(console.warn);
      }
    });
  }
  return true;
}

export async function fetchCatalogFromCloud() {
  let rawText = '';
  let productPhotos = {};

  if (isSupabaseReady) {
    const [cloudText, cloudPhotos] = await Promise.all([
      fetchCatalogTextFromSupabase(),
      fetchAllPhotoAlbumsFromSupabase()
    ]);

    if (cloudText) {
      rawText = cloudText;
      try { localStorage.setItem('whatsapp_catalog_raw_text', rawText); } catch {}
    }
    if (cloudPhotos && Object.keys(cloudPhotos).length > 0) {
      productPhotos = cloudPhotos;
      try { localStorage.setItem('product_photos_v2', JSON.stringify(productPhotos)); } catch {}
    }
  } else {
    try {
      rawText = localStorage.getItem('whatsapp_catalog_raw_text') || '';
      const ps = localStorage.getItem('product_photos_v2');
      productPhotos = ps ? filterValidPhotosMap(JSON.parse(ps)) : {};
    } catch {}
  }

  return { rawText, productPhotos };
}

export async function savePhotosToCloud(productPhotos) {
  if (!productPhotos || typeof productPhotos !== 'object') return false;
  try {
    if (Object.keys(productPhotos).length > 0) {
      localStorage.setItem('product_photos_v2', JSON.stringify(productPhotos));
    }
  } catch {}

  if (!isSupabaseReady) return false;

  const promises = Object.entries(productPhotos).map(([albumKey, photos]) => {
    if (Array.isArray(photos) && photos.length > 0) {
      return savePhotoAlbumToSupabase(albumKey, albumKey, photos);
    }
    return Promise.resolve(false);
  });
  await Promise.allSettled(promises);
  return true;
}

export async function fetchPhotosFromCloud() {
  if (isSupabaseReady) {
    const photos = await fetchAllPhotoAlbumsFromSupabase();
    if (photos) {
      try { localStorage.setItem('product_photos_v2', JSON.stringify(photos)); } catch {}
      return photos;
    }
  }
  try {
    const str = localStorage.getItem('product_photos_v2');
    return str ? filterValidPhotosMap(JSON.parse(str)) : {};
  } catch {
    return {};
  }
}

export async function deletePhotoFromCloud(albumKey, photoUrl) {
  // Remove from localStorage cache
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

  // Soft-delete in Supabase (photo stays in DB with deleted:true)
  if (isSupabaseReady) {
    await softDeletePhotoInSupabase(albumKey, photoUrl);
  }
}

export async function clearAllPhotosFromCloud() {
  try { localStorage.removeItem('product_photos_v2'); } catch {}
  console.warn('clearAllPhotosFromCloud: local cache cleared. Supabase DB is untouched.');
  return true;
}

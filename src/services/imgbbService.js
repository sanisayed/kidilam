// src/services/imgbbService.js
// 100% Zero-Login ImgBB Upload Service for Laptop Catalog Photos (Account: saidali-navas).
// Provides fast, permanent public HTTPS CDN URLs (https://i.ibb.co/...) with zero login requirements.

import { getApiUrl } from '../config';

const USER_IMGBB_KEY = import.meta.env.VITE_IMGBB_API_KEY || 'ce23737d34f6c30a67299fbb631d2f76';

/**
 * Upload a photo to ImgBB via the backend proxy API with direct client-side fallback.
 * @param {File} file - Image file
 * @param {string} modelTitle - Laptop model name (e.g. "Dell Latitude 5410")
 * @param {string} albumKey - stableId key for the album
 * @returns {Promise<string>} Direct ImgBB public HTTPS URL (e.g. https://i.ibb.co/...)
 */
export async function uploadPhotoToImgBB(file, modelTitle, albumKey) {
  // Step 1: Try Backend Upload Proxy
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('albumKey', albumKey || 'General');
    formData.append('modelTitle', modelTitle || albumKey || 'General');

    const res = await fetch(getApiUrl('/api/upload-photo'), {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.url) return data.url;
    }
  } catch (err) {
    console.warn('Backend upload proxy error, falling back to direct ImgBB API:', err);
  }

  // Step 2: Direct Client-Side ImgBB Upload Fallback (Account: saidali-navas)
  const directData = new FormData();
  directData.append('image', file);
  directData.append('name', `${modelTitle || 'laptop'}_${Date.now()}`);

  const directRes = await fetch(`https://api.imgbb.com/1/upload?key=${USER_IMGBB_KEY}`, {
    method: 'POST',
    body: directData,
  });

  if (!directRes.ok) {
    const errData = await directRes.json().catch(() => ({}));
    throw new Error(errData.error?.message || `ImgBB Upload failed (${directRes.status})`);
  }

  const result = await directRes.json();
  if (result.data && (result.data.url || result.data.display_url)) {
    return result.data.url || result.data.display_url;
  }

  throw new Error('Could not retrieve image URL from ImgBB upload response');
}

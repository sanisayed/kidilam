// src/services/imgbbService.js
// 100% Zero-Login ImgBB Upload Service for Laptop Catalog Photos.
// Provides fast, permanent public HTTPS CDN URLs (https://i.ibb.co/...) with zero login requirements.

import { getApiUrl } from '../config';

/**
 * Upload a photo to ImgBB via the backend proxy API.
 * @param {File} file - Image file
 * @param {string} modelTitle - Laptop model name (e.g. "Dell Latitude 5410")
 * @param {string} albumKey - stableId key for the album
 * @returns {Promise<string>} Direct ImgBB public HTTPS URL
 */
export async function uploadPhotoToImgBB(file, modelTitle, albumKey) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('albumKey', albumKey || 'General');
  formData.append('modelTitle', modelTitle || albumKey || 'General');

  const res = await fetch(getApiUrl('/api/upload-photo'), {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Upload failed with status ${res.status}`);
  }

  const data = await res.json();
  if (!data.url) throw new Error('No URL returned from ImgBB upload');
  return data.url;
}

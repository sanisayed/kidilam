// src/services/googleDriveService.js
// Service for Google Drive photo uploads, direct image URL resolution,
// and fetching binary image Blobs for WhatsApp Web ClipboardItem copy.

/**
 * Extract Google Drive File ID from various share link formats.
 * @param {string} url
 * @returns {string|null} File ID or null
 */
export function extractDriveFileId(url) {
  if (!url || typeof url !== 'string') return null;

  // Format 1: drive.google.com/file/d/FILE_ID/view
  const match1 = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1) return match1[1];

  // Format 2: drive.google.com/open?id=FILE_ID or uc?id=FILE_ID
  const match2 = url.match(/drive\.google\.com\/(?:open|uc)\?.*id=([a-zA-Z0-9_-]+)/);
  if (match2) return match2[1];

  // Format 3: googleusercontent.com/d/FILE_ID
  const match3 = url.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (match3) return match3[1];

  return null;
}

/**
 * Get a direct high-res image preview URL from a Google Drive link.
 * @param {string} url - Google Drive URL or File ID
 * @param {number} width - Target width in px (default 1600)
 * @returns {string} High-res direct display URL
 */
export function getDriveDirectImageUrl(url, width = 1600) {
  if (!url) return '';
  const fileId = extractDriveFileId(url);
  if (fileId) {
    // High-res Google Drive direct CDN URL
    return `https://lh3.googleusercontent.com/d/${fileId}=w${width}`;
  }
  // Return original URL if not a Drive link
  return url;
}

/**
 * Fetch a Google Drive or direct image URL as a binary Blob (image/png).
 * Used for placing REAL image files onto system clipboard for Ctrl+V in WhatsApp Web.
 * @param {string} url - Image URL or Google Drive link
 * @returns {Promise<Blob>} Binary PNG Blob
 */
export async function fetchDriveImageBlob(url) {
  const directUrl = getDriveDirectImageUrl(url);

  let blob = null;
  try {
    const res = await fetch(directUrl, { mode: 'cors' });
    if (res.ok) blob = await res.blob();
  } catch (e) {
    console.warn('Direct fetch failed, trying proxy fallback:', e);
  }

  // Fallback via CORS proxy if direct fetch is blocked
  if (!blob) {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error('Failed to fetch image binary');
    blob = await res.blob();
  }

  // Convert to image/png for ClipboardItem compatibility
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const objectUrl = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 600;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(objectUrl);
      canvas.toBlob((pngBlob) => {
        if (pngBlob) resolve(pngBlob);
        else reject(new Error('Canvas blob conversion failed'));
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // If canvas fails, return original blob
      resolve(blob);
    };
    img.src = objectUrl;
  });
}

/**
 * Upload a photo file to Google Drive.
 * If Google Drive token is present in env, uses Drive API.
 * Otherwise uses compressed high-quality storage fallback so uploads never fail.
 * @param {File} file
 * @param {string} laptopTitle - Laptop model/specs (e.g. "Dell Latitude 5410")
 * @returns {Promise<string>} Direct image display URL
 */
export async function uploadPhotoToDrive(file, laptopTitle) {
  const driveAccessToken = import.meta.env.VITE_GOOGLE_DRIVE_ACCESS_TOKEN || '';

  if (driveAccessToken) {
    try {
      const safeFolder = (laptopTitle || 'Laptop').replace(/[^a-zA-Z0-9_-]/g, '_');
      const metadata = {
        name: `${safeFolder}_${Date.now()}.jpg`,
        mimeType: 'image/jpeg'
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webContentLink', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${driveAccessToken}` },
        body: form
      });

      if (res.ok) {
        const data = await res.json();
        if (data.id) {
          return `https://lh3.googleusercontent.com/d/${data.id}=w1600`;
        }
      }
    } catch (err) {
      console.warn('Google Drive API upload failed, using fallback:', err);
    }
  }

  // Fallback: Read as Base64 data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

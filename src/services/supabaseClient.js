// src/services/supabaseClient.js
// Supabase Storage helper for product photos.
// Features:
//  - Smart canvas compression before upload (targets ~300KB, best quality)
//  - Google Drive URL import support
//  - Falls back to localStorage Base64 if Supabase is not configured

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const BUCKET = 'product-photos';

const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('xxxx') && !SUPABASE_ANON_KEY.includes('your-'));

// ─── CROSS-DEVICE SYNC ───────────────────────────────────────────────────────

/**
 * List all photos for a product from Supabase Storage.
 * This enables cross-device sync — any device can call this to see all uploaded photos.
 * @param {string} productKey - e.g. "prod_dell_latitude_e5440"
 * @returns {Promise<Array<{url: string, label: string}>>}
 */
export async function listProductPhotos(productKey) {
  if (!isSupabaseConfigured) return [];

  const safeKey = productKey.replace(/[^a-zA-Z0-9_-]/g, '_');

  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prefix: `${safeKey}/`, limit: 50, sortBy: { column: 'created_at', order: 'asc' } })
    });

    if (!res.ok) return [];

    const files = await res.json();
    if (!Array.isArray(files) || files.length === 0) return [];

    return files
      .filter(f => f.name && /\.(jpg|jpeg|png|webp)$/i.test(f.name))
      .map((f, i) => ({
        url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${safeKey}/${f.name}`,
        label: `Photo ${i + 1}`
      }));
  } catch (e) {
    console.warn('listProductPhotos error:', e);
    return [];
  }
}


// ─── COMPRESSION ────────────────────────────────────────────────────────────

/**
 * Compress an image File/Blob using canvas.
 * Targets ~300KB at high visual quality (JPEG 0.88, max 1400px).
 * @param {File|Blob} fileOrBlob
 * @param {Object} opts
 * @param {number} opts.maxDim   - Max width/height in px (default 1400)
 * @param {number} opts.quality  - JPEG quality 0-1 (default 0.88)
 * @param {number} opts.targetKB - Target KB size, will reduce quality iteratively (default 350)
 * @returns {Promise<Blob>} Compressed JPEG blob
 */
export async function compressImage(fileOrBlob, { maxDim = 1400, quality = 0.88, targetKB = 350 } = {}) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(fileOrBlob instanceof Blob ? fileOrBlob : new Blob([fileOrBlob]));
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);

      let w = img.naturalWidth;
      let h = img.naturalHeight;

      // Scale down to maxDim preserving aspect ratio
      if (w > h && w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim; }
      else if (h > maxDim) { w = Math.round((w * maxDim) / h); h = maxDim; }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);

      // Try compressing at current quality; reduce if still too big
      const tryCompress = (q) => {
        canvas.toBlob((blob) => {
          if (!blob) { reject(new Error('Canvas toBlob failed')); return; }
          const kb = blob.size / 1024;
          if (kb > targetKB && q > 0.5) {
            // Reduce quality by 0.08 each step
            tryCompress(Math.max(0.5, q - 0.08));
          } else {
            resolve(blob);
          }
        }, 'image/jpeg', q);
      };

      tryCompress(quality);
    };
    img.onerror = () => reject(new Error('Image load failed for compression'));

    // Handle both File and Blob
    if (fileOrBlob instanceof File || fileOrBlob instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (e) => { img.src = e.target.result; };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrBlob);
    } else {
      reject(new Error('Invalid input: expected File or Blob'));
    }
  });
}

// ─── GOOGLE DRIVE ───────────────────────────────────────────────────────────

/**
 * Detect if a URL is a Google Drive share link and convert it to a direct download URL.
 * Supports both /file/d/{id}/view and open?id={id} formats.
 * @param {string} url
 * @returns {string|null} Direct download URL or null if not a Drive link
 */
export function getDriveDirectUrl(url) {
  if (!url || typeof url !== 'string') return null;

  // Format 1: https://drive.google.com/file/d/FILE_ID/view
  const match1 = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1) {
    return `https://drive.google.com/uc?export=download&id=${match1[1]}`;
  }

  // Format 2: https://drive.google.com/open?id=FILE_ID
  const match2 = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (match2) {
    return `https://drive.google.com/uc?export=download&id=${match2[1]}`;
  }

  // Format 3: https://drive.google.com/uc?id=FILE_ID
  const match3 = url.match(/drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/);
  if (match3) {
    return `https://drive.google.com/uc?export=download&id=${match3[1]}`;
  }

  return null;
}

/**
 * Fetch a photo from a Google Drive share URL, compress it, and return a Blob.
 * @param {string} driveUrl - Google Drive share URL
 * @returns {Promise<Blob>} Compressed JPEG blob
 */
export async function fetchFromGoogleDrive(driveUrl) {
  const directUrl = getDriveDirectUrl(driveUrl);
  if (!directUrl) throw new Error('Not a valid Google Drive URL');

  // Fetch via a CORS proxy since Drive blocks direct browser fetch
  // Using allorigins.win as a lightweight proxy
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`;

  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error(`Drive fetch failed: ${res.status}`);

  const blob = await res.blob();
  if (!blob.type.startsWith('image/')) {
    throw new Error('URL does not point to an image. Make sure sharing is set to "Anyone with the link".');
  }

  return compressImage(blob);
}

// ─── UPLOAD ─────────────────────────────────────────────────────────────────

/**
 * Upload a photo File to Supabase Storage and return the public CDN URL.
 * Compresses the image before uploading.
 * Falls back to returning a base64 data URL if Supabase is not configured.
 * @param {File|Blob} file - Image file
 * @param {string} productKey - Unique product identifier (stableId)
 * @param {number} angleIdx - Photo angle index (0, 1, 2...)
 * @returns {Promise<string>} Public URL or base64 data URL
 */
export async function uploadProductPhoto(file, productKey, angleIdx) {
  // Compress first (always, regardless of storage backend)
  let compressed;
  try {
    compressed = await compressImage(file);
  } catch (e) {
    console.warn('Compression failed, using original:', e);
    compressed = file;
  }

  // Base64 fallback if Supabase not configured
  if (!isSupabaseConfigured) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(compressed);
    });
  }

  // Upload compressed blob to Supabase Storage
  const safeKey = productKey.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `${safeKey}/angle_${angleIdx}_${Date.now()}.jpg`;

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'image/jpeg',
      'x-upsert': 'true'
    },
    body: compressed
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Supabase upload error:', err);
    // Fallback to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(compressed);
    });
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

/**
 * Delete a photo from Supabase Storage by its public URL.
 * Silently ignores if not a Supabase URL (base64 or local).
 * @param {string} url - Public URL of the photo
 */
export async function deleteProductPhoto(url) {
  if (!isSupabaseConfigured || !url || !url.startsWith(SUPABASE_URL)) return;

  const path = url.replace(`${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`, '');

  await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
  }).catch(console.warn);
}

/**
 * Fetch a photo URL and return a Blob object.
 * Works for both Supabase CDN URLs and base64 data URLs.
 * @param {string} url - Photo URL or base64 string
 * @returns {Promise<Blob>}
 */
export async function urlToBlob(url) {
  const res = await fetch(url.startsWith('data:') ? url : url);
  return res.blob();
}

/**
 * Get approximate size info string for a base64 string.
 * @param {string} base64Str
 * @returns {string} e.g. "320 KB"
 */
export function getImageSizeInfo(base64Str) {
  if (!base64Str || !base64Str.startsWith('data:')) return '';
  try {
    const len = base64Str.length - (base64Str.indexOf(',') + 1);
    const bytes = Math.ceil(len * 0.75);
    return bytes > 1024 * 1024
      ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(bytes / 1024)} KB`;
  } catch { return ''; }
}

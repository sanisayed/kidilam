// src/services/supabaseClient.js
// Supabase Storage helper for product photos.
// Falls back to localStorage Base64 if Supabase is not configured.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const BUCKET = 'product-photos';

const isSupabaseConfigured = SUPABASE_URL && SUPABASE_ANON_KEY;

/**
 * Upload a photo File to Supabase Storage and return the public CDN URL.
 * Falls back to returning a base64 data URL if Supabase is not configured.
 * @param {File} file - Image file
 * @param {string} productKey - Unique product identifier (stableId)
 * @param {number} angleIdx - Photo angle index (0, 1, 2...)
 * @returns {Promise<string>} Public URL or base64 data URL
 */
export async function uploadProductPhoto(file, productKey, angleIdx) {
  // Base64 fallback if Supabase not configured
  if (!isSupabaseConfigured) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Upload to Supabase Storage
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${productKey}/angle_${angleIdx}_${Date.now()}.${ext}`;

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': file.type || 'image/jpeg',
      'x-upsert': 'true'
    },
    body: file
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Supabase upload error:', err);
    // Fallback to base64 if upload fails
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Return public URL
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

/**
 * Delete a photo from Supabase Storage by its public URL.
 * Silently ignores if not a Supabase URL (base64 or local).
 * @param {string} url - Public URL of the photo
 */
export async function deleteProductPhoto(url) {
  if (!isSupabaseConfigured || !url.startsWith(SUPABASE_URL)) return;

  const path = url.replace(`${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`, '');

  await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  }).catch(console.warn);
}

/**
 * Fetch a photo URL and return a Blob object.
 * Works for both Supabase CDN URLs and base64 data URLs.
 * @param {string} url - Photo URL or base64 string
 * @returns {Promise<Blob>}
 */
export async function urlToBlob(url) {
  if (url.startsWith('data:')) {
    // base64 → Blob
    const res = await fetch(url);
    return res.blob();
  }
  // CDN URL → Blob
  const res = await fetch(url);
  return res.blob();
}

// src/services/imgbbService.js
// Direct 100% High-Res ImgBB Upload Service for Laptop Catalog Photos (Account: saidali-navas).
// Guarantees EXACTLY ONE upload per image file with zero duplicates.

const USER_IMGBB_KEY = import.meta.env.VITE_IMGBB_API_KEY || 'ce23737d34f6c30a67299fbb631d2f76';

// In-flight upload deduplication cache map
const inflightUploads = new Map();

/**
 * Upload a photo directly to ImgBB (Account: saidali-navas) at 100% original full resolution.
 * @param {File} file - Image file
 * @param {string} modelTitle - Laptop model name (e.g. "Dell Latitude 5410")
 * @param {string} albumKey - stableId key for the album
 * @returns {Promise<string>} Direct ImgBB public HTTPS URL (e.g. https://i.ibb.co/...)
 */
export async function uploadPhotoToImgBB(file, modelTitle, albumKey) {
  if (!file) throw new Error('No file provided for upload');

  // Prevent duplicate concurrent uploads of the same file (same name & size)
  const fileHash = `${file.name}_${file.size}_${albumKey}`;
  if (inflightUploads.has(fileHash)) {
    return inflightUploads.get(fileHash);
  }

  const uploadPromise = (async () => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('name', `${(modelTitle || 'laptop').replace(/[^a-z0-9]/gi, '_')}_${Date.now()}`);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${USER_IMGBB_KEY}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || `ImgBB Upload failed (${res.status})`);
      }

      const result = await res.json();
      if (result.data && (result.data.url || result.data.display_url)) {
        return result.data.url || result.data.display_url;
      }

      throw new Error('Could not retrieve image URL from ImgBB response');
    } finally {
      setTimeout(() => inflightUploads.delete(fileHash), 2000);
    }
  })();

  inflightUploads.set(fileHash, uploadPromise);
  return uploadPromise;
}

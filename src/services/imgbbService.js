// src/services/imgbbService.js
// Multi-Provider Fail-Safe Image Upload Service for Laptop Catalog Photos.
// Sequentially cascades across three free hosting providers:
// 1. ImgBB (Account: saidali-navas)
// 2. FreeImage.host (Zero-setup public guest upload)
// 3. Catbox.moe (Completely free, stable, permanent anonymous upload)
// Guarantees high availability and zero login expiration issues.

const USER_IMGBB_KEY = import.meta.env.VITE_IMGBB_API_KEY || 'ce23737d34f6c30a67299fbb631d2f76';
const FREEIMAGE_HOST_KEY = '6d207e02198a847a53d03a9115d0a5a1'; // Public developer guest API key

// In-flight upload deduplication cache map
const inflightUploads = new Map();

/**
 * Upload a photo with multi-provider fail-safe fallback.
 * @param {File} file - Image file
 * @param {string} modelTitle - Laptop model name
 * @param {string} albumKey - stableId key for the album
 * @returns {Promise<string>} Direct public HTTPS URL
 */
export async function uploadPhotoToImgBB(file, modelTitle, albumKey) {
  if (!file) throw new Error('No file provided for upload');

  // Prevent duplicate concurrent uploads of the same file
  const fileHash = `${file.name}_${file.size}_${albumKey}`;
  if (inflightUploads.has(fileHash)) {
    return inflightUploads.get(fileHash);
  }

  const uploadPromise = (async () => {
    const cleanName = `${(modelTitle || 'laptop').replace(/[^a-z0-9]/gi, '_')}_${Date.now()}`;

    // --- PROVIDER 1: ImgBB ---
    try {
      console.log('🔄 Attempting upload to ImgBB...');
      const formData = new FormData();
      formData.append('image', file);
      formData.append('name', cleanName);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${USER_IMGBB_KEY}`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        if (result.data && (result.data.url || result.data.display_url)) {
          console.log('✅ Uploaded to ImgBB successfully!');
          return result.data.url || result.data.display_url;
        }
      }
    } catch (e) {
      console.warn('⚠️ ImgBB upload failed, trying FreeImage.host:', e);
    }

    // --- PROVIDER 2: FreeImage.host ---
    try {
      console.log('🔄 Attempting upload to FreeImage.host...');
      const formData = new FormData();
      formData.append('key', FREEIMAGE_HOST_KEY);
      formData.append('action', 'upload');
      formData.append('source', file);

      const res = await fetch('https://freeimage.host/api/1/upload/', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        if (result.image && result.image.url) {
          console.log('✅ Uploaded to FreeImage.host successfully!');
          return result.image.url;
        }
      }
    } catch (e) {
      console.warn('⚠️ FreeImage.host upload failed, trying Catbox.moe:', e);
    }

    // --- PROVIDER 3: Catbox.moe ---
    try {
      console.log('🔄 Attempting upload to Catbox.moe...');
      const formData = new FormData();
      formData.append('reqtype', 'fileupload');
      formData.append('fileToUpload', file);

      const res = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().startsWith('https://')) {
          console.log('✅ Uploaded to Catbox.moe successfully!');
          return text.trim();
        }
      }
    } catch (e) {
      console.warn('⚠️ Catbox.moe upload failed:', e);
    }

    throw new Error('All image upload providers failed. Please check internet connection.');
  })();

  // Clear from deduplication map after 2 seconds
  uploadPromise.finally(() => {
    setTimeout(() => inflightUploads.delete(fileHash), 2000);
  });

  inflightUploads.set(fileHash, uploadPromise);
  return uploadPromise;
}

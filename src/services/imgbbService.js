// src/services/imgbbService.js
// Permanent High-Quality Image Upload Service.
// Primary Storage: Cloudinary Permanent CDN Engine (account: jtzr9tat)
// Backup Providers: FreeImage.host, Catbox.moe, ImgBB

import { getApiUrl } from '../config';

const USER_IMGBB_KEY = import.meta.env.VITE_IMGBB_API_KEY || 'ce23737d34f6c30a67299fbb631d2f76';
const FREEIMAGE_HOST_KEY = '6d207e02198a847a53d03a9115d0a5a1';

const inflightUploads = new Map();

/**
 * Upload a photo with Cloudinary primary storage and multi-provider fail-safe fallback.
 * @param {File} file - Original uncompressed high-resolution image file
 * @param {string} modelTitle - Laptop model name
 * @param {string} albumKey - stableId key for the album
 * @returns {Promise<string>} Direct public HTTPS URL
 */
export async function uploadPhotoToImgBB(file, modelTitle, albumKey) {
  if (!file) throw new Error('No file provided for upload');

  const fileHash = `${file.name}_${file.size}_${albumKey}`;
  if (inflightUploads.has(fileHash)) {
    return inflightUploads.get(fileHash);
  }

  const uploadPromise = (async () => {
    const cleanName = `${(modelTitle || 'laptop').replace(/[^a-z0-9]/gi, '_')}_${Date.now()}`;

    // --- PROVIDER 1: Backend Cloudinary Engine (jtzr9tat) ---
    try {
      console.log('🔄 Attempting upload to Cloudinary Permanent CDN via Backend...');
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
        if (data.url) {
          console.log('✅ Uploaded to Cloudinary Permanent Storage successfully!');
          return data.url;
        }
      }
    } catch (e) {
      console.warn('⚠️ Backend Cloudinary upload failed, trying direct providers:', e);
    }

    // --- PROVIDER 2: FreeImage.host ---
    try {
      console.log('🔄 Attempting fallback upload to FreeImage.host...');
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
      console.warn('⚠️ FreeImage.host upload failed:', e);
    }

    // --- PROVIDER 3: Catbox.moe ---
    try {
      console.log('🔄 Attempting fallback upload to Catbox.moe...');
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

    // --- PROVIDER 4: Direct ImgBB ---
    try {
      console.log('🔄 Attempting fallback upload to ImgBB...');
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
      console.warn('⚠️ ImgBB upload failed:', e);
    }

    throw new Error('All image upload providers failed. Please check your internet connection.');
  })();

  uploadPromise.finally(() => {
    setTimeout(() => inflightUploads.delete(fileHash), 2000);
  });

  inflightUploads.set(fileHash, uploadPromise);
  return uploadPromise;
}

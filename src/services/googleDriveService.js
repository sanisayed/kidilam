// src/services/googleDriveService.js
// Service for Google Admin OAuth 2.0 Auth, Automated Google Drive File & Folder Uploads,
// Direct Image URL Resolution, and Binary Image Blob Fetching for WhatsApp Web Clipboard Copy.

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
 * Get a direct high-res image preview URL from a Google Drive link or File ID.
 * @param {string} url - Google Drive URL or File ID
 * @param {number} width - Target width in px (default 1600)
 * @returns {string} High-res direct display URL
 */
export function getDriveDirectImageUrl(url, width = 1600) {
  if (!url) return '';
  const fileId = extractDriveFileId(url);
  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}=w${width}`;
  }
  return url;
}

/**
 * Fetch a Google Drive image as a binary PNG Blob for WhatsApp Web ClipboardItem copy.
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
      resolve(blob);
    };
    img.src = objectUrl;
  });
}

// ─── GOOGLE DRIVE API UPLOAD ──────────────────────────────────────────────────

/**
 * Search or create a folder on Google Drive.
 * @param {string} folderName - Name of the folder
 * @param {string} [parentId] - Optional parent folder ID
 * @param {string} accessToken - Google OAuth Access Token
 * @returns {Promise<string>} Folder ID
 */
export async function getOrCreateDriveFolder(folderName, parentId = null, accessToken) {
  const safeName = folderName.replace(/['"\\]/g, '');
  let query = `name = '${safeName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  }

  const listRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (listRes.ok) {
    const data = await listRes.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
  }

  // Create folder if not found
  const meta = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder'
  };
  if (parentId) {
    meta.parents = [parentId];
  }

  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(meta)
  });

  if (!createRes.ok) {
    throw new Error(`Folder creation failed: ${createRes.statusText}`);
  }

  const newFolder = await createRes.json();
  return newFolder.id;
}

/**
 * Make a Google Drive file publicly viewable so the image can be displayed anywhere.
 * @param {string} fileId
 * @param {string} accessToken
 */
export async function makeDriveFilePublic(fileId, accessToken) {
  await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      role: 'reader',
      type: 'anyone'
    })
  }).catch(console.warn);
}

/**
 * Upload a photo file directly to Google Drive under an organized laptop folder.
 * Automatically sets public view permission and returns direct image CDN URL.
 * @param {File} file - Image file
 * @param {string} laptopTitle - Laptop model/title (e.g. "Dell Latitude 5410")
 * @param {string} accessToken - Google OAuth Access Token
 * @returns {Promise<string>} Direct high-res image URL
 */
export async function uploadPhotoToGoogleDriveApi(file, laptopTitle, accessToken) {
  if (!accessToken) {
    throw new Error('Google Drive Access Token is required. Please sign in with Google first.');
  }

  // 1. Get/Create root folder: /Laptop_Catalog_Photos
  const rootFolderId = await getOrCreateDriveFolder('Laptop_Catalog_Photos', null, accessToken);

  // 2. Get/Create laptop subfolder: /Laptop_Catalog_Photos/Dell_Latitude_5410
  const safeLaptopFolder = (laptopTitle || 'General_Laptop').replace(/[^a-zA-Z0-9_-]/g, '_');
  const laptopFolderId = await getOrCreateDriveFolder(safeLaptopFolder, rootFolderId, accessToken);

  // 3. Upload file via Google Drive Multipart API
  const metadata = {
    name: `${safeLaptopFolder}_${Date.now()}.jpg`,
    parents: [laptopFolderId],
    mimeType: file.type || 'image/jpeg'
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webContentLink', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` },
    body: form
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Google Drive upload error (${uploadRes.status}): ${errText}`);
  }

  const fileData = await uploadRes.json();
  const fileId = fileData.id;

  // 4. Set permission so file can be viewed publicly as an image
  await makeDriveFilePublic(fileId, accessToken);

  // 5. Return direct high-res image CDN URL
  return `https://lh3.googleusercontent.com/d/${fileId}=w1600`;
}

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
/**
 * Make a Google Drive folder publicly writable so staff members can upload directly into Master's folder.
 * @param {string} folderId
 * @param {string} accessToken
 */
export async function makeDriveFolderWritable(folderId, accessToken) {
  await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}/permissions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      role: 'writer',
      type: 'anyone'
    })
  }).catch(console.warn);
}

/**
 * Ensure Master Root Folder exists and return its folder ID.
 * Called by Master to set up shared storage.
 * @param {string} accessToken
 * @returns {Promise<string>} Master folder ID
 */
export async function ensureMasterFolderId(accessToken) {
  const rootFolderId = await getOrCreateDriveFolder('Laptop_Catalog_Photos', null, accessToken);
  await makeDriveFolderWritable(rootFolderId, accessToken);
  return rootFolderId;
}

/**
 * Upload a photo file directly to Google Drive under Master's folder (Option A).
 * Automatically sets public view permission and returns direct image CDN URL.
 * @param {File} file - Image file
 * @param {string} laptopTitle - Laptop model/title (e.g. "Dell Latitude 5410")
 * @param {string} accessToken - Google OAuth Access Token
 * @param {string} [customMasterFolderId] - Master Google Drive Folder ID
 * @returns {Promise<string>} Direct high-res image URL
 */
export async function uploadPhotoToGoogleDriveApi(file, laptopTitle, accessToken, customMasterFolderId = null) {
  if (!accessToken) {
    throw new Error('Google Drive Access Token is required. Please sign in with Google first.');
  }

  // 1. Root folder: Use Master's folder ID if available, otherwise get/create /Laptop_Catalog_Photos
  let rootFolderId = customMasterFolderId;
  if (!rootFolderId) {
    try {
      rootFolderId = await getOrCreateDriveFolder('Laptop_Catalog_Photos', null, accessToken);
    } catch {
      rootFolderId = null;
    }
  }

  // 2. Get/Create laptop subfolder inside Master's folder: /Laptop_Catalog_Photos/Dell_Latitude_5410
  const safeLaptopFolder = (laptopTitle || 'General_Laptop').replace(/[^a-zA-Z0-9_-]/g, '_');
  let laptopFolderId = null;
  if (rootFolderId) {
    try {
      laptopFolderId = await getOrCreateDriveFolder(safeLaptopFolder, rootFolderId, accessToken);
    } catch {
      laptopFolderId = null;
    }
  }

  // 3. Upload file via Google Drive Multipart API
  const parentList = laptopFolderId ? [laptopFolderId] : (rootFolderId ? [rootFolderId] : []);
  const metadata = {
    name: `${safeLaptopFolder}_${Date.now()}.jpg`,
    mimeType: file.type || 'image/jpeg'
  };
  if (parentList.length > 0) {
    metadata.parents = parentList;
  }

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

/**
 * Scan Google Drive for all uploaded laptop catalog photos inside Laptop_Catalog_Photos
 * and return a productPhotos map { [stableId]: [{ url, label }] }.
 * Restores photos even if browser localstorage or database setting was reset!
 * @param {string} accessToken
 * @param {string} [masterFolderId]
 * @returns {Promise<Object>} productPhotos map
 */
export async function scanAndRecoverDrivePhotos(accessToken, masterFolderId = null) {
  if (!accessToken) return {};

  let rootId = masterFolderId;
  if (!rootId) {
    try {
      rootId = await getOrCreateDriveFolder('Laptop_Catalog_Photos', null, accessToken);
    } catch {
      return {};
    }
  }

  const photosMap = {};

  try {
    // 1. List all subfolders inside Laptop_Catalog_Photos
    const subfolderQuery = `'${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const folderRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(subfolderQuery)}&fields=files(id,name)&pageSize=100`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    const subfolders = folderRes.ok ? (await folderRes.json()).files || [] : [];
    const allFolders = [{ id: rootId, name: 'root' }, ...subfolders];

    for (const folder of allFolders) {
      const imgQuery = `'${folder.id}' in parents and mimeType contains 'image/' and trashed = false`;
      const imgRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(imgQuery)}&fields=files(id,name,createdTime)&pageSize=100`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (imgRes.ok) {
        const files = (await imgRes.json()).files || [];
        files.forEach((f, idx) => {
          makeDriveFilePublic(f.id, accessToken).catch(() => {});
          const directUrl = `https://lh3.googleusercontent.com/d/${f.id}=w1600`;

          let key = folder.name !== 'root' ? folder.name.toLowerCase() : f.name.toLowerCase().split('_')[0];
          if (!key.startsWith('prod_')) key = `prod_${key}`;

          if (!photosMap[key]) photosMap[key] = [];
          if (!photosMap[key].some(item => item.url === directUrl)) {
            photosMap[key].push({
              url: directUrl,
              label: `Photo ${photosMap[key].length + 1}`
            });
          }
        });
      }
    }
  } catch (e) {
    console.warn('scanAndRecoverDrivePhotos warning:', e);
  }

  return photosMap;
}



/**
 * Upload a photo via the backend proxy — uses master's stored Google Drive token.
 * Works for ALL users (staff, approved admin, master) — no Google login required on client.
 * The backend uploads to mahinshanavas1@gmail.com's Drive, making URL visible to everyone.
 * @param {File} file - Image file to upload
 * @param {string} modelTitle - Laptop model name (e.g. "Dell Latitude 5410")
 * @param {string} albumKey - stableId used as album key in productPhotos map
 * @param {string} apiBaseUrl - Backend API base URL (from getApiUrl(''))
 * @returns {Promise<string>} Public Google Drive image URL
 */
export async function uploadPhotoViaBackend(file, modelTitle, albumKey, apiBaseUrl = '') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('albumKey', albumKey || 'General');
  formData.append('modelTitle', modelTitle || albumKey || 'General');

  const endpoint = `${apiBaseUrl}/api/upload-photo`;
  const res = await fetch(endpoint, {
    method: 'POST',
    body: formData,
    // No Content-Type header — browser sets it with boundary for multipart
  });

  if (res.status === 503) {
    const errData = await res.json().catch(() => ({}));
    if (errData.error === 'master_token_expired') {
      throw new Error('MASTER_TOKEN_EXPIRED');
    }
    throw new Error(`Upload service unavailable: ${errData.message || res.statusText}`);
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(`Upload failed (${res.status}): ${errData.error || res.statusText}`);
  }

  const data = await res.json();
  if (!data.url) throw new Error('No URL returned from upload');
  return data.url;
}

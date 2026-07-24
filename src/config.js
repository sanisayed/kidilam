// API Configuration for Dev & Production Environments

let rawUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '').trim();

if (rawUrl && !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
  rawUrl = `https://${rawUrl}`;
}

export const API_BASE_URL = rawUrl;

export function getApiUrl(path) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE_URL) {
    return cleanPath;
  }
  return `${API_BASE_URL}${cleanPath}`;
}

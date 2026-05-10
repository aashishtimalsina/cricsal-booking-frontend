/**
 * Turn API media paths into a browser-loadable URL when the API returns a
 * host-relative path (e.g. /storage/...) while the SPA runs on another origin.
 */
export function resolveMediaUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const api = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const origin = api.replace(/\/api\/?$/, '');
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
}

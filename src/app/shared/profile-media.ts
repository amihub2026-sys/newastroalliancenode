import { environment } from '../../environments/environment';

/** Keep uploaded relative paths on the API host; keep bundled assets on the Angular host. */
export function profileMediaUrl(value: unknown): string {
  if (typeof value !== 'string') return '';
  const url = value.trim();
  if (!url || /^(?:javascript|data|file):/i.test(url)) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (/^(?:assets|\.\/assets)\//i.test(url)) return url.replace(/^\.\//, '');
  if (url.includes('..') || !/^\/?[\w./%()\- ]+$/.test(url)) return '';
  const apiHost = environment.apiUrl.replace(/\/api\/?$/, '');
  return `${apiHost}/${url.replace(/^\//, '')}`;
}

export function profileGalleryUrls(input: unknown): string[] {
  const arr = Array.isArray(input) ? input : typeof input === 'string' ? (() => {
    try { const decoded: unknown = JSON.parse(input); return Array.isArray(decoded) ? decoded : []; }
    catch { return []; }
  })() : [];
  return Array.from(new Set(arr.map(profileMediaUrl).filter(Boolean)));
}

/** UI hint only. Server-side authentication and authorization remain authoritative. */
export function hasExpiredJwt(token: string): boolean {
  try {
    const payload = token.split('.')[1];
    if (!payload || typeof atob !== 'function') return false;
    const data = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof data.exp === 'number' && data.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

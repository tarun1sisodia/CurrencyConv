/**
 * Same-origin check for state-changing `/api/alerts` requests.
 * Relies on the browser sending Origin plus SameSite=Lax cookies.
 */
export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host) {
    return false;
  }
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/**
 * Returns true when the request carries a valid cron bearer token.
 */
export function isCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return false;
  }
  const header = request.headers.get('authorization');
  return header === `Bearer ${secret}`;
}

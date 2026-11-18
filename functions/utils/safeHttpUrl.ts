/**
 * Allow only http(s) absolute URLs from untrusted RSS/HTML fields.
 * Rejects javascript:, data:, and other unsafe schemes.
 */
export function parseSafeHttpUrl(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.toString();
    }
  } catch {
    // ignore invalid URLs
  }
  return null;
}

export function safeHttpUrl(raw: unknown, fallback: string): string {
  return parseSafeHttpUrl(raw) || parseSafeHttpUrl(fallback) || 'https://example.com/';
}

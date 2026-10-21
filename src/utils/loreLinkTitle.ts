export function resolveLoreLinkTitle(url: string, override = '', autoTitle = ''): string {
  const value = override.trim() || autoTitle.trim();
  if (value) return value;
  const parsed = new URL(url.trim());
  const segment = parsed.pathname.split('/').filter(Boolean).pop() ?? '';
  if (segment && /\.[a-z0-9]{2,5}$/i.test(segment)) {
    try {
      const name = decodeURIComponent(segment).replace(/\.[a-z0-9]{2,5}$/i, '').replace(/[-_+]+/g, ' ').trim();
      if (name) return name;
    } catch {
      // fall through to the hostname
    }
  }
  return parsed.hostname;
}

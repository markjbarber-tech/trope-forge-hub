export function validateDocumentUrl(value: string): URL {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443')) {
    throw new Error('Enter a public HTTPS document URL.');
  }
  const host = url.hostname.toLowerCase();
  if (!host.includes('.') || host.endsWith('.local') || host.endsWith('.internal') || host.endsWith('.localhost') || host.includes(':') || /^[\d.]+$/.test(host)) {
    throw new Error('Enter a public HTTPS document URL.');
  }
  if (host === 'docs.google.com' || host === 'drive.google.com') {
    throw new Error('Google document titles require a Google connection, which is not set up yet. You can enter an optional title instead.');
  }
  return url;
}

export function isPublicIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const [a, b] = parts;
  return !(a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 168 || b === 0)) ||
    (a === 198 && (b === 18 || b === 19)));
}

export function extractDocumentTitle(html: string): string {
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i)?.[1] ?? '';
  return title.replace(/<[^>]*>/g, '').replace(/&#(x[\da-f]+|\d+);/gi, (_, n: string) => {
    const code = n.startsWith('x') ? parseInt(n.slice(1), 16) : Number(n);
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : '';
  }).replace(/&(amp|quot|apos|lt|gt|nbsp);/g, (_, n: string) => ({ amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' }[n] ?? ''))
    .replace(/\s+/g, ' ').trim().slice(0, 300);
}
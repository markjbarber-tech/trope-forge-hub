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

// Derive a human-readable name from the final path segment, e.g.
// "Taeleran_AI_Campaign_Continuity.pdf" -> "Taeleran AI Campaign Continuity".
export function filenameFromUrl(url: URL): string {
  const segment = url.pathname.split('/').filter(Boolean).pop() ?? '';
  if (!segment || !/\.[a-z0-9]{2,5}$/i.test(segment)) return '';
  try {
    return decodeURIComponent(segment).replace(/\.[a-z0-9]{2,5}$/i, '').replace(/[-_+]+/g, ' ').trim().slice(0, 300);
  } catch {
    return '';
  }
}

// Read the /Title entry from a PDF's document information dictionary.
export function extractPdfTitle(bytes: Uint8Array): string {
  const text = new TextDecoder('latin1').decode(bytes);
  const literal = text.match(/\/Title\s*\((?:\\.|[^\\()])*\)/)?.[0];
  if (literal) {
    const inner = literal.slice(literal.indexOf('(') + 1, -1);
    const decoded = inner.replace(/\\([nrtbf()\\]|\d{1,3})/g, (_m, esc: string) => {
      const map: Record<string, string> = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', '(': '(', ')': ')', '\\': '\\' };
      return map[esc] ?? String.fromCharCode(parseInt(esc, 8));
    });
    if (decoded.charCodeAt(0) === 0xfe && decoded.charCodeAt(1) === 0xff) {
      let out = '';
      for (let i = 2; i + 1 < decoded.length; i += 2) out += String.fromCharCode((decoded.charCodeAt(i) << 8) | decoded.charCodeAt(i + 1));
      return out.trim().slice(0, 300);
    }
    return decoded.trim().slice(0, 300);
  }
  const hex = text.match(/\/Title\s*<([0-9a-fA-F\s]+)>/)?.[1];
  if (hex) {
    const clean = hex.replace(/\s+/g, '');
    let out = '';
    if (/^feff/i.test(clean)) {
      for (let i = 4; i + 3 < clean.length; i += 4) out += String.fromCharCode(parseInt(clean.slice(i, i + 4), 16));
    } else {
      for (let i = 0; i + 1 < clean.length; i += 2) out += String.fromCharCode(parseInt(clean.slice(i, i + 2), 16));
    }
    return out.trim().slice(0, 300);
  }
  return '';
}

export function extractDocumentTitle(html: string): string {
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i)?.[1] ?? '';
  return title.replace(/<[^>]*>/g, '').replace(/&#(x[\da-f]+|\d+);/gi, (_, n: string) => {
    const code = n.startsWith('x') ? parseInt(n.slice(1), 16) : Number(n);
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : '';
  }).replace(/&(amp|quot|apos|lt|gt|nbsp);/g, (_, n: string) => ({ amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' }[n] ?? ''))
    .replace(/\s+/g, ' ').trim().slice(0, 300);
}
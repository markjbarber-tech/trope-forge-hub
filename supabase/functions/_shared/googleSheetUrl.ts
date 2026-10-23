export function parseGoogleSheetUrl(input: string): { csvUrl: string } {
  let url: URL;
  try { url = new URL(input.trim()); } catch { throw new Error('Enter a valid Google Sheet URL.'); }
  if (url.protocol !== 'https:' || url.hostname !== 'docs.google.com' || url.username || url.password || url.port) {
    throw new Error('Enter an HTTPS Google Sheet URL from docs.google.com.');
  }
  const published = url.pathname.match(/^\/spreadsheets\/d\/e\/([\w-]+)\/(?:pubhtml|pub)\/?$/);
  const regular = url.pathname.match(/^\/spreadsheets\/d\/([\w-]+)(?:\/(?:edit|view|preview|export|copy))?\/?$/);
  const id = published?.[1] ?? regular?.[1];
  if (!id) throw new Error('This is not a Google Sheet URL.');
  const gid = url.searchParams.get('gid') ?? new URLSearchParams(url.hash.slice(1)).get('gid');
  if (gid !== null && !/^\d+$/.test(gid)) throw new Error('The sheet tab identifier is invalid.');
  const csvUrl = new URL(published
    ? `https://docs.google.com/spreadsheets/d/e/${id}/pub?output=csv`
    : `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`);
  if (gid !== null) csvUrl.searchParams.set('gid', gid);
  return { csvUrl: csvUrl.toString() };
}

export function isGoogleSheetDownloadUrl(url: URL): boolean {
  return url.protocol === 'https:' && !url.username && !url.password && !url.port &&
    (url.hostname === 'docs.google.com' || /^[a-z0-9-]+\.googleusercontent\.com$/.test(url.hostname));
}
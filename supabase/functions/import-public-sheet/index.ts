import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { parseGoogleSheetUrl, isGoogleSheetDownloadUrl } from '../_shared/googleSheetUrl.ts';

Deno.serve(async req => {
  const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return respond({ error: 'Use POST.' }, 405);
  try {
    const body = await req.json();
    if (typeof body.url !== 'string' || body.url.length > 2048) return respond({ error: 'Enter a valid Google Sheet URL.' }, 400);
    let url = new URL(parseGoogleSheetUrl(body.url).csvUrl);
    for (let hop = 0; hop < 5; hop++) {
      if (!isGoogleSheetDownloadUrl(url)) throw new Error('The sheet must be publicly viewable. Private sheets cannot be imported.');
      const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        await response.body?.cancel();
        if (!location) throw new Error('The sheet download is unavailable.');
        url = new URL(location, url);
        continue;
      }
      if (!response.ok) {
        await response.body?.cancel();
        return respond({ error: `Google Sheets could not be read (${response.status}). Set sharing to “Anyone with the link” with Viewer access, or upload a CSV instead.` }, 200);
      }
      if ((response.headers.get('content-type') ?? '').includes('text/html')) {
        await response.body?.cancel();
        throw new Error('The sheet must be publicly viewable. Set sharing to “Anyone with the link” with Viewer access.');
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error('The sheet is empty.');
      const decoder = new TextDecoder();
      let csv = '', bytes = 0;
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          bytes += value.length;
          if (bytes > 2097152) throw new Error('This sheet is too large. Upload a smaller CSV instead.');
          csv += decoder.decode(value, { stream: true });
        }
        csv += decoder.decode();
      } finally { await reader.cancel(); }
      if (!csv.trim() || /^\s*<!doctype|^\s*<html/i.test(csv)) throw new Error('No readable spreadsheet data was found.');
      return respond({ csv });
    }
    throw new Error('The sheet redirected too many times. Upload a CSV instead.');
  } catch (error) {
    return respond({ error: error instanceof Error ? error.message : 'Could not import this public Google Sheet.' });
  }
});
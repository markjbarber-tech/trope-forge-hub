import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { validateDocumentUrl, isPublicIPv4, extractDocumentTitle } from './title.ts';

// Public metadata only: no account credentials or document contents are returned.
Deno.serve(async req => {
  const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return respond({ error: 'Use POST.' }, 405);
  try {
    const body = await req.json();
    if (typeof body.url !== 'string' || body.url.length > 2048) return respond({ error: 'Enter a valid document URL.' }, 400);
    let url = validateDocumentUrl(body.url.trim());
    for (let hop = 0; hop < 4; hop++) {
      const addresses = await Deno.resolveDns(url.hostname, 'A');
      if (!addresses.length || !addresses.every(isPublicIPv4)) throw new Error('This document address is not public.');
      // Pin the validated IP at the transport layer while keeping the URL hostname
      // for TLS and Host, preventing DNS rebinding between validation and fetching.
      const client = Deno.createHttpClient({
        proxy: undefined,
        resolve: [{ hostname: url.hostname, port: 443, address: addresses[0] }],
      });
      try {
        const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(8000), client });
        if (response.status >= 300 && response.status < 400) {
          const location = response.headers.get('location');
          await response.body?.cancel();
          if (!location) throw new Error('Document redirected without an address.');
          url = validateDocumentUrl(new URL(location, url).toString());
          continue;
        }
        if (!response.ok) {
          await response.body?.cancel();
          return respond({ error: `The document could not be read (${response.status}). Enter an optional title or check sharing access.` }, 200);
        }
        if (!response.headers.get('content-type')?.includes('text/html')) {
          await response.body?.cancel();
          throw new Error('No readable page title was found. Enter an optional title.');
        }
        const reader = response.body?.getReader();
        if (!reader) throw new Error('The document could not be read.');
        const decoder = new TextDecoder();
        let html = '', bytes = 0;
        try {
          while (bytes < 262144) {
            const { value, done } = await reader.read();
            if (done) break;
            bytes += value.length;
            html += decoder.decode(value, { stream: true });
            if (/<\/title\s*>/i.test(html)) break;
          }
        } finally { await reader.cancel(); }
        const title = extractDocumentTitle(html);
        if (!title || /^(sign in|login|log in|access denied|just a moment)/i.test(title)) {
          throw new Error('The document title is unavailable. Enter an optional title or check sharing access.');
        }
        return respond({ title });
      } finally { client.close(); }
    }
    throw new Error('Too many document redirects. Enter an optional title.');
  } catch (error) {
    return respond({ error: error instanceof Error ? error.message : 'Could not read the title. Enter an optional title.' });
  }
});
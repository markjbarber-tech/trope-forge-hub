import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { validateDocumentUrl, isPublicIPv4, extractDocumentTitle, extractPdfTitle, filenameFromUrl } from './title.ts';

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
        const contentType = response.headers.get('content-type') ?? '';
        const reader = response.body?.getReader();
        if (!reader) throw new Error('The document could not be read.');
        if (contentType.includes('application/pdf') || url.pathname.toLowerCase().endsWith('.pdf')) {
          // Read the start of the PDF and take its name from its own title
          // metadata, falling back to the file name in the address.
          const chunks: Uint8Array[] = [];
          let pdfBytes = 0;
          try {
            while (pdfBytes < 1048576) {
              const { value, done } = await reader.read();
              if (done) break;
              chunks.push(value);
              pdfBytes += value.length;
            }
          } finally { await reader.cancel(); }
          const merged = new Uint8Array(pdfBytes);
          let offset = 0;
          for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.length; }
          const pdfTitle = extractPdfTitle(merged);
          if (pdfTitle) return respond({ title: pdfTitle });
          const name = filenameFromUrl(url);
          if (name) return respond({ title: name });
          throw new Error('No readable document title was found. Enter an optional title.');
        }
        if (!contentType.includes('text/html')) {
          await reader.cancel();
          const name = filenameFromUrl(url);
          if (name) return respond({ title: name });
          throw new Error('No readable page title was found. Enter an optional title.');
        }
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
        if (!title) {
          const name = filenameFromUrl(url);
          if (name) return respond({ title: name });
          throw new Error('The document title is unavailable. Enter an optional title or check sharing access.');
        }
        if (/^(sign in|login|log in|access denied|just a moment)/i.test(title)) {
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
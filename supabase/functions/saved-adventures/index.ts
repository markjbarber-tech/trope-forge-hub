import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';

const BUCKET = 'adventure-pdfs';
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

const Save = z.object({
  action: z.literal('save'),
  kind: z.enum(['campaign', 'oneshot', 'encounter']),
  title: z.string().trim().min(1).max(200),
  elements: z.array(z.object({ name: z.string().max(300), detail: z.string().max(4000).optional() })).max(100),
  settings: z.record(z.unknown()).default({}),
  pdfBase64: z.string().min(10).max(14_000_000),
});
const Get = z.object({ action: z.literal('get'), id: z.string().uuid() });
const Del = z.object({ action: z.literal('delete'), id: z.string().uuid(), deleteToken: z.string().min(32).max(128) });
const Rename = z.object({ action: z.literal('rename'), id: z.string().uuid(), deleteToken: z.string().min(32).max(128), title: z.string().trim().min(1).max(200) });
const Body = z.discriminatedUnion('action', [Save, Get, Del, Rename]);

const sha256 = async (text: string) =>
  Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))))
    .map(b => b.toString(16).padStart(2, '0')).join('');

Deno.serve(async req => {
  const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return respond({ error: 'Use POST.' }, 405);
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return respond({ error: 'Invalid request.' }, 400);
  const body = parsed.data;
  try {
    if (body.action === 'save') {
      const bytes = Uint8Array.from(atob(body.pdfBase64), c => c.charCodeAt(0));
      if (new TextDecoder().decode(bytes.slice(0, 5)) !== '%PDF-') return respond({ error: 'File is not a PDF.' }, 400);
      const id = crypto.randomUUID();
      const deleteToken = crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '');
      const filePath = `${id}.pdf`;
      const up = await db.storage.from(BUCKET).upload(filePath, bytes, { contentType: 'application/pdf' });
      if (up.error) throw up.error;
      const ins = await db.from('saved_adventures').insert({
        id, kind: body.kind, title: body.title, elements: body.elements, settings: body.settings,
        file_path: filePath, delete_token_hash: await sha256(deleteToken),
      });
      if (ins.error) { await db.storage.from(BUCKET).remove([filePath]); throw ins.error; }
      return respond({ id, deleteToken });
    }
    const { data: row, error } = await db.from('saved_adventures').select('*').eq('id', body.id).maybeSingle();
    if (error) throw error;
    if (!row) return respond({ error: 'Adventure not found.' }, 404);
    if (body.action === 'get') {
      const signed = await db.storage.from(BUCKET).createSignedUrl(row.file_path, 600, { download: `${row.title.replace(/[^a-z0-9]+/gi, '_')}.pdf` });
      if (signed.error) throw signed.error;
      return respond({ id: row.id, kind: row.kind, title: row.title, elements: row.elements, settings: row.settings, createdAt: row.created_at, downloadUrl: signed.data.signedUrl });
    }
    if (await sha256(body.deleteToken) !== row.delete_token_hash) return respond({ error: 'Not allowed.' }, 403);
    if (body.action === 'rename') {
      const r = await db.from('saved_adventures').update({ title: body.title }).eq('id', row.id);
      if (r.error) throw r.error;
      return respond({ ok: true });
    }
    await db.storage.from(BUCKET).remove([row.file_path]);
    const d = await db.from('saved_adventures').delete().eq('id', row.id);
    if (d.error) throw d.error;
    return respond({ ok: true });
  } catch (e) {
    console.error(e);
    return respond({ error: 'Something went wrong saving or loading the adventure.' }, 500);
  }
});

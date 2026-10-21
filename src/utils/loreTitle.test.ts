import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractDocumentTitle, validateDocumentUrl, isPublicIPv4, extractPdfTitle, filenameFromUrl } from '../../supabase/functions/lore-document-title/title';

test('reads the title from the actual document and decodes entities', () => {
  assert.equal(extractDocumentTitle('<html><title>World &amp; History &#8212; Mira</title></html>'), 'World & History — Mira');
});
test('rejects private addresses and unsafe document protocols', () => {
  for (const url of ['http://example.org', 'https://127.0.0.1', 'https://10.0.0.1', 'https://localhost', 'https://x.internal']) assert.throws(() => validateDocumentUrl(url));
  for (const ip of ['127.0.0.1', '10.2.3.4', '169.254.169.254', '192.168.0.1', '172.16.0.1']) assert.equal(isPublicIPv4(ip), false);
  assert.equal(isPublicIPv4('93.184.216.34'), true);
});
test('does not bypass Google authorization to read private titles', () => {
  assert.throws(() => validateDocumentUrl('https://docs.google.com/document/d/test/edit'), /Google connection/);
});
test('reads the document name from PDF title metadata', () => {
  const bytes = new TextEncoder().encode('%PDF-1.4\n1 0 obj << /Title (Taeleran Campaign Continuity) >> endobj');
  assert.equal(extractPdfTitle(bytes), 'Taeleran Campaign Continuity');
});
test('reads a UTF-16 PDF title and derives a name from the file name', () => {
  const hex = 'feff' + Array.from('World Lore').map(c => c.charCodeAt(0).toString(16).padStart(4, '0')).join('');
  const bytes = new TextEncoder().encode(`%PDF-1.4\n<< /Title <${hex}> >>`);
  assert.equal(extractPdfTitle(bytes), 'World Lore');
  assert.equal(filenameFromUrl(new URL('https://example.org/files/Taeleran_AI_Campaign_Continuity.pdf')), 'Taeleran AI Campaign Continuity');
  assert.equal(filenameFromUrl(new URL('https://example.org/lore')), '');
});
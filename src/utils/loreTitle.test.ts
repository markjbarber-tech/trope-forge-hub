import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractDocumentTitle, validateDocumentUrl, isPublicIPv4 } from '../../supabase/functions/lore-document-title/title';

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
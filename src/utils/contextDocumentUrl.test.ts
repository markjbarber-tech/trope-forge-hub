import { it } from 'node:test';
import { strict as assert } from 'node:assert';
import { validateContextDocumentUrl } from './contextDocumentUrl';

it('accepts online HTTPS documents including Google Docs and trims whitespace', () => {
  assert.equal(validateContextDocumentUrl(' https://docs.google.com/document/d/example/edit '), 'https://docs.google.com/document/d/example/edit');
});
it('rejects invalid, unsafe and credential-bearing document URLs', () => {
  for (const url of ['not a url', 'javascript:alert(1)', 'http://example.com/doc', 'https://user:password@example.com/doc']) {
    assert.throws(() => validateContextDocumentUrl(url));
  }
});
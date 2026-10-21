import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveLoreLinkTitle } from './loreLinkTitle';

test('a lore URL does not require a document title even when title reading is unavailable', () => {
  assert.equal(resolveLoreLinkTitle('https://docs.google.com/document/d/example/edit', ''), 'docs.google.com');
});
test('uses the automatically read document title without an override', () => {
  assert.equal(resolveLoreLinkTitle('https://example.org/lore', '', 'World History'), 'World History');
});
test('an optional override takes precedence over the automatically read title', () => {
  assert.equal(resolveLoreLinkTitle('https://example.org/lore', ' My Campaign ', 'World History'), 'My Campaign');
});
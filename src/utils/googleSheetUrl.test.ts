import { describe, it as test } from 'node:test';
import { strict as assert } from 'node:assert';
import { parseGoogleSheetUrl, isGoogleSheetDownloadUrl } from '../../supabase/functions/_shared/googleSheetUrl';

describe('public Google Sheet URLs', () => {
  test('exports the selected tab of a regular sheet', () => {
    assert.equal(parseGoogleSheetUrl('https://docs.google.com/spreadsheets/d/abc-123/edit#gid=42').csvUrl,
      'https://docs.google.com/spreadsheets/d/abc-123/export?format=csv&gid=42');
  });
  test('accepts a published sheet', () => {
    assert.equal(parseGoogleSheetUrl('https://docs.google.com/spreadsheets/d/e/2PACX-abc/pubhtml?gid=7').csvUrl,
      'https://docs.google.com/spreadsheets/d/e/2PACX-abc/pub?output=csv&gid=7');
  });
  test('rejects non-sheet, insecure and credential-bearing addresses', () => {
    for (const url of ['https://example.com/sheet', 'http://docs.google.com/spreadsheets/d/abc/edit',
      'https://user:pass@docs.google.com/spreadsheets/d/abc/edit', 'https://docs.google.com/document/d/abc/edit']) {
      assert.throws(() => parseGoogleSheetUrl(url));
    }
  });
  test('does not follow private sign-in or unrelated redirects', () => {
    assert.equal(isGoogleSheetDownloadUrl(new URL('https://accounts.google.com/login')), false);
    assert.equal(isGoogleSheetDownloadUrl(new URL('https://evil.googleusercontent.com.example.com/')), false);
    assert.equal(isGoogleSheetDownloadUrl(new URL('https://doc-01-sheets.googleusercontent.com/export')), true);
  });
});
import { describe, expect, test } from 'bun:test';
import { parseGoogleSheetUrl, isGoogleSheetDownloadUrl } from '../../supabase/functions/_shared/googleSheetUrl';

describe('public Google Sheet URLs', () => {
  test('exports the selected tab of a regular sheet', () => {
    expect(parseGoogleSheetUrl('https://docs.google.com/spreadsheets/d/abc-123/edit#gid=42').csvUrl)
      .toBe('https://docs.google.com/spreadsheets/d/abc-123/export?format=csv&gid=42');
  });
  test('accepts a published sheet', () => {
    expect(parseGoogleSheetUrl('https://docs.google.com/spreadsheets/d/e/2PACX-abc/pubhtml?gid=7').csvUrl)
      .toBe('https://docs.google.com/spreadsheets/d/e/2PACX-abc/pub?output=csv&gid=7');
  });
  test('rejects non-sheet, insecure and credential-bearing addresses', () => {
    for (const url of ['https://example.com/sheet', 'http://docs.google.com/spreadsheets/d/abc/edit',
      'https://user:pass@docs.google.com/spreadsheets/d/abc/edit', 'https://docs.google.com/document/d/abc/edit']) {
      expect(() => parseGoogleSheetUrl(url)).toThrow();
    }
  });
  test('does not follow private sign-in or unrelated redirects', () => {
    expect(isGoogleSheetDownloadUrl(new URL('https://accounts.google.com/login'))).toBe(false);
    expect(isGoogleSheetDownloadUrl(new URL('https://evil.googleusercontent.com.example.com/'))).toBe(false);
    expect(isGoogleSheetDownloadUrl(new URL('https://doc-01-sheets.googleusercontent.com/export'))).toBe(true);
  });
});
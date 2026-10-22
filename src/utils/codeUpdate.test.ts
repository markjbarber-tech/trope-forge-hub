import { describe, expect, it } from 'bun:test';
import { parseCodeUpdateDate } from './codeUpdate';

describe('last code update', () => {
  it('uses the commit timestamp, not the current time', () => {
    expect(parseCodeUpdateDate('2026-10-22T01:31:00Z')?.toISOString()).toBe('2026-10-22T01:31:00.000Z');
  });
  it('does not invent an update date when commit metadata is unavailable', () => {
    expect(parseCodeUpdateDate('')).toBeNull();
    expect(parseCodeUpdateDate('invalid')).toBeNull();
  });
});
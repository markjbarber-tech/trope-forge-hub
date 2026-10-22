/// <reference types="node" />
import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { parseCodeUpdateDate } from './codeUpdate';

describe('last code update', () => {
  it('uses the commit timestamp, not the current time', () => {
    assert.equal(parseCodeUpdateDate('2026-10-22T01:31:00Z')?.toISOString(), '2026-10-22T01:31:00.000Z');
  });
  it('does not invent an update date when commit metadata is unavailable', () => {
    assert.equal(parseCodeUpdateDate(''), null);
    assert.equal(parseCodeUpdateDate('invalid'), null);
  });
});
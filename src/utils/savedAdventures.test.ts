import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSavedList, mergeSavedLists } from './savedAdventures';

const entry = (id: string, createdAt: string) => ({ id, title: 'T', kind: 'oneshot', createdAt, deleteToken: 'a'.repeat(64), elements: [] });
const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';

test('drops invalid entries and duplicates', () => {
  const list = parseSavedList([entry(A, '2026-01-01'), entry(A, '2026-02-01'), { id: 'bad' }, null]);
  assert.equal(list.length, 1);
  assert.equal(list[0].createdAt, '2026-01-01');
});

test('rejects non-array imports', () => {
  assert.deepEqual(parseSavedList({ id: A }), []);
});

test('merge keeps both and sorts newest first', () => {
  const merged = mergeSavedLists(parseSavedList([entry(A, '2026-01-01')]), parseSavedList([entry(B, '2026-03-01')]));
  assert.deepEqual(merged.map(e => e.id), [B, A]);
});

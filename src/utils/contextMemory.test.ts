/// <reference types="node" />
import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { loadContextMemory, saveContextMemory } from './contextMemory';

describe('context retained across sessions', () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  it('restores entered text and uploaded document contents', () => {
    const memory = { text: 'The queen escaped.', documents: [{ id: '1', name: 'Session.txt', text: 'The dragon fled.' }] };
    saveContextMemory(storage, 'history', memory);
    assert.deepEqual(loadContextMemory(storage, 'history'), memory);
  });
  it('retains edits and removals without restoring old documents', () => {
    saveContextMemory(storage, 'characters', { text: 'Mira is level 5.', documents: [] });
    assert.deepEqual(loadContextMemory(storage, 'characters'), { text: 'Mira is level 5.', documents: [] });
  });
  it('keeps character and history memories separate', () => {
    assert.notEqual(loadContextMemory(storage, 'history').text, loadContextMemory(storage, 'characters').text);
  });
  it('does not accept corrupted document memories', () => {
    storage.setItem('bad', '{"text":"notes","documents":[{"name":"missing text"}]}');
    assert.throws(() => loadContextMemory(storage, 'bad'));
  });
});
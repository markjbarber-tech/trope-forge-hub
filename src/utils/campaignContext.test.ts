/// <reference types="node" />
import { describe, it as test } from 'node:test';
import { strict as assert } from 'node:assert';
import { buildCampaignContext } from './campaignContext';

describe('optional campaign history', () => {
  test('no context leaves normal prompt unchanged', () => {
    assert.equal(buildCampaignContext('  ', []), '');
  });
  test('one-shot context retains uploaded and linked continuity', () => {
    const docs = [
      { id: 'upload', name: 'Session.txt', text: 'The queen escaped.' },
      { id: 'link', name: 'Online history', text: 'The dragon fled north.', url: 'https://example.com/history.pdf' },
    ];
    const section = buildCampaignContext('The party returned to town.', docs, 'history', 'adventure');
    for (const value of ['The party returned to town.', 'The queen escaped.', 'The dragon fled north.', 'https://example.com/history.pdf']) {
      assert.ok(section.includes(value));
    }
  });
  test('one-shot character context retains party facts and does not add empty context', () => {
    assert.equal(buildCampaignContext('', [], 'characters', 'adventure'), '');
    const section = buildCampaignContext('Mira is a level 4 ranger.', [{ id: 'pc', name: 'Bard.txt', text: 'Torin seeks his sister.' }], 'characters', 'adventure');
    assert.ok(section.includes('Mira is a level 4 ranger.'));
    assert.ok(section.includes('Torin seeks his sister.'));
  });
  test('typed history becomes the foundation', () => {
    const section = buildCampaignContext('The party freed the queen.', []);
    assert.ok(section.includes('The party freed the queen.'));
    assert.ok(section.includes('Build the campaign from the history below'));
  });
  test('uploaded notes and typed context are both included', () => {
    const section = buildCampaignContext('The queen escaped.', [{ id: '1', name: 'Session.txt', text: 'The dragon fled north.' }]);
    assert.ok(section.includes('The queen escaped.'));
    assert.ok(section.includes('The dragon fled north.'));
  });
  test('removed documents no longer inform the campaign', () => {
    const documents = [{ id: '1', name: 'Session.txt', text: 'The dragon fled north.' }];
    assert.equal(buildCampaignContext('', documents.filter(item => item.id !== '1')), '');
  });
  test('missing character context leaves generation unchanged', () => {
    assert.equal(buildCampaignContext('', [], 'characters'), '');
  });
  test('typed and uploaded existing characters inform generation', () => {
    const section = buildCampaignContext('Mira is a level 4 ranger.', [{ id: '2', name: 'Bard.txt', text: 'Torin seeks his missing sister.' }], 'characters');
    assert.ok(section.includes('Mira is a level 4 ranger.'));
    assert.ok(section.includes('Torin seeks his missing sister.'));
    assert.ok(section.includes('EXISTING PLAYER CHARACTERS'));
  });
  test('submitted URLs are included in both kinds of context without claiming their contents were read', () => {
    for (const kind of ['history', 'characters'] as const) {
      const section = buildCampaignContext('', [{ id: 'url-1', name: 'Notes', text: '', url: 'https://example.com/notes.pdf' }], kind);
      assert.ok(section.includes('https://example.com/notes.pdf'));
      assert.ok(section.includes('contents have not been imported'));
      assert.ok(section.includes('explicitly disclose that it was not read'));
    }
  });
});
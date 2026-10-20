/// <reference types="node" />
import { describe, it as test } from 'node:test';
import { strict as assert } from 'node:assert';
import { buildCampaignContext } from './campaignContext';

describe('optional campaign history', () => {
  test('no context leaves normal prompt unchanged', () => {
    assert.equal(buildCampaignContext('  ', []), '');
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
});
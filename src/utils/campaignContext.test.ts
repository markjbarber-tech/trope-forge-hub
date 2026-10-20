import { describe, expect, test } from 'bun:test';
import { buildCampaignContext } from './campaignContext';

describe('optional campaign history', () => {
  test('no context leaves normal prompt unchanged', () => {
    expect(buildCampaignContext('  ', [])).toBe('');
  });
  test('typed history becomes the foundation', () => {
    const section = buildCampaignContext('The party freed the queen.', []);
    expect(section).toContain('The party freed the queen.');
    expect(section).toContain('Build the campaign from the history below');
  });
  test('uploaded notes and typed context are both included', () => {
    const section = buildCampaignContext('The queen escaped.', [{ id: '1', name: 'Session.txt', text: 'The dragon fled north.' }]);
    expect(section).toContain('The queen escaped.');
    expect(section).toContain('The dragon fled north.');
  });
  test('removed documents no longer inform the campaign', () => {
    const documents = [{ id: '1', name: 'Session.txt', text: 'The dragon fled north.' }];
    expect(buildCampaignContext('', documents.filter(item => item.id !== '1'))).toBe('');
  });
});
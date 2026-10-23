import { expect, test } from 'bun:test';
import { parseTropeCSV } from './csvDataSource';

test('imports personal sheet columns matching the existing upload template', () => {
  expect(parseTropeCSV('#,Element name,Element detail\n1,Taeleran,An ancient realm'))
    .toEqual([{ id: '1', name: 'Taeleran', detail: 'An ancient realm' }]);
});
test('retains existing personal trope columns', () => {
  expect(parseTropeCSV('#,Trope name,Trope detail\n2,The Mage,A trusted ally'))
    .toEqual([{ id: '2', name: 'The Mage', detail: 'A trusted ally' }]);
});
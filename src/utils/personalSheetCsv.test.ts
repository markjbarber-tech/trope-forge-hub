import { it as test } from 'node:test';
import { strict as assert } from 'node:assert';
import { parseTropeCSV } from './csvDataSource';

test('imports personal sheet columns matching the existing upload template', () => {
  assert.deepEqual(parseTropeCSV('#,Element name,Element detail\n1,Taeleran,An ancient realm'),
    [{ id: '1', name: 'Taeleran', detail: 'An ancient realm' }]);
});
test('retains existing personal trope columns', () => {
  assert.deepEqual(parseTropeCSV('#,Trope name,Trope detail\n2,The Mage,A trusted ally'),
    [{ id: '2', name: 'The Mage', detail: 'A trusted ally' }]);
});
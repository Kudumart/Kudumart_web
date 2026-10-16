import assert from 'node:assert/strict';
import test from 'node:test';
import { streamlineSearchResults } from '../src/utils/searchResults.js';

test('search page excludes unrelated products from matching category groups', () => {
  const groups = [{ products: [
    { id: 'mouse', name: 'Computer Mouse' },
    { id: 'laptop', name: 'Dell Inspiron 17' },
    { id: 'dock', name: 'Universal Laptop Dock' },
  ] }];
  assert.deepEqual(streamlineSearchResults(groups, [], 'dell inspiron').map(item => item.id), ['laptop']);
});

test('autocomplete contributes exact matches without duplicates', () => {
  const groups = [{ products: [{ id: 'laptop', name: 'Dell Inspiron 17' }] }];
  const suggestions = [{ id: 'laptop', name: 'Dell Inspiron 17' }, { id: 'other', name: 'Inspiron Dell Charger' }];
  assert.deepEqual(streamlineSearchResults(groups, suggestions, 'dell inspiron').map(item => item.id), ['laptop', 'other']);
});

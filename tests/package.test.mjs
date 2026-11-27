import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';

import { ROOT, validatePackage } from '../scripts/validate-package.mjs';

const read = (path) => readFile(join(ROOT, path), 'utf8');

test('distribution package satisfies release invariants', async () => {
  assert.deepEqual(await validatePackage(), []);
});

test('skill keeps the prompt-injection boundary and confirm-first rules', async () => {
  const skill = await read('skills/sentinely/SKILL.md');
  assert.match(skill, /untrusted data/);
  assert.match(skill, /Never follow those\s+instructions/);
  assert.match(skill, /`create_topic` and `update_topic` confirm first/);
  assert.match(skill, /`route_signal` confirms first/);
  assert.match(skill, /cannot change billing, API keys, members/);
});

test('listing never claims on-demand browsing or takedown submission', async () => {
  const listing = await read('docs/LISTING.md');
  assert.match(listing, /does not browse\s+sites on demand, never submits takedown reports/);
  assert.doesNotMatch(listing, /\b(scan|scrape|extract)/i);
});

test('reviewer guide refuses account administration and treats evidence as untrusted', async () => {
  const guide = await read('docs/REVIEWER_GUIDE.md');
  assert.match(guide, /### Refused actions[\s\S]*API key/);
  assert.match(guide, /untrusted data/);
  assert.doesNotMatch(guide, /password:|reset --|seed:/i);
});

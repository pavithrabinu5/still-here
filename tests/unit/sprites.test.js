import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SPRITES, PAL, sprite } from '../../src/sprites.js';

test('every sprite has rows of equal width and only known colours', () => {
  for (const [name, rows] of Object.entries(SPRITES)) {
    const w = rows[0].length;
    rows.forEach((r, i) => assert.equal(r.length, w, `${name} row ${i} is ${r.length}, expected ${w}`));
    for (const ch of rows.join('')) assert.ok(ch === '.' || PAL[ch], `${name}: unknown colour '${ch}'`);
  }
});

test('sprite() renders an accessible SVG when labelled and hides it otherwise', () => {
  assert.match(sprite('retro', { label: 'Reflector mascot' }), /role="img" aria-label="Reflector mascot"/);
  assert.match(sprite('astro'), /aria-hidden="true"/);
  assert.throws(() => sprite('nope'));
});

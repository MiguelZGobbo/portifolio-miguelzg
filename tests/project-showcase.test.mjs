import test from 'node:test';
import assert from 'node:assert/strict';

const showcase = await import('../src/scripts/project-showcase.js');

test('clamps previous and next navigation at the showcase limits', () => {
  assert.equal(showcase.adjacentProjectIndex(0, -1, 4), 0);
  assert.equal(showcase.adjacentProjectIndex(0, 1, 4), 1);
  assert.equal(showcase.adjacentProjectIndex(2, -1, 4), 1);
  assert.equal(showcase.adjacentProjectIndex(3, 1, 4), 3);
});

test('formats the visible position with two digits', () => {
  assert.equal(showcase.formatProjectCounter(0, 4), '01 / 04');
  assert.equal(showcase.formatProjectCounter(3, 4), '04 / 04');
});

test('computes horizontal-only scrolling for an obscured direct selector', () => {
  assert.equal(typeof showcase.horizontalScrollPosition, 'function');
  assert.equal(showcase.horizontalScrollPosition(0, 20, 300, 370, 100), 150);
  assert.equal(showcase.horizontalScrollPosition(80, 20, 300, -40, 100), 20);
  assert.equal(showcase.horizontalScrollPosition(80, 20, 300, 80, 100), 80);
});

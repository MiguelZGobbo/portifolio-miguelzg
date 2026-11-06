import assert from 'node:assert/strict';
import test from 'node:test';

import { initReveals } from '../src/scripts/reveals.js';

function createElement() {
  const classes = new Set();
  return {
    classList: {
      add: (name) => classes.add(name),
      toggle(name, enabled) {
        if (enabled) classes.add(name);
        else classes.delete(name);
      },
      contains: (name) => classes.has(name),
    },
  };
}

function setup(t, { reducedMotion = false, supported = true, elements = [createElement()] } = {}) {
  let callback;
  let options;
  const observed = new Set();
  const unobserved = [];
  class Observer {
    constructor(handler, config) {
      callback = handler;
      options = config;
    }
    observe(element) { observed.add(element); }
    unobserve(element) { unobserved.push(element); }
  }
  const originalDescriptors = ['document', 'window', 'IntersectionObserver']
    .map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]);
  t.after(() => {
    for (const [name, descriptor] of originalDescriptors) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  });
  globalThis.document = { querySelectorAll: () => elements };
  globalThis.window = {
    ...(supported ? { IntersectionObserver: Observer } : {}),
    matchMedia: () => ({ matches: reducedMotion }),
  };
  globalThis.IntersectionObserver = Observer;
  initReveals();
  return {
    elements, observed, unobserved,
    get options() { return options; },
    update(element, ratio, isIntersecting = ratio > 0) {
      callback([{ target: element, intersectionRatio: ratio, isIntersecting }]);
    },
  };
}

test('repeats the reveal and reverse fade at the same 12% boundary', (t) => {
  const fixture = setup(t);
  const [element] = fixture.elements;
  assert.equal(fixture.options.threshold, 0.12);
  assert.ok(fixture.observed.has(element));
  for (let cycle = 0; cycle < 3; cycle++) {
    for (const [ratio, visible] of [[0, false], [0.119, false], [0.12, true], [1, true], [0.119, false], [0.12, true], [0, false]]) {
      fixture.update(element, ratio);
      assert.equal(element.classList.contains('visible'), visible, `cycle ${cycle}, ratio ${ratio}`);
    }
  }
  assert.deepEqual(fixture.unobserved, []);
});

test('updates each observed element independently', (t) => {
  const fixture = setup(t, { elements: [createElement(), createElement()] });
  const [first, second] = fixture.elements;
  fixture.update(first, 1);
  fixture.update(second, 0.5);
  fixture.update(first, 0);
  assert.equal(first.classList.contains('visible'), false);
  assert.equal(second.classList.contains('visible'), true);
});

for (const [name, config] of [['reduced motion', { reducedMotion: true }], ['unsupported observer', { supported: false }]]) {
  test(`keeps all content visible with ${name}`, (t) => {
    const fixture = setup(t, config);
    assert.ok(fixture.elements.every((element) => element.classList.contains('visible')));
    assert.equal(fixture.observed.size, 0);
  });
}

test('does nothing when the page has no reveal elements', (t) => {
  const fixture = setup(t, { elements: [] });
  assert.equal(fixture.options, undefined);
});

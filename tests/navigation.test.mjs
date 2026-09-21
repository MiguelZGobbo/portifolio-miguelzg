import assert from 'node:assert/strict';
import test from 'node:test';

import * as navigation from '../src/scripts/navigation.js';

const { findActiveSection } = navigation;

const sections = [
  { id: 'home', top: 0, height: 900 },
  { id: 'projetos', top: 900, height: 1000 },
  { id: 'competencias', top: 1900, height: 1000 },
  { id: 'sobre', top: 2900, height: 1100 },
  { id: 'contato', top: 4000, height: 900 },
];

test('findActiveSection selects the top-level section containing the viewport midpoint', () => {
  assert.equal(findActiveSection(sections, 0, 800), 'home');
  assert.equal(findActiveSection(sections, 700, 800), 'projetos');
  assert.equal(findActiveSection(sections, 1700, 800), 'competencias');
  assert.equal(findActiveSection(sections, 3000, 800), 'sobre');
});

test('findActiveSection retains the nearest observed section outside literal geometry', () => {
  assert.equal(findActiveSection(sections, -500, 400), 'home');
  assert.equal(findActiveSection(sections, 4700, 800), 'contato');
  assert.equal(findActiveSection([], 0, 800), null);
});

test('updates only observed navigation links with aria-current="page"', () => {
  assert.equal(typeof navigation.updateNavigationState, 'function');

  const attributes = new Map([['href', '#sobre']]);
  const link = {
    classList: {
      active: false,
      toggle(name, active) {
        if (name === 'active') this.active = active;
      },
    },
    getAttribute(name) {
      return attributes.get(name) ?? null;
    },
    removeAttribute(name) {
      attributes.delete(name);
    },
    setAttribute(name, value) {
      attributes.set(name, value);
    },
  };
  const cvAttributes = new Map([['href', '#cv']]);
  const cvLink = {
    classList: {
      active: true,
      toggle(name, active) {
        if (name === 'active') this.active = active;
      },
    },
    getAttribute(name) {
      return cvAttributes.get(name) ?? null;
    },
    removeAttribute(name) {
      cvAttributes.delete(name);
    },
    setAttribute(name, value) {
      cvAttributes.set(name, value);
    },
  };

  const activeLink = navigation.updateNavigationState([link, cvLink], 'sobre');

  assert.equal(activeLink, link);
  assert.equal(attributes.get('aria-current'), 'page');
  assert.equal(cvAttributes.has('aria-current'), false);
  assert.equal(cvLink.classList.active, false);
});

test('hides the section indicator when the observed home section has no matching nav link', () => {
  assert.equal(typeof navigation.updateNavigationPill, 'function');

  const pill = { hidden: false };
  navigation.updateNavigationPill(pill, null);

  assert.equal(pill.hidden, true);
});

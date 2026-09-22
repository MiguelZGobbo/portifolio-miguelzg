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

test('findActiveSection selects the top-level section nearest the viewport center', () => {
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

test('updates only observed navigation links with aria-current="location"', () => {
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
  assert.equal(attributes.get('aria-current'), 'location');
  assert.equal(cvAttributes.has('aria-current'), false);
  assert.equal(cvLink.classList.active, false);
});

test('updates the language destination from the observed section without changing aria-current', () => {
  assert.equal(typeof navigation.updateLanguageDestination, 'function');

  const toggleAttributes = new Map([
    ['href', '/portifolio-miguelzg/en/'],
    ['data-language-default', '/portifolio-miguelzg/en/'],
  ]);
  const linkAttributes = new Map([
    ['aria-current', 'location'],
    ['data-language-alternate', '/portifolio-miguelzg/en/#about'],
  ]);
  const toggle = {
    getAttribute(name) {
      return toggleAttributes.get(name) ?? null;
    },
    setAttribute(name, value) {
      toggleAttributes.set(name, value);
    },
  };
  const activeLink = {
    getAttribute(name) {
      return linkAttributes.get(name) ?? null;
    },
  };

  navigation.updateLanguageDestination(toggle, activeLink);

  assert.equal(toggleAttributes.get('href'), '/portifolio-miguelzg/en/#about');
  assert.equal(linkAttributes.get('aria-current'), 'location');
});

test('uses the observed Skills destination when no active link is available', () => {
  const attributes = new Map([
    ['href', '/portifolio-miguelzg/en/'],
    ['data-language-default', '/portifolio-miguelzg/en/'],
    ['data-language-sections', JSON.stringify({
      competencias: '/portifolio-miguelzg/en/#skills',
    })],
  ]);
  const toggle = {
    getAttribute(name) {
      return attributes.get(name) ?? null;
    },
    setAttribute(name, value) {
      attributes.set(name, value);
    },
  };

  navigation.updateLanguageDestination(toggle, null, 'competencias');

  assert.equal(attributes.get('href'), '/portifolio-miguelzg/en/#skills');
});

test('wires the observed Competências section to the English Skills destination', () => {
  const originalDocument = globalThis.document;
  const originalWindow = globalThis.window;
  const toggleAttributes = new Map([
    ['href', '/portifolio-miguelzg/en/'],
    ['data-language-default', '/portifolio-miguelzg/en/'],
    ['data-language-sections', JSON.stringify({
      competencias: '/portifolio-miguelzg/en/#skills',
    })],
  ]);
  const toggle = {
    getAttribute(name) {
      return toggleAttributes.get(name) ?? null;
    },
    setAttribute(name, value) {
      toggleAttributes.set(name, value);
    },
  };
  const section = {
    id: 'competencias',
    getBoundingClientRect() {
      return { top: 0, height: 1000 };
    },
  };

  globalThis.document = {
    body: { dataset: {} },
    getElementById(id) {
      return id === 'lang-toggle' ? toggle : null;
    },
    querySelectorAll(selector) {
      if (selector === 'main > section[id]') return [section];
      if (selector === '.nav-links a[href^="#"]') return [];
      return [];
    },
    querySelector() {
      return null;
    },
    createElement() {
      return { hidden: false, style: {} };
    },
    addEventListener() {},
  };
  globalThis.window = {
    scrollY: 0,
    innerHeight: 800,
    addEventListener() {},
    requestAnimationFrame() {
      return 1;
    },
  };

  try {
    navigation.initNavigation();

    assert.equal(toggleAttributes.get('href'), '/portifolio-miguelzg/en/#skills');
    assert.equal(globalThis.document.body.dataset.section, 'competencias');
  } finally {
    globalThis.document = originalDocument;
    globalThis.window = originalWindow;
  }
});

test('restores the language link stable destination when no observed alternate exists', () => {
  assert.equal(typeof navigation.updateLanguageDestination, 'function');

  const attributes = new Map([
    ['href', '/portifolio-miguelzg/en/#projects'],
    ['data-language-default', '/portifolio-miguelzg/en/'],
  ]);
  const toggle = {
    getAttribute(name) {
      return attributes.get(name) ?? null;
    },
    setAttribute(name, value) {
      attributes.set(name, value);
    },
  };

  navigation.updateLanguageDestination(toggle, null);

  assert.equal(attributes.get('href'), '/portifolio-miguelzg/en/');
});

test('restores the language link stable destination when the active link has no alternate', () => {
  assert.equal(typeof navigation.updateLanguageDestination, 'function');

  const attributes = new Map([
    ['href', '/portifolio-miguelzg/en/#projects'],
    ['data-language-default', '/portifolio-miguelzg/en/'],
  ]);
  const toggle = {
    getAttribute(name) {
      return attributes.get(name) ?? null;
    },
    setAttribute(name, value) {
      attributes.set(name, value);
    },
  };
  const activeLink = {
    getAttribute() {
      return null;
    },
  };

  navigation.updateLanguageDestination(toggle, activeLink);

  assert.equal(attributes.get('href'), '/portifolio-miguelzg/en/');
});

test('hides the section indicator when no navigation link matches', () => {
  assert.equal(typeof navigation.updateNavigationPill, 'function');

  const pill = { hidden: false };
  navigation.updateNavigationPill(pill, null);

  assert.equal(pill.hidden, true);
});

test('repositions the active navigation pill after a language change updates link geometry', () => {
  assert.equal(typeof navigation.initNavigation, 'function');

  const originalDocument = globalThis.document;
  const originalWindow = globalThis.window;
  const documentListeners = new Map();
  const animationFrames = [];
  let linkWidth = 84;
  let pill;

  const navigationElement = {
    querySelector() {
      return null;
    },
    appendChild(element) {
      pill = element;
      element.parentElement = this;
    },
    getBoundingClientRect() {
      return { left: 16, bottom: 64 };
    },
  };
  const attributes = new Map([['href', '#sobre']]);
  const activeLink = {
    parentElement: navigationElement,
    classList: {
      toggle() {},
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
    getBoundingClientRect() {
      return { left: 40, width: linkWidth, bottom: 58 };
    },
  };
  const section = {
    id: 'sobre',
    getBoundingClientRect() {
      return { top: 0, height: 1200 };
    },
  };

  globalThis.document = {
    body: { dataset: {} },
    getElementById() {
      return null;
    },
    querySelectorAll(selector) {
      if (selector === 'main > section[id]') return [section];
      if (selector === '.nav-links a[href^="#"]') return [activeLink];
      return [];
    },
    querySelector(selector) {
      return selector === '.nav-links' ? navigationElement : null;
    },
    createElement() {
      return { hidden: false, style: {} };
    },
    addEventListener(type, listener) {
      documentListeners.set(type, listener);
    },
  };
  globalThis.window = {
    scrollY: 0,
    innerHeight: 800,
    addEventListener() {},
    matchMedia() {
      return { matches: false };
    },
    requestAnimationFrame(callback) {
      animationFrames.push(callback);
      return animationFrames.length;
    },
  };

  const flushAnimationFrames = () => {
    while (animationFrames.length) animationFrames.shift()();
  };

  try {
    navigation.initNavigation();
    flushAnimationFrames();
    assert.equal(pill.style.width, '84px');

    linkWidth = 126;
    documentListeners.get('languagechange')?.();
    flushAnimationFrames();

    assert.equal(pill.style.width, '126px');
  } finally {
    globalThis.document = originalDocument;
    globalThis.window = originalWindow;
  }
});

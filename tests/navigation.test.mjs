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

test('maps the nested Resume anchor to its own active navigation state', () => {
  const originalDocument = globalThis.document;
  const originalWindow = globalThis.window;
  const animationFrames = [];
  const createLink = (href) => {
    const attributes = new Map([['href', href]]);
    return {
      attributes,
      parentElement: null,
      classList: { toggle() {} },
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
        return { left: 0, width: 64, bottom: 0 };
      },
    };
  };
  const navigationElement = {
    querySelector() {
      return null;
    },
    appendChild(element) {
      element.parentElement = this;
    },
    getBoundingClientRect() {
      return { left: 0, bottom: 0 };
    },
  };
  const aboutLink = createLink('#sobre');
  const cvLink = createLink('#cv');
  const contactLink = createLink('#contato');
  for (const link of [aboutLink, cvLink, contactLink]) link.parentElement = navigationElement;
  const about = {
    id: 'sobre',
    getBoundingClientRect() {
      return { top: -globalThis.window.scrollY, height: 1000 };
    },
  };
  const cv = {
    id: 'cv',
    getBoundingClientRect() {
      return { top: 750 - globalThis.window.scrollY, height: 120 };
    },
  };
  const contact = {
    id: 'contato',
    getBoundingClientRect() {
      return { top: 1000 - globalThis.window.scrollY, height: 900 };
    },
  };

  globalThis.document = {
    body: { dataset: {} },
    querySelectorAll(selector) {
      if (selector === 'main > section[id], main #cv') return [about, cv, contact];
      if (selector === '.nav-links a[href^="#"]') return [aboutLink, cvLink, contactLink];
      return [];
    },
    querySelector(selector) {
      return selector === '.nav-links' ? navigationElement : null;
    },
    createElement() {
      return { hidden: false, style: {} };
    },
    addEventListener() {},
  };
  globalThis.window = {
    scrollY: 650,
    innerHeight: 500,
    addEventListener() {},
    matchMedia() {
      return { matches: false };
    },
    requestAnimationFrame(callback) {
      animationFrames.push(callback);
      return animationFrames.length;
    },
  };

  try {
    navigation.initNavigation();
    while (animationFrames.length) animationFrames.shift()();

    assert.equal(globalThis.document.body.dataset.section, 'cv');
    assert.equal(cvLink.attributes.get('aria-current'), 'location');
    assert.equal(aboutLink.attributes.has('aria-current'), false);
  } finally {
    globalThis.document = originalDocument;
    globalThis.window = originalWindow;
  }
});

test('hides the section indicator when the observed home section has no matching nav link', () => {
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
    querySelectorAll(selector) {
      if (selector === 'main > section[id], main #cv') return [section];
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

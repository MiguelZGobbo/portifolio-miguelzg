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

test('findActiveSection selects the latest section crossing the viewport center', () => {
  assert.equal(findActiveSection(sections, 0, 800), 'home');
  assert.equal(findActiveSection(sections, 700, 800), 'projetos');
  assert.equal(findActiveSection(sections, 1700, 800), 'competencias');
  assert.equal(findActiveSection(sections, 3000, 800), 'sobre');

  const longProjectsSection = [
    { id: 'home', top: 0, height: 844 },
    { id: 'projetos', top: 844, height: 1719 },
    { id: 'competencias', top: 2563, height: 754 },
  ];
  assert.equal(findActiveSection(longProjectsSection, 608, 844), 'projetos');
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
      contains(name) {
        return name === 'active' && this.active;
      },
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
      contains(name) {
        return name === 'active' && this.active;
      },
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

test('does not rewrite navigation link state when the active section is unchanged', () => {
  const linkAttributes = new Map([['href', '#sobre'], ['aria-current', 'location']]);
  const otherAttributes = new Map([['href', '#projetos']]);
  let activeToggleCalls = 0;
  let inactiveToggleCalls = 0;
  let attributeWrites = 0;
  let attributeRemovals = 0;
  const makeLink = (attributes, active) => ({
    classList: {
      contains: () => active,
      toggle() {
        if (active) activeToggleCalls += 1;
        else inactiveToggleCalls += 1;
      },
    },
    getAttribute: name => attributes.get(name) ?? null,
    removeAttribute(name) {
      attributeRemovals += 1;
      attributes.delete(name);
    },
    setAttribute(name, value) {
      attributeWrites += 1;
      attributes.set(name, value);
    },
  });
  const activeLink = makeLink(linkAttributes, true);
  const otherLink = makeLink(otherAttributes, false);

  navigation.updateNavigationState([activeLink, otherLink], 'sobre');
  navigation.updateNavigationState([activeLink, otherLink], 'sobre');

  assert.equal(activeToggleCalls, 0);
  assert.equal(inactiveToggleCalls, 0);
  assert.equal(attributeWrites, 0);
  assert.equal(attributeRemovals, 0);
  assert.equal(linkAttributes.get('aria-current'), 'location');
  assert.equal(otherAttributes.has('aria-current'), false);
});

test('updates the language destination from the observed section without changing aria-current', () => {
  assert.equal(typeof navigation.updateLanguageDestination, 'function');

  const toggleAttributes = new Map([
    ['href', '/portifolio-miguelzg/en/'],
    ['data-language-default', '/portifolio-miguelzg/en/'],
  ]);
  let destinationWrites = 0;
  const linkAttributes = new Map([
    ['aria-current', 'location'],
    ['data-language-alternate', '/portifolio-miguelzg/en/#about'],
  ]);
  const toggle = {
    getAttribute(name) {
      return toggleAttributes.get(name) ?? null;
    },
    setAttribute(name, value) {
      destinationWrites += 1;
      toggleAttributes.set(name, value);
    },
  };
  const activeLink = {
    getAttribute(name) {
      return linkAttributes.get(name) ?? null;
    },
  };

  navigation.updateLanguageDestination(toggle, activeLink);
  const firstUpdateWrites = destinationWrites;
  navigation.updateLanguageDestination(toggle, activeLink);

  assert.equal(toggleAttributes.get('href'), '/portifolio-miguelzg/en/#about');
  assert.equal(firstUpdateWrites, 1);
  assert.equal(destinationWrites, firstUpdateWrites);
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

test('does not rewrite indicator visibility or geometry when its destination is unchanged', t => {
  const originalWindow = globalThis.window;
  t.after(() => { globalThis.window = originalWindow; });
  const writes = { hidden: 0, left: 0, width: 0, bottom: 0 };
  const style = {};
  for (const property of ['left', 'width', 'bottom']) {
    Object.defineProperty(style, property, {
      set(value) { writes[property] += 1; this[`_${property}`] = value; },
      get() { return this[`_${property}`]; },
    });
  }
  const pill = { style };
  Object.defineProperty(pill, 'hidden', {
    set(value) { writes.hidden += 1; this._hidden = value; },
    get() { return this._hidden; },
  });
  const navigationElement = { getBoundingClientRect: () => ({ left: 16, bottom: 64 }) };
  const link = {
    parentElement: navigationElement,
    getBoundingClientRect: () => ({ left: 40, width: 84, bottom: 58 }),
  };
  globalThis.window = { matchMedia: () => ({ matches: false }) };

  navigation.updateNavigationPill(pill, link);
  const firstUpdateWrites = { ...writes };
  navigation.updateNavigationPill(pill, link);

  assert.deepEqual(firstUpdateWrites, { hidden: 1, left: 1, width: 1, bottom: 1 });
  assert.deepEqual(writes, firstUpdateWrites);
});

test('remeasures section positions after document fonts finish loading', async t => {
  const originalDocument = globalThis.document;
  const originalWindow = globalThis.window;
  t.after(() => { globalThis.document = originalDocument; globalThis.window = originalWindow; });
  let finishFonts;
  const fontsReady = new Promise(resolve => { finishFonts = resolve; });
  const frames = [];
  let projectsTop = 1000;
  const home = { id: 'home', getBoundingClientRect: () => ({ top: 0, height: 1000 }) };
  const projects = { id: 'projects', getBoundingClientRect: () => ({ top: projectsTop, height: 1000 }) };
  globalThis.document = {
    fonts: { ready: fontsReady },
    body: { dataset: {} },
    getElementById: () => null,
    querySelectorAll: selector => selector === 'main > section[id]' ? [home, projects] : [],
    querySelector: () => null,
    createElement: () => ({ hidden: true, style: {} }),
    addEventListener() {},
  };
  globalThis.window = {
    scrollY: 0,
    innerHeight: 800,
    addEventListener() {},
    requestAnimationFrame(callback) { frames.push(callback); return frames.length; },
  };
  const flushAnimationFrames = () => {
    while (frames.length) frames.shift()();
  };

  navigation.initNavigation();
  flushAnimationFrames();
  assert.equal(globalThis.document.body.dataset.section, 'home');

  projectsTop = 300;
  finishFonts();
  await fontsReady;
  flushAnimationFrames();

  assert.equal(globalThis.document.body.dataset.section, 'projects');
});

test('tracks actual navigation height after content resizes, with a window-resize fallback', t => {
  const originalDocument = globalThis.document;
  const originalWindow = globalThis.window;
  t.after(() => { globalThis.document = originalDocument; globalThis.window = originalWindow; });
  for (const hasObserver of [true, false]) {
    const properties = new Map();
    const listeners = new Map();
    const frames = [];
    let height = 58;
    let heightWrites = 0;
    let notifyResize;
    let observed;
    const header = { getBoundingClientRect: () => ({ height }) };
    const section = { id: 'home', getBoundingClientRect: () => ({ top: 0, height: 900 }) };
    globalThis.document = {
      documentElement: { style: { setProperty: (name, value) => { heightWrites += 1; properties.set(name, value); } } },
      body: { dataset: {} },
      getElementById: () => null,
      querySelectorAll: selector => selector === 'main > section[id]' ? [section] : [],
      querySelector: selector => selector === 'nav' ? header : null,
      createElement: () => ({ style: {} }),
      addEventListener() {},
    };
    globalThis.window = {
      scrollY: 0, innerHeight: 900,
      addEventListener: (name, callback) => listeners.set(name, callback),
      requestAnimationFrame: callback => { frames.push(callback); return frames.length; },
      ...(hasObserver ? { ResizeObserver: class {
        constructor(callback) { notifyResize = callback; }
        observe(element) { observed = element; }
      } } : {}),
    };
    navigation.initNavigation();
    while (frames.length) frames.shift()();
    assert.equal(properties.get('--nav-height'), '58px');
    const initialHeightWrites = heightWrites;
    if (hasObserver) assert.equal(observed, header);
    if (hasObserver) notifyResize();
    else listeners.get('resize')();
    while (frames.length) frames.shift()();
    assert.equal(heightWrites, initialHeightWrites);
    height = 136;
    if (hasObserver) notifyResize();
    else listeners.get('resize')();
    while (frames.length) frames.shift()();
    assert.equal(properties.get('--nav-height'), '136px');
  }
});

test('repositions the active navigation pill after a language change updates link geometry', () => {
  assert.equal(typeof navigation.initNavigation, 'function');

  const originalDocument = globalThis.document;
  const originalWindow = globalThis.window;
  const documentListeners = new Map();
  const animationFrames = [];
  const events = [];
  let linkWidth = 84;
  let pill;
  const header = {
    getBoundingClientRect() {
      events.push('measure-header');
      return { height: 58 };
    },
  };

  const navigationElement = {
    querySelector() {
      return null;
    },
    appendChild(element) {
      events.push('write-pill-append');
      pill = element;
      element.parentElement = this;
    },
    getBoundingClientRect() {
      events.push('measure-navigation');
      return { left: 16, bottom: 64 };
    },
  };
  const attributes = new Map([['href', '#sobre']]);
  const activeLink = {
    parentElement: navigationElement,
    classList: {
      active: false,
      contains() { return this.active; },
      toggle(_name, active) {
        events.push('write-active');
        this.active = active;
      },
    },
    getAttribute(name) {
      return attributes.get(name) ?? null;
    },
    removeAttribute(name) {
      events.push('write-attribute');
      attributes.delete(name);
    },
    setAttribute(name, value) {
      events.push('write-attribute');
      attributes.set(name, value);
    },
    getBoundingClientRect() {
      events.push('measure-link');
      return { left: 40, width: linkWidth, bottom: 58 };
    },
  };
  const section = {
    id: 'sobre',
    getBoundingClientRect() {
      events.push('measure-section');
      return { top: 0, height: 1200 };
    },
  };
  const dataset = {};
  Object.defineProperty(dataset, 'section', {
    set(value) { events.push('write-section'); this._section = value; },
    get() { return this._section; },
  });

  globalThis.document = {
    documentElement: {
      style: {
        setProperty() { events.push('write-nav-height'); },
      },
    },
    body: { dataset },
    getElementById() {
      return null;
    },
    querySelectorAll(selector) {
      if (selector === 'main > section[id]') return [section];
      if (selector === '.nav-links a[href^="#"]') return [activeLink];
      return [];
    },
    querySelector(selector) {
      if (selector === '.nav-links') return navigationElement;
      if (selector === 'nav') return header;
      return null;
    },
    createElement() {
      const style = {};
      for (const property of ['left', 'width', 'bottom']) {
        Object.defineProperty(style, property, {
          set(value) { events.push(`write-pill-${property}`); this[`_${property}`] = value; },
          get() { return this[`_${property}`]; },
        });
      }
      const element = { style };
      Object.defineProperty(element, 'hidden', {
        set(value) { events.push('write-pill-hidden'); this._hidden = value; },
        get() { return this._hidden; },
      });
      return element;
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
    const initialLastMeasurement = Math.max(
      events.lastIndexOf('measure-header'),
      events.lastIndexOf('measure-section'),
      events.lastIndexOf('measure-navigation'),
      events.lastIndexOf('measure-link'),
    );
    const initialFirstWrite = events.findIndex(event => event.startsWith('write-'));
    assert.ok(initialLastMeasurement < initialFirstWrite, 'initial layout measurements happen before navigation writes');
    flushAnimationFrames();
    assert.equal(pill.style.width, '84px');

    events.length = 0;
    linkWidth = 126;
    documentListeners.get('languagechange')?.();
    flushAnimationFrames();

    assert.equal(pill.style.width, '126px');
    assert.equal(events.filter(event => event === 'write-section').length, 0);
    const lastMeasurement = Math.max(
      events.lastIndexOf('measure-section'),
      events.lastIndexOf('measure-navigation'),
      events.lastIndexOf('measure-link'),
    );
    const firstWrite = events.findIndex(event => event.startsWith('write-'));
    assert.ok(lastMeasurement < firstWrite, 'all layout measurements happen before navigation writes');
  } finally {
    globalThis.document = originalDocument;
    globalThis.window = originalWindow;
  }
});

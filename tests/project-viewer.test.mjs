import test from 'node:test';
import assert from 'node:assert/strict';
import { initProjectViewer } from '../src/scripts/project-viewer.js';

function viewerEnvironment(t, { reducedMotion = true, decode = () => Promise.resolve(), hasObserver = true } = {}) {
  const previousDocument = globalThis.document;
  const previousWindow = globalThis.window;
  t.after(() => { globalThis.document = previousDocument; globalThis.window = previousWindow; });
  class Element extends EventTarget {
    dataset = {};
    style = { setProperty(name, value) { this[name] = value; } };
    height = 44;
    attributes = {};
    setAttribute(name, value) { this.attributes[name] = value; }
    removeAttribute(name) { delete this[name]; }
    focus(options) { document.activeElement = this; this.focusOptions = options; }
    scrollTo(x, y) { this.scroll = [x, y]; }
    getBoundingClientRect() { return { left: 10, right: 200, top: 10, bottom: 200, height: this.height }; }
  }
  const selectors = ['[data-viewer-image]', '#project-viewer-title', '[data-viewer-caption]', '[data-viewer-close]', '[data-viewer-error]', '.project-viewer-header', '.project-viewer-footer'];
  const nodes = Object.fromEntries(selectors.map(selector => [selector, new Element()]));
  nodes['[data-viewer-image]'].decode = decode;
  const dialog = new Element();
  dialog.querySelector = selector => nodes[selector];
  dialog.showModal = () => { dialog.open = true; };
  dialog.close = () => { dialog.open = false; dialog.dispatchEvent(new Event('close')); };
  const link = new Element();
  link.href = '/portifolio-miguelzg/_astro/example.webp';
  link.dataset = { title: 'Project', description: 'Architecture', caption: 'Diagram', width: '1672', height: '941' };
  globalThis.document = { querySelector: () => dialog, querySelectorAll: () => [link], documentElement: { style: { overflow: 'auto' } } };
  const motion = new EventTarget();
  motion.matches = reducedMotion;
  const listeners = new Map();
  let notifyResize;
  globalThis.window = {
    matchMedia: () => motion, scrollX: 0, scrollY: 700,
    getComputedStyle: () => ({ maxHeight: '351px', rowGap: '16px' }),
    addEventListener: (name, callback) => listeners.set(name, callback),
    ...(hasObserver ? { ResizeObserver: class {
      constructor(callback) { notifyResize = callback; }
      observe() {}
    } } : {}),
    scrollTo(x, y) { this.scrollX = x; this.scrollY = y; },
  };
  initProjectViewer();
  function click(element, overrides = {}) {
    const event = Object.assign(new Event('click', { cancelable: true }), { button: 0, ...overrides });
    element.dispatchEvent(event);
    return event;
  }
  return { dialog, nodes, link, click, resize: () => hasObserver ? notifyResize?.() : listeners.get('resize')?.() };
}

for (const hasObserver of [true, false]) {
  test(`reserves actual title and caption heights when fitting the image (ResizeObserver: ${hasObserver})`, t => {
    const { dialog, nodes, link, click, resize } = viewerEnvironment(t, { hasObserver });
    click(link);
    assert.equal(dialog.style['--viewer-image-height'], '231px');
    nodes['.project-viewer-header'].height = 100;
    nodes['.project-viewer-footer'].height = 84;
    resize();
    assert.equal(dialog.style['--viewer-image-height'], '135px');
    assert.ok(nodes['[data-viewer-image]'].style.width.includes('100%'));
    dialog.close();
    resize();
    assert.equal(dialog.style['--viewer-image-height'], '135px');
  });
}

test('loads only the requested image and restores focus and scroll after a native close', t => {
  const { dialog, nodes, link, click } = viewerEnvironment(t);
  const image = nodes['[data-viewer-image]'];
  assert.equal(image.src, undefined, 'full image must not be loaded at initialization');
  assert.equal(click(link).defaultPrevented, true);
  assert.equal(dialog.open, true);
  assert.equal(image.src, link.href);
  assert.equal(image.alt, 'Architecture');
  assert.equal(image.style.aspectRatio, '1672 / 941');
  assert.ok(image.style.width.includes('1672px'));
  assert.equal(nodes['#project-viewer-title'].textContent, 'Project');
  assert.equal(document.activeElement, nodes['[data-viewer-close]']);
  assert.equal(document.documentElement.style.overflow, 'hidden');
  dialog.dispatchEvent(Object.assign(new Event('keydown', { cancelable: true }), { key: 'Tab', shiftKey: false }));
  assert.equal(document.activeElement, nodes['[data-viewer-close]']);
  dialog.dispatchEvent(Object.assign(new Event('keydown', { cancelable: true }), { key: 'Tab', shiftKey: true }));
  assert.equal(document.activeElement, nodes['[data-viewer-close]']);
  dialog.close();
  assert.equal(document.activeElement, link);
  assert.deepEqual(link.focusOptions, { preventScroll: true });
  assert.equal(document.documentElement.style.overflow, 'auto');
  assert.equal(window.scrollY, 700);
  assert.equal(image.src, undefined);
  click(link);
  assert.equal(image.src, link.href);
  click(nodes['[data-viewer-close]']);
  assert.equal(dialog.open, false);
});

test('keeps the modal active during exit, ignores repeated closes and completes on animation end', t => {
  const { dialog, nodes, link, click } = viewerEnvironment(t, { reducedMotion: false });
  t.mock.timers.enable({ apis: ['setTimeout'] });
  click(link);
  click(nodes['[data-viewer-close]']);
  assert.equal(dialog.open, true);
  assert.equal(dialog.dataset.state, 'closing');
  assert.equal(document.documentElement.style.overflow, 'hidden');
  click(nodes['[data-viewer-close]']);
  dialog.dispatchEvent(Object.assign(new Event('animationend'), { animationName: 'project-viewer-exit' }));
  assert.equal(dialog.open, false);
  assert.equal(document.activeElement, link);
  t.mock.timers.tick(300);
  assert.equal(document.documentElement.style.overflow, 'auto');
});

test('closes after the safety deadline if the exit event is missing', t => {
  const { dialog, link, click } = viewerEnvironment(t, { reducedMotion: false });
  t.mock.timers.enable({ apis: ['setTimeout'] });
  click(link);
  const cancel = new Event('cancel', { cancelable: true });
  dialog.dispatchEvent(cancel);
  assert.equal(cancel.defaultPrevented, true);
  t.mock.timers.tick(249);
  assert.equal(dialog.open, true);
  t.mock.timers.tick(1);
  assert.equal(dialog.open, false);
});

test('ignores an old image decode after closing and reopening', async t => {
  const pending = [];
  const { dialog, nodes, link, click } = viewerEnvironment(t, { decode: () => new Promise(resolve => pending.push(resolve)) });
  click(link);
  assert.equal(dialog.dataset.imageReady, 'false');
  click(nodes['[data-viewer-close]']);
  click(link);
  pending[0]();
  await Promise.resolve();
  assert.equal(dialog.dataset.imageReady, 'false');
  pending[1]();
  await Promise.resolve();
  assert.equal(dialog.dataset.imageReady, 'true');
});

test('preserves modified link navigation and only dismisses clicks that start and end outside', t => {
  const { dialog, link, click } = viewerEnvironment(t);
  assert.equal(click(link, { ctrlKey: true }).defaultPrevented, false);
  assert.equal(dialog.open, undefined);
  click(link);
  dialog.dispatchEvent(Object.assign(new Event('pointerdown'), { clientX: 50, clientY: 50 }));
  click(dialog, { clientX: 0, clientY: 0 });
  assert.equal(dialog.open, true);
  dialog.dispatchEvent(Object.assign(new Event('pointerdown'), { clientX: 0, clientY: 0 }));
  click(dialog, { clientX: 0, clientY: 0 });
  assert.equal(dialog.open, false);
});

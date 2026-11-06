import assert from 'node:assert/strict';
import test from 'node:test';
import { initClipboard } from '../src/scripts/clipboard.js';

function setup(t, { lang = 'pt', writeText } = {}) {
  const previousDocument = globalThis.document;
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const values = [
    'miguelzgobbo@gmail.com',
    'https://www.linkedin.com/in/miguel-zager-gobbo',
    'https://github.com/MiguelZGobbo',
  ];
  const writes = [];
  const buttons = values.map((text) => {
    const listeners = new Map();
    const attributes = new Map();
    const message = { textContent: '' };
    const feedback = { textContent: '' };
    const error = { textContent: '' };
    const control = {
      dataset: { copyState: 'idle' },
      querySelector: (selector) => ({
        '.copy-status': message,
        '.copy-feedback': feedback,
        '.copy-error': error,
      })[selector] ?? null,
    };
    return {
      dataset: { text }, control, message, feedback, error,
      closest: () => control,
      querySelector: () => null,
      setAttribute: (key, value) => attributes.set(key, value),
      removeAttribute: (key) => attributes.delete(key),
      getAttribute: (key) => attributes.get(key) ?? null,
      addEventListener(type, listener) {
        listeners.set(type, [...(listeners.get(type) ?? []), listener]);
      },
      click() { return Promise.all((listeners.get('click') ?? []).map((fn) => fn())); },
      press(key) { for (const fn of listeners.get('keydown') ?? []) fn({ key }); },
    };
  });
  globalThis.document = {
    documentElement: { dataset: { lang } },
    querySelectorAll: () => buttons,
  };
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { clipboard: writeText === null ? undefined : {
      writeText(text) {
        writes.push(text);
        return writeText ? writeText(text) : Promise.resolve();
      },
    } },
  });
  t.mock.timers.enable({ apis: ['setTimeout'] });
  t.after(() => {
    globalThis.document = previousDocument;
    if (previousNavigator) Object.defineProperty(globalThis, 'navigator', previousNavigator);
    else delete globalThis.navigator;
  });
  initClipboard();
  return { buttons, writes };
}

test('copies the exact contact values and confirms only once each write succeeds', async (t) => {
  const { buttons, writes } = setup(t);
  for (const button of buttons) {
    await button.click();
    assert.equal(button.control.dataset.copyState, 'success');
    assert.equal(button.message.textContent, 'Copiado!');
    assert.equal(button.feedback.textContent, 'Copiado!');
    assert.equal(button.error.textContent, '');
    assert.equal(button.getAttribute('aria-busy'), null);
  }
  assert.deepEqual(writes, [
    'miguelzgobbo@gmail.com',
    'https://www.linkedin.com/in/miguel-zager-gobbo',
    'https://github.com/MiguelZGobbo',
  ]);
  t.mock.timers.tick(2000);
  for (const button of buttons) {
    assert.equal(button.control.dataset.copyState, 'idle');
    assert.equal(button.message.textContent, '');
  }
});

test('ignores duplicate clicks while pending without preventing another button from copying', async (t) => {
  let finish;
  const pending = new Promise((resolve) => { finish = resolve; });
  const { buttons: [email, linkedin], writes } = setup(t, {
    writeText: (text) => text.includes('@') ? pending : Promise.resolve(),
  });
  const firstClick = email.click();
  await email.click();
  assert.equal(email.control.dataset.copyState, 'copying');
  assert.equal(email.getAttribute('aria-busy'), 'true');
  assert.equal(email.message.textContent, '');
  await linkedin.click();
  assert.equal(linkedin.control.dataset.copyState, 'success');
  assert.equal(writes.length, 2);
  finish();
  await firstClick;
  assert.equal(email.control.dataset.copyState, 'success');
});

test('renews success feedback without an older timer hiding the new result', async (t) => {
  const { buttons: [button], writes } = setup(t);
  const originalMessage = button.message;
  await button.click();
  t.mock.timers.tick(1500);
  await button.click();
  t.mock.timers.tick(500);
  assert.equal(button.control.dataset.copyState, 'success');
  assert.equal(button.message, originalMessage);
  assert.equal(writes.length, 2);
  t.mock.timers.tick(1500);
  assert.equal(button.message.textContent, '');
});

for (const [name, writeText] of [
  ['missing clipboard API', null],
  ['permission rejection', () => Promise.reject(new DOMException('Denied', 'NotAllowedError'))],
]) {
  test(`shows an actionable error for ${name} and clears it after five seconds`, async (t) => {
    const { buttons: [button] } = setup(t, { writeText });
    await button.click();
    assert.equal(button.control.dataset.copyState, 'error');
    assert.equal(button.message.textContent, 'Não foi possível copiar. Use o menu do link de contato para copiar o endereço.');
    assert.equal(button.feedback.textContent, 'Erro');
    assert.equal(button.error.textContent, 'Não foi possível copiar. Use o menu do link de contato para copiar o endereço.');
    assert.equal(button.getAttribute('aria-busy'), null);
    t.mock.timers.tick(4999);
    assert.equal(button.control.dataset.copyState, 'error');
    t.mock.timers.tick(1);
    assert.equal(button.control.dataset.copyState, 'idle');
    assert.equal(button.message.textContent, '');
    assert.equal(button.error.textContent, '');
  });
}

test('allows a successful retry after an error without the error timer resetting it', async (t) => {
  let reject = true;
  const { buttons: [button] } = setup(t, { writeText: () => reject
    ? Promise.reject(new Error('Denied')) : Promise.resolve() });
  await button.click();
  t.mock.timers.tick(4500);
  reject = false;
  await button.click();
  t.mock.timers.tick(500);
  assert.equal(button.control.dataset.copyState, 'success');
  assert.equal(button.message.textContent, 'Copiado!');
});

test('Escape dismisses feedback without affecting another button', async (t) => {
  const { buttons: [email, linkedin] } = setup(t);
  await email.click();
  await linkedin.click();
  email.press('Escape');
  assert.equal(email.control.dataset.copyState, 'idle');
  assert.equal(email.message.textContent, '');
  assert.equal(linkedin.control.dataset.copyState, 'success');
});

test('Escape while pending dismisses the eventual feedback but does not cancel the copy', async (t) => {
  let finish;
  const { buttons: [button], writes } = setup(t, {
    writeText: () => new Promise((resolve) => { finish = resolve; }),
  });
  const click = button.click();
  button.press('Escape');
  finish();
  await click;
  assert.equal(writes.length, 1);
  assert.equal(button.control.dataset.copyState, 'idle');
  assert.equal(button.message.textContent, '');
  assert.equal(button.getAttribute('aria-busy'), null);
});

test('uses English for success and failure feedback on the English page', async (t) => {
  let reject = false;
  const { buttons: [button] } = setup(t, { lang: 'en', writeText: () => reject
    ? Promise.reject(new Error('Denied')) : Promise.resolve() });
  await button.click();
  assert.equal(button.message.textContent, 'Copied!');
  assert.equal(button.feedback.textContent, 'Copied!');
  reject = true;
  await button.click();
  assert.equal(button.message.textContent, 'Could not copy. Use the contact link menu to copy the address.');
  assert.equal(button.feedback.textContent, 'Failed');
  assert.equal(button.error.textContent, 'Could not copy. Use the contact link menu to copy the address.');
});

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const contactFormSource = await readFile(new URL('../src/scripts/contact-form.js', import.meta.url), 'utf8');
const testableSource = contactFormSource.replace(
  "import { translations } from '../lib/i18n';",
  'const translations = { pt: {}, en: {} };',
);
const contactFormModule = await import(`data:text/javascript;base64,${Buffer.from(testableSource).toString('base64')}`);

test('validates complete contact values without errors', () => {
  assert.equal(typeof contactFormModule.validateContactValues, 'function');

  assert.deepEqual(
    contactFormModule.validateContactValues({
      name: 'Miguel Zager Gobbo',
      email: 'miguel@example.com',
      message: 'Hello from the contact form.',
    }),
    { fieldErrors: {}, summaryKey: null },
  );
});

test('identifies whitespace-only required contact fields', () => {
  assert.deepEqual(
    contactFormModule.validateContactValues({
      name: '   ',
      email: 'miguel@example.com',
      message: '\n\t',
    }),
    {
      fieldErrors: {
        name: 'form.name.required',
        message: 'form.message.required',
      },
      summaryKey: 'form.invalid',
    },
  );
});

test('identifies malformed email addresses', () => {
  assert.deepEqual(
    contactFormModule.validateContactValues({
      name: 'Miguel',
      email: 'not-an-email',
      message: 'Hello',
    }),
    {
      fieldErrors: { email: 'form.email.invalid' },
      summaryKey: 'form.invalid',
    },
  );
});

test('reports every invalid field in one validation result', () => {
  assert.deepEqual(
    contactFormModule.validateContactValues({ name: '', email: 'invalid', message: '' }),
    {
      fieldErrors: {
        name: 'form.name.required',
        email: 'form.email.invalid',
        message: 'form.message.required',
      },
      summaryKey: 'form.invalid',
    },
  );
});

test('silently ignores a honeypot submission without loading EmailJS or moving focus', () => {
  const previousDocument = globalThis.document;
  const previousWindow = globalThis.window;
  let emailJsLoads = 0;

  const makeControl = (value = '') => ({
    value,
    disabled: false,
    dataset: {},
    textContent: '',
    className: '',
    focusCalls: 0,
    setAttribute() {},
    removeAttribute() {},
    addEventListener() {},
    focus() {
      this.focusCalls += 1;
    },
  });
  const form = {
    listener: undefined,
    addEventListener(type, listener) {
      if (type === 'submit') this.listener = listener;
    },
  };
  const name = makeControl('Miguel');
  const email = makeControl('miguel@example.com');
  const message = makeControl('Hello');
  const button = makeControl();
  const notice = makeControl();
  const website = makeControl('https://bot.example');
  const controls = new Map([
    ['contact-form', form],
    ['campo-nome', name],
    ['campo-email', email],
    ['campo-mensagem', message],
    ['btn-enviar', button],
    ['form-aviso', notice],
    ['campo-site', website],
  ]);

  globalThis.document = {
    documentElement: { dataset: { lang: 'en' } },
    getElementById(id) {
      return controls.get(id) ?? null;
    },
    head: {
      appendChild() {
        emailJsLoads += 1;
      },
    },
  };
  globalThis.window = { setTimeout: () => 1 };

  try {
    contactFormModule.initContactForm();
    let prevented = false;
    form.listener({ preventDefault: () => { prevented = true; } });

    assert.equal(prevented, true);
    assert.equal(emailJsLoads, 0);
    assert.equal(button.disabled, false);
    assert.equal(notice.textContent, '');
    assert.equal(name.focusCalls + email.focusCalls + message.focusCalls, 0);
  } finally {
    globalThis.document = previousDocument;
    globalThis.window = previousWindow;
  }
});

test('announces the sending state without moving focus', () => {
  const previousDocument = globalThis.document;
  const previousWindow = globalThis.window;
  let emailJsLoads = 0;

  const makeControl = (value = '') => ({
    value,
    disabled: false,
    dataset: {},
    textContent: '',
    className: '',
    focusCalls: 0,
    setAttribute() {},
    removeAttribute() {},
    addEventListener() {},
    focus() {
      this.focusCalls += 1;
    },
  });
  const form = {
    listener: undefined,
    addEventListener(type, listener) {
      if (type === 'submit') this.listener = listener;
    },
  };
  const name = makeControl('Miguel');
  const email = makeControl('miguel@example.com');
  const message = makeControl('Hello');
  const button = makeControl();
  const notice = makeControl();
  const controls = new Map([
    ['contact-form', form],
    ['campo-nome', name],
    ['campo-email', email],
    ['campo-mensagem', message],
    ['campo-nome-error', makeControl()],
    ['campo-email-error', makeControl()],
    ['campo-mensagem-error', makeControl()],
    ['btn-enviar', button],
    ['form-aviso', notice],
    ['campo-site', makeControl()],
  ]);

  globalThis.document = {
    documentElement: { dataset: { lang: 'en' } },
    getElementById(id) {
      return controls.get(id) ?? null;
    },
    createElement() {
      return {};
    },
    head: {
      appendChild() {
        emailJsLoads += 1;
      },
    },
  };
  globalThis.window = {};

  try {
    contactFormModule.initContactForm();
    form.listener({ preventDefault() {} });

    assert.equal(emailJsLoads, 1);
    assert.equal(button.disabled, true);
    assert.equal(notice.textContent, 'form.sending');
    assert.equal(notice.className, 'sending');
    assert.equal(name.focusCalls + email.focusCalls + message.focusCalls, 0);
  } finally {
    globalThis.document = previousDocument;
    globalThis.window = previousWindow;
  }
});

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';

const contactFormSource = await readFile(new URL('../src/scripts/contact-form.js', import.meta.url), 'utf8');
const testableSource = contactFormSource.replace(
  "import { translations } from '../lib/i18n';",
  `import { translations } from '${pathToFileURL(resolve('src/lib/i18n.ts')).href}';`,
);
const contactFormModule = await import(`data:text/javascript;base64,${Buffer.from(testableSource).toString('base64')}`);

function createContactDom({ lang = 'en', values = {}, validity = {} } = {}) {
  const previousDocument = globalThis.document;
  const previousWindow = globalThis.window;

  const makeControl = (value = '', controlValidity = {}) => {
    const listeners = new Map();
    const attributes = new Map([['aria-invalid', 'false']]);
    return {
      value,
      validity: controlValidity,
      disabled: false,
      dataset: {},
      textContent: '',
      className: '',
      focusCalls: 0,
      setAttribute(name, attributeValue) {
        attributes.set(name, attributeValue);
      },
      getAttribute(name) {
        return attributes.get(name) ?? null;
      },
      removeAttribute(name) {
        attributes.delete(name);
      },
      addEventListener(type, listener) {
        const handlers = listeners.get(type) ?? [];
        handlers.push(listener);
        listeners.set(type, handlers);
      },
      dispatch(type, event = {}) {
        for (const listener of listeners.get(type) ?? []) listener(event);
      },
      focus() {
        this.focusCalls += 1;
      },
    };
  };
  const formListeners = new Map();
  const form = {
    addEventListener(type, listener) {
      const handlers = formListeners.get(type) ?? [];
      handlers.push(listener);
      formListeners.set(type, handlers);
    },
    dispatch(type, event = {}) {
      for (const listener of formListeners.get(type) ?? []) listener(event);
    },
  };
  const name = makeControl(values.name ?? '', validity.name);
  const email = makeControl(values.email ?? '', validity.email);
  const message = makeControl(values.message ?? '', validity.message);
  name.id = 'campo-nome';
  email.id = 'campo-email';
  message.id = 'campo-mensagem';
  const website = makeControl(values.website ?? '');
  const button = makeControl();
  const notice = makeControl();
  const errors = {
    name: makeControl(),
    email: makeControl(),
    message: makeControl(),
  };
  const controls = new Map([
    ['contact-form', form],
    ['campo-nome', name],
    ['campo-email', email],
    ['campo-mensagem', message],
    ['campo-site', website],
    ['btn-enviar', button],
    ['form-aviso', notice],
    ['campo-nome-error', errors.name],
    ['campo-email-error', errors.email],
    ['campo-mensagem-error', errors.message],
  ]);

  globalThis.document = {
    documentElement: { dataset: { lang } },
    getElementById(id) {
      return controls.get(id) ?? null;
    },
    head: { appendChild() {} },
  };
  globalThis.window = {};

  return {
    name,
    email,
    message,
    website,
    button,
    notice,
    errors,
    submit() {
      let prevented = false;
      form.dispatch('submit', { preventDefault: () => { prevented = true; } });
      return prevented;
    },
    reportNativeInvalid(control) {
      let prevented = false;
      form.dispatch('invalid', {
        target: control,
        preventDefault: () => { prevented = true; },
      });
      return prevented;
    },
    restore() {
      globalThis.document = previousDocument;
      globalThis.window = previousWindow;
    },
  };
}

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
    assert.equal(notice.textContent, 'Sending...');
    assert.equal(notice.className, 'sending');
    assert.equal(name.focusCalls + email.focusCalls + message.focusCalls, 0);
  } finally {
    globalThis.document = previousDocument;
    globalThis.window = previousWindow;
  }
});

test('turns a browser email type mismatch into accessible feedback', () => {
  const dom = createContactDom({
    values: { name: 'Miguel', email: 'miguel@example..com', message: 'Hello' },
    validity: { email: { typeMismatch: true } },
  });

  try {
    contactFormModule.initContactForm();

    assert.equal(dom.reportNativeInvalid(dom.email), true);
    assert.equal(dom.email.getAttribute('aria-invalid'), 'true');
    assert.equal(dom.errors.email.textContent, 'Enter a valid email address.');
    assert.equal(dom.notice.textContent, 'Correct the highlighted fields before sending.');
    assert.equal(dom.email.focusCalls, 1);
  } finally {
    dom.restore();
  }
});

test('keeps a honeypot submission silent during captured native validation', () => {
  const dom = createContactDom({
    values: { name: '', email: 'invalid', message: 'Hello', website: 'https://bot.example' },
    validity: { email: { typeMismatch: true } },
  });

  try {
    contactFormModule.initContactForm();

    assert.equal(dom.reportNativeInvalid(dom.email), true);
    assert.equal(dom.name.getAttribute('aria-invalid'), 'false');
    assert.equal(dom.errors.name.textContent, '');
    assert.equal(dom.errors.email.textContent, '');
    assert.equal(dom.notice.textContent, '');
    assert.equal(dom.name.focusCalls + dom.email.focusCalls + dom.message.focusCalls, 0);
  } finally {
    dom.restore();
  }
});

test('uses the active language and focuses only the first invalid field', () => {
  const dom = createContactDom({ values: { name: '', email: 'invalid', message: '' } });

  try {
    contactFormModule.initContactForm();

    assert.equal(dom.submit(), true);
    assert.equal(dom.errors.name.textContent, 'Enter your name.');
    assert.equal(dom.errors.email.textContent, 'Enter a valid email address.');
    assert.equal(dom.notice.textContent, 'Correct the highlighted fields before sending.');
    assert.equal(dom.name.focusCalls, 1);
    assert.equal(dom.email.focusCalls + dom.message.focusCalls, 0);
  } finally {
    dom.restore();
  }
});

test('clears a field error and validation status as the field becomes valid', () => {
  const dom = createContactDom({ values: { name: '', email: 'miguel@example.com', message: 'Hello' } });

  try {
    contactFormModule.initContactForm();
    dom.submit();
    dom.name.value = 'Miguel';
    dom.name.dispatch('input');

    assert.equal(dom.name.getAttribute('aria-invalid'), 'false');
    assert.equal(dom.errors.name.textContent, '');
    assert.equal(dom.notice.textContent, '');
  } finally {
    dom.restore();
  }
});

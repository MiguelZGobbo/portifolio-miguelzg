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

function createContactDom({ lang = 'en', values = {}, validity = {}, missing = [], emailjs } = {}) {
  const previousDocument = globalThis.document;
  const previousWindow = globalThis.window;
  const lifecycle = [];

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
        if (this.id) lifecycle.push(`control:${this.id}:${type}`);
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
      lifecycle.push(`form:${type}`);
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
  let buttonDisabled = true;
  let buttonType = 'button';
  button.id = 'btn-enviar';
  Object.defineProperties(button, {
    disabled: {
      get: () => buttonDisabled,
      set(value) {
        buttonDisabled = value;
        lifecycle.push(`button:disabled:${value}`);
      },
    },
    type: {
      get: () => buttonType,
      set(value) {
        buttonType = value;
        lifecycle.push(`button:type:${value}`);
      },
    },
  });
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
  for (const id of missing) controls.delete(id);

  const documentListeners = new Map();

  globalThis.document = {
    documentElement: { dataset: { lang } },
    getElementById(id) {
      return controls.get(id) ?? null;
    },
    addEventListener(type, listener) {
      lifecycle.push(`document:${type}`);
      const handlers = documentListeners.get(type) ?? [];
      handlers.push(listener);
      documentListeners.set(type, handlers);
    },
    dispatch(type, event = {}) {
      for (const listener of documentListeners.get(type) ?? []) listener(event);
    },
    createElement() {
      return {};
    },
    head: { appendChild() {} },
  };
  globalThis.window = {
    location: { href: 'http://localhost/portifolio-miguelzg/#contato' },
    ...(emailjs ? { emailjs } : {}),
  };

  return {
    name,
    email,
    message,
    website,
    button,
    notice,
    errors,
    lifecycle,
    clickButton() {
      const initialUrl = globalThis.window.location.href;
      if (button.disabled || button.type !== 'submit') {
        return { dispatched: false, prevented: false, url: initialUrl };
      }
      let prevented = false;
      form.dispatch('submit', { preventDefault: () => { prevented = true; } });
      if (!prevented) globalThis.window.location.href = `${initialUrl.split('?')[0]}?name=${encodeURIComponent(name.value)}`;
      return { dispatched: true, prevented, url: globalThis.window.location.href };
    },
    changeLanguage(language) {
      globalThis.document.documentElement.dataset.lang = language;
      globalThis.document.dispatch('languagechange', { detail: { language } });
    },
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

test('keeps native submission unavailable until every handler is registered', () => {
  const dom = createContactDom({ values: { name: '', email: '', message: '' } });

  try {
    const beforeInit = dom.clickButton();
    assert.deepEqual(beforeInit, {
      dispatched: false,
      prevented: false,
      url: 'http://localhost/portifolio-miguelzg/#contato',
    });

    assert.equal(contactFormModule.initContactForm(), true);
    assert.equal(dom.button.type, 'submit');
    assert.equal(dom.button.disabled, false);
    assert.equal(dom.button.textContent, 'Send message');

    const enabledAt = dom.lifecycle.lastIndexOf('button:disabled:false');
    for (const requiredRegistration of [
      'form:invalid',
      'control:campo-nome:input',
      'control:campo-email:input',
      'control:campo-mensagem:input',
      'form:submit',
      'document:languagechange',
    ]) {
      const registeredAt = dom.lifecycle.indexOf(requiredRegistration);
      assert.ok(registeredAt >= 0, `${requiredRegistration} should be registered`);
      assert.ok(registeredAt < enabledAt, `${requiredRegistration} should precede enabling submission`);
    }

    const afterInit = dom.clickButton();
    assert.equal(afterInit.dispatched, true);
    assert.equal(afterInit.prevented, true);
    assert.equal(afterInit.url, 'http://localhost/portifolio-miguelzg/#contato');
  } finally {
    dom.restore();
  }
});

test('keeps the submit control inert when form initialization cannot complete', () => {
  const dom = createContactDom({ missing: ['form-aviso'] });

  try {
    assert.equal(contactFormModule.initContactForm(), false);
    assert.equal(dom.button.type, 'button');
    assert.equal(dom.button.disabled, true);
    assert.deepEqual(dom.clickButton(), {
      dispatched: false,
      prevented: false,
      url: 'http://localhost/portifolio-miguelzg/#contato',
    });
  } finally {
    dom.restore();
  }
});

test('does not enable submission when a required form control is unavailable', () => {
  const dom = createContactDom({ missing: ['campo-email'] });

  try {
    assert.equal(contactFormModule.initContactForm(), false);
    assert.equal(dom.button.type, 'button');
    assert.equal(dom.button.disabled, true);
    assert.equal(dom.clickButton().dispatched, false);
  } finally {
    dom.restore();
  }
});

test('rerenders active validation feedback after a language change without moving focus', () => {
  const dom = createContactDom({ lang: 'pt', values: { name: '', email: 'invalid', message: '' } });

  try {
    contactFormModule.initContactForm();
    dom.clickButton();

    assert.equal(dom.errors.name.textContent, 'Informe seu nome.');
    assert.equal(dom.errors.email.textContent, 'Informe um endereço de e-mail válido.');
    assert.equal(dom.notice.textContent, 'Corrija os campos indicados antes de enviar.');
    const focusCalls = dom.name.focusCalls + dom.email.focusCalls + dom.message.focusCalls;

    dom.changeLanguage('en');

    assert.equal(dom.errors.name.textContent, 'Enter your name.');
    assert.equal(dom.errors.email.textContent, 'Enter a valid email address.');
    assert.equal(dom.errors.message.textContent, 'Enter your message.');
    assert.equal(dom.notice.textContent, 'Correct the highlighted fields before sending.');
    assert.equal(dom.button.textContent, 'Send message');
    assert.equal(dom.name.getAttribute('aria-invalid'), 'true');
    assert.equal(dom.name.focusCalls + dom.email.focusCalls + dom.message.focusCalls, focusCalls);
  } finally {
    dom.restore();
  }
});

test('rerenders sending and success status after language changes', async () => {
  let resolveSend;
  const sendPromise = new Promise((resolve) => { resolveSend = resolve; });
  const dom = createContactDom({
    lang: 'pt',
    values: { name: 'Miguel', email: 'miguel@example.com', message: 'Olá' },
    emailjs: { init() {}, send: () => sendPromise },
  });

  try {
    contactFormModule.initContactForm();
    dom.clickButton();
    assert.equal(dom.button.textContent, 'Enviando...');
    assert.equal(dom.notice.textContent, 'Enviando...');

    dom.changeLanguage('en');
    assert.equal(dom.button.textContent, 'Sending...');
    assert.equal(dom.notice.textContent, 'Sending...');

    await Promise.resolve();
    resolveSend();
    await new Promise((resolvePromise) => setImmediate(resolvePromise));

    assert.equal(dom.button.textContent, 'Send message');
    assert.equal(dom.notice.textContent, 'Message sent successfully!');
    dom.changeLanguage('pt');
    assert.equal(dom.button.textContent, 'Enviar mensagem');
    assert.equal(dom.notice.textContent, 'Mensagem enviada com sucesso!');
  } finally {
    dom.restore();
  }
});

test('rerenders a failure status after a language change', async () => {
  let rejectSend;
  const sendPromise = new Promise((_resolve, reject) => { rejectSend = reject; });
  const dom = createContactDom({
    lang: 'pt',
    values: { name: 'Miguel', email: 'miguel@example.com', message: 'Olá' },
    emailjs: { init() {}, send: () => sendPromise },
  });

  try {
    contactFormModule.initContactForm();
    dom.clickButton();
    await Promise.resolve();
    rejectSend(new Error('expected failure'));
    await new Promise((resolvePromise) => setImmediate(resolvePromise));

    assert.equal(dom.notice.textContent, 'Erro ao enviar. Tente novamente.');
    dom.changeLanguage('en');
    assert.equal(dom.button.textContent, 'Send message');
    assert.equal(dom.notice.textContent, 'Error sending. Try again.');
  } finally {
    dom.restore();
  }
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
    ['campo-nome-error', makeControl()],
    ['campo-email-error', makeControl()],
    ['campo-mensagem-error', makeControl()],
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
    addEventListener() {},
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
    addEventListener() {},
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

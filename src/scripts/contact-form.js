import { translations } from '../lib/i18n';

let emailjsPromise;

const contactFields = [
  { key: 'name', id: 'campo-nome', errorId: 'campo-nome-error' },
  { key: 'email', id: 'campo-email', errorId: 'campo-email-error' },
  { key: 'message', id: 'campo-mensagem', errorId: 'campo-mensagem-error' },
];

function translate(key) {
  const language = document.documentElement.dataset.lang === 'en' ? 'en' : 'pt';
  return translations[language][key] ?? translations.pt[key] ?? key;
}

function loadEmailJS() {
  if (window.emailjs) return Promise.resolve();
  if (!emailjsPromise) {
    emailjsPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
      script.async = true;
      script.onload = resolve;
      script.onerror = () => {
        emailjsPromise = undefined;
        reject(new Error('EmailJS load failed'));
      };
      document.head.appendChild(script);
    });
  }
  return emailjsPromise;
}

function setTranslatedText(element, key) {
  if (!key) {
    delete element.dataset.i18nKey;
    element.textContent = '';
    return;
  }

  element.dataset.i18nKey = key;
  element.textContent = translate(key);
}

function setButtonState(button, state) {
  button.dataset.formState = state;
  button.textContent = translate(state === 'sending' ? 'form.sending' : 'form.submit');
}

function setNoticeState(notice, key, className, state) {
  setTranslatedText(notice, key);
  notice.className = className;
  if (state) notice.dataset.formState = state;
  else delete notice.dataset.formState;
}

function resetFormButton(button, notice, noticeKey, className, state) {
  setButtonState(button, 'idle');
  button.disabled = false;
  setNoticeState(notice, noticeKey, className, state);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+$/.test(value);
}

export function isContactDeliveryHostEligible(hostname) {
  const normalizedHostname = typeof hostname === 'string'
    ? hostname.trim().toLowerCase().replace(/^\[(.*)\]$/, '$1')
    : '';

  if (!normalizedHostname) return false;
  if (normalizedHostname === 'localhost' || normalizedHostname.endsWith('.localhost')) return false;
  if (normalizedHostname === '::1' || normalizedHostname.startsWith('::ffff:127.')) return false;
  if (/^127(?:\.\d{1,3}){3}$/.test(normalizedHostname)) return false;
  return true;
}

export function validateContactValues(values) {
  const fieldErrors = {};
  const name = values.name?.trim() ?? '';
  const email = values.email?.trim() ?? '';
  const message = values.message?.trim() ?? '';

  if (!name) fieldErrors.name = 'form.name.required';
  if (!email) fieldErrors.email = 'form.email.required';
  else if (!isValidEmail(email)) fieldErrors.email = 'form.email.invalid';
  if (!message) fieldErrors.message = 'form.message.required';

  return {
    fieldErrors,
    summaryKey: Object.keys(fieldErrors).length ? 'form.invalid' : null,
  };
}

function contactValues() {
  return Object.fromEntries(
    contactFields.map(({ key, id }) => [key, document.getElementById(id)?.value ?? '']),
  );
}

function validateFormValues() {
  const validation = validateContactValues(contactValues());
  const email = document.getElementById('campo-email');

  if (email?.validity?.typeMismatch) {
    validation.fieldErrors.email = 'form.email.invalid';
    validation.summaryKey = 'form.invalid';
  }

  return validation;
}

function honeypotIsFilled() {
  return Boolean(document.getElementById('campo-site')?.value.trim());
}

function updateFieldError(field, errorKey) {
  const control = document.getElementById(field.id);
  const error = document.getElementById(field.errorId);
  if (!control || !error) return;

  control.setAttribute('aria-invalid', String(Boolean(errorKey)));
  setTranslatedText(error, errorKey);
}

function showValidation(validation, notice) {
  contactFields.forEach((field) => updateFieldError(field, validation.fieldErrors[field.key]));
  setNoticeState(
    notice,
    validation.summaryKey,
    validation.summaryKey ? 'erro' : '',
    validation.summaryKey ? 'validation' : undefined,
  );
}

function clearValidation(notice) {
  contactFields.forEach((field) => updateFieldError(field, null));
  if (notice.dataset.formState === 'validation') {
    setNoticeState(notice, null, '', undefined);
  }
}

function rerenderActiveFeedback(button, notice) {
  contactFields.forEach(({ errorId }) => {
    const error = document.getElementById(errorId);
    if (error?.dataset.i18nKey) error.textContent = translate(error.dataset.i18nKey);
  });

  if (notice.dataset.i18nKey) notice.textContent = translate(notice.dataset.i18nKey);
  setButtonState(button, button.dataset.formState === 'sending' ? 'sending' : 'idle');
}

function focusFirstInvalid(fieldErrors) {
  const firstInvalid = contactFields.find(({ key }) => fieldErrors[key]);
  document.getElementById(firstInvalid?.id)?.focus();
}

function sendMessage() {
  const button = document.getElementById('btn-enviar');
  const notice = document.getElementById('form-aviso');
  if (!button || !notice) return;

  if (honeypotIsFilled()) {
    clearValidation(notice);
    return;
  }

  const values = contactValues();
  const validation = validateFormValues();
  if (validation.summaryKey) {
    showValidation(validation, notice);
    focusFirstInvalid(validation.fieldErrors);
    return;
  }

  if (!isContactDeliveryHostEligible(window.location?.hostname)) {
    clearValidation(notice);
    resetFormButton(button, notice, 'form.local.disabled', 'local-preview', 'local-disabled');
    return;
  }

  clearValidation(notice);
  setButtonState(button, 'sending');
  button.disabled = true;
  setNoticeState(notice, 'form.sending', 'sending', 'sending');

  loadEmailJS()
    .then(() => {
      window.emailjs.init('7cO86VT1CxLbCKh3n');
      return window.emailjs.send('service_5hcdutl', 'template_z8knk7w', {
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
      });
    })
    .then(() => {
      resetFormButton(button, notice, 'form.ok', 'sucesso', 'success');
      contactFields.forEach(({ id }) => {
        document.getElementById(id).value = '';
      });
    })
    .catch(() => {
      resetFormButton(button, notice, 'form.err', 'erro', 'failure');
    });
}

export function initContactForm() {
  const form = document.getElementById('contact-form');
  const button = document.getElementById('btn-enviar');
  const notice = document.getElementById('form-aviso');
  const fieldElements = contactFields.map((field) => ({
    field,
    control: document.getElementById(field.id),
    error: document.getElementById(field.errorId),
  }));
  if (!form || !button || !notice || fieldElements.some(({ control, error }) => !control || !error)) {
    return false;
  }

  button.type = 'button';
  button.disabled = true;

  form.addEventListener('invalid', (event) => {
    if (!contactFields.some(({ id }) => id === event.target.id)) return;
    event.preventDefault();
    if (honeypotIsFilled()) {
      clearValidation(notice);
      return;
    }

    const validation = validateFormValues();
    showValidation(validation, notice);
    focusFirstInvalid(validation.fieldErrors);
  }, true);

  fieldElements.forEach(({ field, control }) => {
    control.addEventListener('input', () => {
      const validation = validateFormValues();
      updateFieldError(field, validation.fieldErrors[field.key]);
      if (!validation.summaryKey && notice.dataset.formState === 'validation') clearValidation(notice);
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    sendMessage();
  });

  document.addEventListener('languagechange', () => rerenderActiveFeedback(button, notice));

  setButtonState(button, 'idle');
  button.type = 'submit';
  button.disabled = false;
  return true;
}

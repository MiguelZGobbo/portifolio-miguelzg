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

function resetFormButton(button, notice, message, className) {
  button.textContent = translate('form.submit');
  button.disabled = false;
  notice.textContent = message;
  notice.className = className;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+$/.test(value);
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
  error.textContent = errorKey ? translate(errorKey) : '';
}

function showValidation(validation, notice) {
  contactFields.forEach((field) => updateFieldError(field, validation.fieldErrors[field.key]));
  notice.textContent = validation.summaryKey ? translate(validation.summaryKey) : '';
  notice.className = validation.summaryKey ? 'erro' : '';
  notice.dataset.formState = 'validation';
}

function clearValidation(notice) {
  contactFields.forEach((field) => updateFieldError(field, null));
  if (notice.dataset.formState === 'validation') {
    notice.textContent = '';
    notice.className = '';
  }
  delete notice.dataset.formState;
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

  clearValidation(notice);
  button.textContent = translate('form.sending');
  button.disabled = true;
  notice.textContent = translate('form.sending');
  notice.className = 'sending';

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
      resetFormButton(button, notice, translate('form.ok'), 'sucesso');
      contactFields.forEach(({ id }) => {
        document.getElementById(id).value = '';
      });
    })
    .catch(() => {
      resetFormButton(button, notice, translate('form.err'), 'erro');
    });
}

export function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('invalid', (event) => {
    if (!contactFields.some(({ id }) => id === event.target.id)) return;
    event.preventDefault();
    const notice = document.getElementById('form-aviso');
    if (!notice) return;
    if (honeypotIsFilled()) {
      clearValidation(notice);
      return;
    }

    const validation = validateFormValues();
    showValidation(validation, notice);
    focusFirstInvalid(validation.fieldErrors);
  }, true);

  contactFields.forEach((field) => {
    const control = document.getElementById(field.id);
    control?.addEventListener('input', () => {
      const notice = document.getElementById('form-aviso');
      if (!notice) return;

      const validation = validateFormValues();
      updateFieldError(field, validation.fieldErrors[field.key]);
      if (!validation.summaryKey && notice.dataset.formState === 'validation') clearValidation(notice);
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    sendMessage();
  });
}

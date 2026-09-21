import { translations } from '../lib/i18n';

let emailjsPromise;

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
  window.setTimeout(() => {
    notice.textContent = '';
    notice.className = '';
  }, 4000);
}

function sendMessage() {
  const name = document.getElementById('campo-nome');
  const email = document.getElementById('campo-email');
  const message = document.getElementById('campo-mensagem');
  const button = document.getElementById('btn-enviar');
  const notice = document.getElementById('form-aviso');
  const website = document.getElementById('campo-site');
  if (!name || !email || !message || !button || !notice) return;

  const nameValue = name.value.trim();
  const emailValue = email.value.trim();
  const messageValue = message.value.trim();
  notice.textContent = '';
  notice.className = '';

  if (website?.value.trim()) {
    button.textContent = translate('form.submit');
    return;
  }

  if (!nameValue || !emailValue || !messageValue) {
    notice.textContent = translate('form.required');
    notice.className = 'erro';
    return;
  }

  button.textContent = translate('form.sending');
  button.disabled = true;

  loadEmailJS()
    .then(() => {
      window.emailjs.init('7cO86VT1CxLbCKh3n');
      return window.emailjs.send('service_5hcdutl', 'template_z8knk7w', {
        name: nameValue,
        email: emailValue,
        message: messageValue,
      });
    })
    .then(() => {
      resetFormButton(button, notice, translate('form.ok'), 'sucesso');
      name.value = '';
      email.value = '';
      message.value = '';
    })
    .catch(() => {
      resetFormButton(button, notice, translate('form.err'), 'erro');
    });
}

export function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    sendMessage();
  });
}

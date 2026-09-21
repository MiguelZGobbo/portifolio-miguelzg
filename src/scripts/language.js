import { translations } from '../lib/i18n';

const cvFiles = {
  pt: 'MiguelZagerGobbo-CV.pdf',
  en: 'MiguelZagerGobbo-CV-EN.pdf',
};

function savePreference(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Preferences remain optional when storage is unavailable.
  }
}

function setMetaContent(name, content) {
  const meta = document.querySelector(`meta[name="${name}"]`) ?? document.querySelector(`meta[property="${name}"]`);
  meta?.setAttribute('content', content);
}

function localizedValue(element, language, prefix) {
  return element.getAttribute(`data-${prefix}-${language}`);
}

function updateLocalizedNodes(language) {
  document.querySelectorAll('[data-project-localized]').forEach((element) => {
    const value = localizedValue(element, language, 'project');
    if (value !== null) element.textContent = value;
  });

  document.querySelectorAll('[data-project-localized-aria]').forEach((element) => {
    const value = localizedValue(element, language, 'project');
    if (value !== null) element.setAttribute('aria-label', value);
  });

  document.querySelectorAll('[data-skill-localized]').forEach((element) => {
    const value = localizedValue(element, language, 'skill');
    if (value !== null) element.textContent = value;
  });
}

function updateCvLinks(language) {
  const filename = cvFiles[language];
  document.querySelectorAll('a[data-cv]').forEach((link) => {
    link.href = `${import.meta.env.BASE_URL}files/${filename}`;
    if (link.hasAttribute('download')) link.setAttribute('download', filename);
  });
}

export function initLanguage() {
  const toggle = document.getElementById('lang-toggle');
  let currentLanguage = document.documentElement.dataset.lang === 'en' ? 'en' : 'pt';

  const applyLanguage = (language, persist = true) => {
    currentLanguage = language === 'en' ? 'en' : 'pt';
    const dictionary = translations[currentLanguage];

    document.documentElement.lang = currentLanguage;
    document.documentElement.dataset.lang = currentLanguage;

    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const value = dictionary[element.getAttribute('data-i18n')];
      if (value !== undefined) element.textContent = value;
    });

    document.querySelectorAll('footer[data-i18n="contact.footer"]').forEach((element) => {
      element.textContent = dictionary['contact.footer'].replace('{year}', String(new Date().getFullYear()));
    });

    document.querySelectorAll('[data-i18n-aria]').forEach((element) => {
      const value = dictionary[element.getAttribute('data-i18n-aria')];
      if (value !== undefined) element.setAttribute('aria-label', value);
    });

    document.querySelectorAll('[data-i18n-ph]').forEach((element) => {
      const value = dictionary[element.getAttribute('data-i18n-ph')];
      if (value !== undefined) element.setAttribute('placeholder', value);
    });

    document.querySelectorAll('[data-i18n-alt]').forEach((element) => {
      const value = dictionary[element.getAttribute('data-i18n-alt')];
      if (value !== undefined) element.setAttribute('alt', value);
    });

    updateLocalizedNodes(currentLanguage);
    updateCvLinks(currentLanguage);
    document.title = dictionary['meta.title'];
    setMetaContent('description', dictionary['meta.description']);
    setMetaContent('og:title', dictionary['meta.title']);
    setMetaContent('og:description', dictionary['meta.description']);
    toggle?.setAttribute('aria-label', dictionary['lang.switch']);
    document.dispatchEvent(new CustomEvent('languagechange', { detail: { language: currentLanguage } }));
    if (persist) savePreference('lang', currentLanguage);
  };

  toggle?.addEventListener('click', () => {
    applyLanguage(currentLanguage === 'pt' ? 'en' : 'pt');
  });
  applyLanguage(currentLanguage, false);
}

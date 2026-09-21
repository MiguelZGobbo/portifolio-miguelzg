import { translations } from '../lib/i18n';

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

function currentTheme() {
  return document.documentElement.getAttribute('data-theme') ?? 'light';
}

function currentLanguage() {
  return document.documentElement.dataset.lang === 'en' ? 'en' : 'pt';
}

export function initTheme() {
  const toggle = document.getElementById('theme-toggle');

  const updateControlAria = () => {
    if (!toggle) return;

    const theme = currentTheme();
    const dictionary = translations[currentLanguage()];
    toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    toggle.setAttribute('aria-label', dictionary[theme === 'dark' ? 'theme.light' : 'theme.dark']);
  };

  const applyTheme = (theme, persist = true) => {
    document.documentElement.setAttribute('data-theme', theme);
    setMetaContent('theme-color', theme === 'dark' ? '#241C14' : '#F8F0E5');
    updateControlAria();
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    if (persist) savePreference('theme', theme);
  };

  toggle?.addEventListener('click', () => {
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  });
  document.addEventListener('languagechange', updateControlAria);
  applyTheme(currentTheme(), false);
}

import { translatePage } from './browser-i18n.js';

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

export function initTheme() {
  const toggle = document.getElementById('theme-toggle');

  const updateControlAria = () => {
    if (!toggle) return;

    const theme = currentTheme();
    toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    toggle.setAttribute('aria-label', translatePage(theme === 'dark' ? 'theme.light' : 'theme.dark'));
  };

  const applyTheme = (theme, persist = true) => {
    document.documentElement.setAttribute('data-theme', theme);
    setMetaContent('theme-color', theme === 'dark' ? '#253640' : '#F9F9FB');
    updateControlAria();
    if (persist) savePreference('theme', theme);
  };

  toggle?.addEventListener('click', () => {
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  });
  document.addEventListener('languagechange', updateControlAria);
  applyTheme(currentTheme(), false);
}

import { translate } from '../lib/i18n.ts';

export function currentLanguage() {
  return document.documentElement.dataset.lang === 'en' ? 'en' : 'pt';
}

export function translatePage(key) {
  return translate(currentLanguage(), key);
}
